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

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.ColorAxisVariableSelector;
import org.labkey.test.pages.DataGrid;
import org.labkey.test.pages.DataGridVariableSelector;
import org.labkey.test.pages.DataspaceVariableSelector;
import org.labkey.test.pages.XAxisVariableSelector;
import org.labkey.test.pages.YAxisVariableSelector;
import org.labkey.test.util.CDSAsserts;
import org.labkey.test.util.CDSHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({CDS.class, Git.class})
public class CDSTest extends CDSReadOnlyTest
{
    private static final String GROUP_NULL = "Group creation cancelled";
    private static final String GROUP_DESC = "Intersection of " + CDSHelper.STUDIES[1] + " and " + CDSHelper.STUDIES[4];

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
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Test
    public void verifyHomePage()
    {
        log("Verify Home Page");

        //
        // Validate splash counts
        //
        Locator.XPathLocator studyPoints = Locator.tagWithText("h1", "55 studies to learn about.");
        Locator.XPathLocator dataPoints = Locator.tagWithText("h1", "46,644 data points collected from 51 studies.");
        waitForElement(studyPoints);
        waitForElement(dataPoints);

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

        YAxisVariableSelector yAxis = new YAxisVariableSelector(this);
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // Not sure why I need this but test is more reliable with it.
        yAxis.openSelectorWindow();
        yAxis.pickSource(CDSHelper.ICS);
        yAxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yAxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yAxis.confirmSelection();

        XAxisVariableSelector xAxis = new XAxisVariableSelector(this);
        xAxis.openSelectorWindow();
        xAxis.pickSource(CDSHelper.ICS);
        xAxis.pickVariable(CDSHelper.ICS_ANTIGEN);
        xAxis.confirmSelection();

        ColorAxisVariableSelector colorAxis = new ColorAxisVariableSelector(this);
        colorAxis.openSelectorWindow();
        colorAxis.pickSource(CDSHelper.SUBJECT_CHARS);
        colorAxis.pickVariable(CDSHelper.DEMO_RACE);
        colorAxis.confirmSelection();

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.clickBy(CDSHelper.SUBJECT_CHARS);
        cds.selectBars(CDSHelper.RACE_VALUES[2]);
        cds.useSelectionAsSubjectFilter();
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.RACE_VALUES[2]));
        _asserts.assertFilterStatusCounts(139, 12, 1, 1, 39);

        final String clippedGroup = HOME_PAGE_GROUP.substring(0, 20);
        final String saveLabel = "Group \"A Plotted...\" saved.";
        Locator.XPathLocator clippedLabel = Locator.tagWithClass("div", "grouplabel").containing(clippedGroup);

        cds.saveGroup(HOME_PAGE_GROUP, "A Plottable group");
        waitForText(saveLabel);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElement(Locator.css("div.groupicon img"));
        assertElementPresent(clippedLabel);
        cds.ensureNoFilter();

        getDriver().navigate().refresh();
        waitAndClick(clippedLabel);
        waitForText("Your filters have been");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("In the plot: " + CDSHelper.ICS_ANTIGEN + ", " + CDSHelper.ICS_MAGNITUDE_BACKGROUND + ", " + CDSHelper.DEMO_RACE));
        _asserts.assertFilterStatusCounts(139, 12, 1, 1, 39); // TODO Test data dependent.

        // remove just the plot filter
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.clearFilter(0);
        cds.saveOverGroup(HOME_PAGE_GROUP);
        waitForText(saveLabel);
        _asserts.assertFilterStatusCounts(829, 48, 1, 1, 152); // TODO Test data dependent.
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElementToDisappear(Locator.css("div.groupicon img"));
    }

    @Test
    public void verifyFilterPane()
    {
        log("Verify Filter Pane");

        String studyMember = "ZAP 117";
        String studyMember2 = "RED 4";
        String studyMember3 = "YOYO 55";
        String productMember = "Unknown";
        String productMember2 = "MENTHOL";

        Locator.XPathLocator hasData = Locator.tagWithClass("div", "x-grid-group-title").withText("Has data in active filters");
        Locator.XPathLocator noData = Locator.tagWithClass("div", "x-grid-group-title").withText("No data in active filters");

        //
        // Open an filter pane and close it
        //
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.openStatusInfoPane("Studies");
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
        _asserts.assertDefaultFilterStatusCounts();

        //
        // Open a filter pane and create filter
        //
        cds.openStatusInfoPane("Studies");
        cds.selectInfoPaneItem(studyMember, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember));
        _asserts.assertFilterStatusCounts(80, 1, 1, 1, 8); // TODO Test data dependent.

        //
        // Undo a info pane generated filter
        //
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember));
        _asserts.assertFilterStatusCounts(80, 1, 1, 1, 8); // TODO Test data dependent.

        //
        // open the filter pane via a created filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(studyMember));
        assertElementPresent(hasData);
        assertElementNotPresent(noData);

        cds.selectInfoPaneItem(studyMember2, true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember2));
        _asserts.assertFilterStatusCounts(90, 1, 1, 1, 3); // TODO Test data dependent.

        //
        // update the current filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(studyMember2));
        cds.selectInfoPaneItem(studyMember3, false);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember2));
        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember3));
        // TODO Test data dependent.
        _asserts.assertFilterStatusCounts(186, 2, 1, 1, 11);
        cds.ensureNoFilter();

        //
        // change the operator
        //
        cds.openStatusInfoPane("Products");
        cds.selectInfoPaneItem(productMember, true);
        cds.selectInfoPaneItem(productMember2, false);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        _asserts.assertFilterStatusCounts(8272, 50, 2, 2, 275); // default is 'OR'
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(productMember2));
        cds.selectInfoPaneOperator(true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(productMember));
        waitForElement(CDSHelper.Locators.filterMemberLocator(productMember2));
        // TODO Test data dependent.
        _asserts.assertFilterStatusCounts(0, 0, 0, 0, 0); // now it's 'AND'
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(productMember2));
        assertElementPresent(hasData);
        assertElementNotPresent(noData);
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
        cds.ensureNoFilter();

        //
        // Check sort menu
        //
        cds.openStatusInfoPane("Studies");
        cds.changeInfoPaneSort("Name", "Study Type");
        cds.selectInfoPaneItem("Phase I", true);
        cds.selectInfoPaneItem("Phase II", true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        Locator.XPathLocator studyTypeFilter = CDSHelper.Locators.filterMemberLocator("Phase II");
        waitForElement(studyTypeFilter);
        _asserts.assertFilterStatusCounts(1109, 3, 1, 1, 7); // TODO Test data dependent.
        cds.openFilterInfoPane(studyTypeFilter);
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
        for (String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String lab : CDSHelper.LABS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(lab));
        }
        cds.pickSort("Immunogenicity Type");
        for (String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String i_type : CDSHelper.I_TYPES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(i_type));
        }
        cds.pickSort("Study");
        for (String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String protocol : CDSHelper.PROT_NAMES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(protocol));
        }
        cds.pickSort("Assay Name");
        for (String assay : CDSHelper.ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String h_type : CDSHelper.H_TYPES)
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
        click(CDSHelper.Locators.cdsButtonLocator("Save", "groupupdatesave"));

        // verify group save messaging
        waitForText("Group \"Study Group...\" saved.");
        _asserts.assertFilterStatusCounts(89, 2, 1, 3, 7); // TODO Test data dependent.

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify that the description has changed.
        waitForText(studyGroupDescModified);

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
        _asserts.assertFilterStatusCounts(1604, 14, 2, 1, 86); // TODO Test data dependent.

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));

        // Verify the group does not replace already active filters
        sleep(500); // give it a chance to apply
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        cds.clearFilters();
        click(Locator.css("a.applygroup"));

        // Verify the filters get applied when directly acting
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        _asserts.assertFilterStatusCounts(89, 2, 1, 3, 7); // TODO Test data dependent.
        assertTextPresent("Study Group Verify", "Description", studyGroupDescModified);
        cds.clearFilters();

        // Verify filters get applied by viewing when no filters exist
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "grouplabel").withText(STUDY_GROUP));
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        _asserts.assertFilterStatusCounts(89, 2, 1, 3, 7); // TODO Test data dependent.

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
        cds.toggleExplorerBar(CDSHelper.STUDIES[1]);
        cds.selectBars("Group I Arm T1 Vaccine", "Group V Arm C Placebo");
        waitForElement(CDSHelper.Locators.filterMemberLocator("Group I Arm T1 Vaccine"));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("Group V Arm C Placebo"));
        assertElementPresent(Locator.tagWithClass("div", "selitem").withText("Study (Treatment)"));
        _asserts.assertSelectionStatusCounts(24, 1, 1, 1, 2); // TODO Test data dependent.

        // clear by selection
        cds.selectBars("Group V Arm C Placebo");
        waitForElement(CDSHelper.Locators.filterMemberLocator("Group V Arm C Placebo"));
        _asserts.assertSelectionStatusCounts(14, 1, 1, 1, 1); // TODO Test data dependent.
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
        _asserts.assertFilterStatusCounts(137, 3, 1, 1, 15); // TODO Test data dependent.

        // remove filter
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
       _asserts.assertFilterStatusCounts(137, 3, 1, 1, 15); // TODO Test data dependent.

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
            grid.assertRowCount(10783); // TODO Test data dependent.
            grid.assertPageTotal(432); // TODO Test data dependent.
        }

        //
        // Check paging buttons with known dataset. Verify with first and last subject id on page.
        //
        log("Verify grid paging");
        grid.sort(CDSHelper.GRID_COL_SUBJECT_ID);
        grid.goToLastPage();

        if (CDSHelper.validateCounts)
        {
            grid.assertCurrentPage(432); // TODO Test data dependent.
            grid.assertCellContent("z139-2398"); // TODO Test data dependent.
            grid.assertCellContent("z139-2500"); // TODO Test data dependent.
        }

        grid.clickPreviousBtn();

        if (CDSHelper.validateCounts)
        {
            grid.assertCurrentPage(431); // TODO Test data dependent.
            grid.assertCellContent("z139-2157"); // TODO Test data dependent.
            grid.assertCellContent("z139-2358"); // TODO Test data dependent.
        }

        grid.goToFirstPage();

        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("q2-003"); // TODO Test data dependent.
        }

        //
        // Navigate to Summary to apply a filter
        //
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.hideEmpty();
        cds.selectBars(CDSHelper.STUDIES[1]);
        cds.useSelectionAsSubjectFilter();

        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[1]));

        //
        // Check to see if grid is properly filtering based on explorer filter
        //
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        if (CDSHelper.validateCounts)
        {
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
            grid.assertRowCount(1075); // TODO Test data dependent.
        }

        cds.clearFilters();
        _ext4Helper.waitForMaskToDisappear();

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(10783); // TODO Test data dependent.
            assertElementPresent(DataGrid.Locators.cellLocator("q2-003")); // TODO Test data dependent.
        }

        gridColumnSelector.addGridColumn(CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_SEX, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.SUBJECT_CHARS, CDSHelper.GRID_TITLE_DEMO, CDSHelper.DEMO_RACE, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.DEMO_SEX, CDSHelper.DEMO_RACE);

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(10783); // TODO Test data dependent.
        }

        log("Remove a column");
        gridColumnSelector.removeGridColumn(CDSHelper.NAB, CDSHelper.NAB_ASSAY, false);
        grid.assertColumnsNotPresent(CDSHelper.NAB_ASSAY);
        grid.ensureColumnsPresent(CDSHelper.NAB_LAB); // make sure other columns from the same source still exist

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(10783); // TODO Test data dependent.
        }

        grid.setFacet(CDSHelper.DEMO_RACE, "White");

        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(32); // TODO Test data dependent.
            grid.assertRowCount(792); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(777, 48, 1, 1, 148); // TODO Test data dependent.
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
            grid.assertCellContent("z139-0599"); // TODO Test data dependent.
        }

        grid.clickPreviousBtn();
        grid.goToPreviousPage();
        grid.assertCurrentPage(3);

        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("z135-197"); // TODO Test data dependent.
        }

        grid.goToNextPage();
        grid.assertCurrentPage(5);

        if (CDSHelper.validateCounts)
        {
            grid.assertCellContent("z135-030"); // TODO Test data dependent.
            grid.assertCellContent("z135-005"); // TODO Test data dependent.
        }

        log("Change column set and ensure still filtered");
        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_TITERIC50, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERIC50);

        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(32); // TODO Test data dependent.
            grid.assertRowCount(792); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(777, 48, 1, 1, 148); // TODO Test data dependent.
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
        cds.clickBy(CDSHelper.SUBJECT_CHARS);
        cds.selectBars(false, CDSHelper.RACE_ASIAN);

        log("Create a plot that will filter.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yAxis = new YAxisVariableSelector(this);

        // There was a regression when only the y axis was set the filter counts would go to 0.
        // That is why this test is here.
        yAxis.openSelectorWindow();
        yAxis.pickSource(CDSHelper.ICS);
        yAxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yAxis.setCellType("All");
        yAxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yAxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        log("Validate expected columns are present.");
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);

        log("Validating grid counts");
        _asserts.assertFilterStatusCounts(159, 13, 1, 1, 41);
        grid.assertPageTotal(27);
        grid.assertRowCount(658);

        log("Applying a column filter.");
        grid.setFilter(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, "Is Greater Than or Equal To", "1");

        _asserts.assertFilterStatusCounts(4, 3, 1, 1, 3);
        grid.assertPageTotal(1);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        grid.assertRowCount(4);

        log("Go back to the grid and apply a color to it. Validate it appears as a column.");
        // Can't use CDSHelper.NavigationLink.Grid.makeNavigationSelection. It expects that it will be going to a blank plot.
        click(CDSHelper.NavigationLink.PLOT.getLinkLocator());

        sleep(500); // There is a brief moment where the grid refreshes because of filters applied in the grid.

        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_SEX);
        coloraxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        log("Validate new column added to grid.");
        grid.ensureColumnsPresent(CDSHelper.DEMO_SEX);

        log("Filter on new column.");
        grid.setCheckBoxFilter(CDSHelper.DEMO_SEX, true, "Male");
        _asserts.assertFilterStatusCounts(2, 2, 1, 1, 2);
        grid.assertRowCount(2);

        log("Now add a new column to the mix.");
        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_TITERIC50, false, true);

        _asserts.assertFilterStatusCounts(2, 2, 1, 1, 2);
        grid.assertPageTotal(1);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.NAB_TITERIC50, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_VIRUS_NAME);
        grid.assertRowCount(15);

        log("Validate checkerboarding.");
        List<WebElement> gridRows, gridRowCells;
        String xpathAllGridRows = "//div[contains(@class, 'connector-grid')]//div[contains(@class, 'x-grid-body')]//div//table//tr[contains(@class, 'x-grid-data-row')]";
        gridRows = Locator.xpath(xpathAllGridRows).findElements(getDriver());
        for (WebElement row : gridRows)
        {
            gridRowCells = row.findElements(By.xpath("./descendant::td"));

            // If the Magnitude Background subtracted column is "empty"
            if (gridRowCells.get(8).getText().trim().length() == 0)
            {
                // There should be no lab id
                assertTrue(gridRowCells.get(7).getAttribute("class").toLowerCase().contains("no-value"));
                // but there should be a value for Titer IC50.
                assertTrue(!gridRowCells.get(18).getText().trim().isEmpty());
            }
            else
            {
                // There should be a lab id
                assertTrue(!gridRowCells.get(7).getText().trim().isEmpty());
                // but there should not be a value for Titer IC50.
                assertTrue(gridRowCells.get(18).getAttribute("class").toLowerCase().contains("no-value"));
            }

        }

        log("Remove the plot and validate that the columns stay the same, but the counts could change.");

        cds.clearFilter(0);

        _asserts.assertFilterStatusCounts(2, 2, 1, 1, 2);
        grid.assertPageTotal(1);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.NAB_TITERIC50, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_VIRUS_NAME);
        grid.assertRowCount(17);

        cds.goToAppHome();
        cds.clearFilters();
    }

    // TODO: Still needs work, mainly blocked by issue https://www.labkey.org/issues/home/Developer/issues/details.view?issueId=24128
    @Test @Ignore
    public void verifyGridColumnSelector()
    {
        CDSHelper cds = new CDSHelper(this);

        log("Verify Grid column selector.");

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        log("Create a plot that will filter.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yAxis = new YAxisVariableSelector(this);
        XAxisVariableSelector xAxis = new XAxisVariableSelector(this);
        ColorAxisVariableSelector colorAxis = new ColorAxisVariableSelector(this);

        yAxis.openSelectorWindow();
        yAxis.pickSource(CDSHelper.NAB);
        yAxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yAxis.setVirusName(cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_NEUTRAL_TIER, CDSHelper.NEUTRAL_TIER_1));
        yAxis.setScale(DataspaceVariableSelector.Scale.Linear);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yAxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xAxis.openSelectorWindow();
        xAxis.pickSource(CDSHelper.ICS);
        xAxis.pickVariable(CDSHelper.ICS_ANTIGEN);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xAxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        colorAxis.openSelectorWindow();
        colorAxis.pickSource(CDSHelper.SUBJECT_CHARS);
        colorAxis.pickVariable(CDSHelper.DEMO_RACE);
        colorAxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        waitForText("View data grid"); // grid warning
        _ext4Helper.waitForMaskToDisappear();

        log("Validate expected columns are present.");
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY,
                CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_ANTIGEN,
                CDSHelper.NAB_TITERIC50, CDSHelper.DEMO_RACE);

        gridColumnSelector.openSelectorWindow();
        Map<String, Boolean> columns = new HashMap<>();
        columns.put(CDSHelper.ICS_ANTIGEN, false);
        columns.put(CDSHelper.NAB_TITERIC50, false);
        columns.put(CDSHelper.DEMO_RACE, false);

        log("Validate that Current columns are as expected and not selectable.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_CUR_COL, columns);
        log("Validate that All columns are as expected and not selectable.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_ALL_VARS, columns);

        log("Validate that column selectors are as expected in their specific variable selector.");
        Map<String, Boolean> oneColumn = new HashMap<>();
        oneColumn.put(CDSHelper.DEMO_RACE, false);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.SUBJECT_CHARS, oneColumn);
        oneColumn.clear();
        oneColumn.put(CDSHelper.ICS_ANTIGEN, false);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.ICS, oneColumn);
        oneColumn.clear();
        oneColumn.put(CDSHelper.NAB_TITERIC50, false);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.NAB, oneColumn);
        oneColumn.clear();

        log("Now add a new column to the mix.");
        gridColumnSelector.pickSource(CDSHelper.ICS);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-grid-cell-inner')][text()='" + CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB + "']"));
        // TODO Why doesn't this selector work?
