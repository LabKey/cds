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
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.di.DataIntegrationHelper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_DILUTION_REPORT;
import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_IC50_REPORT;
import static org.labkey.test.util.cds.CDSHelper.QED_2;
import static org.labkey.test.util.cds.CDSHelper.ZAP_110;

public class CDSInitializer
{
    private final int WAIT_ON_IMPORT = 1 * 60 * 1000;
    private final int WAIT_ON_LOADAPP = 15 * 60 * 1000;

    private final BaseWebDriverTest _test;
    private final CDSHelper _cds;
    private final String _project;
    public DataIntegrationHelper _etlHelper;
    private final ApiPermissionsHelper _apiPermissionsHelper;
    private RReportHelper _rReportHelper;

    private static final String ELISPOT_Z110_REPORT_SOURCE = "library(Rlabkey)\n" +
            "labkey.data <- labkey.selectRows(\n" +
            "    baseUrl=labkey.url.base, \n" +
            "    folderPath=labkey.url.path, \n" +
            "    schemaName=\"study\", \n" +
            "    queryName=\"ELISPOT\", \n" +
            "    colSelect=\"SubjectId,SubjectVisit/Visit,visit_day,study_prot,assay_identifier,summary_level,antigen,antigen_type,peptide_pool,protein,protein_panel,protein_panel_protein,protein_panel_protein_peptide_pool,clade,cell_type,cell_name,vaccine_matched,specimen_type,functional_marker_name,functional_marker_type,response_call,mean_sfc,mean_sfc_neg,mean_sfc_raw,els_ifng_lab_source_key,lab_code,exp_assayid\", \n" +
            "    colFilter=makeFilter(c(\"study_prot\", \"EQUAL\", \"z110\")), \n" +
            "    containerFilter=NULL, \n" +
            "    colNameOpt=\"rname\"\n" +
            ")\n";

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

    public CDSInitializer(BaseWebDriverTest test, String projectName)
    {
        _test = test;
        _cds = new CDSHelper(_test);
        _project = projectName;
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
    private void setupProject()
    {
        _test._containerHelper.createProject(_project, "Dataspace");
        _test._containerHelper.enableModule(_project, "CDS");
        _test._containerHelper.enableModule(_project, "DataIntegration");

        _test.setPipelineRoot(TestFileUtils.getSampleData("/dataspace/MasterDataspace/folder.xml").getParentFile().getParent());
        _test.waitForText("The pipeline root was set to '");
        _test.importFolderFromPipeline("/MasterDataspace/folder.xml");

        _cds.initModuleProperties();

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
            _test.log("Looks like there was an error with runTransformAndWait while loading the application: " + ce.getMessage());
            _test.log("Going to ignore this error.");
            _test.resetErrors();
            _test.log("Now wait until the ETL Scheduler view shows the job as being complete.");
            _test.goToProjectHome();
            _test.goToModule("DataIntegration");
            _test.waitForText("COMPLETE", 2, 1000 * 60 * 30);
        }
        initReportConfig();
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

    public void updateStudyReportsTable(int cds_report_id, String prot) throws IOException, CommandException
    {
        insertData("cds_report_id", cds_report_id, "prot", prot, null, null,"cds", "studyReport");
    }

    public void updateStudyPublicationsTable(int cds_report_id, int pubId) throws IOException, CommandException
    {
        insertData("cds_report_id", cds_report_id, null, null,"publication_id", pubId, "cds", "publicationReport");
    }

    private void insertData(String reportIdColName, int reportIdColVal,
                            String protColName, String protVal,
                            String pubColName, Integer pubId,
                            String schemaName, String table) throws IOException, CommandException
    {
        _test.goToProjectHome();

        Connection cn = WebTestHelper.getRemoteApiConnection();

        InsertRowsCommand insertCmd = new InsertRowsCommand(schemaName, table);
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put(reportIdColName, reportIdColVal);
        if (null != protColName && null != protVal)
            rowMap.put(protColName, protVal);
        else if (null != pubColName && null != pubId)
            rowMap.put(pubColName, pubId);

        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, _test.getCurrentProject());
    }

    public void initReportConfig()
    {
        _test.goToHome();
        _rReportHelper.ensureRConfig();
        _test.goToProjectHome();
        String url = _project +  "/study-dataset.view?datasetId=5003";

        int reportId = _cds.createReport(_rReportHelper, url, ELISPOT_Z110_REPORT_SOURCE, "ELISPOT PROT Z110 Report", true, true);
        try
        {
            updateStudyReportsTable(reportId, "z110");
            updateStudyPublicationsTable(reportId, 170);
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }

        initMAbReportConfig();
    }

    public void initMAbReportConfig()
    {
        _test.goToHome();
        _rReportHelper.ensureRConfig();
        _test.goToProjectHome();
        String mAbUrl = _project +  "/study-dataset.view?datasetId=5007";

        int dilutionReportId = _cds.createReport(_rReportHelper, mAbUrl, DILUTION_REPORT_SOURCE, NAB_MAB_DILUTION_REPORT, true, true);
        try
        {
            updateStudyReportsTable(dilutionReportId, "q2");
            updateStudyPublicationsTable(dilutionReportId, 2);
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }

        int heatmapReportId = _cds.createReport(_rReportHelper, mAbUrl, CONCENTRATION_PLOT_REPORT_SOURCE, NAB_MAB_IC50_REPORT, true, true);

        List<ModulePropertyValue> propList = new ArrayList<>();
        propList.add(new ModulePropertyValue("CDS", "/", "MAbReportID1", "db:" + dilutionReportId));
        propList.add(new ModulePropertyValue("CDS", "/", "MAbReportLabel1", NAB_MAB_DILUTION_REPORT));
        propList.add(new ModulePropertyValue("CDS", "/", "MAbReportID2", "db:" + heatmapReportId));
        propList.add(new ModulePropertyValue("CDS", "/", "MAbReportLabel2", NAB_MAB_IC50_REPORT));
        propList.add(new ModulePropertyValue("CDS", "/", "WhatYouNeedToKnowWiki", CDSHelper.WHAT_YOU_NEED_TO_KNOW_WIKI));
        propList.add(new ModulePropertyValue("CDS", "/", "ToursWiki", CDSHelper.TOURS_WIKI));

        _test.setModuleProperties(propList);
        _test.goToProjectHome();
    }

}
