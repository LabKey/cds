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
package org.labkey.test.tests;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.SortDirection;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.ColorAxisVariableSelector;
import org.labkey.test.pages.DataGrid;
import org.labkey.test.pages.DataGridVariableSelector;
import org.labkey.test.pages.XAxisVariableSelector;
import org.labkey.test.pages.YAxisVariableSelector;
import org.labkey.test.util.CDSAsserts;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.Maps;
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({CDS.class, Git.class})
public class CDSTest extends CDSReadOnlyTest
{
    private static final String GROUP_NULL = "Group creation cancelled";
    private static final String GROUP_DESC = "Intersection of " + CDSHelper.STUDIES[1] + " and " + CDSHelper.STUDIES[4];
    private static final String TOOLTIP = "Hold Shift, CTRL, or CMD to select multiple";

    // Known Test Groups
    private static final String GROUP_NAME = "CDSTest_AGroup";
    private static final String GROUP_NAME2 = "CDSTest_BGroup";
    private static final String GROUP_NAME3 = "CDSTest_CGroup";
    private static final String GROUP_LIVE_FILTER = "CDSTest_DGroup";
    private static final String GROUP_STATIC_FILTER = "CDSTest_EGroup";
    private static final String STUDY_GROUP = "Study Group Verify";

    private static final String HOME_PAGE_GROUP = "A Plotted Group For Home Page Verification and Testing.";

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    @Before
    public void preTest()
    {
        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // let the group display load

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_NAME);
        groups.add(GROUP_NAME2);
        groups.add(GROUP_NAME3);
        groups.add(GROUP_LIVE_FILTER);
        groups.add(GROUP_STATIC_FILTER);
        groups.add(STUDY_GROUP);
        groups.add(HOME_PAGE_GROUP);
        ensureGroupsDeleted(groups);

        cds.ensureNoFilter();
        cds.ensureNoSelection();

        // go back to app starting location
        cds.goToAppHome();
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
//        return BrowserType.FIREFOX;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @LogMethod(quiet = true)
    private void updateParticipantGroups(String... exclusions)
    {
        goToProjectHome();
        clickAndWait(Locator.linkWithText("Update Participant Groups"));
        for (String s : exclusions)
        {
            uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", s));
        }
        submit();
        waitForElement(Locator.css("div.uslog").withText("Success!"), defaultWaitForPage);
        Ext4Helper.setCssPrefix("x-");
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        CDSTest init = (CDSTest)getCurrentTest();

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_NAME);
        groups.add(GROUP_NAME2);
        groups.add(GROUP_NAME3);
        groups.add(GROUP_LIVE_FILTER);
        groups.add(GROUP_STATIC_FILTER);
        groups.add(STUDY_GROUP);
        groups.add(HOME_PAGE_GROUP);
        init.ensureGroupsDeleted(groups);

        init.cds.ensureNoFilter();
        init.cds.ensureNoSelection();
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
        Locator.XPathLocator studyPoints = Locator.tagWithText("h1", "57 studies connected together combining");
        Locator.XPathLocator dataPoints = Locator.tagWithText("h1", "48,359 data points.");
        waitForElement(studyPoints);
        waitForElement(dataPoints);

        click(Locator.tagWithText("a", "About"));
        waitForText("About the HIV Collaborative DataSpace");
        getDriver().navigate().back();
        waitForElement(dataPoints.notHidden());

        //
        // Validate News feed
        //
        waitForText("LabKey Software looks forward to sponsoring the Association of Independent Research Institutes");
        assertTextPresentInThisOrder("08 May 2014", "09 Jan 2014", "16 Oct 2013");

