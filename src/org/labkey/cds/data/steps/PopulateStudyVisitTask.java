/*
 * Copyright (c) 2015 LabKey Corporation
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
        SQLFragment sql;
        BatchValidationException errors = new BatchValidationException();

        // populate cohorts
        QuerySchema studySchema;
        QuerySchema cdsSchema;

        TableInfo sourceTable;
        TableInfo targetTable;

        QueryUpdateService targetService;
        Map<String, Object>[] rows;

        logger.info("Starting visit management.");
        long start = System.currentTimeMillis();
        for (Container container : project.getChildren())
        {
            studySchema = DefaultSchema.get(user, container).getSchema("study");

            if (studySchema == null)
                throw new PipelineJobException("Unable to find study schema for folder " + container.getPath());

            cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            sourceTable = cdsSchema.getTable("ds_studygroup");
            targetTable = cdsSchema.getTable("studygroup");

            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for study.cohort in folder " + container.getPath());

            //
            // Delete Study Groups
            //
            try
            {
                targetService.truncateRows(user, container, null, null);
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
            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
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
            sourceTable = cdsSchema.getTable("ds_visit");
            targetTable = studySchema.getTable("visit");
            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for study.visit in folder " + container.getPath());

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }

            //
            // Populate Study Group Visit Map (Schedule)
            //
            sourceTable = cdsSchema.getTable("ds_studygroupvisit");
            targetTable = cdsSchema.getTable("studygroupvisitmap");
            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for cds.studygroupvisitmap in folder " + container.getPath());

            ((ContainerFilterable) sourceTable).setContainerFilter(new ContainerFilter.CurrentAndSubfolders(user));

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }
        }

        //
        // Populate Visit Tags (Project level only)
        //
        studySchema = DefaultSchema.get(user, project).getSchema("study");

        if (studySchema == null)
            throw new PipelineJobException("Unable to find study schema for project " + project.getPath());

        cdsSchema = DefaultSchema.get(user, project).getSchema("cds");

        if (cdsSchema == null)
            throw new PipelineJobException("Unable to find cds schema for project " + project.getPath());

        sourceTable = cdsSchema.getTable("ds_visittag");
        targetTable = studySchema.getTable("visittag");
        targetService = targetTable.getUpdateService();

        if (targetService == null)
            throw new PipelineJobException("Unable to find update service for study.visittag in project " + project.getPath());

        sql = new SQLFragment("SELECT * FROM ").append(sourceTable);

        rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
        if (rows.length > 0)
        {
            try
            {
                targetService.insertRows(user, project, Arrays.asList(rows), errors, null, null);
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
        // Populate Visit Tag Map
        //
        for (Container container : project.getChildren())
        {
            cdsSchema = DefaultSchema.get(user, container).getSchema("cds");

            if (cdsSchema == null)
                throw new PipelineJobException("Unable to find cds schema for folder " + container.getPath());

            sourceTable = cdsSchema.getTable("ds_visittagmap");
            ((ContainerFilterable) sourceTable).setContainerFilter(new ContainerFilter.CurrentAndSubfolders(user));

            targetTable = cdsSchema.getTable("visittagmap");
            targetService = targetTable.getUpdateService();

            if (targetService == null)
                throw new PipelineJobException("Unable to find update service for cds.visittagmap in folder " + container.getPath());

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());

            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
            if (rows.length > 0)
            {
                try
                {
                    targetService.insertRows(user, container, Arrays.asList(rows), errors, null, null);
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
