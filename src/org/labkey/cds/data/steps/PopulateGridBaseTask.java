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
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.util.DateUtil;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class PopulateGridBaseTask extends AbstractPopulateTask
{
    String SOURCE_SCHEMA = "sourceSchema";
    String SOURCE_QUERY = "sourceQuery";
    String TARGET_SCHEMA = "targetSchema";
    String TARGET_QUERY = "targetQuery";
    String SKIP_CONTAINER_FILTERING = "bypassContainerFilter";

    @Override
    public List<String> getRequiredSettings()
    {
        return Arrays.asList(SOURCE_SCHEMA, SOURCE_QUERY, TARGET_SCHEMA, TARGET_QUERY, SKIP_CONTAINER_FILTERING);
    }

    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        SQLFragment sql;
        Map<String, Object>[] rows;
        BatchValidationException errors = new BatchValidationException();
        long start = System.currentTimeMillis();

        boolean skipContainerFiltering = "true".equalsIgnoreCase(settings.get(SKIP_CONTAINER_FILTERING));

        // Insert all the rows
        for (Container container : project.getChildren())
        {
            DefaultSchema containerSchema = DefaultSchema.get(user, container);

            QuerySchema targetSchema = containerSchema.getSchema(settings.get(TARGET_SCHEMA));

            if (null == targetSchema)
            {
                throw new PipelineJobException("Unable to find target schema: \"" + settings.get(TARGET_SCHEMA) + "\".");
            }

            TableInfo targetTable = targetSchema.getTable(settings.get(TARGET_QUERY));

            if (null == targetTable)
            {
                throw new PipelineJobException("Unable to find target table: \"" + settings.get(TARGET_QUERY) + "\".");
            }

            // Get a new TableInfo with the default container filter
            targetTable = targetSchema.getTable(settings.get(TARGET_QUERY));

            DefaultSchema childSchema = DefaultSchema.get(user, container);

            QuerySchema sourceSchema = childSchema.getSchema(settings.get(SOURCE_SCHEMA));

            if (null == sourceSchema)
            {
                throw new PipelineJobException("Unable to find source schema: \"" + settings.get(SOURCE_SCHEMA) + "\".");
            }

            TableInfo sourceTable = sourceSchema.getTable(settings.get(SOURCE_QUERY), ContainerFilter.CURRENT);

            if (null == sourceTable)
            {
                throw new PipelineJobException("Unable to find source table: \"" + settings.get(SOURCE_QUERY) + "\".");
            }

            sql = new SQLFragment("SELECT * FROM ").append(sourceTable);
            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();

            if (rows.length > 0)
            {
                try
                {
                    targetTable.getUpdateService().insertRows(user, container, Arrays.asList(rows), errors, null, null);

                    if (errors.hasErrors())
                    {
                        for (ValidationException error : errors.getRowErrors())
                        {
                            logger.warn(error.getMessage());
                        }
                    }
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }
        }

        long finish = System.currentTimeMillis();

        logger.info("Populating " + settings.get(TARGET_QUERY) + " took " + DateUtil.formatDuration(finish - start) + ".");
    }
}
