/*
 * Copyright (c) 2016-2018 LabKey Corporation
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

import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.core.SaveModulePropertiesCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.params.ModuleProperty;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.TestLogger;
import org.labkey.test.util.di.DataIntegrationHelper;

import java.io.IOException;
import java.util.List;

import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_DILUTION_REPORT;
import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_IC50_REPORT;

public class CDSInitializer
{
    private static Boolean hiddenVariablesShown = null;

    private final int WAIT_ON_IMPORT = 1 * 60 * 1000;
    private final int WAIT_ON_LOADAPP = 15 * 60 * 1000;

    private final BaseWebDriverTest _test;
    private final CDSHelper _cds;
    private final String _project;
    public DataIntegrationHelper _etlHelper;
    private final ApiPermissionsHelper _apiPermissionsHelper;
    private RReportHelper _rReportHelper;

    private static final String DILUTION_REPORT_SOURCE = "library(Rlabkey)\n" +
            "if (!is.null(labkey.url.params$\"filteredKeysQuery\"))  {\n" +
            "   \tlabkey.keysQuery <- labkey.url.params$\"filteredKeysQuery\"\n" +
            "   \tcat('Query name for filtered unique keys: ', labkey.keysQuery)\n" +
            "   \tuniquekeys <- labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName=\"cds\", queryName=labkey.keysQuery)\n" +
            "\n" +
            "   \tcat('\\n\\n', 'Number of unique keys: ', nrow(uniquekeys), '\\n\\n')\n" +
            "\t\n" +
            "\tcat(length(names(uniquekeys)), 'Columns for unique keys:\\n')\n" +
            "\tnames(uniquekeys)\n" +
            "} else {\n" +
            "   print(\"Error: filteredKeysQuery param doesn't exist\")\n" +
            "}\n" +
            "\n" +
            "if (!is.null(labkey.url.params$\"filteredDatasetQuery\"))  {\n" +
            "   \tlabkey.datasetQuery <- labkey.url.params$\"filteredDatasetQuery\"\n" +
            "   \tcat('Query name for filtered dataset: ', labkey.datasetQuery)\n" +
            "   \tfiltereddataset <- labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName=\"cds\", queryName=labkey.datasetQuery)\n" +
            "\n" +
            "   \tcat('\\n\\n', 'Number of filtered data rows: ', nrow(filtereddataset), '\\n\\n')\n" +
            "\t\n" +
            "\tcat(length(names(filtereddataset)), 'Columns for dataset:\\n')\n" +
            "\tnames(filtereddataset)\n" +
            "} else {\n" +
            "   print(\"Error: filteredDatasetQuery param doesn't exist\")\n" +
            "}";

    private static final String CONCENTRATION_PLOT_REPORT_SOURCE = "library(Rlabkey)\n" +
            "\n" +
            "if (!is.null(labkey.url.params$\"filteredDatasetQuery\"))  {\n" +
            "   \tlabkey.datasetQuery <- labkey.url.params$\"filteredDatasetQuery\"\n" +
            "   \tcat('Query name for filtered dataset: ', labkey.datasetQuery, '\\n')\n" +
            "   \tfiltereddataset <- labkey.selectRows(baseUrl=labkey.url.base, folderPath=labkey.url.path, schemaName=\"cds\", queryName=labkey.datasetQuery, colNameOpt=\"rname\")\n" +
            "\n" +
            "   # ${imgout:labkeyl.png}\n" +
            "   \tpng(filename=\"labkeyl.png\")\n" +
            "\tplot(filtereddataset$\"curve_id\", filtereddataset$\"titer_curve_ic50\", ylab=\"IC50\", xlab=\"Curve Id\")\n" +
            "\tdev.off()\n" +
            "   \n" +
            "} else {\n" +
            "   print(\"Error: filteredDatasetQuery param doesn't exist\")\n" +
            "}";

    public CDSInitializer(BaseWebDriverTest test)
    {
        _test = test;
        _cds = new CDSHelper(_test);
        _project = test.getPrimaryTestProject();
        _etlHelper = new DataIntegrationHelper(_project);
        _apiPermissionsHelper = new ApiPermissionsHelper(_test);
        _rReportHelper  = new RReportHelper(test);
    }

    @LogMethod
    public void setupDataspace() throws Exception
    {
        setupProject();
        importData();
    }

    @LogMethod
    private void setupProject() throws Exception
    {
        initRootModuleProperties();

        _test._containerHelper.createProject(_project, "Dataspace");
        _test._containerHelper.enableModule(_project, "CDS");
        _test._containerHelper.enableModule(_project, "DataIntegration");

        _test.setPipelineRoot(TestFileUtils.getSampleData("/dataspace/MasterDataspace/folder.xml").getParentFile().getParent());
        _test.waitForText("The pipeline root was set to '");
        _test.importFolderFromPipeline("/MasterDataspace/folder.xml");

        _test.goToProjectHome();

        setupStudyDocumentProject();

        // Create the Site groups. ETL won't import if these are not present.
        for (String groupName : CDSHelper.siteGroupRoles.keySet())
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

        // run initial ETL to populate CDS import tables
        _etlHelper.runTransformAndWait("{CDS}/CDSImport", WAIT_ON_IMPORT);

        // During automation runs set will fail sometimes because of a NPE in Container.hasWorkbookChildren(416).
        // We think this happens because the tests run quicker than human interaction would.
        // Putting in a try/catch to work around the issue if it happens during set up, this should prevent an all out failure of all the tests.

        try{
            // populate the app
            _etlHelper.runTransformAndWait("{CDS}/LoadApplication", WAIT_ON_LOADAPP);
        }
        catch(CommandException ce)
        {
            TestLogger.warn("There was an error with runTransformAndWait while loading the application.", ce);
            _test.log("Going to ignore this error.");
            _test.resetErrors();
            _test.log("Now wait until the ETL Scheduler view shows the job as being complete.");
            _test.goToProjectHome();
            _test.goToModule("DataIntegration");
            _test.waitForText("COMPLETE", 2, 1000 * 60 * 30);
        }
        initMAbReportConfig();
        populateNewsFeed();

        _test.goToProjectHome();

        PortalHelper portalHelper = new PortalHelper(_test);
        portalHelper.addWebPart("CDS Management");
    }

    @LogMethod
    private void populateNewsFeed()
    {
        // prepare RSS news feed
        _test.goToModule("Query");
        _test.selectQuery("announcement", "RSSFeeds");
        _test.waitForText("view data");
        _test.clickAndWait(Locator.linkContainingText("view data"));

        // insert test data feed
        DataRegionTable rssTable = new DataRegionTable("query", _test);
        rssTable.clickInsertNewRow();
        _test.setFormElement(Locator.name("quf_FeedName"), "Dataspace Test Feed");
        _test.setFormElement(Locator.name("quf_FeedURL"), CDSHelper.TEST_FEED);
        _test.clickButton("Submit");
        _test.assertTextPresent(CDSHelper.TEST_FEED);
    }

    public void initMAbReportConfig() throws IOException, CommandException
    {
        _test.goToHome();
        _rReportHelper.ensureRConfig();
        _test.goToProjectHome();
        String mAbUrl = _project +  "/study-dataset.view?datasetId=5007";

        int dilutionReportId = _cds.createReport(_rReportHelper, mAbUrl, DILUTION_REPORT_SOURCE, NAB_MAB_DILUTION_REPORT, true, true);
        int heatmapReportId = _cds.createReport(_rReportHelper, mAbUrl, CONCENTRATION_PLOT_REPORT_SOURCE, NAB_MAB_IC50_REPORT, true, true);

        List<ModuleProperty> mabProps = List.of(
                new ModuleProperty("CDS", "/", "MAbReportID1", "db:" + dilutionReportId),
                new ModuleProperty("CDS", "/", "MAbReportLabel1", NAB_MAB_DILUTION_REPORT),
                new ModuleProperty("CDS", "/", "MAbReportID2", "db:" + heatmapReportId),
                new ModuleProperty("CDS", "/", "MAbReportLabel2", NAB_MAB_IC50_REPORT),
                new ModuleProperty("CDS", "/", "WhatYouNeedToKnowWiki", CDSHelper.WHAT_YOU_NEED_TO_KNOW_WIKI),
                new ModuleProperty("CDS", "/", "ToursWiki", CDSHelper.TOURS_WIKI)
        );
        SaveModulePropertiesCommand command = new SaveModulePropertiesCommand(mabProps);
        command.execute(_test.createDefaultConnection(), "/");
    }

    public void initRootModuleProperties() throws IOException, CommandException
    {
        List<ModuleProperty> properties = List.of(
                new ModuleProperty("CDS", "/", "GettingStartedVideoURL", "https://player.vimeo.com/video/142939542?color=ff9933&title=0&byline=0&portrait=0"),
                new ModuleProperty("CDS", "/", "StaticPath", "/_webdav/CDSTest%20Project/@pipeline/cdsstatic/"),
                new ModuleProperty("CDS", "/", "StudyDocumentPath", "/_webdav/CDSTest%20Project/@pipeline/cdsstatic/"),
                new ModuleProperty("CDS", "/", "AssayDocumentPath", "/_webdav/CDSTest%20Project/@pipeline/cdsstatic/"),
                new ModuleProperty("CDS", "/", "CDSImportPath", TestFileUtils.getSampleData("/dataspace/MasterDataspace/folder.xml").getParentFile().getParent())
        );
        SaveModulePropertiesCommand command = new SaveModulePropertiesCommand(properties);
        command.execute(_test.createDefaultConnection(), "/");

    }

    public void setHiddenVariablesProperty(boolean showHiddenVars) throws IOException, CommandException
    {
        List<ModuleProperty> properties = List.of(
                new ModuleProperty("CDS", "CDSTest Project", "ShowHiddenVariables", String.valueOf(showHiddenVars))
        );
        SaveModulePropertiesCommand command = new SaveModulePropertiesCommand(properties);
        command.execute(_test.createDefaultConnection(), "/");

    }

}
