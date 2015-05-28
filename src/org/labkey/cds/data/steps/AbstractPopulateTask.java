package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedActionSet;

import java.util.Collections;
import java.util.List;

abstract public class AbstractPopulateTask extends TaskRefTaskImpl
{
    @Override
    public RecordedActionSet run(Logger logger) throws PipelineJobException
    {
        populate(logger);

        return new RecordedActionSet(makeRecordedAction());
    }

    @Override
    public List<String> getRequiredSettings()
    {
        return Collections.emptyList();
    }

    abstract protected void populate(Logger logger);
}
