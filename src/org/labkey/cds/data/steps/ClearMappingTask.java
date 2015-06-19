package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class ClearMappingTask extends TaskRefTaskImpl
{
    Container project;
    User user;

    @Override
    public RecordedActionSet run(Logger logger) throws PipelineJobException
    {
        project = containerUser.getContainer();
        user = containerUser.getUser();

        clear(logger);

        return new RecordedActionSet(makeRecordedAction());
    }


    @Override
    public List<String> getRequiredSettings()
    {
        return Collections.emptyList();
    }


    protected void clear(Logger logger) throws PipelineJobException
    {
        logger.info("Clearing mapping tables");
        long start = System.currentTimeMillis();

        for (Container container : project.getChildren())
        {
            clearTable("cds", "facts", container, logger);
            clearTable("cds", "treatmentarmsubjectmap", container, logger);
            clearTable("cds", "subjectproductmap", container, logger);
            clearTable("cds", "studyproductmap", container, logger);
        }

        long finish = System.currentTimeMillis();
        logger.info("Clearing mapping tables took " + DateUtil.formatDuration(finish - start) + ".");
    }


    private void clearTable(String schema, String table, Container container, Logger logger) throws PipelineJobException
    {
        QuerySchema clearSchema;
        TableInfo clearTable;
        QueryUpdateService clearService;

        clearSchema = DefaultSchema.get(user, container).getSchema(schema);

        if (clearSchema == null)
            throw new PipelineJobException("Unable to find " + schema + " schema for folder " + container.getPath());

        clearTable = clearSchema.getTable(table);
        clearService = clearTable.getUpdateService();

        if (clearService == null)
            throw new PipelineJobException("Unable to find update service for " + clearSchema.getName() + "." + clearTable.getName());

        try
        {
            clearService.truncateRows(user, container, null, null);
        }
        catch (Exception e)
        {
            throw new PipelineJobException(e);
        }
    }
}
