/*
 * Copyright (c) 2014 LabKey Corporation
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
package org.labkey.test.tests;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.pages.AssayDetailsPage;
import org.labkey.test.pages.DataGridSelector;
import org.labkey.test.pages.DataGridVariableSelector;
import org.labkey.test.pages.YAxisVariableSelector;
import org.labkey.test.util.CDSAsserts;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;

@Category({CustomModules.class, CDS.class})
public class CDSTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private static final String GROUP_NULL = "Group creation cancelled";
    private static final String GROUP_DESC = "Intersection of " + CDSHelper.LABS[1]+ " and " + CDSHelper.LABS[2];
    private static final String TOOLTIP = "Hold Shift, CTRL, or CMD to select multiple";

    // Known Test Groups
    private static final String GROUP_NAME = "CDSTest_AGroup";
    private static final String GROUP_NAME2 = "CDSTest_BGroup";
    private static final String GROUP_NAME3 = "CDSTest_CGroup";
    private static final String GROUP_LIVE_FILTER = "CDSTest_DGroup";
    private static final String GROUP_STATIC_FILTER = "CDSTest_EGroup";
    private static final String STUDY_GROUP = "Study Group Verify";
    private static final String[] DESIRED_STUDIES = {"DemoSubset", "NotCHAVI001", "NotCHAVI008", "NotRV144"};
    
    private static final String HOME_PAGE_GROUP = "A Plotted Group For Home Page Verification and Testing.";

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    @Override
    public String getAssociatedModuleDirectory()
    {
        return "server/customModules/CDS";
    }

    @Override
    public String getProjectName()
    {
        return "CDSTest Project";
    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        deleteProject(getProjectName(), afterTest);
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @BeforeClass @LogMethod(category = LogMethod.MethodType.SETUP)
    public static void doSetup() throws Exception
    {
        CDSTest initTest = new CDSTest();

        initTest.doCleanup(false);
        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setDesiredStudies(DESIRED_STUDIES);
        _initializer.setupDataspace();

        currentTest = initTest;
    }

    @LogMethod(quiet = true)
    private void updateParticipantGroups(String... exclusions)
    {
        clickProject(getProjectName());
        clickAndWait(Locator.linkWithText("Update Participant Groups"));
        for (String s : exclusions)
        {
            uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", s));
        }
        submit();
        waitForText("Fact Table");
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void verifyFactTable()
    {
        clickProject(getProjectName());
        clickAndWait(Locator.linkWithText("Verify"));
        waitForText("No data to show.", CDSHelper.CDS_WAIT);
    }

    @Before
    public void preTest()
    {
        Ext4Helper.setCssPrefix("x-");

        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(500); // let the group display load

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_NAME);
        groups.add(GROUP_NAME2);
        groups.add(GROUP_NAME3);
        groups.add(GROUP_LIVE_FILTER);
        groups.add(GROUP_STATIC_FILTER);
        groups.add(STUDY_GROUP);
        groups.add(HOME_PAGE_GROUP);
        ensureGroupsDeleted(groups);

        cds.clearAllFilters();
        cds.clearAllSelections();

        // go back to app starting location
        cds.goToAppHome();
    }

    @AfterClass
    public static void postTest()
    {
        Ext4Helper.resetCssPrefix();
    }

    @Test
    public void verifyHomePage()
    {
        /**
         * Header
         * ------
         * Counts (logged out -- once ajax login is present)
         */

        log("Verify Home Page");

        //
        // Validate counts and about link
        //
        Locator.XPathLocator studyPoints = Locator.tagWithText("h1", CDSHelper.STUDIES.length + " studies connected together combining");
        Locator.XPathLocator dataPoints = Locator.tagWithText("h1", "1,106 data points.");
        waitForElement(studyPoints);
        waitForElement(dataPoints);

        click(Locator.tagContainingText("a", "About the Co"));
        waitForText("About the HIV Collaborative");
        getDriver().navigate().back();
        waitForElement(dataPoints.notHidden());

        //
        // Validate News feed
        //
        waitForText("LabKey Software looks forward to sponsoring the Association of Independent Research Institutes");
        assertTextPresentInThisOrder("08 May 2014", "09 Jan 2014", "16 Oct 2013");

        //
        // Validate Groups
        //
        assertTextPresent("My Saved Groups and Plots");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Lab Results", "CD4");
        yaxis.confirmSelection();
        waitForElement(CDSHelper.Locators.filterMemberLocator("In the plot: CD4"));

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0]);
        cds.useSelectionAsFilter();
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        _asserts.assertFilterStatusCounts(6, 1, 2);

        final String clippedGroup = HOME_PAGE_GROUP.substring(0, 20);
        final String saveLabel = "Group \"A Plotted...\" saved.";
        Locator.XPathLocator clippedLabel = Locator.tagWithClass("div", "grouplabel").containing(clippedGroup);

        cds.saveGroup(HOME_PAGE_GROUP, "A Plottable group");
        waitForText(saveLabel);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElement(Locator.css("div.groupicon img"));
        assertElementPresent(clippedLabel);
        cds.clearAllFilters();

        getDriver().navigate().refresh();
        waitAndClick(clippedLabel);
        waitForText("Your filters have been");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("In the plot: CD4"));
        _asserts.assertFilterStatusCounts(6, 1, 2);

        // TODO: Enable this once fb_plots is merged
