package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.module.FolderType;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;
import org.labkey.api.study.TimepointType;
import org.labkey.cds.CDSSchema;
import org.labkey.cds.model.CDSStudy;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class PopulateStudiesTask extends TaskRefTaskImpl
{
    @Override
    public RecordedActionSet run(Logger logger) throws PipelineJobException
    {
        ensureStudies(logger);

        return new RecordedActionSet(makeRecordedAction());
    }

    @Override
    public List<String> getRequiredSettings()
    {
        return Collections.emptyList();
    }

    private void ensureStudies(Logger logger)
    {
        Container project = containerUser.getContainer();
        User user = containerUser.getUser();

        if (project.isProject() && project.getFolderType().equals(FolderTypeManager.get().getFolderType(StudyService.DATASPACE_FOLDERTYPE_NAME)))
        {
            for (Container child : project.getChildren())
            {
                ContainerManager.delete(child, user);
            }

            SQLFragment sql = new SQLFragment("SELECT prot FROM cds.import_study");
            List<CDSStudy> studies = new SqlSelector(CDSSchema.getInstance().getSchema(), sql).getArrayList(CDSStudy.class);
            Set<String> studyNames = new TreeSet<>();

            for (CDSStudy study : studies)
            {
                studyNames.add(study.getProt());
            }

            FolderType folderType = FolderTypeManager.get().getFolderType("Study");

            for (String studyName : studyNames)
            {
                Container c = ContainerManager.createContainer(project, studyName, null, null, Container.TYPE.normal, user);
                c.setFolderType(folderType, user);
                StudyService.get().createStudy(c, user, studyName, TimepointType.DATE, false);
            }
        }
        else
        {
            logger.error(project.getName() + "must be a project and of type \"" + StudyService.DATASPACE_FOLDERTYPE_NAME + "\"");
        }
    }
}
