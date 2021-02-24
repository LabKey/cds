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
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.api.security.roles.ReaderRole;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.security.roles.SiteAdminRole;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PermissionsHelper;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.di.DataIntegrationHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.cds.CDSHelper.QED_2;
import static org.labkey.test.util.cds.CDSHelper.ZAP_110;

@Category({})
public class CDSGroupTest extends CDSGroupBaseTest
{

    // Known Test Groups
    private static final String GROUP_LIVE_FILTER = "CDSTest_DGroup";
    private static final String GROUP_STATIC_FILTER = "CDSTest_EGroup";
    private static final String STUDY_GROUP = "Study Group Verify";
    private static final String GROUP_PLOT_TEST = "Group Plot Test";

    private static final String STUDY_GROUP_Z110 = "Study Z110 Group";
    private static final String STUDY_GROUP_Q2 = "Study Q2 Group";

    private static final String HOME_PAGE_GROUP = "A Plotted Group For Home Page Verification and Testing.";

    private boolean studyLabelUpdated = false;

    private final CDSTestLearnAbout _cdsTestLearnAbout = new CDSTestLearnAbout();

    @Override
    @Before
    public void preTest()
    {

        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // let the group display load

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_LIVE_FILTER);
        groups.add(GROUP_STATIC_FILTER);
        groups.add(STUDY_GROUP);
        groups.add(HOME_PAGE_GROUP);
        groups.add(SHARED_GROUP_NAME);
        groups.add(SHARED_MAB_GROUP_NAME);
        cds.ensureGroupsDeleted(groups);

        cds.ensureNoFilter();
        cds.ensureNoSelection();