//        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        // assert the SVG element and plot build properly

        // remove just the plot filter
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        click(Locator.tagWithClass("div", "closeitem").index(0));
        cds.saveOverGroup(HOME_PAGE_GROUP);
        waitForText(saveLabel);
        _asserts.assertFilterStatusCounts(6, 1, 2);
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElementToDisappear(Locator.css("div.groupicon img"));
    }

    @Test
    public void verifyFilterPane()
    {
        log("Verify Filter Pane");

        String raceMemberType = "Subject (Race & Subtype)";
        String raceMember = "Black/African American";
        String raceMember2 = "Native Hawaiian/Pacific Islander";
        String raceMember3 = "Asian";
        String raceMember4 = "White";

        Locator.XPathLocator hasData = Locator.tagWithClass("div", "x-grid-group-title").withText("Has data in current filters");
        Locator.XPathLocator noData = Locator.tagWithClass("div", "x-grid-group-title").withText("No data in current filters");

        //
        // Open an filter pane and close it
        //
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.openStatusInfoPane("Races & subtypes");
        click(CDSHelper.Locators.cdsButtonLocator("cancel", "filterinfocancel"));
        _asserts.assertDefaultFilterStatusCounts(this);

        //
        // Open a filter pane and create filter
        //
        cds.openStatusInfoPane("Races & subtypes");
        cds.selectInfoPaneItem(raceMember, true);
        click(CDSHelper.Locators.cdsButtonLocator("filter", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember));
        _asserts.assertFilterStatusCounts(9, 4, 3);

        //
        // Undo a info pane generated filter
        //
        click(Locator.tagWithClass("div", "closeitem"));
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts(this);

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember));
        _asserts.assertFilterStatusCounts(9, 4, 3);

        //
        // open the filter pane via a created filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember));
        assertElementPresent(hasData);
        assertElementPresent(noData);

        cds.selectInfoPaneItem(raceMember2, true);
        click(CDSHelper.Locators.cdsButtonLocator("update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember2));
        _asserts.assertFilterStatusCounts(3, 2, 3);

        //
        // update the current filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember2));
        cds.selectInfoPaneItem(raceMember3, false);
        click(CDSHelper.Locators.cdsButtonLocator("update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember2));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember3));
        _asserts.assertFilterStatusCounts(7, 2, 3); // default is 'OR'

        //
        // change the operator
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember2));
        cds.selectInfoPaneOperator(true);
        click(CDSHelper.Locators.cdsButtonLocator("update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember2));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember3));
        _asserts.assertFilterStatusCounts(0, 0, 0); // now it's 'AND'

        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember2));
        assertElementNotPresent(hasData);
        assertElementPresent(noData);

        cds.selectInfoPaneItem(raceMember4, true);
        click(CDSHelper.Locators.cdsButtonLocator("update", "filterinfoaction"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember4));
        _asserts.assertFilterStatusCounts(11, 4, 4);
        cds.clearAllFilters();

        //
        // Check sort menu
        //
        cds.openStatusInfoPane("Races & subtypes");
        cds.changeInfoPaneSort("Race", "Country");
        cds.selectInfoPaneItem("South Africa", true);
        cds.selectInfoPaneItem("Thailand", true);
        cds.selectInfoPaneItem("USA", true);
        click(CDSHelper.Locators.cdsButtonLocator("filter", "filterinfoaction"));

        Locator.XPathLocator countryFilter = CDSHelper.Locators.filterMemberLocator("USA");
        waitForElement(countryFilter);
        _asserts.assertFilterStatusCounts(19, 3, 3);
        cds.openFilterInfoPane(countryFilter);
        assertElementNotPresent(CDSHelper.Locators.infoPaneSortButtonLocator().notHidden());
        click(CDSHelper.Locators.cdsButtonLocator("cancel", "filterinfocancel"));
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
        cds.useSelectionAsFilter();
        cds.saveGroup(STUDY_GROUP, studyGroupDesc);

        // verify group save messaging
        //ISSUE 19997
        waitForText("Group \"Study Group...\" saved.");

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
        click(CDSHelper.Locators.cdsButtonLocator("save", "groupupdatesave"));

        // verify group save messaging
        waitForText("Group \"Study Group...\" saved.");
        _asserts.assertFilterStatusCounts(18, 2, 3);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify that the description has changed.
        waitForText(studyGroupDescModified);

        // verify 'whoops' case
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("create a new group");
        click(CDSHelper.Locators.cdsButtonLocator("cancel", "groupupdatecancel"));
        cds.clearFilter();

        // add a filter, which should be blown away when a group filter is selected
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[1]);
        cds.useSelectionAsFilter();
        _asserts.assertFilterStatusCounts(6, 1, 2);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify that filters get replaced when viewing group.
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));
        _asserts.assertFilterStatusCounts(18, 2, 3);
        assertTextPresent("Study Group Verify", "Description", "Updates", studyGroupDescModified);

        // Change from live to snapshot, verify choice remains after navigating away.
        click(Locator.tagWithText("label", "Snapshot: Keep this group static"));
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));
        waitForText(studyGroupDescModified);
        Locator selectedRadio = Ext4Helper.Locators.radiobutton(this, "Snapshot: Keep this group static")
                .withPredicate(Locator.xpath("ancestor-or-self::table").withClass("x-form-cb-checked"));
        assertElementPresent(selectedRadio);

        // Verify that you can cancel delete
        click(CDSHelper.Locators.cdsButtonLocator("delete"));
        waitForText("Are you sure you want to delete");
        click(Locator.linkContainingText("Cancel"));
        waitForTextToDisappear("Are you sure you want to delete");
        assertTextPresent(studyGroupDescModified);

        // Verify back button works
        click(CDSHelper.Locators.cdsButtonLocatorContainingText("back"));
        waitForText("Welcome to the HIV Vaccine Collaborative Dataspace.");
        waitForText(STUDY_GROUP);

        // Verify delete works.
        cds.deleteGroupFromSummaryPage(STUDY_GROUP);

        cds.clearFilter();
    }

    @Test
    public void verifyUserPermissions()
    {
        beginAt("project/" + getProjectName() + "/begin.view?");
        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        if (!isElementPresent(Locator.permissionRendered()))
            _permissionsHelper.enterPermissionsUI();
        _ext4Helper.clickTabContainingText("Project Groups");
       if(isTextPresent("PermGroup1"))
       {
           _permissionsHelper.openGroupPermissionsDisplay("PermGroup1");
           _extHelper.waitForExtDialog("PermGroup1 Information");
           clickButton("Delete Empty Group",0);
           waitForElement(Locator.css(".groupPicker .x4-grid-cell-inner").withText("Users"), WAIT_FOR_JAVASCRIPT);
           clickButton("Cancel");
           if (!isElementPresent(Locator.permissionRendered()))
               _permissionsHelper.enterPermissionsUI();
           _ext4Helper.clickTabContainingText("Project Groups");

       }
        if(isTextPresent("PermGroup2"))
        {
            _permissionsHelper.openGroupPermissionsDisplay("PermGroup2");
            _extHelper.waitForExtDialog("PermGroup2 Information");
            clickButton("Delete Empty Group",0);
            waitForElement(Locator.css(".groupPicker .x4-grid-cell-inner").withText("Users"), WAIT_FOR_JAVASCRIPT);
            clickButton("Cancel");
            if (!isElementPresent(Locator.permissionRendered()))
                _permissionsHelper.enterPermissionsUI();
            _ext4Helper.clickTabContainingText("Project Groups");
        }

        //Here is where the issue occurs (Issue 20329)
        _permissionsHelper.createPermissionsGroup("PermGroup1");
        if (isElementPresent(Locator.permissionRendered()) && isButtonPresent("Save and Finish"))
            clickButton("Save and Finish");
        clickProject("CDSTest Project");
        clickFolder("NotRV144");
        _permissionsHelper.enterPermissionsUI();
        _permissionsHelper.uncheckInheritedPermissions();
        clickButton("Save",0);

        //This is the workaround for issue 20329
        sleep(1000);
        _permissionsHelper.uncheckInheritedPermissions();
        clickButton("Save",0);

        waitForElement(Locator.permissionRendered());
        _securityHelper.setProjectPerm("PermGroup1", "Reader");
        clickButton("Save and Finish");
        clickProject("CDSTest Project");
        _permissionsHelper.enterPermissionsUI();
        _securityHelper.setProjectPerm("PermGroup1", "Reader");
        clickButton("Save and Finish");
        _permissionsHelper.createPermissionsGroup("PermGroup2");
        clickButton("Save and Finish");
        _permissionsHelper.enterPermissionsUI();
        _securityHelper.setProjectPerm("PermGroup2", "Reader");
        clickButton("Save and Finish");
        impersonateGroup("PermGroup1", false);
        cds.enterApplication();
        _asserts.assertFilterStatusCounts(9, 1, 2);
        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        clickUserMenuItem("Stop Impersonating");
        assertSignOutAndMyAccountPresent();
        impersonateGroup("PermGroup2", false);
        cds.enterApplication();
        _asserts.assertFilterStatusCounts(0, 0, 0);
        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        clickUserMenuItem("Stop Impersonating");
        assertSignOutAndMyAccountPresent();
    }

    @Test
    public void verifyFilterDisplays()
    {
        //ISSUE 20013
        log("verify filter displays");

        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0]);

        // verify "Study: Demo Study" selection
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));

        // verify buttons available
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("use as filter"));
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("label as subgroup"));
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("clear"));

        // verify split display
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));
        assertElementPresent(Locator.tagWithClass("div", "selitem").withText("Study"));
        _asserts.assertSelectionStatusCounts(18, 2, 3);

        // clear by selection
        cds.selectBars(CDSHelper.STUDIES[1]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));
        _asserts.assertSelectionStatusCounts(12, 1, 2);

        // verify multi-level filtering
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[0], CDSHelper.ASSAYS[2]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[0]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[2]));

        cds.useSelectionAsFilter();
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[0]), 1);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[2]), 1);
        _asserts.assertFilterStatusCounts(0, 0, 0);

        // remove filter
        click(Locator.tagWithClass("div", "closeitem"));
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts(this);
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[0]));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[0]));
        _asserts.assertFilterStatusCounts(0, 0, 0);

        // remove an undo filter
        click(Locator.tagWithClass("div", "closeitem"));
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts(this);
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[0]));

        // ensure undo is removed on view navigation
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        waitForTextToDisappear("Filter removed.", 5000);
    }

    @Test
    public void verifyGrid()
    {
        log("Verify Grid");
        final int COLUMN_COUNT = 117;

        DataGridSelector grid = new DataGridSelector(this);

        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this);
        gridColumnSelector.setColumnCount(COLUMN_COUNT);

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        waitForText("choose from " + COLUMN_COUNT + " columns");

        gridColumnSelector.addGridColumn("NAb", "Point IC50", true, true);
        gridColumnSelector.addGridColumn("NAb", "Lab", false, true);
        grid.ensureColumnsPresent("Point IC50", "Lab");
        grid.waitForCount(757);

        //
        // Navigate to Summary to apply a filter
        //
        cds.goToSummary();
        cds.clickBy("Studies");
        click(CDSHelper.Locators.cdsButtonLocator("hide empty"));
        cds.waitForBarToAnimate(CDSHelper.STUDIES[0]);
        cds.selectBars(CDSHelper.STUDIES[0]);
        cds.useSelectionAsFilter();

        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));

        //
        // Check to see if grid is properly filtering based on explorer filter
        //
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        grid.waitForCount(482);
        cds.clearFilter();
        grid.waitForCount(757);
        assertElementPresent(grid.cellLocator("Piehler/Eckels Lab"));

        gridColumnSelector.addGridColumn("Demographics", "Sex", true, true);
        gridColumnSelector.addGridColumn("Demographics", "Race", false, true);
        grid.ensureColumnsPresent("Point IC50", "Lab", "Sex", "Race");
        grid.waitForCount(760);

        log("Remove a column");
        gridColumnSelector.removeGridColumn("NAb", "Point IC50", false);
        grid.assertColumnsNotPresent("Point IC50");
        grid.ensureColumnsPresent("Lab"); // make sure other columns from the same source still exist

        grid.setFilter("Race", "White");
        grid.waitForCount(246);
        _asserts.assertFilterStatusCounts(11, 4, 4);

        log("Change column set and ensure still filtered");
        gridColumnSelector.addGridColumn("NAb", "Point IC50", false, true);
        grid.ensureColumnsPresent("Point IC50");
        grid.waitForCount(246);
        _asserts.assertFilterStatusCounts(11, 4, 4);

        log("Add a lookup column");
        gridColumnSelector.addLookupColumn("NAb", "Lab", "PI");
        grid.ensureColumnsPresent("Point IC50", "Lab", "PI");
        grid.waitForCount(246);
        _asserts.assertFilterStatusCounts(11, 4, 4);

        log("Filter on a looked-up column");
        grid.setFilter("PI", "Mark I");
        waitForElement(CDSHelper.Locators.filterMemberLocator("Race: Starts With White"));
        waitForElement(CDSHelper.Locators.filterMemberLocator("Lab/PI: Starts With Mark I"));
        grid.waitForCount(237);
        _asserts.assertFilterStatusCounts(8, 3, 4);

        log("Filter undo on grid");
        cds.clearFilter();
        grid.waitForCount(760);
        _asserts.assertDefaultFilterStatusCounts(this);

        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator("Race: Starts With White"));
        waitForElement(CDSHelper.Locators.filterMemberLocator("Lab/PI: Starts With Mark I"));
        grid.waitForCount(237);
        _asserts.assertFilterStatusCounts(8, 3, 4);

        log("update a column filter that already has a filter");
        grid.setFilter("Race", "Black");
        grid.waitForCount(128);
        _asserts.assertFilterStatusCounts(5, 2, 3);

