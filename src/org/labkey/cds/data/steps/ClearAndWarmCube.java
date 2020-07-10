/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
import org.labkey.api.cache.CacheManager;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.QueryService;

/**
 * Created by Joe on 7/14/2015.
 */
public class ClearAndWarmCube extends AbstractPopulateTask
{
    @Override
    protected void populate(Logger logger) throws PipelineJobException
    {
        CacheManager.clearAllKnownCaches(); // query definition might be stale
        clearCube();
//        warmCube();
    }
    private void clearCube()
    {
        QueryService.get().cubeDataChanged(project);
    }
    private void warmCube()
    {
        //todo: Only if necessary
    }

}
