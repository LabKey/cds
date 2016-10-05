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
import org.labkey.api.query.ValidationException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class PopulateRelationshipTask extends AbstractPopulateTask
{
    String MAIN_STUDY = "Main study";  // TODO: change this to an enum reference later

    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        QuerySchema cdsSchema = DefaultSchema.get(user, project).getSchema("cds");

        if (null == cdsSchema)
        {
            throw new PipelineJobException("Schema not found: cds");
        }

        TableInfo sourceTable = cdsSchema.getTable("import_studyrelationship");
        TableInfo targetTable = cdsSchema.getTable("studyrelationship");

        // Truncate the target table
        if (targetTable instanceof ContainerFilterable)
        {
            ((ContainerFilterable) targetTable).setContainerFilter(new ContainerFilter.CurrentAndSubfolders(user));
        }

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

        Map<String, String> relationshipMap = new HashMap<>();

        // Insert all the rows
        for (Container container : project.getChildren())
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
                    String relationship = (String)row.get("relationship");

                    relationshipMap.put(study + relatedStudy, relationship);

                    if(study.equals(relatedStudy))
                    {
                        logger.warn("Study '" + study + "' is defined as related to itself.");
                    }
                    else if(relationship.equals(MAIN_STUDY))
                    {
                        String relationshipMapEntry = relationshipMap.get(relatedStudy + study);
                        if((relationshipMapEntry != null) && relationshipMapEntry.equals(MAIN_STUDY))
                        {
                            logger.warn("Studies '" + study + "' and '" + relatedStudy + "' both define each other as a '" + MAIN_STUDY + "' relationship.");
                        }
                    }
                }
            }
        }
    }
}
