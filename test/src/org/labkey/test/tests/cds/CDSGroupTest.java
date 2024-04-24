/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
package org.labkey.test.tests.cds;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.di.RunTransformResponse;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.cds.ActiveFilterDialog;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.GroupDetailsPage;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.pages.cds.LearnGrid.LearnTab;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.pages.query.ExecuteQueryPage;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.di.DataIntegrationHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.cds.CDSHelper.QED_2;
import static org.labkey.test.util.cds.CDSHelper.ZAP_110;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 22)
public class CDSGroupTest extends CDSGroupBaseTest
{
    // Known Test Groups
    private static final String GROUP_LIVE_FILTER = "CDSTest_DGroup";
    private static final String GROUP_STATIC_FILTER = "CDSTest_EGroup";
    private static final String STUDY_GROUP = "Study Group Verify";
    private static final String ASSAY_GROUP_NAME = "Single assay group";
    private static final String ASSAY_GROUP_NAME_UPDATED = "Updated " + ASSAY_GROUP_NAME;

    private static final String CDS_SINGLE_GROUP = "cds_single_group";
    private static final String MULTI_FILTER_GROUP = "cds_multi_group";
    private static final String GROUP_PLOT_TEST = "Group Plot Test";

    private static final String STUDY_GROUP_Z110 = "Study Z110 Group";
    private static final String STUDY_GROUP_Q2 = "Study Q2 Group";

    private static final String HOME_PAGE_GROUP = "A Plotted Group For Home Page Verification and Testing.";
    private static final String NAB_Q2_REPORT_SOURCE = "library(Rlabkey)\n" +
            "\n" +
            "# Select rows into a data frame called 'labkey.data'\n" +
            "\n" +
            "labkey.data <- labkey.selectRows(\n" +
            "    baseUrl=labkey.url.base, \n" +
            "    folderPath=labkey.url.path, \n" +
            "    schemaName=\"study\", \n" +
            "    queryName=\"NAb\", \n" +
            "    viewName=\"\", \n" +
            "    colSelect=\"SubjectId,SubjectVisit/Visit,visit_day,study_prot,assay_identifier,summary_level,specimen_type,antigen,antigen_type,virus,virus_type,virus_full_name,virus_species,virus_host_cell,virus_backbone,virus_insert_name,clade,neutralization_tier,tier_clade_virus,target_cell,initial_dilution,titer_ic50,titer_ic80,titer_ID50,titer_ID80,nab_response_ID50,nab_response_ID80,response_call,nab_lab_source_key,lab_code,exp_assayid,slope,vaccine_matched\", \n" +
            "    colFilter=makeFilter(c(\"study_prot\", \"EQUAL\", \"q2\")), \n" +
            "    containerFilter=NULL, \n" +
            "    colNameOpt=\"rname\"\n" +
            ")\n";
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
    private final CDSTestLearnAbout _cdsTestLearnAbout = new CDSTestLearnAbout();
    private boolean studyLabelUpdated = false;
    private RReportHelper _rReportHelper;

    @Before
    public void preTest()
    {

        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // let the group display load

        cds.deleteAllGroups();

        cds.ensureNoFilter();
        cds.ensureNoSelection();

        // go back to app starting location
        cds.goToAppHome();
    }