        // go back to app starting location
        cds.goToAppHome();
    }

    @After
    public void revertStudyName() throws Exception
    {
        if(studyLabelUpdated)
        {
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
    public void verifyGroups()
    {
        log("Verify Groups");

        //
        // Define Group Names
        //
        String studyGroupDesc = "A set of defined studies.";
        String studyGroupDescModified = "A set of defined studies. More info added.";

        //
        // Compose Groups
        //
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        cds.useSelectionAsSubjectFilter();
        cds.saveGroup(STUDY_GROUP, studyGroupDesc);

        // verify filter is still applied
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));

        // verify group can be updated
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("replace an existing group");
        click(CDSHelper.Locators.cdsButtonLocator("replace an existing group"));

        Locator.XPathLocator listGroup = Locator.tagWithClass("div", "save-label");
        waitAndClick(listGroup.withText(STUDY_GROUP));

        setFormElement(Locator.id("updategroupdescription-inputEl"), studyGroupDescModified);
        click(CDSHelper.Locators.cdsButtonLocator("Save", "groupupdatesave"));

        // verify group save messaging
        waitForText("Group \"Study Group...\" saved.");
        _asserts.assertFilterStatusCounts(89, 2, 1, 3, 7); // TODO Test data dependent.

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify that the description has changed.
        waitForText(studyGroupDescModified);

        // Verify that No plot data message is shown
        assertTextPresent("No plot saved for this group.");

        // verify 'whoops' case
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("create a new group");
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "groupcancelreplace"));
        cds.clearFilters();

        // add a filter, which should be blown away when a group filter is selected
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[1]);
        cds.useSelectionAsSubjectFilter();
        _asserts.assertFilterStatusCounts(1604, 14, 2, 3, 91); // TODO Test data dependent.

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify the group does overwrite already active filters
        sleep(500); // give it a chance to apply
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        cds.clearFilters();

        // Verify the filters get applied when directly acting
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        _asserts.assertFilterStatusCounts(89, 2, 1, 3, 7); // TODO Test data dependent.
        assertTextPresent("Study Group Verify", "Description", studyGroupDescModified);
        cds.clearFilters();

        // Verify that you can cancel delete
        click(CDSHelper.Locators.cdsButtonLocator("Delete"));
        waitForText("Are you sure you want to delete");
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "x-toolbar-item").notHidden());
        _ext4Helper.waitForMaskToDisappear();
        assertTextPresent(studyGroupDescModified);

        // Verify back button works
        click(CDSHelper.Locators.pageHeaderBack());
        waitForText(CDSHelper.HOME_PAGE_HEADER);
        waitForText(STUDY_GROUP);

        // Verify delete works.
        cds.deleteGroupFromSummaryPage(STUDY_GROUP);

        cds.clearFilters();
    }

    @Test
    public void verifyApplyingGroups()
    {
        String singleFilterGroup = "cds_single_group";
        String multiFilterGroup = "cds_multi_group";
        Locator.XPathLocator singleLoc = CDSHelper.Locators.getPrivateGroupLoc(singleFilterGroup);
        Locator.XPathLocator multiLoc = CDSHelper.Locators.getPrivateGroupLoc(multiFilterGroup);

        log("Compose a group that consist of a single filter");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars("ICS");
        cds.useSelectionAsSubjectFilter();
        cds.saveGroup(singleFilterGroup, "", false);

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
        cds.saveGroup(multiFilterGroup, "", false);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        click(singleLoc);
        sleep(2000); // wait for filter panel to stablize
        log("Verify the group consist of a single filter is applied correctly");
        List<WebElement> activeFilters = cds.getActiveFilters();
        assertEquals("Number of active filters not as expected.", 1, activeFilters.size());

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        click(multiLoc);
        sleep(2000); // wait for filter panel to stablize
        log("Verify the group consist of a 4 filters is applied correctly when current filter panel contains only one filter");
        activeFilters = cds.getActiveFilters();
        assertEquals("Number of active filters not as expected.", 4, activeFilters.size());


        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        click(singleLoc);
        sleep(2000); // wait for filter panel to stablize
        log("Verify the group consist of a single filter is applied correctly when current filter panel contains 4 filters");
        activeFilters = cds.getActiveFilters();
        assertEquals("Number of active filters not as expected.", 1, activeFilters.size());

        //clean up
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.deleteGroupFromSummaryPage(singleFilterGroup);
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.deleteGroupFromSummaryPage(multiFilterGroup);
        cds.clearFilters();
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
        waitForText("Group \"Group Plot Test\" saved.");
        sleep(1000);
        cds.clearFilters(true);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(GROUP_PLOT_TEST );
        click(Locator.tagWithClass("div", "grouplabel").withText(GROUP_PLOT_TEST ));
        waitForText("View in Plot");
        click(Locator.xpath("//span/following::span[contains(text(), 'View in Plot')]").parent().parent().parent());
        assertTrue(getDriver().getCurrentUrl().contains("#chart"));
        sleep(3000); // wait for the plot to draw.
        CDSPlot cdsPlot = new CDSPlot(this);
        assertTrue("Group filter with plot is not applied correctly", cdsPlot.getPointCount() > 0);
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.deleteGroupFromSummaryPage(GROUP_PLOT_TEST );
        cds.clearFilters();
    }

    @Test
    public void verifySharedSubjectGroups()
    {
        verifySharedGroups();
    }

    @Test
    public void verifyInteractiveAndCuratedLinks()
    {
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
        int rowId = Integer.valueOf(vals[vals.length-1]); //study.SubjectGroup.RowId

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

        studyGroupDesc = "Curated group for " + ZAP_110;
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(ZAP_110);
        cds.useSelectionAsSubjectFilter();
        cds.saveGroup(STUDY_GROUP_Z110, studyGroupDesc, false);

        cds.goToAppHome();
        waitAndClick(listGroup.withText(STUDY_GROUP_Z110));
        groupUrl = getCurrentRelativeURL();
        vals = groupUrl.split("/");
        rowId = Integer.valueOf(vals[vals.length-1]); //study.SubjectGroup.RowId

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
        createUserWithPermissions(NEW_USER_ACCOUNTS[0], getProjectName(), "Reader");
        _apiPermissionsHelper.addMemberToRole(NEW_USER_ACCOUNTS[0], "Reader", PermissionsHelper.MemberType.user, getProjectName());
        goToProjectHome();
        impersonate(NEW_USER_ACCOUNTS[0]);
        cds.enterApplication();
        verifyLinksOnStudyPage(studyGroupDesc);
        verifyLinksOnPublicationPage(studyGroupDesc);
        goToProjectHome();
        stopImpersonating();
        _apiPermissionsHelper.removeRoleAssignment(_apiPermissionsHelper.getUserId(NEW_USER_ACCOUNTS[0]), RoleManager.getRole("org.labkey.api.security.roles.ReaderRole").getName(), getProjectName());
        _userHelper.deleteUsers(false, NEW_USER_ACCOUNTS[0]);
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

    private void goToPubPage(String pub)
    {
        cds.viewLearnAboutPage("Publications");
        _cdsTestLearnAbout.gotToLearnAboutDetail(pub);
    }

    private void goToStudyPage(String prot)
    {
        cds.viewLearnAboutPage("Studies");
        LearnGrid learnGrid = new LearnGrid(this);
        learnGrid.setSearch(prot);
        _cdsTestLearnAbout.goToDetail(prot, true);
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
        log("verify interactive report link");
        scrollIntoView(Locator.id("interactive_report_title"));
        clickAndWait(Locator.linkContainingText("NAb dilution report"));
        assertTextPresent("Contains NAb MAb data");
        goBack();
    }

    private void updateStudyCuratedGroupTable(int cds_saved_group_id, String prot) throws IOException, CommandException
    {
        insertData("cds_saved_group_id", cds_saved_group_id, "prot", prot, null, null,"cds", "studyCuratedGroup");
    }

    private void updatePublicationCuratedGroupTable(int cds_saved_group_id, int pubId) throws IOException, CommandException
    {
        insertData("cds_saved_group_id", cds_saved_group_id, null, null,"publication_id", pubId, "cds", "publicationCuratedGroup");
    }

    private void insertData(String savedGrpColName, int savedGrpId,
                            String protColName, String protVal,
                            String pubColName, Integer pubId,
                            String schemaName, String table) throws IOException, CommandException
    {
        Connection cn = WebTestHelper.getRemoteApiConnection();

        InsertRowsCommand insertCmd = new InsertRowsCommand(schemaName, table);
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put(savedGrpColName, savedGrpId);
        if (null != protColName && null != protVal)
            rowMap.put(protColName, protVal);
        else if (null != pubColName && null != pubId)
            rowMap.put(pubColName, pubId);

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

        assertEquals("Filter selection not as expecxted.", "Subject (Sex)", activeFilters.get(0).findElement(By.className("sel-label")).getText());

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

        assertEquals("First filter selection not as expecxted.", "Study", activeFilters.get(0).findElement(By.className("sel-label")).getText());
        assertEquals("Second filter selection not as expecxted.", "Subject (Sex)", activeFilters.get(1).findElement(By.className("sel-label")).getText());

        log("Ok, looks good. Clear the filter, delete the group, and test is done.");
        cds.goToAppHome();
        cds.deleteGroupFromSummaryPage(GROUP_NAME);
        cds.clearFilters();

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
        new DataIntegrationHelper(getProjectName()).runTransformAndWait("{CDS}/LoadApplication", 15 * 60 * 1000);

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
