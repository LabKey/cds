package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

public class PopulateDemographicsTask extends AbstractPopulateTask
{
    protected void populate(Logger logger) throws PipelineJobException
    {
        // If !hasErrors?
        Container project = containerUser.getContainer();
        User user = containerUser.getUser();

        // study.ds_demographics
        QueryService queryService = QueryService.get();
        QueryDefinition qd = queryService.getQueryDef(user, project, "study", "ds_demographics");

        ArrayList<QueryException> qerrors = new ArrayList<>();
        TableInfo tiImportDemographics = qd.getTable(qerrors, true);

        if (!qerrors.isEmpty())
        {
            // TODO: Process errors?
            return;
        }
        else if (null == tiImportDemographics)
        {
            logger.error("Unable to find source query for demographics.");
            return;
        }

        SQLFragment sql;
        BatchValidationException errors = new BatchValidationException();

        // Assumes all child containers are studies
        for (Container container : project.getChildren())
        {
            sql = new SQLFragment("SELECT * FROM ").append(tiImportDemographics).append(" WHERE study_name = ?");
            sql.add(container.getName());

            Map<String, Object>[] subjects = new SqlSelector(tiImportDemographics.getSchema(), sql).getMapArray();
            if (subjects.length > 0)
            {
                try
                {
                    TableInfo demographicsTI = DefaultSchema.get(user, container).getSchema("study").getTable("Demographics");

                    sql = new SQLFragment("SELECT * FROM ").append(demographicsTI, "demographics");
                    Map<String, Object>[] allRows = new SqlSelector(demographicsTI.getSchema(), sql).getMapArray();
                    if (allRows.length > 0)
                        demographicsTI.getUpdateService().deleteRows(user, container, Arrays.asList(allRows), null, null);

                    demographicsTI.getUpdateService().insertRows(user, container, Arrays.asList(subjects), errors, null, null);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(), e);
                }
            }
            else
            {
                logger.warn("Study \"" + container.getName() + "\" does not have any associated subjects. Make sure this is expected.");
            }
        }
    }
}
