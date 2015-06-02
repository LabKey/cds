package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerFilterable;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;
import org.labkey.api.study.TimepointType;
import org.labkey.api.util.DateUtil;
import org.labkey.cds.CDSSchema;
import org.labkey.cds.CDSSimpleTable;
import org.labkey.cds.CDSUserSchema;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class PopulateStudiesTask extends AbstractPopulateTask
{
    protected void populate(Logger logger) throws PipelineJobException
    {
        Container project = containerUser.getContainer();
        User user = containerUser.getUser();

        if (project.isProject() && project.getFolderType().equals(FolderTypeManager.get().getFolderType(StudyService.DATASPACE_FOLDERTYPE_NAME)))
        {
            // Delete All Containers
            clean(project, user, logger);

            // Retrieve the set of studies available in the 'import_' schema
            Set<String> studyNames = getStudyNames(project, user, logger);

            if (null == studyNames)
            {
                return;
            }

            // Ensure containers -- and generate a study for them
            long start = System.currentTimeMillis();
            int created = 0;
            BatchValidationException errors = new BatchValidationException();
            for (String studyName : studyNames)
            {
                Container c = ContainerManager.getChild(project, studyName);

                if (c == null)
                {
                    c = ContainerManager.createContainer(project, studyName, null, null, Container.TYPE.normal, user);
                    c.setFolderType(FolderTypeManager.get().getFolderType("Study"), user);
                    StudyService.get().createStudy(c, user, studyName, TimepointType.VISIT, false);
                    created++;
                }
            }
            long finish = System.currentTimeMillis();
            logger.info("Created " + created + " studies in " + DateUtil.formatDuration(finish - start) + ".");

            // Get the collesced metadata for the studies (including container)
            Map<String, Map<String, Object>> studies = getStudies(project, user, logger);

            // Import Study metadata
            for (String studyName : studies.keySet())
            {
                if (studies.containsKey(studyName))
                {
                    Container c = ContainerManager.getChild(project, studyName);

                    try
                    {
                        List<Map<String, Object>> rows = new ArrayList<>();
                        rows.add(studies.get(studyName));

                        TableInfo updatable = new CDSSimpleTable(new CDSUserSchema(user, c), CDSSchema.getInstance().getSchema().getTable("Study"));
                        QueryUpdateService qud = updatable.getUpdateService();

                        if (null != qud)
                            qud.insertRows(user, c, rows, errors, null, null);
                        else
                            throw new PipelineJobException("Unable to find update service for " + updatable.getName());
                    }
                    catch (Exception e)
                    {
                        logger.error(e.getMessage(), e);
                    }
                }
                else
                {
                    logger.error("Unable to find metadata for study: " + studyName);
                }
            }
        }
        else
        {
            logger.error(project.getName() + "must be a project and of type \"" + StudyService.DATASPACE_FOLDERTYPE_NAME + "\"");
        }
    }


    private void clean(Container project, User user, Logger logger)
    {
        int numStudies = project.getChildren().size();

        if (numStudies > 0)
        {
            logger.info("Starting cleanup of " + numStudies + " studies in " + project.getPath());

            long start = System.currentTimeMillis();

            for (Container child : project.getChildren())
            {
                ContainerManager.delete(child, user);
            }
            long finish = System.currentTimeMillis();

            logger.info("Cleaned up " + numStudies + " studies in " + DateUtil.formatDuration(finish - start) + ".");
        }
        else
        {
            logger.info("No studies needed to be cleaned up.");
        }
    }

    @Nullable
    private Set<String> getStudyNames(Container project, User user, Logger logger)
    {
        TableInfo tiStudyHasSubjects = DefaultSchema.get(user, project).getSchema("study").getTable("ds_study_has_subjects");

        // Get all the studies
        SQLFragment sql = new SQLFragment("SELECT * FROM ").append(tiStudyHasSubjects);
        Map<String, Object>[] importStudies = new SqlSelector(tiStudyHasSubjects.getSchema(), sql).getMapArray();

        Set<String> studies = new HashSet<>();
        for (Map<String, Object> map : importStudies)
        {
            studies.add((String) map.get("prot"));
        }

        return studies;
    }


    private Map<String, Map<String, Object>> getStudies(Container project, User user, Logger logger)
    {
        QueryService queryService = QueryService.get();
        QueryDefinition qd = queryService.getQueryDef(user, project, "study", "ds_study");

        ArrayList<QueryException> qerrors = new ArrayList<>();
        TableInfo tiImportStudy = qd.getTable(qerrors, true);

        if (!qerrors.isEmpty())
        {
            // TODO: Process errors to logger?
            return Collections.emptyMap();
        }
        else if (null == tiImportStudy)
        {
            logger.error("Unable to find source query for studies.");
            return Collections.emptyMap();
        }

        ((ContainerFilterable) tiImportStudy).setContainerFilter(new ContainerFilter.CurrentAndSubfolders(user));

        // Get all the studies
        SQLFragment sql = new SQLFragment("SELECT * FROM ").append(tiImportStudy);
        Map<String, Object>[] importStudies = new SqlSelector(tiImportStudy.getSchema(), sql).getMapArray();

        Map<String, Map<String, Object>> importStudiesMap = new HashMap<>();
        for (Map<String, Object> map : importStudies)
        {
            importStudiesMap.put((String) map.get("study_name"), map);
        }

        return importStudiesMap;
    }
}
