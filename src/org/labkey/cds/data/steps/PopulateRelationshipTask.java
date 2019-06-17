/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class PopulateRelationshipTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        QuerySchema cdsSchema = DefaultSchema.get(user, project).getSchema("cds");

        if (null == cdsSchema)
        {
            throw new PipelineJobException("Schema not found: cds");
        }

        TableInfo sourceTable = cdsSchema.getTable("learn_relationshipsforstudies", null);
        TableInfo targetTable = cdsSchema.getTable("studyrelationship", new ContainerFilter.CurrentAndSubfolders(user));

        // Truncate the target table
        try
        {
            targetTable.getUpdateService().truncateRows(user, project, null, null);
        }
        catch (Exception e)
        {
            logger.error(e.getMessage(), e);
        }

        // Get a new TableInfo with the default container filter
        targetTable = cdsSchema.getTable("studyrelationship");

        SQLFragment sql;
        SQLFragment queryForRowsWithoutValidStudy = new SQLFragment("SELECT * FROM ").append(sourceTable)
                .append(" WHERE ");
        Map<String, Object>[] rows;
        BatchValidationException errors = new BatchValidationException();

        List<Container> containers = project.getChildren();

        // Get valid studies first
        Set<String> validStudies = new HashSet<>();
        for (Container container : containers)
        {
            validStudies.add(container.getName());
        }

        // Insert all the rows
        for (Container container : containers)
        {
            sql = new SQLFragment("SELECT * FROM ").append(sourceTable, sourceTable.getName()).append(" WHERE prot = ?");
            sql.add(container.getName());
            rows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();

            queryForRowsWithoutValidStudy.append("prot != '").append(container.getName()).append("' AND ");

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

                for (Map<String, Object> row : rows)
                {
                    String study = (String)row.get("prot");
                    String relatedStudy = (String)row.get("rel_prot");

                    if(!validStudies.contains(relatedStudy))  // have to enforce this at ETL time, not in db, due to container deletion problems
                    {
                        throw new PipelineJobException("Related study '" + relatedStudy + "' does not exist in 'study' table.");
                    }
                    else if(study.equals(relatedStudy))
                    {
                        logger.warn("Study '" + study + "' is defined as related to itself.");
                    }
                }
            }
        }
    }
}
