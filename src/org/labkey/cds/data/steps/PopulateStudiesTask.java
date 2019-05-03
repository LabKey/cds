/*
 * Copyright (c) 2015-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerFilterable;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.NormalContainerType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.dataiterator.ListofMapsDataIterator;
import org.labkey.api.module.FolderType;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.GroupManager;
import org.labkey.api.security.MutableSecurityPolicy;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.roles.Role;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.study.StudyService;
import org.labkey.api.study.TimepointType;
import org.labkey.api.util.DateUtil;
import org.labkey.cds.CDSSchema;
import org.labkey.cds.CDSSimpleTable;
import org.labkey.cds.CDSUserSchema;
import org.labkey.security.xml.GroupEnumType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class PopulateStudiesTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        // Retrieve the set of studies available in the 'import_' schema
        Set<String> importStudies = readImportStudies(project, user, logger);

        // Clean-up old studies and ensure containers for all importStudies
        cleanContainers(importStudies, project, user, logger);
        ensureContainers(importStudies, project, user, logger);

        // Set permissions - Destroys importStudies set.
        ensurePermissions(logger, importStudies);

        // Get the coalesced metadata for the studies (including container)
        Map<String, Map<String, Object>> studies = getStudies(project, user, logger);
        List<Map<String, Object>> rows = new ArrayList<>();

        // Import Study metadata
        for (String studyName : studies.keySet())
        {
            if (job.checkInterrupted())
                return;

            if (studies.containsKey(studyName))
            {
                Container c = ContainerManager.getChild(project, studyName);

                try
                {
                    rows.clear();
                    rows.add(studies.get(studyName));

                    TableInfo studyTable = new CDSSimpleTable(new CDSUserSchema(user, c), CDSSchema.getInstance().getSchema().getTable("Study"), null);
                    QueryUpdateService qud = studyTable.getUpdateService();

                    if (null != qud && !rows.isEmpty())
                    {
                        BatchValidationException errors = new BatchValidationException();
                        ListofMapsDataIterator maps = new ListofMapsDataIterator(rows.get(0).keySet(), rows);

                        qud.importRows(user, c, maps, errors, null, null);

                        if (errors.hasErrors())
                        {
                            for (ValidationException error : errors.getRowErrors())
                            {
                                logger.error(error.getMessage());
                            }
                        }
                    }
                    else
                        throw new PipelineJobException("Unable to find update service for " + studyTable.getName());
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


    private void cleanContainers(Set<String> importStudies, Container project, User user, Logger logger)
    {
        int deleted = 0;
        long start = System.currentTimeMillis();

        // Iterate the children to remove any studies that are no longer imported
        for (Container c : project.getChildren())
        {
            if (!importStudies.contains(c.getName()))
            {
                logger.info("Deleting container for study (" + c.getName() + ") as it is no longer imported");
                ContainerManager.delete(c, user);
                deleted++;
            }
        }

        long finish = System.currentTimeMillis();
        logger.info("Deleted " + deleted + " studies in " + DateUtil.formatDuration(finish - start) + ".");
    }

    private void ensurePermissions(Logger logger, Set<String> studiesStillNeedingPermissions) throws PipelineJobException
    {
        QuerySchema schema = DefaultSchema.get(user, project).getSchema("cds");

        if (null == schema)
            throw new PipelineJobException("Unable to find cds schema.");

        TableInfo importStudyGroups = schema.getTable("import_studygroups");

        if (null == importStudyGroups)
            throw new PipelineJobException("Unable to find cds.import_studygroups table.");

        SQLFragment sql = new SQLFragment("SELECT * FROM ").append(importStudyGroups, "studyGroups");
        Map<String, Object>[] importPermissions = new SqlSelector(importStudyGroups.getSchema(), sql).getMapArray();

        // Map(Study -> Map(Role -> Set(Groups)))
        Map<String, Map<String, Set<String>>> studyRoleGroups = new HashMap<>();

        for (Map<String, Object> study : importPermissions)
        {
            String prot = (String) study.get("prot");
            String role = (String) study.get("role");
            String group = (String) study.get("group");

            if (!studyRoleGroups.containsKey(prot)) {
                studyRoleGroups.put(prot, new HashMap<>());
            }
            if (!studyRoleGroups.get(prot).containsKey(role)) {
                studyRoleGroups.get(prot).put(role, new HashSet<>());
            }
            studyRoleGroups.get(prot).get(role).add(group);
        }

        // Cache simple names for roles
        Map<String, Role> simpleNameToRole = new HashMap<>();
        for (Role r : RoleManager.getAllRoles())
        {
            simpleNameToRole.put(r.getName(), r);
        }

        // Cache for groups
        Map<String, UserPrincipal> groupPrincipalCache = new HashMap<>();

        for (Map.Entry<String, Map<String, Set<String>>> entry : studyRoleGroups.entrySet())
        {
            if (project.hasChild(entry.getKey()))
            {
                Container c = ContainerManager.getChild(project, entry.getKey());

                Map<String, Set<String>> roleGroupsMap = entry.getValue();

                //inherit permissions case:
                if (roleGroupsMap.keySet().contains("*")) {
                    if (roleGroupsMap.keySet().size() == 1 &&
                            roleGroupsMap.get("*").size() == 1 &&
                            roleGroupsMap.get("*").contains("*"))
                    {
                        studiesStillNeedingPermissions.remove(c.getName());
                        SecurityManager.setInheritPermissions(c);
                    }
                    else
                    {
                        logger.error("Permissions incorrectly specified for container: " + c.getName());
                    }
                }
                else {
                    // Wipe out previous settings
                    MutableSecurityPolicy policy = new MutableSecurityPolicy(c);

                    for (Map.Entry<String, Set<String>> roleEntry : roleGroupsMap.entrySet())
                    {
                        Role role = simpleNameToRole.get(roleEntry.getKey());

                        if (role != null)
                        {
                            for (String groupName : roleEntry.getValue())
                            {
                                UserPrincipal principal;
                                if (groupPrincipalCache.containsKey(groupName))
                                {
                                    principal = groupPrincipalCache.get(groupName);
                                }
                                else
                                {
                                    principal = GroupManager.getGroup(c, groupName, GroupEnumType.SITE);
                                    groupPrincipalCache.put(groupName, principal);
                                }
                                if (principal == null)
                                {
                                    logger.warn("Non-existent group in role assignment for role " + role.getName() + " will be ignored: " + groupName);
                                }
                                else
                                {
                                    studiesStillNeedingPermissions.remove(c.getName());
                                    policy.addRoleAssignment(principal, role);
                                }
                            }
                        }
                        else
                        {
                            logger.warn("Non-existent role: " + roleEntry.getKey() + ". Entry will be ignored");
                        }
                    }
                    SecurityPolicyManager.savePolicy(policy);
                }
            }
            else
            {
                logger.warn("Non-existent study: " + entry.getKey() + ". Entry will be ignored.");
            }
        }

        for (String cName : studiesStillNeedingPermissions)
        {
            logger.error("Permissions not specified for container: " + cName);
        }
    }

    private void ensureContainers(Set<String> importStudies, Container project, User user, Logger logger)
    {
        long start = System.currentTimeMillis();
        int created = 0;
        FolderType studyFolderType = FolderTypeManager.get().getFolderType("Study");

        // Iterate the studies and create a container for any that do not have one
        for (String studyName : importStudies)
        {
            Container c = ContainerManager.getChild(project, studyName);

            if (c == null)
            {
                logger.info("Creating container for study (" + studyName + ")");
                c = ContainerManager.createContainer(project, studyName, null, null, NormalContainerType.NAME, user);
                c.setFolderType(studyFolderType, user);
                StudyService.get().createStudy(c, user, studyName, TimepointType.VISIT, false);
                created++;
            }
            else
            {
                logger.info("Container already exists for study (" + studyName + ")");
            }
        }

        long finish = System.currentTimeMillis();
        logger.info("Created " + created + " studies in " + DateUtil.formatDuration(finish - start) + ".");
    }


    private Set<String> readImportStudies(Container container, User user, Logger logger) throws PipelineJobException
    {
        Set<String> studies = new HashSet<>();
        QuerySchema schema = DefaultSchema.get(user, container).getSchema("cds");

        if (null == schema)
            throw new PipelineJobException("Unable to find cds schema.");

        TableInfo importStudy = schema.getTable("import_study");

        if (null == importStudy)
            throw new PipelineJobException("Unable to find cds.import_study table.");

        SQLFragment sql = new SQLFragment("SELECT prot FROM ").append(importStudy);
        Map<String, Object>[] importStudies = new SqlSelector(importStudy.getSchema(), sql).getMapArray();

        for (Map<String, Object> study : importStudies)
        {
            studies.add((String) study.get("prot"));
        }

        return studies;
    }


    private Map<String, Map<String, Object>> getStudies(Container project, User user, Logger logger)
    {
        QueryService queryService = QueryService.get();
        QueryDefinition qd = queryService.getQueryDef(user, project, "cds", "ds_study");

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
