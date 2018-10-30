/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.cds.data.steps;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.module.FolderTypeManager;
import org.labkey.api.pipeline.PipelineJob;
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

    //Infinite recursion (StackOverflowError) (through reference chain: java.util.ArrayList[1]->org.labkey.di.steps.TaskRefTransformStepMeta["taskInstance"]->org.labkey.cds.data.steps.CDSValidateTask["job"]
    //->org.labkey.di.pipeline.TransformPipelineJob["_etlDescriptor"]->org.labkey.di.pipeline.TransformDescriptor["_stepMetaDatas"]->java.util.ArrayList[1]->org.labkey.di.steps.TaskRefTransformStepMeta["taskInstance"]
    @JsonIgnore
    PipelineJob job;

    @Override
    public RecordedActionSet run(@NotNull PipelineJob job) throws PipelineJobException
    {
        project = containerUser.getContainer();
        user = containerUser.getUser();
        this.job = job;

        if (project.isProject() && project.getFolderType().equals(FolderTypeManager.get().getFolderType(StudyService.DATASPACE_FOLDERTYPE_NAME)))
        {
            populate(job.getLogger());
        }
        else
        {
            job.getLogger().error(project.getName() + "must be a project and of type \"" + StudyService.DATASPACE_FOLDERTYPE_NAME + "\"");
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
