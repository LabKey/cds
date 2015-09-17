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

public class PopulateAssayTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        logger.info("Starting populate assays.");
        long start = System.currentTimeMillis();

        SQLFragment sql;
        BatchValidationException errors = new BatchValidationException();
        Map<String, Object>[] rows;

        // populate cohorts
        QuerySchema cdsSchema = DefaultSchema.get(user, project).getSchema("cds");

        if (cdsSchema == null)
            throw new PipelineJobException("Unable to find cds schema for folder " + project.getPath());

        TableInfo sourceTable = cdsSchema.getTable("ds_assay");
        TableInfo targetTable = cdsSchema.getTable("assay");

        QueryUpdateService targetService = targetTable.getUpdateService();

        if (targetService == null)
            throw new PipelineJobException("Unable to find update service for study.cohort in folder " + project.getPath());

        //
        // Delete Assays
        //
        try
        {
            targetService.truncateRows(user, project, null, null);
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
        // Insert Assays (all in current project)
        //
        sql = new SQLFragment("SELECT * FROM ").append(sourceTable);
        rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();

        if (rows.length > 0)
        {
            try
            {
                targetService.insertRows(user, project, Arrays.asList(rows), errors, null, null);
                logger.info("Inserted " + rows.length + " rows in cds.assay.");
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

        long finish = System.currentTimeMillis();
        logger.info("Populate assays took " + DateUtil.formatDuration(finish - start) + ".");
    }
}
