package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;

import java.util.Collections;
import java.util.List;

abstract public class AbstractPopulateTask extends TaskRefTaskImpl
{
    Container project;
    User user;

    @Override
    public RecordedActionSet run(Logger logger) throws PipelineJobException
    {
        project = containerUser.getContainer();
        user = containerUser.getUser();

        if (project.isProject() && project.getFolderType().equals(FolderTypeManager.get().getFolderType(StudyService.DATASPACE_FOLDERTYPE_NAME)))
        {
            populate(logger);
        }
        else
        {
            logger.error(project.getName() + "must be a project and of type \"" + StudyService.DATASPACE_FOLDERTYPE_NAME + "\"");
        }

        return new RecordedActionSet(makeRecordedAction());
    }

    @Override
    public List<String> getRequiredSettings()
    {
        return Collections.emptyList();
    }

    abstract protected void populate(Logger logger) throws PipelineJobException;
}
