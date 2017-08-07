/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
package org.labkey.test.util.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.etl.ETLHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.remoteapi.CommandException;

public class CDSInitializer
{
    private final int WAIT_ON_IMPORT = 1 * 60 * 1000;
    private final int WAIT_ON_LOADAPP = 15 * 60 * 1000;

    private final BaseWebDriverTest _test;
    private final CDSHelper _cds;
    private final String _project;
    public ETLHelper _etlHelper;
    private final ApiPermissionsHelper _apiPermissionsHelper;

    public CDSInitializer(BaseWebDriverTest test, String projectName)
    {
        _test = test;
        _cds = new CDSHelper(_test);
        _project = projectName;
        _etlHelper = new ETLHelper(_test, _project);
        _apiPermissionsHelper = new ApiPermissionsHelper(_test);
    }

    @LogMethod
    public void setupDataspace() throws Exception
    {
        setupProject();
        importData();
    }

    @LogMethod
    private void setupProject()
    {
        _test._containerHelper.createProject(_project, "Dataspace");
        _test._containerHelper.enableModule(_project, "CDS");
        _test._containerHelper.enableModule(_project, "DataIntegration");

        _test.setPipelineRoot(TestFileUtils.getSampleData("/dataspace/MasterDataspace/folder.xml").getParentFile().getParent());
        _test.importFolderFromPipeline("/MasterDataspace/folder.xml");

        _cds.initModuleProperties();

        _test.goToProjectHome();

        setupStudyDocumentProject();

        // Create the Site groups. ETL won't import if these are not present.
        for(String groupName : CDSHelper.siteGroupRoles.keySet())
        {
            _apiPermissionsHelper.createGlobalPermissionsGroup(groupName);
        }

    }

    private void setupStudyDocumentProject()
    {
        _test._containerHelper.deleteProject("DataSpaceStudyDocuments", false);
        _test._containerHelper.createProject("DataSpaceStudyDocuments", "Collaboration");
        _test.setPipelineRoot(TestFileUtils.getSampleData("/studydocuments/folder.xml").getParent());

        _test.goToProjectHome();
    }

    @LogMethod
    private void importData() throws Exception
    {
        // TODO: Catch any RemoteAPI Command Exceptions

        // During automation runs set will fail sometimes because of a NPE in Container.hasWorkbookChildren(416).
        // We think this happens because the tests run quicker than human interaction would.
        // Putting in a try/catch to work around the issue if it happens during set up, this should prevent an all out failure of all the tests.

        try
        {
            // run initial ETL to populate CDS import tables
            _etlHelper.getDiHelper().runTransformAndWait("{CDS}/CDSImport", WAIT_ON_IMPORT);

            // Adding a slight pause, trying to avoid the NPE Container.hasWorkbookChildren.
            _test.sleep(1000);
        }
        catch(CommandException ce)
        {
            _test.log("Looks like there was an error with runTransformAndWait while doing the CDSImport: " + ce.getMessage());
            _test.log("Going to ignore this error.");
            _test.resetErrors();
        }

        try{
        // populate the app
        _etlHelper.getDiHelper().runTransformAndWait("{CDS}/LoadApplication", WAIT_ON_LOADAPP);
        }
        catch(CommandException ce)
        {
            _test.log("Looks like there was an error with runTransformAndWait while loading the application: " + ce.getMessage());
            _test.log("Going to ignore this error.");
            _test.resetErrors();
        }


        populateNewsFeed();

        _test.goToProjectHome();

        PortalHelper portalHelper = new PortalHelper(_test);
        portalHelper.addWebPart("CDS Management");
    }

    @LogMethod
    private void populateNewsFeed()
    {
        // prepare RSS news feed
        _test.clickAdminMenuItem("Go To Module", "Query");
        _test.selectQuery("announcement", "RSSFeeds");
        _test.waitForText("view data");
        _test.clickAndWait(Locator.linkContainingText("view data"));

        // insert test data feed
        DataRegionTable rssTable = new DataRegionTable("query", _test);
        rssTable.clickHeaderMenu("Insert", "Insert New Row");
        _test.setFormElement(Locator.name("quf_FeedName"), "Dataspace Test Feed");
        _test.setFormElement(Locator.name("quf_FeedURL"), CDSHelper.TEST_FEED);
        _test.clickButton("Submit");
        _test.assertTextPresent(CDSHelper.TEST_FEED);
    }
}
