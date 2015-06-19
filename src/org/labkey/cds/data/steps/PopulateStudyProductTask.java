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
import org.labkey.api.security.User;

import java.util.Arrays;
import java.util.Map;

public class PopulateStudyProductTask extends AbstractPopulateTask
{
    String SOURCE_SCHEMA = "study";
    String SOURCE_QUERY = "ds_studyproduct";
    String TARGET_SCHEMA = "cds";
    String TARGET_QUERY = "studyproductmap";

    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        DefaultSchema projectSchema = DefaultSchema.get(user, project);

        QuerySchema sourceSchema = projectSchema.getSchema(SOURCE_SCHEMA);

        if (null == sourceSchema)
        {
            throw new PipelineJobException("Unable to find source schema: \"" + SOURCE_SCHEMA + "\".");
        }

        TableInfo sourceTable = sourceSchema.getTable(SOURCE_QUERY);

        if (null == sourceTable)
        {
            throw new PipelineJobException("Unable to find source table: \"" + SOURCE_QUERY + "\".");
        }

        QuerySchema targetSchema = projectSchema.getSchema(TARGET_SCHEMA);

        if (null == targetSchema)
        {
            throw new PipelineJobException("Unable to find target schema: \"" + TARGET_SCHEMA + "\".");
        }

        TableInfo targetTable = targetSchema.getTable(TARGET_QUERY);

        if (null == targetTable)
        {
            throw new PipelineJobException("Unable to find target table: \"" + TARGET_QUERY + "\".");
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
        targetTable = targetSchema.getTable(TARGET_QUERY);

        SQLFragment sql;
        Map<String, Object>[] rows;
        BatchValidationException errors = new BatchValidationException();
        long start;
        long finish;

        // Insert all the rows
        for (Container container : project.getChildren())
        {
            sql = new SQLFragment("SELECT * FROM ").append(sourceTable).append(" WHERE prot = ?");
            sql.add(container.getName());
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
    }
}
