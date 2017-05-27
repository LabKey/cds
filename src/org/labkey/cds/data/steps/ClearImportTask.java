package org.labkey.cds.data.steps;

import org.apache.log4j.Logger;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.util.DateUtil;

public class ClearImportTask extends ClearTablesTask
{

    @Override
    protected void clear(Logger logger) throws PipelineJobException
    {
        logger.info("Clearing subject level import_ tables");
        long start = System.currentTimeMillis();

        // datasets
        clearTable("cds", "import_ICS", project, logger);
        clearTable("cds", "import_NAb", project, logger);
        clearTable("cds", "import_ELS_IFNg", project, logger);
        clearTable("cds", "import_BAMA", project, logger);

        //Dependent Tables
        clearTable("cds", "import_StudyPartGroupArmSubject", project, logger);
        clearTable("cds", "import_StudyPartGroupArmProduct", project, logger);
        clearTable("cds", "import_StudyPartGroupArmVisitProduct", project, logger);
        clearTable("cds", "import_StudyPartGroupArmVisit", project, logger);
        clearTable("cds", "import_StudyPartGroupArm", project, logger);
        clearTable("cds", "import_studysubject", project, logger);

        long finish = System.currentTimeMillis();
        logger.info("Clearing subject level import tables took " + DateUtil.formatDuration(finish - start) + ".");

    }

}
