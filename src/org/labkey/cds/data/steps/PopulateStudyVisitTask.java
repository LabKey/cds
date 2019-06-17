/*
 * Copyright (c) 2015-2019 LabKey Corporation
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
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.util.DateUtil;

import java.util.Arrays;
import java.util.Map;

public class PopulateStudyVisitTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        BatchValidationException errors = new BatchValidationException();

        // populate cohorts
        QuerySchema projectCdsSchema = DefaultSchema.get(user, project).getSchema("cds");
        logger.info("Starting visit management.");
        long start = System.currentTimeMillis();
        for (Container container : project.getChildren())
        {
            QuerySchema studySchema = DefaultSchema.get(user, container).getSchema("study");

            if (studySchema == null)
                throw new PipelineJobException("Unable to find study schema for folder " + container.getPath());

            QuerySchema cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            TableInfo studyGroupSource = cdsSchema.getTable("ds_studygroup");
            TableInfo studyGroupTarget = cdsSchema.getTable("studygroup");

            QueryUpdateService studyGroupTargetService = studyGroupTarget.getUpdateService();

            if (studyGroupTargetService == null)
                throw new PipelineJobException("Unable to find update service for study.cohort in folder " + container.getPath());

            //
            // Delete Study Groups
            //
            try
            {
                studyGroupTargetService.truncateRows(user, container, null, null);
            }
            catch (Exception e)
            {
                logger.error(e.getMessage(), e);
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }

            //
            // Insert Study Groups
            //
            SQLFragment studyGroupSql = new SQLFragment("SELECT * FROM ").append(studyGroupSource).append(" WHERE prot = ?");
            studyGroupSql.add(container.getName());

            Map<String, Object>[] studyGroupRows = new SqlSelector(studyGroupSource.getSchema(), studyGroupSql).getMapArray();
            if (studyGroupRows.length > 0)
            {
                try
                {
                    studyGroupTargetService.insertRows(user, container, Arrays.asList(studyGroupRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }

            //
            // Update Visits
            //
            TableInfo visitSource = cdsSchema.getTable("ds_visit");
            TableInfo visitTarget = studySchema.getTable("visit");
            QueryUpdateService visitTargetService = visitTarget.getUpdateService();

            if (visitTargetService == null)
                throw new PipelineJobException("Unable to find update service for study.visit in folder " + container.getPath());

            SQLFragment visitSql = new SQLFragment("SELECT * FROM ").append(visitSource).append(" WHERE prot = ?");
            visitSql.add(container.getName());

            Map<String, Object>[] visitRows = new SqlSelector(visitSource.getSchema(), visitSql).getMapArray();
            if (visitRows.length > 0)
            {
                try
                {
                    visitTargetService.insertRows(user, container, Arrays.asList(visitRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            //
            // Populate Study Group Visit Map (Schedule)
            //
            SQLFragment studyGroupVisitMapSql = new SQLFragment("SELECT DISTINCT studygroup.row_id AS group_id, visit.rowid AS visit_row_id, arm_visit.prot\n");
            studyGroupVisitMapSql.append("FROM (SELECT * FROM cds.import_studypartgrouparmvisit WHERE container = ? AND prot = ?) AS arm_visit\n")
                    .add(project)
                    .add(container.getName())
                    .append("INNER JOIN (SELECT * FROM cds.studygroup WHERE container = ?) AS studygroup\n")
                    .add(container)
                    .append("ON (studygroup.group_name = arm_visit.study_group)\n")
                    .append("INNER JOIN (SELECT * FROM study.visit WHERE container = ?) AS visit\n")
                    .add(container)
                    .append("ON (visit.sequencenummin = CAST(arm_visit.study_day AS DOUBLE PRECISION))");

            TableInfo studyGroupVisitMapTarget = cdsSchema.getTable("studygroupvisitmap");
            QueryUpdateService studyGroupVisitMapTargetService = studyGroupVisitMapTarget.getUpdateService();

            if (studyGroupVisitMapTargetService == null)
                throw new PipelineJobException("Unable to find update service for cds.studygroupvisitmap in folder " + container.getPath());

            Map<String, Object>[] studyGroupVisitMapRows = new SqlSelector(projectCdsSchema.getDbSchema(), studyGroupVisitMapSql).getMapArray();
            if (studyGroupVisitMapRows.length > 0)
            {
                try
                {
                    studyGroupVisitMapTargetService.insertRows(user, container, Arrays.asList(studyGroupVisitMapRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            // Insert visit time
            //
            TableInfo visitTimeSource = cdsSchema.getTable("import_studypartgrouparmvisittime");
            TableInfo visitTimeTarget = cdsSchema.getTable("studypartgrouparmvisittime");
            QueryUpdateService visitTimeTargetService = visitTimeTarget.getUpdateService();

            SQLFragment visitTimeSql = new SQLFragment("SELECT study_part, study_group, study_arm, study_day, visit_code, hours_post_initial_infusion, hours_post_recent_infusion, visit_time_label" +
                    " FROM ").append(visitTimeSource).append(" WHERE prot = ?");
            visitTimeSql.add(container.getName());

            Map<String, Object>[] visitTimeRows = new SqlSelector(visitTimeSource.getSchema(), visitTimeSql).getMapArray();
            if (visitTimeRows.length > 0)
            {
                try
                {
                    visitTimeTargetService.insertRows(user, container, Arrays.asList(visitTimeRows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            if (errors.hasErrors())
            {
                for (ValidationException error : errors.getRowErrors())
                {
                    logger.error(error.getMessage());
                }
                return;
            }
        }

        long finish = System.currentTimeMillis();

        logger.info("Visit management took " + DateUtil.formatDuration(finish - start) + ".");
    }
}
