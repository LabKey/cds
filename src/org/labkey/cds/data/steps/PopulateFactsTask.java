package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.security.User;
import org.labkey.cds.CDSSchema;
import org.labkey.cds.CDSSimpleTable;
import org.labkey.cds.CDSUserSchema;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

public class PopulateFactsTask extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        Container project = containerUser.getContainer();
        User user = containerUser.getUser();

        // SOURCE: study.ds_facts
        QueryService queryService = QueryService.get();
        QueryDefinition qd = queryService.getQueryDef(user, project, "study", "ds_facts");

        ArrayList<QueryException> qerrors = new ArrayList<>();
        TableInfo tiImportFacts = qd.getTable(qerrors, true);

        if (!qerrors.isEmpty())
        {
            // TODO: Process errors?
            return;
        }
        else if (null == tiImportFacts)
        {
            logger.error("Unable to find source query for facts.");
            return;
        }

        // TARGET: cds.Facts
        TableInfo tiFacts = new CDSSimpleTable(new CDSUserSchema(user, project), CDSSchema.getInstance().getSchema().getTable("Facts"));
        QueryUpdateService factsQUS = tiFacts.getUpdateService();

        if (null == factsQUS)
        {
            throw new PipelineJobException("Unable to find update service for " + tiFacts.getName());
        }

        SQLFragment sql = new SQLFragment("SELECT * FROM ").append(tiImportFacts);
        Map<String, Object>[] factsMap = new SqlSelector(tiImportFacts.getSchema(), sql).getMapArray();

        if (factsMap.length > 0)
        {
            try
            {
                factsQUS.truncateRows(user, project, null, null);
                factsQUS.insertRows(user, project, Arrays.asList(factsMap), new BatchValidationException(), null, null);
            }
            catch (Exception e)
            {
                logger.error(e.getMessage(), e);
            }
        }
        else
        {
            logger.warn("Did not find any facts to import into fact table.");
        }
    }
}