//        gridColumnSelector.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, false);

        log("Validate that Current columns are as expected and enabled or not as appropriate.");
        columns.put(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, true);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_CUR_COL, columns);
        log("Validate that All columns are as expected and enabled or not as appropriate.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_ALL_VARS, columns);

        gridColumnSelector.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY,
                CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_ANTIGEN,
                CDSHelper.NAB_TITERIC50, CDSHelper.DEMO_RACE, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);

        log("Filter on added column, check to make sure it is now 'locked' in the selector.");
        grid.setFilter(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, "Is Less Than or Equal To", "0.003");

        gridColumnSelector.openSelectorWindow();
        columns.replace(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, false);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_CUR_COL, columns);
        log("Validate that All columns are as expected and enabled or not as appropriate.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_ALL_VARS, columns);
        gridColumnSelector.cancelSelection();

        log("Remove the filter on the column, and validate that the selector goes back to as before.");
        grid.clearFilters(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        columns.replace(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, true);

        gridColumnSelector.openSelectorWindow();
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_CUR_COL, columns);
        log("Validate that All columns are as expected and enabled or not as appropriate.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_ALL_VARS, columns);

        log("Remove the column and validate the columns are as expected.");
        gridColumnSelector.pickSource(CDSHelper.ICS);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-grid-cell-inner')][text()='" + CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB + "']"));
        gridColumnSelector.confirmSelection();

        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY,
                CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_ANTIGEN,
                CDSHelper.NAB_TITERIC50, CDSHelper.DEMO_RACE);

        log("Validate the column chooser is correct when a column is removed.");
        String selectorText, selectorTextClean;
        String expectedText, expectedTextClean;

        gridColumnSelector.openSelectorWindow();
        gridColumnSelector.pickSource(CDSHelper.GRID_COL_ALL_VARS);
        assertElementPresent("Could not find unchecked checkbox with text: '" + CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB + "'", Locator.xpath("//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]//tbody//tr[not(contains(@class, 'x-grid-row-selected'))]//div[contains(@class, 'x-grid-cell-inner')][text()='" + CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB + "']"), 1);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_ALL_VARS, columns);
        gridColumnSelector.pickSource(CDSHelper.GRID_COL_CUR_COL);

        selectorText = Locator.xpath("//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]").findElement(getDriver()).getText();
        assertFalse("Found '" + CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB + "' in current columns and it should not be there.", selectorText.contains(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB));
        gridColumnSelector.confirmSelection();

        log("Clear the filters and make sure the selector reflects this.");
        cds.clearFilters();
        waitForText(5000, "Filter removed.");
        _ext4Helper.waitForMaskToDisappear();

        gridColumnSelector.openSelectorWindow();

        gridColumnSelector.pickSource(CDSHelper.GRID_COL_ALL_VARS);
        selectorText = Locator.xpath("//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]").findElement(getDriver()).getText();
        selectorTextClean = selectorText.toLowerCase().replaceAll("\\n", "");
        selectorTextClean = selectorTextClean.replaceAll("\\s+", "");

        expectedText = "ICS (Intracellular Cytokine Staining)\n  Magnitude (% cells) - Background subtracted\n  Antigen\nNAb (Neutralizing antibody)\n  Titer IC50\nSubject characteristics\n  Race";
        expectedTextClean = expectedText.toLowerCase().replaceAll("\\n", "");
        expectedTextClean = expectedTextClean.replaceAll("\\s+", "");

        assertTrue("Values not as expected in all variables. Expected: '" + expectedText + "' Actual: '" + selectorText + "'.", expectedTextClean.equals(selectorTextClean));

        gridColumnSelector.pickSource(CDSHelper.GRID_COL_CUR_COL);
        selectorText = Locator.xpath("//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]").findElement(getDriver()).getText();
        selectorText = selectorText.trim();

        assertTrue("Expected no text in Current columns. Found: '" + selectorText + "'.", selectorText.length() == 0);

        gridColumnSelector.confirmSelection();

        log("Validating treatment and study variables");
        gridColumnSelector.openSelectorWindow();
        gridColumnSelector.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-column-header-checkbox')]"));
        gridColumnSelector.confirmSelection();
        sleep(500); //Wait for mask to appear.
        _ext4Helper.waitForMaskToDisappear();

        grid.ensureColumnsPresent(CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_DATE_SUBJ_ENR,
                CDSHelper.DEMO_DATE_FUP_COMP, CDSHelper.DEMO_DATE_PUB, CDSHelper.DEMO_DATE_START, CDSHelper.DEMO_NETWORK,
                CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM,
                CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC);

        columns.clear();
        columns.put(CDSHelper.DEMO_STUDY_NAME, true);
        columns.put(CDSHelper.DEMO_TREAT_SUMM, true);
        columns.put(CDSHelper.DEMO_DATE_SUBJ_ENR, true);
        columns.put(CDSHelper.DEMO_DATE_FUP_COMP, true);
        columns.put(CDSHelper.DEMO_DATE_PUB, true);
        columns.put(CDSHelper.DEMO_DATE_START, true);
        columns.put(CDSHelper.DEMO_NETWORK, true);
        columns.put(CDSHelper.DEMO_PROD_CLASS, true);
        columns.put(CDSHelper.DEMO_PROD_COMB, true);
        columns.put(CDSHelper.DEMO_STUDY_TYPE, true);
        columns.put(CDSHelper.DEMO_TREAT_ARM, true);
        columns.put(CDSHelper.DEMO_TREAT_CODED, true);
        columns.put(CDSHelper.DEMO_VACC_PLAC, true);

        gridColumnSelector.openSelectorWindow();
        log("Validate that Current columns are as expected and selectable.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_CUR_COL, columns);
        gridColumnSelector.cancelSelection();

        cds.goToAppHome();
    }

    private void gridColumnSelectorValidator(DataGridVariableSelector gridColumnSelector, String source, Map<String, Boolean> columns)
    {
        String xpathColumnNameTemplate = "//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]//td[contains(@role, 'gridcell')]//div[contains(@class, 'x-grid-cell-inner')][text()='*']";
        String xpathSelectorColumnName;
        String xpathSpecificCheckboxesTemplate = "//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]//tr//td//div[text()='*']/./ancestor::tr//div[contains(@class, 'x-grid-row-checker')]";
        String xpathSpecificCheckbox;
        WebElement checkBox;

        gridColumnSelector.pickSource(source);

        for (Map.Entry<String, Boolean> entry : columns.entrySet())
        {
            xpathSelectorColumnName = xpathColumnNameTemplate.replaceAll("[*]", entry.getKey());
            assertElementVisible(Locator.xpath(xpathSelectorColumnName));

            xpathSpecificCheckbox = xpathSpecificCheckboxesTemplate.replaceAll("[*]", entry.getKey());
            checkBox = Locator.xpath(xpathSpecificCheckbox).findElement(getDriver());

            // Should the checkbox be enabled/checkable?
            if (entry.getValue())
            {
                assertFalse("Check-box for " + entry.getKey() + " is disabled and it should not be.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));
            }
            else
            {
                assertTrue("Check-box for " + entry.getKey() + " is not disabled.", checkBox.getAttribute("class").toLowerCase().contains("checker-disabled"));
            }
        }

        gridColumnSelector.backToSource();
    }

    @Test
    public void verifyCounts()
    {
        cds.goToSummary();
        _asserts.assertAllSubjectsPortalPage();

        // 14902
        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(5, 1, 1, 2, 2);

        cds.useSelectionAsSubjectFilter();
        cds.hideEmpty();
        waitForElementToDisappear(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[1]), CDSHelper.CDS_WAIT);
        _asserts.assertFilterStatusCounts(5, 1, 1, 2, 2);
        cds.goToSummary();

        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(5, 1, 1, 2, 2);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        cds.clearFilters();
        waitForElement(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[2]), CDSHelper.CDS_WAIT);
        // end 14902

        cds.goToSummary();
        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[1]);
        _asserts.assertSelectionStatusCounts(84, 1, 1, 1, 5);
        cds.applySelection(CDSHelper.STUDIES[2]);
        _asserts.assertSelectionStatusCounts(30, 1, 1, 1, 4);
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.applySelection(CDSHelper.ASSAYS[0]);
        _asserts.assertSelectionStatusCounts(75, 1, 1, 1, 8);
        cds.applySelection(CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(1604, 14, 2, 1, 86);
        cds.applySelection(CDSHelper.ASSAYS[2]);
        _asserts.assertSelectionStatusCounts(477, 4, 1, 1, 31);
        cds.applySelection(CDSHelper.ASSAYS[3]);
        _asserts.assertSelectionStatusCounts(337, 5, 1, 1, 20);
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        _asserts.assertDefaultFilterStatusCounts();
        cds.pickSort("Country at enrollment");
        cds.applySelection("South Africa");
        _asserts.assertSelectionStatusCounts(43, 21, 1, 1, 27);
        cds.applySelection("United States");
        _asserts.assertSelectionStatusCounts(2797, 49, 1, 3, 223);
        cds.applySelection("Thailand");
        _asserts.assertSelectionStatusCounts(98, 32, 1, 3, 45);
    }

    @Test
    public void verifyFilters()
    {
        log("Verify multi-select");
        Locator hierarchySelector = Locator.input("sae-hierarchy");

        // 14910
        cds.goToSummary();
        cds.clickBy("Study products");
        cds.pickSort("Product Type");
        cds.shiftSelectBars("Adjuvant", "Risperidone");
        waitForElement(CDSHelper.Locators.filterMemberLocator("benztropine mesylate"), WAIT_FOR_JAVASCRIPT);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("Adjuvant, benztropine mesylate, Risperidone"));
        _asserts.assertSelectionStatusCounts(5, 1, 1, 2, 2);
        cds.clearSelection();
        _asserts.assertDefaultFilterStatusCounts();
        // end 14910

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        cds.openStatusInfoPane("Studies");
        waitForText(CDSHelper.STUDIES[1]);
        cds.selectInfoPaneItem(CDSHelper.STUDIES[1], true);
        cds.selectInfoPaneItem(CDSHelper.STUDIES[4], false);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        cds.saveGroup(GROUP_NAME, GROUP_DESC);
        _asserts.assertFilterStatusCounts(194, 2, 1, 1, 8);
        cds.clearFilters();
        _asserts.assertDefaultFilterStatusCounts();

        log("Verify operator filtering");
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[4]);
        _asserts.assertSelectionStatusCounts(115, 2, 1, 3, 5);  // or
        assertElementPresent(Locator.css("option").withText("Subjects related to any (OR)"));
        mouseOver(Locator.css("option").withText("Subjects related to any (OR)"));

        WebElement selector = Locator.css("select").findElement(getDriver());
        assertEquals("Wrong initial combo selection", "UNION", selector.getAttribute("value"));
        selectOptionByValue(selector, "INTERSECT");
        _asserts.assertSelectionStatusCounts(0, 0, 0, 0, 0); // and
        cds.useSelectionAsSubjectFilter();
        cds.hideEmpty();
        waitForText("None of the selected");
        _asserts.assertFilterStatusCounts(0, 0, 0, 0, 0); // and

        selector = Locator.css("select").findElement(getDriver());
        waitForElement(Locator.css("option").withText("Subjects related to all (AND)"));
        mouseOver(Locator.css("option").withText("Subjects related to all (AND)"));

        assertEquals("Combo box selection changed unexpectedly", "INTERSECT", selector.getAttribute("value"));
        selectOptionByValue(selector, "UNION");
        _asserts.assertFilterStatusCounts(115, 2, 1, 3, 5);  // or
        waitForElement(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[0]));
        cds.goToSummary();
        cds.clickBy("Assays");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));
        assertElementPresent(Locator.css("option").withText("Subjects related to any (OR)"));
        _asserts.assertFilterStatusCounts(115, 2, 1, 3, 5);  // or
        cds.clearFilters();
        _asserts.assertDefaultFilterStatusCounts();

        log("Verify selection messaging");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[0], CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(75, 1, 1, 1, 8);
        cds.pickDimension("Studies");
        waitForText("Selection applied as filter.");
        _asserts.assertFilterStatusCounts(75, 1, 1, 1, 8);
        cds.clearFilters();
        waitForText(CDSHelper.CDS_WAIT, CDSHelper.STUDIES[32]);
        cds.selectBars(CDSHelper.STUDIES[32]);
        cds.pickDimension("Assays");
        waitForText("Selection applied as filter.");

        //test more group saving
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        cds.pickSort("Country at enrollment");
        cds.selectBars("United States");

        // save the group and request cancel
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_NULL);
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "groupcancelcreate"));
        waitForElementToDisappear(Locator.xpath("//div[starts-with(@id, 'groupsave')]").notHidden());

        // save the group and request save
        cds.saveGroup(GROUP_NAME2, null);

        // save a group with an interior group
        cds.saveGroup(GROUP_NAME3, null);

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
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//span[text()='" + itemParts[0] + "']").toBy()));

        log("Validating Study Type is: " + itemParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[1] + "']").findElement(getDriver()).isDisplayed());

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')]/span[contains(@class, 'breadcrumb')][text()='Studies / ']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']").toBy()));
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
        for (WebElement listItem : returnedItems)
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
        for (WebElement listItem : returnedItems)
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
        for (WebElement listItem : returnedItems)
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
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//span[text()='" + itemParts[0] + "']").toBy()));

        log("Validating Product Type is: " + itemParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[1] + "']").findElement(getDriver()).isDisplayed());

        log("Validating Class is: " + itemParts[2]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[2] + "']").findElement(getDriver()).isDisplayed());

        // TODO could add more code here to validate other fields, but in the interest of time leaving it at this for now.

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')]/span[contains(@class, 'breadcrumb')][text()='Study products / ']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']").toBy()));
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
        for (WebElement listItem : returnedItems)
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
        for (WebElement listItem : returnedItems)
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
        for (WebElement listItem : returnedItems)
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
        for (WebElement listItem : returnedItems)
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

    @Test
    public void testLearnAboutAssays()
    {
        cds.viewLearnAboutPage("Assays");
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays); // Until the data is stable don't count the assay's shown.

        waitAndClick(Locator.tagWithClass("div", "detail-container").append("/div/div/h2").containing(assays.get(0)));
        waitForElement(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_ANALYTE_DATA);

        //testing variables page
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        waitForElement(Locator.tagWithClass("div", "list-entry-container"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_VARIABLES_DATA);

        refresh();

        waitForElement(Locator.tagWithClass("div", "list-entry-container"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_VARIABLES_DATA);

        //testing BAMA antigens page
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        waitForElement(Locator.tagWithClass("div", "list-title-bar").append("/div").containing("Antigen"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA);

        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.

        //testing ICS antigens page
        waitAndClick(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));
        waitAndClick(Locator.tagWithClass("div", "detail-container").append("/div/div/h2").containing(assays.get(1)));
        waitForElement(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));

        refresh();

        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        waitForElement(Locator.tagWithClass("div", "list-title-bar").append("/div").containing("Protein Panel"));
        waitForText(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA[0]);
        assertTextPresent(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA);
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

    private void ensureGroupsDeleted(List<String> groups)
    {
        Boolean isVisible;

        List<String> deletable = new ArrayList<>();
        for (String group : groups)
        {
            String subName = group.substring(0, 10);

            // Adding this test for the scenario of a test failure and this is called after the page has been removed.
            try
            {
                isVisible = isElementVisible(Locator.xpath("//div[contains(@class, 'grouplist-view')]//div[contains(@class, 'grouprow')]//div[contains(@title, '" + subName + "')]"));
            }
            catch (org.openqa.selenium.NoSuchElementException nse)
            {
                isVisible = false;
            }

            if (isTextPresent(subName) && isVisible)
                deletable.add(subName);
        }

        if (deletable.size() > 0)
        {
            deletable.forEach(cds::deleteGroupFromSummaryPage);
        }
    }

}
