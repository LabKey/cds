package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.security.User;

import java.util.Collections;
import java.util.List;

public abstract class ClearTablesTask extends TaskRefTaskImpl
{
    Container project;
    User user;

    @Override
    public RecordedActionSet run(@NotNull PipelineJob job) throws PipelineJobException
    {
        project = containerUser.getContainer();
        user = containerUser.getUser();

        clear(job.getLogger());

        return new RecordedActionSet(makeRecordedAction());
    }

    protected abstract void clear(Logger logger) throws PipelineJobException;


    @Override
    public List<String> getRequiredSettings()
    {
        return Collections.emptyList();
    }

    protected void clearTable(String schema, String table, Container container, Logger logger) throws PipelineJobException
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
