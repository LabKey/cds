/*
 * Copyright (c) 2015-2019 LabKey Corporation
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

import org.apache.logging.log4j.Logger;
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
import org.labkey.api.util.DateUtil;

import java.util.Collections;
import java.util.List;

public class ClearMappingTask extends TaskRefTaskImpl
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
            clearTable("cds", "mAbGridBase", container, logger);
            clearTable("cds", "GridBase", container, logger);
            clearTable("cds", "visittagalignment", container, logger);
            clearTable("cds", "visittagmap", container, logger);
            clearTable("cds", "treatmentarmsubjectmap", container, logger);
            clearTable("cds", "studygroupvisitmap", container, logger);
            clearTable("cds", "subjectproductmap", container, logger);
            clearTable("cds", "studypartgrouparmproduct", container, logger);
            clearTable("cds", "studypartgrouparmvisittime", container, logger);
            clearTable("cds", "studyproductmap", container, logger);
            clearTable("cds", "studyassay", container, logger);
            clearTable("cds", "studydocument", container, logger);
            clearTable("cds", "studypublication", container, logger);
            clearTable("cds", "studyrelationship", container, logger);
            clearTable("cds", "study", container, logger);
            clearTable("cds", "publicationDocument", container, logger);
            clearTable("cds", "studyReport", container, logger);
            clearTable("cds", "studyCuratedGroup", container, logger);
            clearTable("cds", "publicationReport", container, logger);
            clearTable("cds", "publicationCuratedGroup", container, logger);
        }

        clearTable("cds", "studyproductmap", project, logger);      // May have project data, too
        clearTable("cds", "mabmix", project, logger);
        clearTable("cds", "mAbMetaGridBase", project, logger);
        clearTable("cds", "icsantigen", project, logger);
        clearTable("cds", "nabantigen", project, logger);
        clearTable("cds", "elispotantigen", project, logger);
        clearTable("cds", "bamaantigen", project, logger);
        clearTable("cds", "facts", project, logger);
        clearTable("study", "visittag", project, logger);
        clearTable("cds", "publicationDocument", project, logger);

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
