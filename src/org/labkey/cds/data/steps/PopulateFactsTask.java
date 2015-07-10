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

import java.util.Arrays;
import java.util.Map;

public class PopulateFactsTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        load("study", "ds_facts", "cds", "Facts", logger);
        load("study", "ds_properties", "cds", "properties", logger);
    }


    private void load(String sourceSchema, String sourceQuery, String targetSchema, String targetQuery, Logger logger) throws PipelineJobException
    {
        DefaultSchema projectSchema = DefaultSchema.get(user, project);

        QuerySchema ss = projectSchema.getSchema(sourceSchema);

        if (null == ss)
        {
            throw new PipelineJobException("Unable to find source schema: \"" + sourceSchema + "\".");
        }

        TableInfo sourceTable = ss.getTable(sourceQuery);

        if (null == sourceTable)
        {
            throw new PipelineJobException("Unable to find source table: \"" + sourceQuery + "\".");
        }

        QuerySchema ts = projectSchema.getSchema(targetSchema);

        if (null == ts)
        {
            throw new PipelineJobException("Unable to find target schema: \"" + targetSchema + "\".");
        }

        TableInfo targetTable = ts.getTable(targetQuery);

        if (null == targetTable)
        {
            throw new PipelineJobException("Unable to find target table: \"" + targetQuery + "\".");
        }

        QueryUpdateService qus = targetTable.getUpdateService();

        if (null == qus)
        {
            throw new PipelineJobException("Unable to find update service for " + ts.getName() + "." + targetTable.getName());
        }

        SQLFragment sql = new SQLFragment("SELECT * FROM ").append(sourceTable);
        Map<String, Object>[] sourceRows = new SqlSelector(sourceTable.getSchema(), sql).getMapArray();
        BatchValidationException errors = new BatchValidationException();

        if (sourceRows.length > 0)
        {
            try
            {
                qus.insertRows(user, project, Arrays.asList(sourceRows), errors, null, null);

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
        else
        {
            logger.warn("Did not find any rows to import into " + ts.getName() + "." + targetTable.getName() + ".");
        }
    }
}