//        log("Ensure filtering goes away when column does");
//        gridColumnSelector.removeLookupColumn("NAb", "Lab", "PI");
//        grid.waitForCount(999); // update to real count

        grid.setFilter("Point IC50", "Is Greater Than", "60");
        grid.waitForCount(1);
        grid.clearFilters("Race");
        grid.waitForCount(5);
        grid.clearFilters("Point IC50");
        grid.waitForCount(650);
        grid.clearFilters("PI");
        grid.waitForCount(760);
        assertTextPresent("All subjects"); // ensure there are no app filters remaining
    }

    @Test
    public void verifyCounts()
    {
        cds.goToSummary();
        _asserts.assertAllSubjectsPortalPage();

        // 14902
        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(6, 1, 2);

        // Verify multi-select tooltip -- this only shows the first time
        assertTextPresent(TOOLTIP);

        cds.useSelectionAsFilter();
        click(CDSHelper.Locators.cdsButtonLocator("hide empty"));
        waitForElementToDisappear(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[1]), CDSHelper.CDS_WAIT);
        _asserts.assertFilterStatusCounts(6, 1, 2);
        cds.goToSummary();

        // Verify multi-select tooltip has dissappeared
        waitForTextToDisappear(TOOLTIP);

        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(6, 1, 2);
        sleep(500);
        cds.clearFilter();
        waitForElement(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[2]), CDSHelper.CDS_WAIT);
        cds.goToSummary();
        // end 14902

        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[1]);
        _asserts.assertSelectionStatusCounts(12, 1, 2);
        assertTextNotPresent(TOOLTIP);
        cds.applySelection(CDSHelper.STUDIES[2]);
        _asserts.assertSelectionStatusCounts(5, 1, 1);
        cds.goToSummary();
        cds.clearSelection();
        cds.clickBy("Assays");
        cds.applySelection(CDSHelper.ASSAYS[0]);
        _asserts.assertSelectionStatusCounts(12, 1, 2);
        cds.applySelection(CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(6, 1, 2);
        cds.applySelection(CDSHelper.ASSAYS[3]);
        _asserts.assertSelectionStatusCounts(29, 4, 4);
        cds.applySelection(CDSHelper.ASSAYS[2]);
        _asserts.assertSelectionStatusCounts(5, 1, 2);
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        cds.clearSelection();
        _asserts.assertDefaultFilterStatusCounts(this);
        cds.pickSort("Country");
        cds.applySelection("South Africa");
        _asserts.assertSelectionStatusCounts(5, 1, 1);
        cds.applySelection("USA");
        _asserts.assertSelectionStatusCounts(19, 3, 3);
        cds.applySelection("Thailand");
        _asserts.assertSelectionStatusCounts(5, 1, 2);
    }

    @Test
    public void verifyFilters()
    {
        log("Verify multi-select");
        Locator dimensionGroup = Locator.css("div.dimgroup");
        Locator dimensionSort = Locator.css("div.dimensionsort");

        // 14910
        cds.goToSummary();
        waitAndClick(Locator.linkWithText("types"));
        waitForElement(dimensionGroup.withText("Assays"));
        waitForElement(dimensionSort.withText("SORTED BY: TYPE"));
        click(CDSHelper.Locators.cdsButtonLocator("hide empty"));
        cds.waitForBarToAnimate(CDSHelper.ASSAYS[0]);
        cds.shiftSelectBars(CDSHelper.ASSAYS[3], CDSHelper.ASSAYS[0]);
        waitForElement(CDSHelper.Locators.filterMemberLocator("Fake ADCC data"), WAIT_FOR_JAVASCRIPT);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(), 3);
        _asserts.assertSelectionStatusCounts(12, 1, 2);
        cds.clearSelection();
        _asserts.assertDefaultFilterStatusCounts(this);
        // end 14910

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        cds.openStatusInfoPane("Labs");
        waitForText(CDSHelper.LABS[1]);
        cds.selectInfoPaneItem(CDSHelper.LABS[1], true);
        cds.selectInfoPaneItem(CDSHelper.LABS[2], false);
        click(CDSHelper.Locators.cdsButtonLocator("filter", "filterinfoaction"));
        cds.saveGroup(GROUP_NAME, GROUP_DESC);
        _asserts.assertFilterStatusCounts(12, 1, 2);
        cds.clearFilter();
        _asserts.assertDefaultFilterStatusCounts(this);
        cds.goToSummary();
        _asserts.assertAllSubjectsPortalPage();

        log("Verify operator filtering");
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        _asserts.assertSelectionStatusCounts(18, 2, 3);  // or
        assertElementPresent(Locator.css("option").withText("OR"));
        mouseOver(Locator.css("option").withText("OR"));

        WebElement selector = Locator.css("select").findElement(getDriver());
        assertEquals("Wrong initial combo selection", "UNION", selector.getAttribute("value"));
        selectOptionByValue(selector, "INTERSECT");
        _asserts.assertSelectionStatusCounts(0, 0, 0); // and
        cds.useSelectionAsFilter();
        waitForElementToDisappear(Locator.css("span.barlabel"), CDSHelper.CDS_WAIT);
        _asserts.assertFilterStatusCounts(0, 0, 0); // and

        selector = Locator.css("select").findElement(getDriver());
        waitForElement(Locator.css("option").withText("AND"));
        mouseOver(Locator.css("option").withText("AND"));

        assertEquals("Combo box selection changed unexpectedly", "INTERSECT", selector.getAttribute("value"));
        selectOptionByValue(selector, "UNION");
        _asserts.assertFilterStatusCounts(18, 2, 3);  // or
        assertElementPresent(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[0]));
        cds.goToSummary();
        waitForText(CDSHelper.STUDIES[1], CDSHelper.CDS_WAIT);
        cds.clickBy("Assays");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(Locator.css("option").withText("OR"));
        _asserts.assertFilterStatusCounts(18, 2, 3);  // and
        cds.clearFilter();
        waitForText("All subjects");
        _asserts.assertDefaultFilterStatusCounts(this);
        assertTextPresent("All subjects");
        cds.goToSummary();

        log("Verify selection messaging");
        cds.clickBy("Assays");
        cds.pickSort("Name");
        cds.waitForBarToAnimate(CDSHelper.ASSAYS[0]);
        cds.selectBars(CDSHelper.ASSAYS[0], CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(0, 0, 0);
        cds.pickDimension("Studies");
        _asserts.assertSelectionStatusCounts(0, 0, 0);
        cds.clearSelection();
        waitForText(CDSHelper.STUDIES[2], CDSHelper.CDS_WAIT);
        cds.selectBars(CDSHelper.STUDIES[0]);
        cds.pickDimension("Assays");
        _asserts.assertSelectionStatusCounts(6, 1, 2);
        cds.useSelectionAsFilter();
        cds.goToSummary();

        //test more group saving
        cds.clickBy("Subject characteristics");
        cds.pickSort("Sex at birth");
        cds.selectBars("f");

        // save the group and request cancel
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_NULL);
        click(CDSHelper.Locators.cdsButtonLocator("cancel", "cancelgroupsave"));
        waitForElementToDisappear(Locator.xpath("//div[starts-with(@id, 'groupsave')]").notHidden());

        cds.selectBars("f");

        // save the group and request save
        cds.saveGroup(GROUP_NAME2, null);

        cds.selectBars("f");

        // save a group with an interior group
        cds.saveGroup(GROUP_NAME3, null);

        cds.clearFilter();
    }

    @Test
    @Ignore("Single Noun Pages NYI")
    public void verifyNounPages()
    {
        // placeholder pages
        cds.clickBy("Assay antigens");
        cds.waitForBarToAnimate("SF162.LS");
        cds.pickSort("Tier", "1A");
        cds.toggleExplorerBar("1A");
        _asserts.assertNounInfoPage("MW965.26", Arrays.asList("Clade", "Tier", "MW965.26", "U08455"));
        _asserts.assertNounInfoPage("SF162.LS", Arrays.asList("Clade", "Tier", "SF162.LS", "EU123924"));
        cds.toggleExplorerBar("1B");
        _asserts.assertNounInfoPage("ZM109F.PB4", Arrays.asList("Zambia", "Tier", "AY424138"));

        cds.goToSummary();
        cds.clickBy("Studies");
        _asserts.assertNounInfoPage(CDSHelper.STUDIES[0], Arrays.asList("Igra M", "Fitzsimmons K", "Trial", "LabKey"));
        _asserts.assertNounInfoPage(CDSHelper.STUDIES[1], Arrays.asList("Bellew M", "Arnold N", "Observational", "CHAVI"));
        _asserts.assertNounInfoPage(CDSHelper.STUDIES[3], Arrays.asList("Piehler B", "Lum K", "Trial", "USMHRP"));

        cds.goToSummary();
        cds.clickBy("Assays");

        AssayDetailsPage labResults = AssayDetailsPage.labResults(this);
        _asserts.verifyAssayInfo(labResults);

        AssayDetailsPage adccFerrari = AssayDetailsPage.adccFerrari(this);
        _asserts.verifyAssayInfo(adccFerrari);

        AssayDetailsPage luminexSampleLabKey = AssayDetailsPage.luminexSampleLabKey(this);
        _asserts.verifyAssayInfo(luminexSampleLabKey);

        AssayDetailsPage mrnaAssay = AssayDetailsPage.mrnaAssay(this);
        _asserts.verifyAssayInfo(mrnaAssay);

        AssayDetailsPage nabSampleLabKey = AssayDetailsPage.nabSampleLabKey(this);
        _asserts.verifyAssayInfo(nabSampleLabKey);

        cds.goToSummary();
        cds.clickBy("Study products");

        _asserts.assertVaccineTypeInfoPage("VRC-HIVADV014-00-VP", "The recombinant adenoviral vector product VRC-HIVADV014-00-VP (Ad5)");
        _asserts.assertVaccineTypeInfoPage("VRC-HIVDNA016-00-VP", "VRC-HIVDNA016-00-VP is manufactured by Vical Incorporated");
    }

    @Test
    public void testLearnAboutStudies()
    {
        cds.viewLearnAboutPage("Studies");

        List<String> studies = Arrays.asList(CDSHelper.STUDIES);
        _asserts.verifyLearnAboutPage(studies);
    }

    @Test
    public void testLearnAboutAssays()
    {
        cds.viewLearnAboutPage("Assays");

        List<String> assays = Arrays.asList(CDSHelper.ASSAYS);
        _asserts.verifyLearnAboutPage(assays);
    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        cds.viewLearnAboutPage("Study products");

        List<String> studyProducts = Arrays.asList("AIDSVAX B/E (gp120)", "Placebo", "VRC-HIVDNA016-00-VP");
        _asserts.verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void testLearnAboutLabs()
    {
        cds.viewLearnAboutPage("Labs");

        List<String> labs = Arrays.asList("Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab");
        _asserts.verifyLearnAboutPage(labs);
    }

    @Test
    @Ignore("Sites have been disabled until it is no longer dependent on the demographics dataset")
    public void testLearnAboutSites()
    {
        cds.viewLearnAboutPage("Sites");

        List<String> sites = Collections.emptyList();
        _asserts.verifyLearnAboutPage(sites);
    }

    @Test
    public void testSummaryPageSingleAxisLinks()
    {
        Locator dimensionGroup = Locator.css("div.dimgroup");
        Locator dimensionSort = Locator.css("div.dimensionsort");

        cds.goToSummary();
        waitAndClick(Locator.linkWithText("races & subtypes"));
        waitForElement(dimensionGroup.withText("Subject characteristics"));
        waitForElement(dimensionSort.withText("SORTED BY: RACE & SUBTYPE"));
        cds.goToSummary();
        sleep(250);

        waitAndClick(Locator.linkWithText("countries"));
        waitForElement(dimensionGroup.withText("Subject characteristics"));
        waitForElement(dimensionSort.withText("SORTED BY: COUNTRY"));
        cds.goToSummary();
    }

    @Test
    @Ignore("Needs to be implemented without side-effects")
    public void verifyLiveFilterGroups()
    {
        String[] liveGroupMembersBefore = new String[]{
                "1",
                "102", "103", "105",
                "3006", "3007", "3008", "3009", "3012",
                "249320489", "249325717"};

        String[] liveGroupMembersAfter = new String[] {
                "1",
                "249320489", "249325717"};

        String[] excludedMembers = new String[]{
                "102", "103", "105",
                "3006", "3007", "3008", "3009", "3012"};

        // exit the app and verify no live filter groups exist
        beginAt("/cds/" + getProjectName() + "/begin.view?");
        updateParticipantGroups();

        // use this search method to only search body text instead of html source
        assertTextPresentInThisOrder("No Participant Groups with Live Filters were defined.");

        // create two groups one that is a live filter and one that is not
        cds.enterApplication();
        cds.goToSummary();

        // create live filter group
        cds.clickBy("Subject characteristics");
        cds.pickSort("Race");
        cds.selectBars("White");
        cds.useSelectionAsFilter();
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_LIVE_FILTER);
        click(Locator.radioButtonByNameAndValue("groupselect", "live"));
        click(CDSHelper.Locators.cdsButtonLocator("save", "groupcreatesave"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(GROUP_LIVE_FILTER), WAIT_FOR_JAVASCRIPT);

        // create static filter group
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_STATIC_FILTER);
        click(Locator.radioButtonByNameAndValue("groupselect", "live"));
        click(CDSHelper.Locators.cdsButtonLocator("save", "groupcreatesave"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(GROUP_STATIC_FILTER), WAIT_FOR_JAVASCRIPT);

        // exit the app and verify
        beginAt("/cds/" + getProjectName() + "/begin.view?");
        updateParticipantGroups();
        waitForText(GROUP_LIVE_FILTER + " now has participants:");
        _asserts.assertParticipantIdsOnPage(liveGroupMembersBefore, null);
        assertTextNotPresent(GROUP_STATIC_FILTER);

        // now repopulate the cube with a subset of subjects and ensure the live filter is updated while the static filter is not
        updateParticipantGroups("NAb", "Lab Results", "ADCC");
        waitForText(GROUP_LIVE_FILTER + " now has participants:");
        assertTextNotPresent(GROUP_STATIC_FILTER);
        _asserts.assertParticipantIdsOnPage(liveGroupMembersAfter, excludedMembers);

        // verify that our static group still ha the original members in it now
        clickTab("Manage");
        clickAndWait(Locator.linkContainingText("Manage Participant Groups"));
        _asserts.assertParticipantIds(GROUP_LIVE_FILTER, liveGroupMembersAfter, excludedMembers);
        _asserts.assertParticipantIds(GROUP_STATIC_FILTER, liveGroupMembersBefore, null);
    }

    private void ensureGroupsDeleted(List<String> groups)
    {
        List<String> deletable = new ArrayList<>();
        for (String group : groups)
        {
            String subName = group.substring(0, 10);
            if (isTextPresent(subName))
                deletable.add(subName);
        }

        if (deletable.size() > 0)
        {
            for (String d : deletable)
            {
                cds.deleteGroupFromSummaryPage(d);
            }
        }
    }
}