    @After
    public void revertStudyName() throws Exception
    {
        if (studyLabelUpdated)
        {
            // Get failure screenshot before navigating to clean up after failed test
            getArtifactCollector().dumpPageSnapshot("CDSGroupTest_dataChange");
            changeStudyLabelAndLoadData(CDSHelper.ZAP_139, CDSHelper.PROT_Z139, CDSHelper.ZAP_139);
        }

    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Test
    public void testUpdateThisGroup()
    {
        log("Verifying Study Group workflow");
        String studyGroupDesc = "A set of defined studies.";
        String studyGroupDescModified = "A set of defined studies. More info added.";

        log("Create the group");
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        cds.useSelectionAsSubjectFilter();
        ActiveFilterDialog activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.saveAsAGroup().setGroupName(STUDY_GROUP).setGroupDescription(studyGroupDesc).saveGroup();

        log("Verify group details from learn about --> group page");
        refresh();
        cds.viewLearnAboutPage(LearnTab.GROUPS);
        click(Locator.tagWithText("h2", STUDY_GROUP));
        GroupDetailsPage detailsPage = new GroupDetailsPage(getDriver());
        Assert.assertEquals("Group Name is incorrect", STUDY_GROUP, detailsPage.getGroupName());
        Assert.assertEquals("Group description is incorrect", studyGroupDesc, detailsPage.getGroupDescription());
        Assert.assertEquals("Incorrect items in the group", Arrays.asList(CDSHelper.STUDIES[0] + "\n" + CDSHelper.STUDIES[1]), detailsPage.getGroupList());

        log("Update the group workflow");
        activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.editGroup("Update this group", null, studyGroupDescModified, false);

        log("Verify group description is updated");
        detailsPage = cds.goToGroup(STUDY_GROUP);
        detailsPage.waitForPage();
        Assert.assertEquals("Group Name is incorrect", STUDY_GROUP, detailsPage.getGroupName());
        Assert.assertEquals("Group description is incorrect", studyGroupDescModified, detailsPage.getGroupDescription());

        activeFilterDialog.clear();
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[3]);
        cds.useSelectionAsSubjectFilter();
        activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.saveAsAGroup()
                .setGroupName(STUDY_GROUP)
                .setGroupDescription(studyGroupDesc)
                .saveExpectingError("A group with this name already exists. Please choose a different name.");
    }

    @Test
    public void testSaveAsNewGroup()
    {
        String desc = ASSAY_GROUP_NAME + " description";

        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[1]);
        cds.useSelectionAsSubjectFilter();
        ActiveFilterDialog activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.saveAsAGroup().setGroupName(ASSAY_GROUP_NAME).setGroupDescription(desc).saveGroup();

        log("Verify navigation from learn about page");
        refresh();
        cds.viewLearnAboutPage(LearnTab.GROUPS);
        click(Locator.tagWithText("h2", ASSAY_GROUP_NAME));
        GroupDetailsPage detailsPage = new GroupDetailsPage(getDriver());
        Assert.assertEquals("Group Name is incorrect", ASSAY_GROUP_NAME, detailsPage.getGroupName());
        Assert.assertEquals("Group description is incorrect", desc, detailsPage.getGroupDescription());

        activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.editGroup("Save as new group", ASSAY_GROUP_NAME_UPDATED, null, false);

        log("Verify updated group details");
        detailsPage = cds.goToGroup(ASSAY_GROUP_NAME_UPDATED);
        Assert.assertEquals("Group Name is incorrect", ASSAY_GROUP_NAME_UPDATED, detailsPage.getGroupName());
        Assert.assertEquals("Group description is incorrect", desc, detailsPage.getGroupDescription());

        log("Verify old group exists too");
        detailsPage = cds.goToGroup(ASSAY_GROUP_NAME);
        Assert.assertEquals("Group Name is incorrect", ASSAY_GROUP_NAME, detailsPage.getGroupName());
        Assert.assertEquals("Group description is incorrect", desc, detailsPage.getGroupDescription());

        log("Verifying deleting the group");
        detailsPage = detailsPage.deleteGroup("Cancel");
        Assert.assertEquals("Group delete cancel does not work", ASSAY_GROUP_NAME, detailsPage.getGroupName());

