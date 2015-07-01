/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
package org.labkey.test.util;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.etl.ETLHelper;

public class CDSInitializer
{
    private final int WAIT_ON_IMPORT = 1 * 60 * 1000;
    private final int WAIT_ON_LOADAPP = 10 * 60 * 1000;

    private final BaseWebDriverTest _test;
    private final CDSHelper _cds;
    private final String _project;
    public ETLHelper _etlHelper;

    // Set this to true if you want to skip the import of data and setting up the project.
    private final boolean _debugTest = false;

    public CDSInitializer(BaseWebDriverTest test, String projectName)
    {
        _test = test;
        _cds = new CDSHelper(_test);
        _project = projectName;
        _etlHelper = new ETLHelper(_test, _project);
    }

    @LogMethod
    public void setupDataspace() throws Exception
    {
        if(_debugTest){
            // If debugging test do not run setup and make sure cleanup does not happen as well.
            System.setProperty("clean", "true");
        }
        else{
            setupProject();
            importData();
        }
    }

    @LogMethod
    private void setupProject()
    {
        _test._containerHelper.createProject(_project, "Dataspace");
        _test._containerHelper.enableModule(_project, "CDS");
        _test._containerHelper.enableModule(_project, "DataIntegration");

        _test.setPipelineRoot(TestFileUtils.getLabKeyRoot() + "/server/optionalModules/cds/test/sampledata");
        _test.importFolderFromPipeline("/MasterDataspace/folder.xml");

        _test.goToProjectHome();
    }

    @LogMethod
    private void importData() throws Exception
    {
        // TODO: Catch any RemoteAPI Command Exceptions

        // run initial ETL to populate CDS import tables
        _etlHelper.getDiHelper().runTransformAndWait("{cds}/CDSImport", WAIT_ON_IMPORT);

        // populate the app
        _etlHelper.getDiHelper().runTransformAndWait("{cds}/loadApplication", WAIT_ON_LOADAPP);

        PortalHelper portalHelper = new PortalHelper(_test);
        portalHelper.addWebPart("CDS Management");

        populateNewsFeed();
    }

    @LogMethod
    private void populateNewsFeed()
    {
        // prepare RSS news feed
        _test.goToSchemaBrowser();
        _test.selectQuery("announcement", "RSSFeeds");
        _test.waitForText("view data");
        _test.clickAndWait(Locator.linkContainingText("view data"));

        // insert test data feed
        _test.clickButton("Insert New");
        _test.setFormElement(Locator.name("quf_FeedName"), "Dataspace Test Feed");
        _test.setFormElement(Locator.name("quf_FeedURL"), CDSHelper.TEST_FEED);
        _test.clickButton("Submit");
        _test.assertTextPresent(CDSHelper.TEST_FEED);
    }
}
