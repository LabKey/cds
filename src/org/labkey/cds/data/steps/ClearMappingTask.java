/*
 * Copyright (c) 2015-2016 LabKey Corporation
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

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.util.DateUtil;

public class ClearMappingTask extends ClearTablesTask
{
    @Override
    protected void clear(Logger logger) throws PipelineJobException
    {
        logger.info("Clearing mapping tables");
        long start = System.currentTimeMillis();

        for (Container container : project.getChildren())
        {
            clearTable("cds", "facts", container, logger);
            clearTable("cds", "GridBase", container, logger);
            clearTable("cds", "visittagalignment", container, logger);
            clearTable("cds", "visittagmap", container, logger);
            clearTable("cds", "treatmentarmsubjectmap", container, logger);
            clearTable("cds", "studygroupvisitmap", container, logger);
            clearTable("cds", "subjectproductmap", container, logger);
            clearTable("cds", "studypartgrouparmproduct", container, logger);
            clearTable("cds", "studyproductmap", container, logger);
            clearTable("cds", "studyassay", container, logger);
            clearTable("cds", "studydocument", container, logger);
            clearTable("cds", "studypublication", container, logger);
            clearTable("cds", "studyrelationship", container, logger);
            clearTable("cds", "study", container, logger);
        }

        clearTable("cds", "icsantigen", project, logger);
        clearTable("cds", "nabantigen", project, logger);
        clearTable("cds", "elispotantigen", project, logger);
        clearTable("cds", "bamaantigen", project, logger);
        clearTable("cds", "facts", project, logger);
        clearTable("study", "visittag", project, logger);

        long finish = System.currentTimeMillis();
        logger.info("Clearing mapping tables took " + DateUtil.formatDuration(finish - start) + ".");
    }

}
