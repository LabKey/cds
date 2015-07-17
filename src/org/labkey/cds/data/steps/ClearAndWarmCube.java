package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
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
