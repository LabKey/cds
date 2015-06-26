package org.labkey.test.util;

import org.labkey.remoteapi.di.RunTransformResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.TestFileUtils;
import org.labkey.test.etl.ETLHelper;

public class CDSUpgrader
{
    private final int WAIT_ON_IMPORT = 1 * 60 * 1000;
    private final int WAIT_ON_LOADAPP = 10 * 60 * 1000;
    private final BaseWebDriverTest _test;
    private final CDSHelper _cds;
    private final String _project;
    public ETLHelper _etlHelper;

    public CDSUpgrader(BaseWebDriverTest test, String projectName)
    {
        _test = test;
        _cds = new CDSHelper(_test);
        _project = projectName;
        _etlHelper = new ETLHelper(_test, _project);
    }

    @LogMethod
    public void setupDataspace()
    {
        setupProject();
        importData();
//        populateFactTable();
//        preCacheCube();
    }

    @LogMethod
    private void setupProject()
    {
        _test._containerHelper.createProject(_project, "Dataspace");
        _test._containerHelper.enableModule(_project, "CDS");

        _test.setPipelineRoot(TestFileUtils.getLabKeyRoot() + "/server/optionalModules/cds/test/sampledata");
        _test.importFolderFromPipeline("/MasterDataspace/folder.xml");

        _test.goToProjectHome();
    }

    @LogMethod
    private void importData()
    {
        try
        {
            // run initial ETL to populate CDS import tables
            _etlHelper.getDiHelper().runTransformAndWait("{cds}/CDSImport", WAIT_ON_IMPORT);

            // populate the app
            _etlHelper.getDiHelper().runTransformAndWait("{cds}/loadApplication", WAIT_ON_LOADAPP);
        }
        catch (Exception x)
        {

        }
    }
}