        //
        // Validate Plot data
        //
        assertTextPresent("My saved groups and plots");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // Not sure why I need this but test is more reliable with it.
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.confirmSelection();

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_ANTIGEN);
        xaxis.confirmSelection();

        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.DEMOGRAPHICS);
        coloraxis.pickVariable(CDSHelper.DEMO_RACE);
        coloraxis.confirmSelection();

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.clickBy(CDSHelper.DEMOGRAPHICS);
        cds.selectBars(CDSHelper.RACE_VALUES[2]);
        cds.useSelectionAsSubjectFilter();
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.RACE_VALUES[2]));
        _asserts.assertFilterStatusCounts(667, 15, -1);

        final String clippedGroup = HOME_PAGE_GROUP.substring(0, 20);
        final String saveLabel = "Group \"A Plotted...\" saved.";
        Locator.XPathLocator clippedLabel = Locator.tagWithClass("div", "grouplabel").containing(clippedGroup);

        cds.saveLiveGroup(HOME_PAGE_GROUP, "A Plottable group");
        waitForText(saveLabel);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElement(Locator.css("div.groupicon img"));
        assertElementPresent(clippedLabel);
        cds.ensureNoFilter();

        getDriver().navigate().refresh();
        waitAndClick(clippedLabel);
        waitForText("Your filters have been");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("In the plot: " + CDSHelper.ICS_ANTIGEN + ", " + CDSHelper.ICS_MAGNITUDE_BACKGROUND + ", " + CDSHelper.DEMO_RACE));
        _asserts.assertFilterStatusCounts(667, 15, -1); // TODO Test data dependent.

        // remove just the plot filter
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.clearFilter(0);
        cds.saveOverGroup(HOME_PAGE_GROUP);
        waitForText(saveLabel);
        _asserts.assertFilterStatusCounts(2727, 50, -1); // TODO Test data dependent.
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElementToDisappear(Locator.css("div.groupicon img"));

    }

    @Test
    public void verifyFilterPane()
    {
        log("Verify Filter Pane");

        String raceMember = "Black";
        String raceMember2 = "Native Hawaiian/Paci";
        String raceMember3 = "Asian";
        String raceMember4 = "White";

        Locator.XPathLocator hasData = Locator.tagWithClass("div", "x-grid-group-title").withText("Has data in active filters");
        Locator.XPathLocator noData = Locator.tagWithClass("div", "x-grid-group-title").withText("No data in active filters");

        //
        // Open an filter pane and close it
        //
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.openStatusInfoPane("Races");
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
        _asserts.assertDefaultFilterStatusCounts();

        //
        // Open a filter pane and create filter
        //
        cds.openStatusInfoPane("Races");
        cds.selectInfoPaneItem(raceMember, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember));
        _asserts.assertFilterStatusCounts(2727, 50, -1); // TODO Test data dependent.

        //
        // Undo a info pane generated filter
        //
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember));
        _asserts.assertFilterStatusCounts(2727, 50, -1); // TODO Test data dependent.

        //
        // open the filter pane via a created filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember));
        assertElementPresent(hasData);
        assertElementNotPresent(noData);

        cds.selectInfoPaneItem(raceMember2, true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember2));
        _asserts.assertFilterStatusCounts(22, 12, -1); // TODO Test data dependent.

        //
        // update the current filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember2));
        cds.selectInfoPaneItem(raceMember3, false);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember2));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember3));
        // TODO Test data dependent.
        _asserts.assertFilterStatusCounts(169, 36, -1); // default is 'OR'

        //
        // change the operator
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember2));
        cds.selectInfoPaneOperator(true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember2));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember3));
        // TODO Test data dependent.
        _asserts.assertFilterStatusCounts(0, 0, -1); // now it's 'AND'

        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(raceMember2));
        assertElementPresent(hasData);
        assertElementNotPresent(noData);

        cds.selectInfoPaneItem(raceMember4, true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(raceMember4));
        _asserts.assertFilterStatusCounts(4911, 50, -1); // TODO Test data dependent.
        cds.ensureNoFilter();

        //
        // Check sort menu
        //
        cds.openStatusInfoPane("Races");
        cds.changeInfoPaneSort("Race", "Country at enrollment");
        cds.selectInfoPaneItem("South Africa", true);
        cds.selectInfoPaneItem("United States", true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        Locator.XPathLocator countryFilter = CDSHelper.Locators.filterMemberLocator("United States");
        waitForElement(countryFilter);
        _asserts.assertFilterStatusCounts(5423, 47, -1); // TODO Test data dependent.
        cds.openFilterInfoPane(countryFilter);
        assertElementPresent(CDSHelper.Locators.infoPaneSortButtonLocator().notHidden());
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
    }

    @Test
    public void verifyAssaySummary()
    {
        log("Verify Assay Summary View");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.pickSort("Lab");
        for(String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for(String lab : CDSHelper.LABS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(lab));
        }
        cds.pickSort("Immunogenicity Type");
        for(String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for(String i_type : CDSHelper.I_TYPES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(i_type));
        }
        cds.pickSort("Study");
        for(String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for(String prot : CDSHelper.PROT_NAMES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(prot));
        }
        cds.pickSort("Assay Name");
        for(String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for(String h_type : CDSHelper.H_TYPES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(h_type));
        }
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
        cds.saveLiveGroup(STUDY_GROUP, studyGroupDesc);

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
        _asserts.assertFilterStatusCounts(8, 2, -1); // TODO Test data dependent.

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify that the description has changed.
        waitForText(studyGroupDescModified);

        // verify 'whoops' case
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("create a new group");
        click(CDSHelper.Locators.cdsButtonLocator("cancel", "groupupdatecancel"));
        cds.clearFilters();

        // add a filter, which should be blown away when a group filter is selected
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[1]);
        cds.useSelectionAsSubjectFilter();
        _asserts.assertFilterStatusCounts(1690, 15, -1); // TODO Test data dependent.

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify that filters get replaced when viewing group.
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));
        _asserts.assertFilterStatusCounts(8, 2, -1); // TODO Test data dependent.
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

        cds.clearFilters();
    }

    @Test
    public void verifyFilterDisplays()
    {
        //ISSUE 20013
        log("verify filter displays");

        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0]);

        // verify study selection
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));

        // verify buttons available
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("Filter"));
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("clear"));

        // verify split display
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));
        assertElementPresent(Locator.tagWithClass("div", "selitem").withText("Study (Treatment Assignment Summary)"));
        _asserts.assertSelectionStatusCounts(8, 2, -1); // TODO Test data dependent.

        // clear by selection
        cds.selectBars(CDSHelper.STUDIES[1]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));
       _asserts.assertSelectionStatusCounts(3, 1, -1); // TODO Test data dependent.
        cds.clearSelection();

        // verify multi-level filtering
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[1], CDSHelper.ASSAYS[4]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[4]));

        cds.useSelectionAsSubjectFilter();
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]), 1);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[4]), 1);
        _asserts.assertFilterStatusCounts(195, 5, -1); // TODO Test data dependent.

        // remove filter
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
       _asserts.assertFilterStatusCounts(195, 5, -1); // TODO Test data dependent.

        // remove an undo filter
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));

        // ensure undo is removed on view navigation
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        waitForTextToDisappear("Filter removed.", 5000);
    }

    @Test
    public void verifyGrid()
    {
        log("Verify Grid");

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        waitForText("View data grid"); // grid warning

        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_ASSAY, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_LAB, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB);

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(25714); // TODO Test data dependent.
            grid.assertPageTotal(1029); // TODO Test data dependent.
        }

        //
        // Check paging buttons with known dataset. Verify with first and last subject id on page.
        //
        log("Verify grid paging");
        grid.sort(CDSHelper.GRID_COL_SUBJECT_ID);
        grid.goToLastPage();

        if (CDSHelper.validateCounts)
        {
            grid.assertCurrentPage(1029); // TODO Test data dependent.
            grid.assertCellContent("c264-003"); // TODO Test data dependent.
            grid.assertCellContent("c256-001"); // TODO Test data dependent.
        }

        grid.clickPreviousBtn();

        if (CDSHelper.validateCounts)
        {
            grid.assertCurrentPage(1028); // TODO Test data dependent.
            grid.assertCellContent("908-020"); // TODO Test data dependent.
            grid.assertCellContent("908-026"); // TODO Test data dependent.
        }

        grid.goToFirstPage();

        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("039-001"); // TODO Test data dependent.
            grid.assertCellContent("039-017"); // TODO Test data dependent.
        }

        //
        // Navigate to Summary to apply a filter
        //
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.hideEmpty();
        cds.selectBars(CDSHelper.STUDIES[4]);
        cds.useSelectionAsSubjectFilter();

        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[4]));

        //
        // Check to see if grid is properly filtering based on explorer filter
        //
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        if (CDSHelper.validateCounts)
        {
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
            grid.assertRowCount(110); // TODO Test data dependent.
        }

        cds.clearFilters();

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(25714); // TODO Test data dependent.
            assertElementPresent(DataGrid.Locators.cellLocator("039-001")); // TODO Test data dependent.
        }

        gridColumnSelector.addGridColumn(CDSHelper.DEMOGRAPHICS, CDSHelper.DEMO_SEX, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.DEMOGRAPHICS, CDSHelper.GRID_TITLE_DEMO, CDSHelper.DEMO_RACE, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.DEMO_SEX, CDSHelper.DEMO_RACE);

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(25714); // TODO Test data dependent.
        }

        log("Remove a column");
        gridColumnSelector.removeGridColumn(CDSHelper.NAB, CDSHelper.NAB_ASSAY, false);
        grid.assertColumnsNotPresent(CDSHelper.NAB_ASSAY);
        grid.ensureColumnsPresent(CDSHelper.NAB_LAB); // make sure other columns from the same source still exist

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(25714); // TODO Test data dependent.
        }

        grid.setFacet(CDSHelper.DEMO_RACE, "White");

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(17551); // TODO Test data dependent.
            grid.assertPageTotal(703); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(4911, 50, -1); // TODO Test data dependent.
        }

        //
        // More page button tests
        //
        log("Verify grid paging with filtered dataset");
        grid.sort(CDSHelper.GRID_COL_SUBJECT_ID);
        grid.clickNextBtn();
        grid.assertCurrentPage(2);


        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("908-024"); // TODO Test data dependent.
            grid.assertCellContent("908-023"); // TODO Test data dependent.
        }

        grid.clickPreviousBtn();
        grid.goToPreviousPage();
        grid.assertCurrentPage(3);

        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("505-2473"); // TODO Test data dependent.
        }

        grid.goToNextPage();
        grid.assertCurrentPage(5);

        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("505-2410"); // TODO Test data dependent.
            grid.assertCellContent("505-2402"); // TODO Test data dependent.
        }

        log("Change column set and ensure still filtered");
        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_TITERIC50, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERIC50);

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(17551); // TODO Test data dependent.
            grid.assertPageTotal(703); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(4911, 50, -1); // TODO Test data dependent.
        }

    }

    @Test
    public void verifyGridCheckerboarding()
    {

        log("Verify Grid with filters and checkerboarding.");

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        log("Filter on race.");
        cds.goToSummary();
        cds.clickBy(CDSHelper.DEMOGRAPHICS);
        cds.selectBars(false, CDSHelper.RACE_ASIAN);

        log("Create a plot that will filter.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        // There was a regression when only the y axis was set the filter counts would go to 0.
        // That is why this test is here.
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.setCellType("All");
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        waitForText("View data grid"); // grid warning

        log("Validate expected columns are present.");
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_SUBJECT_ID, CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY, CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_MAGNITUDE_BACKGROUND);

        log("Validating gid counts");
        _asserts.assertFilterStatusCounts(28, 12, -1);
        grid.assertPageTotal(23);
        grid.assertRowCount(561);

        log("Applying a column filter.");
        grid.setFilter(CDSHelper.ICS_MAGNITUDE_BACKGROUND, "Is Greater Than or Equal To", "1");

        _asserts.assertFilterStatusCounts(3, 3, -1);
        grid.assertPageTotal(1);
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_SUBJECT_ID, CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY, CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        grid.assertRowCount(14);

        log("Go back to the grid and apply a color to it. Validate it appears as a column.");
        // Can't use CDSHelper.NavigationLink.Grid.makeNavigationSelection. It expects that it will be going to a blank plot.
        click(CDSHelper.NavigationLink.PLOT.getLinkLocator());

        sleep(500); // There is a brief moment where the grid refreshes because of filters applied in the grid.

        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.DEMOGRAPHICS);
        coloraxis.pickVariable(CDSHelper.DEMO_SEX);
        coloraxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        waitForText("View data grid"); // grid warning

        log("Validate new column added to grid.");
        grid.ensureColumnsPresent(CDSHelper.DEMO_SEX);

        log("Filter on new column.");
        grid.setCheckBoxFilter(CDSHelper.DEMO_SEX, true, "Male");
        _asserts.assertFilterStatusCounts(2, 2, -1);
        grid.assertRowCount(10);

        log("Now add a new column to the mix.");
        gridColumnSelector.openSelectorWindow();
        shortWait().until(LabKeyExpectedConditions.animationIsDone(gridColumnSelector.window()));
        gridColumnSelector.pickSource(CDSHelper.ELISPOT);
        gridColumnSelector.pickVariable(CDSHelper.ELISPOT_ANTIGEN, false);
        gridColumnSelector.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        _asserts.assertFilterStatusCounts(2, 2, -1);
        grid.assertPageTotal(89);
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY,
                CDSHelper.GRID_COL_TREATMENT_SUMMARY, CDSHelper.GRID_COL_STUDY_DAY,
                CDSHelper.ICS_MAGNITUDE_BACKGROUND, "Study ELISPOT Antigen");
        grid.assertRowCount(126);

        log("Validate checkerboarding.");
        List<WebElement> gridRows, gridRowCells;
        String xpathAllGridRows = "//div[contains(@class, 'connector-grid')]//div[contains(@class, 'x-grid-body')]//div//table//tr[contains(@class, 'x-grid-data-row')]";
        gridRows = Locator.xpath(xpathAllGridRows).findElements(getDriver());
        for(WebElement row : gridRows)
        {
            gridRowCells = row.findElements(By.xpath("./descendant::td"));
            switch(gridRowCells.get(0).getText().toLowerCase())
            {
                case "hvtn 054":
                    assertTrue(gridRowCells.get(5).getAttribute("class").toLowerCase().contains("no-value"));
                    assertTrue(!gridRowCells.get(3).getText().trim().isEmpty());
                    break;
                case "hvtn 060":
                    assertTrue(gridRowCells.get(3).getAttribute("class").toLowerCase().contains("no-value"));
                    assertTrue(!gridRowCells.get(5).getText().trim().isEmpty());
                    break;
            }

        }

        log("Remove the grid and validate that the columns and counts remain the same.");

        mouseOver(Locator.xpath("//span[contains(@class, 'sel-label')][text()='In the plot:']"));
        click(Locator.xpath("//img[contains(@src, 'icon_general_clearsearch_normal.svg')]"));
        sleep(5000);
        _ext4Helper.waitForMaskToDisappear(30000);

        _asserts.assertFilterStatusCounts(2, 2, -1);
        grid.assertPageTotal(89);
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY,
                CDSHelper.GRID_COL_TREATMENT_SUMMARY, CDSHelper.GRID_COL_STUDY_DAY,
                CDSHelper.ICS_MAGNITUDE_BACKGROUND, "Study ELISPOT Antigen");
        grid.assertRowCount(126);

        cds.goToAppHome();
        cds.clearFilters();

    }

    @Test
    public void verifyGridColumnSelector()
    {

        CDSHelper cds = new CDSHelper(this);

        log("Verify Grid column selector.");

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        log("Create a plot that will filter.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setVirusName(cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_NEUTRAL_TIER, CDSHelper.NEUTRAL_TIER_1));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_ANTIGEN);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.DEMOGRAPHICS);
        coloraxis.pickVariable(CDSHelper.DEMO_RACE);
        coloraxis.confirmSelection();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        waitForText("View data grid"); // grid warning
        _ext4Helper.waitForMaskToDisappear();

        log("Validate expected columns are present.");
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY,
                CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_ANTIGEN,
                "Study NAb Titer Ic50", CDSHelper.DEMO_RACE);

        log("Validate that Current columns are as expected and not selectable.");
        List<WebElement> checkBoxes;
        WebElement checkBox;
        String xpathColumnNameTemplate = "//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]//td[contains(@role, 'gridcell')]//div[contains(@class, 'x-grid-cell-inner')][text()='*']";
        String xpathSelectorColumnName;
        String xpathAllCheckboxes = "//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]//div[contains(@class, 'x-grid-row-checker')]";
        String xpathSpecificCheckboxesTemplate = "//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]//tr//td//div[text()='*']/./ancestor::tr//div[contains(@class, 'x-grid-row-checker')]";
        String xpathSpecificCheckbox;

        gridColumnSelector.openSelectorWindow();
        gridColumnSelector.pickSource(CDSHelper.GRID_COL_CUR_COL);

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));

        checkBoxes = Locator.xpath(xpathAllCheckboxes).findElements(getDriver());
        for (WebElement cb : checkBoxes)
        {
            assertTrue("Current columns check-box is not disabled and it should be.",cb.getAttribute("class").toLowerCase().contains("checker-disabled"));
        }

        log("Validate that All columns are as expected and not selectable.");
        gridColumnSelector.pickSource(CDSHelper.GRID_COL_ALL_VARS);

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));

        checkBoxes = Locator.xpath(xpathAllCheckboxes).findElements(getDriver());
        for (WebElement cb : checkBoxes)
        {
            assertTrue("Current columns check-box is not disabled and it should be.",cb.getAttribute("class").toLowerCase().contains("checker-disabled"));
        }

        log("Validate that column selectors are as expected in their specific variable selector.");

        gridColumnSelector.pickSource(CDSHelper.DEMOGRAPHICS);
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.DEMO_RACE + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        gridColumnSelector.pickSource(CDSHelper.ICS);
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.ICS_ANTIGEN + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        gridColumnSelector.pickSource(CDSHelper.NAB);
        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.NAB_TITERIC50 + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        log("Now add a new column to the mix.");
        gridColumnSelector.pickSource(CDSHelper.NAB);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-grid-cell-inner')][text()='"+ CDSHelper.NAB_LAB + "']"));
        // TODO Why doesn't this selector work?
