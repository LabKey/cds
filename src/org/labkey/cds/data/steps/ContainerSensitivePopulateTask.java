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
import java.util.List;
import java.util.Map;

//Copies data from one table to another, and populates the container column based on the prot column along the way.
public class ContainerSensitivePopulateTask extends AbstractPopulateTask
{
    String SOURCE_SCHEMA = "sourceSchema";
    String SOURCE_QUERY = "sourceQuery";
    String TARGET_SCHEMA = "targetSchema";
    String TARGET_QUERY = "targetQuery";

    @Override
    public List<String> getRequiredSettings()
    {
        return Arrays.asList(SOURCE_SCHEMA, SOURCE_QUERY, TARGET_SCHEMA, TARGET_QUERY);
    }

    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        DefaultSchema projectSchema = DefaultSchema.get(user, project);

        QuerySchema sourceSchema = projectSchema.getSchema(settings.get(SOURCE_SCHEMA));

        if (null == sourceSchema)
        {
            throw new PipelineJobException("Unable to find source schema: \"" + settings.get(SOURCE_SCHEMA) + "\".");
        }

        TableInfo sourceTable = sourceSchema.getTable(settings.get(SOURCE_QUERY));

        if (null == sourceTable)
        {
            throw new PipelineJobException("Unable to find source table: \"" + settings.get(SOURCE_QUERY) + "\".");
        }

        QuerySchema targetSchema = projectSchema.getSchema(settings.get(TARGET_SCHEMA));

        if (null == targetSchema)
        {
            throw new PipelineJobException("Unable to find target schema: \"" + settings.get(TARGET_SCHEMA) + "\".");
        }

        TableInfo targetTable = targetSchema.getTable(settings.get(TARGET_QUERY));

        if (null == targetTable)
        {
            throw new PipelineJobException("Unable to find target table: \"" + settings.get(TARGET_QUERY) + "\".");
        }

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
        targetTable = targetSchema.getTable(settings.get(TARGET_QUERY));

        SQLFragment sql;
        SQLFragment queryForRowsWithoutValidStudy = new SQLFragment("SELECT * FROM ").append(sourceTable)
                .append(" WHERE ");
        Map<String, Object>[] rows;
        BatchValidationException errors = new BatchValidationException();

        // Insert all the rows
        for (Container container : project.getChildren())
        {
            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
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
            }
        }

        String temp = queryForRowsWithoutValidStudy.getRawSQL();
        queryForRowsWithoutValidStudy = new SQLFragment(temp.substring(0, temp.length() - 5));
        rows = new SqlSelector(sourceTable.getSchema(), queryForRowsWithoutValidStudy).getMapArray();
        if (rows.length > 0)
        {
            try
            {
                targetTable.getUpdateService().insertRows(user, project, Arrays.asList(rows), errors, null, null);

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
}