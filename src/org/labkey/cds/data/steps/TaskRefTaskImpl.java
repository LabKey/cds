package org.labkey.cds.data.steps;

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.di.TaskRefTask;
import org.labkey.api.exp.PropertyType;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.writer.ContainerUser;

import java.util.Map;

public abstract class TaskRefTaskImpl implements TaskRefTask
{
    protected Map<String, String> settings = new CaseInsensitiveHashMap<>();
    protected ContainerUser containerUser;

    @Override
    public void setSettings(Map<String, String> settings)
    {
        this.settings = settings;
    }

    @Override
    public void setContainerUser(ContainerUser containerUser)
    {
        this.containerUser = containerUser;
    }

    /**
     * Helper to turn a map of settings and outputs into a RecordedAction to be added to the RecordedActionSet return
     * of run()
     */
    protected RecordedAction makeRecordedAction()
    {
        RecordedAction ra = new RecordedAction(this.getClass().getSimpleName());
        for (Map.Entry<String,String> setting : settings.entrySet())
        {
            RecordedAction.ParameterType paramType = new RecordedAction.ParameterType(setting.getKey(), PropertyType.STRING);
            ra.addParameter(paramType, setting.getValue());
        }
        return ra;
    }
}