//        gridColumnSelector.pickVariable(CDSHelper.NAB_LAB, false);

        log("Validate that Current columns are as expected and enabled or not as appropriate.");
        gridColumnSelector.pickSource(CDSHelper.GRID_COL_CUR_COL);

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.ICS_ANTIGEN + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.NAB_TITERIC50 + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.DEMO_RACE + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_LAB);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.NAB_LAB);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertFalse("Check-box for " + CDSHelper.NAB_LAB + " is disabled and it should not be.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        log("Validate that All columns are as expected and enabled or not as appropriate.");
        gridColumnSelector.pickSource(CDSHelper.GRID_COL_ALL_VARS);

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.ICS_ANTIGEN);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.ICS_ANTIGEN + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.NAB_TITERIC50);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.NAB_TITERIC50 + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.DEMO_RACE);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertTrue("Check-box for " + CDSHelper.DEMO_RACE + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", CDSHelper.NAB_LAB);
        assertElementVisible(Locator.xpath(xpathSelectorColumnName));
        xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", CDSHelper.NAB_LAB);
        checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());
        assertFalse("Check-box for " + CDSHelper.NAB_LAB + " is disabled and it should not be.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));

        gridColumnSelector.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY,
                CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_ANTIGEN,
                "Study NAb Titer Ic50", CDSHelper.DEMO_RACE, "Study NAb Lab Code");

        cds.goToAppHome();
        cds.clearFilters();

    }

    // TODO Still needs work. Counts are changing with each new dataset.
    @Test @Ignore
    public void verifyCounts()
    {
        cds.goToSummary();
        _asserts.assertAllSubjectsPortalPage();

        // 14902
        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(5, 1, -1);

        // Verify multi-select tooltip -- this only shows the first time
        //assertTextPresent(TOOLTIP);

        cds.useSelectionAsSubjectFilter();
        cds.hideEmpty();
        waitForElementToDisappear(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[1]), CDSHelper.CDS_WAIT);
        _asserts.assertFilterStatusCounts(5, 1, -1);
        cds.goToSummary();

        // Verify multi-select tooltip has dissappeared
        //waitForTextToDisappear(TOOLTIP);

        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(5, 1, -1);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        cds.clearFilters();
        waitForElement(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[2]), CDSHelper.CDS_WAIT);
        cds.clearSelection();
        cds.goToSummary();
        // end 14902

        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[1]);
        _asserts.assertSelectionStatusCounts(3, 1, -1);
        assertTextNotPresent(TOOLTIP);
        cds.applySelection(CDSHelper.STUDIES[2]);
        _asserts.assertSelectionStatusCounts(110, 1, -1);
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.applySelection(CDSHelper.ASSAYS[0]);
        _asserts.assertSelectionStatusCounts(270, 1, -1);
        cds.applySelection(CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(969, 8, -1);
        cds.applySelection(CDSHelper.ASSAYS[3]);
        _asserts.assertSelectionStatusCounts(899, 14, -1);
        cds.applySelection(CDSHelper.ASSAYS[2]);
        _asserts.assertSelectionStatusCounts(1690, 15, -1);
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        _asserts.assertDefaultFilterStatusCounts();
        cds.pickSort("Country at enrollment");
        cds.applySelection("South Africa");
        _asserts.assertSelectionStatusCounts(1530, 8, -1);
        cds.applySelection("United States");
        _asserts.assertSelectionStatusCounts(5423, 47, -1);
        cds.applySelection("Thailand");
        _asserts.assertSelectionStatusCounts(12, 1, -1);

    }


    @Test
    public void verifyFilters()
    {
        log("Verify multi-select");
        Locator hierarchySelector = Locator.input("sae-hierarchy");

        // 14910
        cds.goToSummary();
        cds.clickBy("Study products");
        waitForFormElementToEqual(hierarchySelector, "Product Type");
        cds.shiftSelectBars("Poly ICLC", "DEC-205-p24");
        waitForElement(CDSHelper.Locators.filterMemberLocator("Vaccine"), WAIT_FOR_JAVASCRIPT);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("Poly ICLC, Vaccine, DEC-205-p24"));
        _asserts.assertSelectionStatusCounts(1, 1, -1);
        cds.clearSelection();
        _asserts.assertDefaultFilterStatusCounts();
        // end 14910

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        cds.openStatusInfoPane("Studies");
        waitForText(CDSHelper.STUDIES[1]);
        cds.selectInfoPaneItem(CDSHelper.STUDIES[1], true);
        cds.selectInfoPaneItem(CDSHelper.STUDIES[4], false);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        cds.saveLiveGroup(GROUP_NAME, GROUP_DESC);
        _asserts.assertFilterStatusCounts(113, 2, -1);
        cds.clearFilters();
        _asserts.assertDefaultFilterStatusCounts();

        log("Verify operator filtering");
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[4]);
        _asserts.assertSelectionStatusCounts(115, 2, -1);  // or
        assertElementPresent(Locator.css("option").withText("Subjects related to any (OR)"));
        mouseOver(Locator.css("option").withText("Subjects related to any (OR)"));

        WebElement selector = Locator.css("select").findElement(getDriver());
        assertEquals("Wrong initial combo selection", "UNION", selector.getAttribute("value"));
        selectOptionByValue(selector, "INTERSECT");
        _asserts.assertSelectionStatusCounts(0, 0, -1); // and
        cds.useSelectionAsSubjectFilter();
        cds.hideEmpty();
        waitForText("None of the selected");
        _asserts.assertFilterStatusCounts(0, 0, -1); // and

        selector = Locator.css("select").findElement(getDriver());
        waitForElement(Locator.css("option").withText("Subjects related to all (AND)"));
        mouseOver(Locator.css("option").withText("Subjects related to all (AND)"));

        assertEquals("Combo box selection changed unexpectedly", "INTERSECT", selector.getAttribute("value"));
        selectOptionByValue(selector, "UNION");
        _asserts.assertFilterStatusCounts(115, 2, -1);  // or
        waitForElement(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[0]));
        cds.goToSummary();
        cds.clickBy("Assays");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(Locator.css("option").withText("Subjects related to any (OR)"));
        _asserts.assertFilterStatusCounts(115, 2, -1);  // or
        cds.clearFilters();
        waitForText("All subjects");
        _asserts.assertDefaultFilterStatusCounts();
        assertTextPresent("All subjects");

        log("Verify selection messaging");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[0], CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(75, 1, -1);
        cds.pickDimension("Studies");
        waitForText("Selection applied as filter.");
        _asserts.assertFilterStatusCounts(75, 1, -1);
        cds.clearFilters();
        waitForText(CDSHelper.CDS_WAIT, CDSHelper.STUDIES[32]);
        cds.selectBars(CDSHelper.STUDIES[32]);
        cds.pickDimension("Assays");
        waitForText("Selection applied as filter.");

        //test more group saving
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        cds.pickSort("Country at enrollment");
        cds.selectBars("Switzerland");

        // save the group and request cancel
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_NULL);
        click(CDSHelper.Locators.cdsButtonLocator("cancel", "cancelgroupsave"));
        waitForElementToDisappear(Locator.xpath("//div[starts-with(@id, 'groupsave')]").notHidden());

        // save the group and request save
        cds.saveLiveGroup(GROUP_NAME2, null);

        // save a group with an interior group
        cds.saveLiveGroup(GROUP_NAME3, null);

        cds.clearFilters();
    }

    @Test
    public void testLearnAboutStudies()
    {
        cds.viewLearnAboutPage("Studies");

        List<String> studies = Arrays.asList(CDSHelper.STUDIES);
        _asserts.verifyLearnAboutPage(studies);
    }

    @Test
    public void clickOnLearnAboutStudyItem()
    {
        List<WebElement> returnedItems;
        String[] itemParts;
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudies')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-container')]";

        cds.viewLearnAboutPage("Studies");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());

        int index = returnedItems.size()/2;

        itemParts = returnedItems.get(index).getText().split("\n");
        returnedItems.get(index).click();

        log("Validating title is " + itemParts[0]);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//h1[text()='" + itemParts[0] + "']").toBy()));

        log("Validating Study Type is: " + itemParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[1] + "']").findElement(getDriver()).isDisplayed());

        // TODO could add more code here to validate other fields, but in the interest of time leaving it at this for now.

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')][contains(@class, 'titlepanel')][text()='Studies']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'titlepanel')][text()='Learn about...']").toBy()));
    }

    @Test
    public void testLearnAboutStudiesSearch()
    {
        String searchString;
        List<WebElement> returnedItems;
        String itemText;
        String[] itemParts;
        final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudies')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-wrapper')]";

        cds.viewLearnAboutPage("Studies");

        searchString = "HVTN"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);  // Same elements are reused between searched, this sleep prevents a "stale element" error.
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        log("Size: " + returnedItems.size());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "(vCP1452)"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "Phase IIB"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "If this string ever appears something very odd happened.";
        log("Searching for '" + searchString + "'.");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        _asserts.verifyEmptyLearnAboutStudyPage();

    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        cds.viewLearnAboutPage("Study products");

        List<String> studyProducts = Arrays.asList(CDSHelper.PRODUCTS);
        _asserts.verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void clickOnLearnAboutStudyProductsItem()
    {
        List<WebElement> returnedItems;
        String[] itemParts;
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-container')]";

        cds.viewLearnAboutPage("Study products");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());

        int index = returnedItems.size()/2;

        itemParts = returnedItems.get(index).getText().split("\n");
        log("Looking for product: " + itemParts[0] + " in a list of " + returnedItems.size());
        shortWait().until(ExpectedConditions.visibilityOf(returnedItems.get(index)));
        returnedItems.get(index).click();

        log("Validating title is " + itemParts[0]);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//h1[text()='" + itemParts[0] + "']").toBy()));

        log("Validating Product Type is: " + itemParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[1] + "']").findElement(getDriver()).isDisplayed());

        log("Validating Class is: " + itemParts[2]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[2] + "']").findElement(getDriver()).isDisplayed());

        // TODO could add more code here to validate other fields, but in the interest of time leaving it at this for now.

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')][contains(@class, 'titlepanel')][text()='Study products']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'titlepanel')][text()='Learn about...']").toBy()));
    }

    @Test
    public void testLearnAboutStudyProductsSearch()
    {
        String searchString;
        List<WebElement> returnedItems;
        String itemText;
        String[] itemParts;
        final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-wrapper')]";

        cds.viewLearnAboutPage("Study products");

        searchString = "AID"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);  // Same elements are reused between searched, this sleep prevents a "stale element" error.
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        log("Size: " + returnedItems.size());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "inhibitor"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "GSK"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "is a"; // TODO Test data dependent.
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        for(WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

        searchString = "If this string ever appears something very odd happened.";
        log("Searching for '" + searchString + "'.");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        _asserts.verifyEmptyLearnAboutStudyProductsPage();

    }

    // TODO Putting this test on hold. "Learn about Assays" is a future feature.
    @Test @Ignore
    public void testLearnAboutAssays()
    {
        cds.viewLearnAboutPage("Assays");
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays);

        waitAndClick(Locator.tagWithClass("div", "detail-wrapper").append("/div/div/h2").containing(assays.get(0)));
        waitForElement(Locator.tagWithClass("div", "learn-up titlepanel interactive inline").containing("Assays"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA);

        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        waitForElement(Locator.tagWithClass("div", "list-entry-container"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_VARIABLES_DATA);

        refresh();

        waitForElement(Locator.tagWithClass("div", "list-entry-container"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_VARIABLES_DATA);
    }

    // TODO Putting this test on hold. "Learn about Sites " is a future feature.
    @Test  @Ignore
    public void testLearnAboutSites()
    {
        cds.viewLearnAboutPage("Sites");

        List<String> sites = Collections.emptyList();
        _asserts.verifyLearnAboutPage(sites);
    }

// TODO Need a test for "Learn about Labs " (a future feature).
    @Test  @Ignore
    public void testLearnAboutLabs()
    {
    }

    @Test
    public void testSummaryPageSingleAxisLinks()
    {
        Locator hierarchySelector = Locator.input("sae-hierarchy");

        cds.goToSummary();
        waitAndClick(Locator.linkWithText("races"));
        waitForElement(CDSHelper.Locators.activeDimensionHeaderLocator("Subject characteristics"));
        waitForFormElementToEqual(hierarchySelector, "Race");
        cds.goToSummary();
        sleep(250);

        waitAndClick(Locator.linkWithText("countries"));
        waitForElement(CDSHelper.Locators.activeDimensionHeaderLocator("Subject characteristics"));
        waitForFormElementToEqual(hierarchySelector, "Country at enrollment");
        cds.goToSummary();
    }

// TODO still debugging this test.
    @Test @Ignore("Needs to be implemented without side-effects")
    public void verifyLiveFilterGroups()
    {
        final String initialBMI = "21";
        final String changedBMI = "16";
        String[] participants = {"052-001", "052-002", "052-003", "052-004"};
        Set<String> staticGroupMembers = setBmisTo(participants, initialBMI);
        Set<String> liveGroupMembers = new HashSet<>(staticGroupMembers);

        // exit the app and verify no live filter groups exist
        updateParticipantGroups();
        assertElementPresent(Locator.css("div.uslog").withText("No Subject Groups with live filters are defined."));

        cds.enterApplication();
        cds.goToSummary();

        // create two groups one that is a live filter and one that is not
        cds.clickBy("Subject characteristics");
        cds.pickSort("Baseline BMI category");
        cds.selectBars(initialBMI);
        cds.useSelectionAsSubjectFilter();
        cds.saveLiveGroup(GROUP_LIVE_FILTER, null);
        cds.saveSnapshotGroup(GROUP_STATIC_FILTER, null);

        _asserts.assertParticipantIds(GROUP_LIVE_FILTER, staticGroupMembers);
        _asserts.assertParticipantIds(GROUP_STATIC_FILTER, liveGroupMembers);

        Set<String> removedGroupMembers = setBmisTo(participants, changedBMI);

        // groups shouldn't be updated yet
        _asserts.assertParticipantIds(GROUP_LIVE_FILTER, staticGroupMembers);
        _asserts.assertParticipantIds(GROUP_STATIC_FILTER, liveGroupMembers);

        // now repopulate the cube with a subset of subjects and ensure the live filter is updated while the static filter is not
        updateParticipantGroups("NAb", "Lab Results", "ADCC");
        liveGroupMembers.removeAll(removedGroupMembers);
        assertElementPresent(Locator.css("div.uslog").containing(String.format("\"%s\" now has %d subjects.", GROUP_LIVE_FILTER, liveGroupMembers.size())));
        assertElementNotPresent(Locator.css("div.uslog").containing(GROUP_STATIC_FILTER));

        // verify that our static group still ha the original members in it now
        _asserts.assertParticipantIds(GROUP_LIVE_FILTER, staticGroupMembers);
        _asserts.assertParticipantIds(GROUP_STATIC_FILTER, liveGroupMembers);
    }

    private Set<String> setBmisTo(String[] participantsId, String value)
    {
        Ext4Helper.resetCssPrefix();
        DataRegionTable dataset;
        Set<String> modifiedParticipants = new HashSet<>();
        for (int i = 0; i < participantsId.length; i++)
        {
            beginAt(WebTestHelper.buildURL("study", getProjectName(), "dataset", Maps.of("datasetId", "5003"))); // Demographics
            dataset = new DataRegionTable("Dataset", this);
            dataset.setSort("SubjectId", SortDirection.ASC);
            clickAndWait(Locator.linkWithText(participantsId[i]).index(0));
            clickAndWait(Locator.linkWithText("edit data"));
            setFormElement(Locator.name("quf_bmi_enrollment"), value);
            modifiedParticipants.add(getFormElement(Locator.name("quf_ParticipantId")));
            clickButton("Submit");
        }
        return modifiedParticipants;
    }

    private void ensureGroupsDeleted(List<String> groups)
    {
        Boolean isVisible;

        List<String> deletable = new ArrayList<>();
        for (String group : groups)
        {
            String subName = group.substring(0, 10);

            // Adding this test for the scenario of a test failure and this is called after the page has been removed.
            try{
                isVisible = isElementVisible(Locator.xpath("//div[contains(@class, 'grouplist-view')]//div[contains(@class, 'grouprow')]//div[contains(@title, '" + subName + "')]"));
            }
            catch(org.openqa.selenium.NoSuchElementException nse)
            {
                isVisible = false;
            }

            if (isTextPresent(subName) && isVisible)
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