        detailsPage.deleteGroup("Delete");
        cds.viewLearnAboutPage(LearnTab.GROUPS);
        refresh();
        Assert.assertFalse("Deleted group is still present " + ASSAY_GROUP_NAME,
                isElementPresent(Locator.tagWithText("h2", ASSAY_GROUP_NAME)));
    }

    @Test
    public void verifyApplyingGroups()
    {
        String singleFilterGroup = "cds_single_group";
        String multiFilterGroup = "cds_multi_group";

        log("Compose a group that consist of a single filter");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars("ICS");
        cds.useSelectionAsSubjectFilter();
        ActiveFilterDialog activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.saveAsAGroup()
                .setGroupName(singleFilterGroup)
                .setGroupDescription(singleFilterGroup)
                .saveGroup();

        log("Verifying Single filter group");
        refresh();
        cds.viewLearnAboutPage(LearnTab.GROUPS);
        click(Locator.tagWithText("h2", singleFilterGroup));
        GroupDetailsPage detailsPage = new GroupDetailsPage(getDriver());
        Assert.assertEquals("Group Name is incorrect", singleFilterGroup, detailsPage.getGroupName());
        log("Verify the group consist of a single filter is applied correctly");
        List<WebElement> activeFilters = cds.getActiveFilters();
        assertEquals("Number of active filters not as. expected.", 1, activeFilters.size());

        log("Clear the previous filter");
        activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.clear();

        log("Compose a group that consist of 4 filter");
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        cds.selectBars("Human");
        cds.goToSummary();
        cds.clickBy("Products");
        cds.selectBars("Unknown");
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars("RED 4", "RED 5");
        cds.useSelectionAsSubjectFilter();

        activeFilterDialog = new ActiveFilterDialog(this);
        activeFilterDialog.saveAsAGroup()
                .setGroupName(multiFilterGroup)
                .setGroupDescription(multiFilterGroup)
                .saveGroup();

        log("Verifying Multi filter group");
        refresh();
        cds.viewLearnAboutPage(LearnTab.GROUPS);
        click(Locator.tagWithText("h2", multiFilterGroup));
        detailsPage = new GroupDetailsPage(getDriver());
        Assert.assertEquals("Group Name is incorrect", multiFilterGroup, detailsPage.getGroupName());
        log("Verify the group consist of a 4 filters is applied correctly when current filter panel contains only one filter");
        activeFilters = cds.getActiveFilters();
        assertEquals("Number of active filters not as expected.", 3, activeFilters.size());
    }

    @Test
    public void verifySharedPlot()
    {
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1], "ZAP 117");
        cds.useSelectionAsSubjectFilter();

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.confirmSelection();

        cds.saveGroup(GROUP_PLOT_TEST, "a plot", false, true);
        waitForElement(Locator.tagWithId("div", "savedgroup-label-id"));
        cds.clearFilters(true);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(GROUP_PLOT_TEST);
        WebElement groupLabel = Locator.tagWithClass("div", "grouplabel").withText(GROUP_PLOT_TEST).findElement(getDriver());
        shortWait().until(ExpectedConditions.elementToBeClickable(groupLabel));
        groupLabel.click();

        waitForText("View in Plot");
        click(Locator.xpath("//span/following::span[contains(text(), 'View in Plot')]").parent().parent().parent());
        assertTrue(getDriver().getCurrentUrl().contains("#chart"));
        sleep(3000); // wait for the plot to draw.
        CDSPlot cdsPlot = new CDSPlot(this);
        assertTrue("Group filter with plot is not applied correctly", cdsPlot.getPointCount() > 0);
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.deleteGroupFromSummaryPage(GROUP_PLOT_TEST);
//        cds.clearFilters(); //TODO : delete group should clear the filter, need to verify with client if this is the expected behavior.
    }

    @Test
    public void verifySharedSubjectGroups()
    {
        verifySharedGroups();
    }

    @Test
    public void verifyInteractiveAndCuratedLinks()
    {
        Ext4Helper.resetCssPrefix(); // Report creation happens in LKS
        _userHelper.deleteUsers(false, NEW_USER_ACCOUNTS[0]);
        createUserWithPermissions(NEW_USER_ACCOUNTS[0], getProjectName(), "Reader");

        createSharedReports(NEW_USER_ACCOUNTS[0]);
        cds.enterApplication();

        String studyGroupDesc = "Curated group for " + QED_2;
        log("create " + studyGroupDesc);
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(QED_2);
        cds.useSelectionAsSubjectFilter();
        cds.saveGroup(STUDY_GROUP_Q2, studyGroupDesc, true);

        cds.goToAppHome();
        Locator.XPathLocator listGroup = Locator.tagWithClass("div", "grouplabel");
        waitAndClick(listGroup.withText(STUDY_GROUP_Q2));
        String groupUrl = getCurrentRelativeURL();
        String[] vals = groupUrl.split("/");
        int rowId = Integer.valueOf(vals[vals.length - 1]); //study.SubjectGroup.RowId

        log("save report info into cds.studyCuratedGroup & cds.publicationCuratedGroup tables");
        try
        {
            updateStudyCuratedGroupTable(rowId, "q2");
            updatePublicationCuratedGroupTable(rowId, 2);
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }

        cds.clearFilters();
        String studyGroupDesc2 = "Curated group for " + ZAP_110;
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(ZAP_110);
        cds.useSelectionAsSubjectFilter();
        cds.saveGroup(STUDY_GROUP_Z110, studyGroupDesc2, false);

        cds.goToAppHome();
        waitAndClick(listGroup.withText(STUDY_GROUP_Z110));
        groupUrl = getCurrentRelativeURL();
        vals = groupUrl.split("/");
        rowId = Integer.valueOf(vals[vals.length - 1]); //study.SubjectGroup.RowId

        try
        {
            updateStudyCuratedGroupTable(rowId, "z110");
            updatePublicationCuratedGroupTable(rowId, 170);
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }
        goToProjectHome();
        String reportName = "NAb ic50 plot";
        log("inserting the value between report and assay");
        updateLinkBetweenAssayAndReport("ICS", reportName);

        clickFolder("q2");
        _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[0], "Reader");
        goToProjectHome();
        impersonate(NEW_USER_ACCOUNTS[0]);
        cds.enterApplication();
        verifyLinksOnStudyPage(studyGroupDesc);
        verifyLinksOnPublicationPage(studyGroupDesc);
        verifyLinksOnAssayPage(reportName);
        goToProjectHome();
        stopImpersonating();
        /*
            Verification step added as part of Update export button and add learn pages export feature
         */
        verifyExportButtonOnReports();
        _userHelper.deleteUsers(false, NEW_USER_ACCOUNTS[0]);
    }

    private void createSharedReports(String userShouldSeeReports)
    {
        String url = getProjectName() + "/study-dataset.view?datasetId=5003";
        _rReportHelper = new RReportHelper(this);

        int reportId = cds.createReport(_rReportHelper, url, ELISPOT_Z110_REPORT_SOURCE, "ELISPOT PROT Z110 Report", true, true);
        try
        {
            updateStudyReportsTable(reportId, "z110");
            updateStudyPublicationsTable(reportId, 170);
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }

        impersonate(userShouldSeeReports); // Verify report is shared
        assertTextPresent("ELISPOT PROT Z110 Report");
        stopImpersonating();

        url = getProjectName() + "/study-dataset.view?datasetId=5004";
        reportId = cds.createReport(_rReportHelper, url, NAB_Q2_REPORT_SOURCE, "NAB PROT QED 2 Report", true, true);

        try
        {
            updateStudyReportsTable(reportId, "q2");
            updateStudyPublicationsTable(reportId, 2);
        }
        catch (IOException | CommandException e)
        {
            throw new RuntimeException(e);
        }

        impersonate(userShouldSeeReports); // Verify report is shared
        assertTextPresent("NAB PROT QED 2 Report");
        stopImpersonating();
    }

    private void verifyLinksOnPublicationPage(String descr)
    {
        log("verify links on publication page");
        String publicationName = "Korioth-Schmitz B 2015 Vaccine";

        goToPubPage(publicationName);
        verifyInteractiveLink();

        goToPubPage(publicationName);
        verifyCuratedLink(descr);
    }

    private void verifyLinksOnStudyPage(String descr)
    {
        log("verify links on study page");

        goToStudyPage(QED_2);
        verifyInteractiveLink();

        goToStudyPage(QED_2);
        verifyCuratedLink(descr);
    }

    private void verifyExportButtonOnReports()
    {
        cds.enterApplication();
        cds.viewLearnAboutPage(LearnTab.REPORTS);
        Locator.XPathLocator exportBtn = Locator.tagWithId("a", "learn-grid-export-button-id-btnIconEl").withAttributeContaining("style", "display: none");
        assertFalse("Export button should not be present", isElementPresent(exportBtn));
    }

    private void verifyLinksOnAssayPage(String reportName)
    {
        log("Verifying links of assay page");
        goToAssayPage(CDSHelper.TITLE_ICS);
        waitForElementWithRefresh(Locator.id("interactive_report_title"), 5000);
        log("verify interactive report link");
        scrollIntoView(Locator.id("interactive_report_title"));

        log("Verifying report is present");
        assertElementPresent(Locator.linkWithText(reportName));
    }

    private void updateLinkBetweenAssayAndReport(String assayName, String reportName)
    {
        goToProjectHome();
        clickTab("Clinical and Assay Data");
        String reportHref = waitForElement(Locator.linkWithText(reportName)).getAttribute("href");
        int reportNum = cds.getReportNumberFromUrl(reportHref);
        DataRegionTable table = ExecuteQueryPage.beginAt(this, "CDS", "assayReport").getDataRegion();
        table.clickInsertNewRow();
        setFormElement(Locator.name("quf_assay_identifier"), assayName);
        setFormElement(Locator.name("quf_cds_report_id"), String.valueOf(reportNum));
        clickButton("Submit");
    }

    private void goToPubPage(String pub)
    {
        cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        _cdsTestLearnAbout.goToDetail(pub, false);
    }

    private void goToStudyPage(String prot)
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        learnGrid.setSearch(prot);
        _cdsTestLearnAbout.goToDetail(prot, true);
    }

    private void goToAssayPage(String name)
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);
        learnGrid.setSearch(name).clickFirstItem();
    }

    private void verifyCuratedLink(String descr)
    {
        log("verify curated group link");

        scrollIntoView(Locator.id("curated_groups_title"), false);
        click(Locator.linkContainingText("Study Q2 Group"));
        waitForText("No plot saved for this group");
        assertTextPresent(descr);
    }

    private void verifyInteractiveLink()
    {
        waitForElementWithRefresh(Locator.id("interactive_report_title"), 5000);
        log("verify interactive report link");
        scrollIntoView(Locator.id("interactive_report_title"));
        click(Locator.linkContainingText("NAB PROT QED 2 Report"));
        waitForText("Overview");
        assertTextPresent("NAB PROT QED 2 Report");
        goToProjectHome();
        cds.enterApplication();
    }

    public void updateStudyReportsTable(int cds_report_id, String prot) throws IOException, CommandException
    {
        insertData("cds_report_id", cds_report_id, "prot", prot, null, null, "cds", "studyReport");
    }

    public void updateStudyPublicationsTable(int cds_report_id, int pubId) throws IOException, CommandException
    {
        insertData("cds_report_id", cds_report_id, null, null, "publication_id", pubId, "cds", "publicationReport");
    }

    private void updateStudyCuratedGroupTable(int cds_saved_group_id, String prot) throws IOException, CommandException
    {
        insertData("cds_saved_group_id", cds_saved_group_id, "prot", prot, null, null, "cds", "studyCuratedGroup");
    }

    private void updatePublicationCuratedGroupTable(int cds_saved_group_id, int pubId) throws IOException, CommandException
    {
        insertData("cds_saved_group_id", cds_saved_group_id, null, null, "publication_id", pubId, "cds", "publicationCuratedGroup");
    }

    private void insertData(String savedGrpColName, int savedGrpId, String protColName, String protVal, String pubColName, Integer pubId, String schemaName, String table) throws IOException, CommandException
    {
        Connection cn = WebTestHelper.getRemoteApiConnection();

        InsertRowsCommand insertCmd = new InsertRowsCommand(schemaName, table);
        Map<String, Object> rowMap = new HashMap<>();
        rowMap.put(savedGrpColName, savedGrpId);
        if (null != protColName && null != protVal) rowMap.put(protColName, protVal);
        else if (null != pubColName && null != pubId) rowMap.put(pubColName, pubId);

        insertCmd.addRow(rowMap);

        insertCmd.execute(cn, getCurrentContainerPath());
    }

    @Test
    public void verifySavedGroupAfterDataChange() throws Exception
    {
        // This is to validate issue 29978 (Improve handling for saved groups with missing/renamed criteria)

        final String GROUP_NAME = "Study139DataChange";

        log("Create filter that includes a study ZAP 139 and gender female.");
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.ZAP_139);
        cds.useSelectionAsSubjectFilter();
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        cds.pickSort("Sex at birth");
        cds.selectBars("Female");
        cds.useSelectionAsSubjectFilter();

        log("Save this filter as a group.");
        cds.saveGroup(GROUP_NAME, "Validate how a group works when the data has changed.");

        log("Now that the group is saved clear the filter.");
        cds.clearFilters();

        log("Go change the label for the study.");
        changeStudyLabelAndLoadData(CDSHelper.ZAP_139, CDSHelper.PROT_Z139, CDSHelper.ZAP_139 + "modified");

        studyLabelUpdated = true;

        log("Go back to the CDS portal, load the group, and validate the expected error message is shown.");
        cds.enterApplication();

        waitForElement(Locator.tagWithClass("div", "grouplabel").withText(GROUP_NAME));
        click(Locator.tagWithClass("div", "grouplabel").withText(GROUP_NAME));

        log("Validate that the error message box is shown.");
        waitForElementToBeVisible(Locator.tagWithClassContaining("div", "x-message-box"));

        log("Validate that the error text is present.");
        assertTextPresent("This saved group includes criteria no longer available in the data: ", "[Study.Treatment].[ZAP 139]", "Do you want to apply the filters without these criteria?");

        log("Apply the filter.");
        click(Locator.xpath("//span[text()='Yes']/ancestor::a[contains(@class, 'x-btn')]"));
        waitForText("No plot saved for this group.");

        cds.goToSummary();

        log("Validate that only one filter is applied, and it should not be for the study ZAP 139.");
        List<WebElement> activeFilters = cds.getActiveFilters();

        assertEquals("Number of active filters not as expected.", 1, activeFilters.size());

        assertEquals("Filter selection not as expecxted.", "Subject (Sex)", activeFilters.get(0).findElement(Locator.byClass("sel-label")).getText());

        log("Clear the filter again and lets go back and undo everything.");
        cds.clearFilters();

        log("Change the label for the study back.");
        changeStudyLabelAndLoadData(CDSHelper.ZAP_139, CDSHelper.PROT_Z139, CDSHelper.ZAP_139);

        studyLabelUpdated = false;

        log("Go back to the CDS portal, load the group, and validate no error is shown and the filter is applied.");
        cds.enterApplication();

        waitForElement(Locator.tagWithClass("div", "grouplabel").withText(GROUP_NAME));
        click(Locator.tagWithClass("div", "grouplabel").withText(GROUP_NAME));
        waitForText("No plot saved for this group.");
        _ext4Helper.waitForMaskToDisappear();

        cds.goToSummary();

        log("Validate that the filter has both study ZAP 139 and gender female.");
        activeFilters = cds.getActiveFilters();

        assertEquals("Number of active filters not as expected.", 2, activeFilters.size());

        assertEquals("First filter selection not as expecxted.", "Study", activeFilters.get(0).findElement(Locator.byClass("sel-label")).getText());
        assertEquals("Second filter selection not as expecxted.", "Subject (Sex)", activeFilters.get(1).findElement(Locator.byClass("sel-label")).getText());

        log("Ok, looks good. Clear the filter, delete the group, and test is done.");
        cds.goToAppHome();
        cds.deleteGroupFromSummaryPage(GROUP_NAME);

    }

    private void changeStudyLabelAndLoadData(String studyName, String studyProtocol, String studyLabel) throws Exception
    {

        log("Go change the label for the study '" + studyName + "'.");
        Ext4Helper.resetCssPrefix();
        goToProjectHome();
        goToSchemaBrowser();

        selectQuery("CDS", "import_study");
        clickAndWait(Locator.linkWithText("view data"));
        log("Edit the record for study '" + studyName + "'.");
        clickAndWait(Locator.xpath("//a[text()='" + studyProtocol + "']/parent::td/preceding-sibling::td/a[@data-original-title='edit']"));
        waitForElement(Locator.input("quf_study_label"));
        setFormElement(Locator.input("quf_study_label"), studyLabel);
        clickAndWait(Locator.lkButton("Submit"));

        goToProjectHome();

        log("Run the 'LoadApplication' ETL for CDS to load the updated study.");
        DataIntegrationHelper diHelper = new DataIntegrationHelper(getProjectName());
        RunTransformResponse runTransformResponse = diHelper.runTransformAndWait("{CDS}/LoadApplication", 15 * 60 * 1000);
        if (!diHelper.getTransformStatus(runTransformResponse.getJobId()).equalsIgnoreCase("COMPLETE"))
        {
            beginAt(runTransformResponse.getPipelineURL());
            Assert.fail("CDS reload ETL failed.");
        }

        goToProjectHome();
        Ext4Helper.setCssPrefix("x-");


    }

    @Override
    public void _composeGroup()
    {
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        cds.useSelectionAsSubjectFilter();
    }


}
