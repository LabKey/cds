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

import org.jetbrains.annotations.Nullable;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverMultipleTest;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.pages.AssayDetailsPage;
import org.labkey.test.pages.DataGridSelector;
import org.labkey.test.pages.DataGridVariableSelector;
import org.labkey.test.pages.DataspaceVariableSelector;
import org.labkey.test.pages.StudyDetailsPage;
import org.labkey.test.pages.XAxisVariableSelector;
import org.labkey.test.pages.YAxisVariableSelector;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.sun.jna.Platform.isMac;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category(CustomModules.class)
public class CDSTest extends BaseWebDriverMultipleTest implements PostgresOnlyTest
{
    private static final String PROJECT_NAME = "CDSTest Project";
    private static final String STUDIES[] = {"DemoSubset", "Not Actually CHAVI 001", "NotCHAVI008", "NotRV144"};
    private static final String LABS[] = {"Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab"};
    private static final String[] ASSAYS = new String[]{"ADCC-Ferrari", "Luminex-Sample-LabKey", "mRNA assay", "NAb-Sample-LabKey"};
    private static final String GROUP_NULL = "Group creation cancelled";
    private static final String GROUP_DESC = "Intersection of " +LABS[1]+ " and " + LABS[2];
    private static final String TOOLTIP = "Hold Shift, CTRL, or CMD to select multiple";

    public final static int CDS_WAIT = 1500;

    // Known Test Groups
    private static final String GROUP_NAME = "CDSTest_AGroup";
    private static final String GROUP_NAME2 = "CDSTest_BGroup";
    private static final String GROUP_NAME3 = "CDSTest_CGroup";
    private static final String GROUP_LIVE_FILTER = "CDSTest_DGroup";
    private static final String GROUP_STATIC_FILTER = "CDSTest_EGroup";
    private static final String STUDY_GROUP = "Study Group Verify";

    @Override
    public String getAssociatedModuleDirectory()
    {
        return "server/customModules/CDS";
    }

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
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

        initTest.setupProject();
        initTest.importData();
        initTest.populateFactTable();
        initTest.verifyFactTable();

        currentTest = initTest;

        // wait for cube caching to take effect
        initTest.enterApplication();
        initTest.waitForElement(Locators.getByLocator("Studies"));
        initTest.goToProjectHome();
    }

    @Before
    public void preTest()
    {
        Ext4Helper.setCssPrefix("x-");

        windowMaximize(); // Provides more useful screenshots on failure
        enterApplication();

        // clean up groups
        makeNavigationSelection(NavigationLink.HOME);
        sleep(500); // let the group display load

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_NAME);
        groups.add(GROUP_NAME2);
        groups.add(GROUP_NAME3);
        groups.add(GROUP_LIVE_FILTER);
        groups.add(GROUP_STATIC_FILTER);
        groups.add(STUDY_GROUP);
        ensureGroupsDeleted(groups);

        // clear filters
        if (isElementPresent(Locators.cdsButtonLocator("clear", "filterclear").notHidden()))
        {
            clearFilter();
        }

        // clear selections
        if (isElementPresent(Locators.cdsButtonLocator("clear", "selectionclear").notHidden()))
        {
            clearSelection();
        }

        // go back to app starting location
        makeNavigationSelection(NavigationLink.SUMMARY);
    }

    @AfterClass
    public static void postTest()
    {
        Ext4Helper.resetCssPrefix();
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void setupProject()
    {
        _containerHelper.createProject(PROJECT_NAME, "Dataspace");
        enableModule(PROJECT_NAME, "CDS");
        goToManageStudy();
        clickAndWait(Locator.linkWithText("Change Study Properties"));
        waitForElement(Ext4Helper.Locators.radiobutton(this, "DATE"));
        _ext4Helper.selectRadioButton("DATE");
        //We need to set the root study name to blank to hide it from mondrian (issue 19996)
        setFormElement(Locator.name("Label"), "");
        clickButton("Submit");

        goToProjectHome();
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void importData()
    {
        importComponentStudy(STUDIES[0]);
        importComponentStudy("NotCHAVI001");
        importComponentStudy(STUDIES[2]);
        importComponentStudy(STUDIES[3]);

        //Can't add web part until we actually have the datasets imported above
        clickProject(PROJECT_NAME);
        PortalHelper portalHelper = new PortalHelper(this);
        portalHelper.addWebPart("CDS Management");

        importCDSData("Antigens",          "antigens.tsv");
        importCDSData("Sites",             "sites.tsv");
        importCDSData("People",            "people.tsv");
        importCDSData("Citable",           "citable.tsv");
        importCDSData("Citations",         "citations.tsv");
        importCDSData("AssayPublications", "assay_publications.tsv");
        importCDSData("Vaccines",          "vaccines.tsv");
        importCDSData("VaccineComponents", "vaccinecomponents.tsv");
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void importComponentStudy(String studyName)
    {
        _containerHelper.createSubfolder(getProjectName(), studyName, "Study");
        importStudyFromZip(getSampleData(studyName + ".folder.zip"), true, true);
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void importCDSData(String query, String dataFilePath)
    {
        clickProject(PROJECT_NAME);
        waitForTextWithRefresh("Fact Table", defaultWaitForPage*4);  //wait for study to fully load
        clickAndWait(Locator.linkWithText(query));
        _listHelper.clickImportData();

        setFormElementJS(Locator.id("tsv3"), getFileContents(getSampleData(dataFilePath)));
        clickButton("Submit");
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void populateFactTable()
    {
        clickProject(PROJECT_NAME);
        clickAndWait(Locator.linkWithText("Populate Fact Table"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "HIV Test Results"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "Physical Exam"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "Lab Results"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "ParticipantTreatments"));
        submit();

        assertElementPresent(Locator.linkWithText("NAb"));
        assertElementPresent(Locator.linkWithText("Luminex"));
        assertElementPresent(Locator.linkWithText("MRNA"));
        assertElementPresent(Locator.linkWithText("ADCC"));
    }

    @LogMethod(quiet = true)
    private void updateParticipantGroups(String... exclusions)
    {
        clickProject(PROJECT_NAME);
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
        clickProject(PROJECT_NAME);
        clickAndWait(Locator.linkWithText("Verify"));
        waitForText("No data to show.", CDS_WAIT);
    }

    @LogMethod(quiet = true)
    private void enterApplication()
    {
        clickProject(PROJECT_NAME);
        clickAndWait(Locator.linkWithText("Application"));
        addUrlParameter("transition=false");

        assertElementNotPresent(Locator.linkWithText("Home"));
        assertElementNotPresent(Locator.linkWithText("Admin"));
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
        goToAppHome();
        clickBy("Studies");
        selectBars(STUDIES[0], STUDIES[1]);
        useSelectionAsFilter();
        saveGroup(STUDY_GROUP, studyGroupDesc);

        // verify group save messaging
        //ISSUE 19997
        waitForText("Group \"Study Group...\" saved.");

        // verify filter is still applied
        assertElementPresent(Locators.filterMemberLocator(STUDIES[0]));
        assertElementPresent(Locators.filterMemberLocator(STUDIES[1]));

        // verify group can be updated
        click(Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("replace an existing group");
        click(Locators.cdsButtonLocator("replace an existing group"));

        Locator.XPathLocator listGroup = Locator.tagWithClass("div", "save-label");
        waitAndClick(listGroup.withText(STUDY_GROUP));

        setFormElement(Locator.id("updategroupdescription-inputEl"), studyGroupDescModified);
        click(Locators.cdsButtonLocator("save", "groupupdatesave"));

        // verify group save messaging
        waitForText("Group \"Study Group...\" saved.");
        assertFilterStatusCounts(18, 2, 3);

        makeNavigationSelection(NavigationLink.HOME);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "nav-label").withText(STUDY_GROUP));

        // Verify that the description has changed.
        waitForText(studyGroupDescModified);

        // verify 'whoops' case
        click(Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("create a new group");
        click(Locators.cdsButtonLocator("cancel", "groupupdatecancel"));
        clearFilter();

        // add a filter, which should be blown away when a group filter is selected
        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Assays");
        selectBars("Luminex-Sample-LabKey");
        useSelectionAsFilter();
        assertFilterStatusCounts(6, 1, 2);

        makeNavigationSelection(NavigationLink.HOME);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "nav-label").withText(STUDY_GROUP));

        // Verify that filters get replaced when viewing group.
        waitForElement(Locators.filterMemberLocator(STUDIES[0]));
        assertElementPresent(Locators.filterMemberLocator(STUDIES[1]));
        assertFilterStatusCounts(18, 2, 3);
        assertTextPresent("Study Group Verify", "Description", "Updates", studyGroupDescModified);

        // Change from live to snapshot, verify choice remains after navigating away.
        click(Locator.tagWithText("label", "Snapshot: Keep this group static"));
        makeNavigationSelection(NavigationLink.HOME);
        waitForText(STUDY_GROUP);
        click(Locator.tagWithClass("div", "nav-label").withText(STUDY_GROUP));
        waitForText(studyGroupDescModified);
        Locator selectedRadio = Ext4Helper.Locators.radiobutton(this, "Snapshot: Keep this group static")
                .withPredicate(Locator.xpath("ancestor-or-self::table").withClass("x-form-cb-checked"));
        assertElementPresent(selectedRadio);

        // Verify that you can cancel delete
        click(Locators.cdsButtonLocator("delete"));
        waitForText("Are you sure you want to delete");
        click(Locator.linkContainingText("Cancel"));
        waitForTextToDisappear("Are you sure you want to delete");
        assertTextPresent(studyGroupDescModified);

        // Verify back button works
        click(Locators.cdsButtonLocatorContainingText("back"));
        waitForText("Welcome to the HIV Vaccine Data Connector.");
        waitForText(STUDY_GROUP);

        // Verify delete works.
        deleteGroupFromSummaryPage(STUDY_GROUP);

        clearFilter();
        makeNavigationSelection(NavigationLink.SUMMARY);
    }

    @Test
    public void verifyFilterDisplays()
    {
        //ISSUE 20013
        log("verify filter displays");

        goToAppHome();
        clickBy("Studies");
        selectBars(STUDIES[0]);

        // verify "Study: Demo Study" selection
        waitForElement(Locators.filterMemberLocator("Study: " + STUDIES[0]));

        // verify buttons available
        assertElementPresent(Locators.cdsButtonLocator("use as filter"));
        assertElementPresent(Locators.cdsButtonLocator("label as subgroup"));
        assertElementPresent(Locators.cdsButtonLocator("clear"));

        // verify split display
        clearSelection();
        goToAppHome();
        clickBy("Studies");
        selectBars(STUDIES[0], STUDIES[1]);
        waitForElement(Locators.filterMemberLocator(STUDIES[0]));
        assertElementPresent(Locators.filterMemberLocator(STUDIES[1]));
        assertElementPresent(Locator.tagWithClass("div", "selitem").withText("Study"));
        assertSelectionStatusCounts(18, 2, 3);

        // clear by selection
        selectBars(STUDIES[1]);
        waitForElement(Locators.filterMemberLocator("Study: " + STUDIES[1]));
        assertSelectionStatusCounts(12, 1, 2);

        // verify multi-level filtering
        goToAppHome();
        clickBy("Assays");
        selectBars("ADCC-Ferrari", "mRNA assay");
        waitForElement(Locators.filterMemberLocator("ADCC-Ferrari"));
        assertElementPresent(Locators.filterMemberLocator("mRNA assay"));

        useSelectionAsFilter();
        assertElementPresent(Locators.filterMemberLocator("ADCC-Ferrari"), 1);
        assertElementPresent(Locators.filterMemberLocator("mRNA assay"), 1);
        assertFilterStatusCounts(0, 0, 0);

        // remove a subfilter
        click(Locators.filterMemberLocator("ADCC-Ferrari").append(Locator.tagWithClass("div", "closeitem")));
        waitForText("Filter removed.");
        assertFilterStatusCounts(5, 1, 2);
        assertElementNotPresent(Locators.filterMemberLocator("ADCC-Ferrari"));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(Locators.filterMemberLocator("ADCC-Ferrari"));
        assertFilterStatusCounts(0, 0, 0);

        // remove a subfilter
        click(Locators.filterMemberLocator("ADCC-Ferrari").append(Locator.tagWithClass("div", "closeitem")));
        waitForText("Filter removed.");
        assertFilterStatusCounts(5, 1, 2);
        assertElementNotPresent(Locators.filterMemberLocator("ADCC-Ferrari"));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(Locators.filterMemberLocator("ADCC-Ferrari"));
        assertFilterStatusCounts(0, 0, 0);

        clearFilter();
    }

    @Test
    public void verifyGrid()
    {
        log("Verify Grid");

        final String GRID_CLEAR_FILTER = "Clear Filters";
        final int COLUMN_COUNT = 106;

        DataGridSelector grid = new DataGridSelector(this);

        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this);
        gridColumnSelector.setColumnCount(COLUMN_COUNT);

        makeNavigationSelection(NavigationLink.GRID);
        waitForText("choose from " + COLUMN_COUNT + " columns");

        gridColumnSelector.addGridColumn("NAb", "Point IC50", true, true);
        gridColumnSelector.addGridColumn("NAb", "Lab", false, true);
        grid.ensureColumnsPresent("Point IC50", "Lab");
        grid.waitForCount(668);

        //
        // Navigate to Summary to apply a filter
        //
        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Studies");
        click(Locators.cdsButtonLocator("hide empty"));
        waitForBarToAnimate(STUDIES[0]);
        selectBars(STUDIES[0]);
        useSelectionAsFilter();

        waitForElement(Locators.filterMemberLocator("Study: " + STUDIES[0]));

        //
        // Check to see if grid is properly filtering based on explorer filter
        //
        makeNavigationSelection(NavigationLink.GRID);
        grid.waitForCount(437);
        clearFilter();
        grid.waitForCount(668);
        assertElementPresent(grid.cellLocator("Piehler/Eckels Lab"));

        gridColumnSelector.addGridColumn("Demographics", "Gender", true, true);
        gridColumnSelector.addGridColumn("Demographics", "Ethnicity", false, true);
        grid.ensureColumnsPresent("Point IC50", "Lab", "Gender", "Ethnicity");
        grid.waitForCount(671); // Why does this change?

        log("Remove a column");
        gridColumnSelector.removeGridColumn("NAb", "Point IC50", false);
        grid.assertColumnsNotPresent("Point IC50");
        grid.ensureColumnsPresent("Lab"); // make sure other columns from the same source still exist

        grid.setFilter("Ethnicity", "White");
        grid.waitForCount(246);
        assertFilterStatusCounts(11, 4, 4);

        log("Change column set and ensure still filtered");
        gridColumnSelector.addGridColumn("NAb", "Point IC50", false, true);
        grid.ensureColumnsPresent("Point IC50");
        grid.waitForCount(246);
        assertFilterStatusCounts(11, 4, 4);

        log("Add a lookup column");
        gridColumnSelector.addLookupColumn("NAb", "Lab", "PI");
        grid.ensureColumnsPresent("Point IC50", "Lab", "PI");
        grid.waitForCount(246);
        assertFilterStatusCounts(11, 4, 4);

        log("Filter on a looked-up column");
        grid.setFilter("PI", "Mark I");
        waitForElement(Locators.filterMemberLocator("Ethnicity: Starts With White"));
        waitForElement(Locators.filterMemberLocator("Lab/PI: Starts With Mark I"));
        grid.waitForCount(237);
        assertFilterStatusCounts(8, 3, 4);

        log("Filter undo on grid");
        clearFilter();
        grid.waitForCount(671);
        assertFilterStatusCounts(29, 4, 4);

        click(Locator.linkWithText("Undo"));
        waitForElement(Locators.filterMemberLocator("Ethnicity: Starts With White"));
        waitForElement(Locators.filterMemberLocator("Lab/PI: Starts With Mark I"));
        grid.waitForCount(237);
        assertFilterStatusCounts(8, 3, 4);

        log("update a column filter that already has a filter");
        grid.setFilter("Ethnicity", "Black");
        grid.waitForCount(128);
        assertFilterStatusCounts(5, 2, 3);

//        log("Ensure filtering goes away when column does");
//        gridColumnSelector.removeLookupColumn("NAb", "Lab", "PI");
//        grid.waitForCount(999); // update to real count
    }

//    public void verifyGridOld()
//    {
//        final String GRID_CLEAR_FILTER = "Clear Filters";
//        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this);

//        log("Ensure filtering goes away when column does");
//        openFilterPanel("Lab");
//        _ext4Helper.uncheckGridRowCheckbox("PI1");
//        click(Locators.cdsButtonLocator("OK"));
//        waitForGridCount(246);
//
//        setDataFilter("Point IC50", "Is Greater Than", "60");
//        waitForGridCount(2);
//        openFilterPanel("Ethnicity");
//        waitAndClick(Locators.cdsButtonLocator(GRID_CLEAR_FILTER));
//
//        // TODO: Workaround for duplicate filters on Firefox
//        List<WebElement> closers = Locator.tag("div").withClass("hierfilter").containing("Ethnicity").append("//img").findElements(getDriver());
//        if (closers.size() > 0)
//            closers.get(0).click();
//
//        waitForGridCount(5);
//
//        openFilterPanel("Point IC50");
//        waitAndClick(Locators.cdsButtonLocator(GRID_CLEAR_FILTER));
//        waitForGridCount(668);
//
//        log("Verify citation sources");
//        click(Locators.cdsButtonLocator("Sources"));
//        waitForText("References", CDS_WAIT);
//        assertTextPresent(
//                "Demo study final NAb data",
//                "NAb Data From Igra Lab",
//                "Data extracted from LabKey lab site on Atlas"
//        );
//        click(Locator.xpath("//a[text()='References']"));
//        waitForText("Recent advances in assay", CDS_WAIT);
//        click(Locators.cdsButtonLocator("Close"));
//        waitForGridCount(668);
//
//        log("Verify multiple citation sources");
//        gridColumnSelector.addGridColumn("Physical Exam", "Weight Kg", false, true);
//        waitForElement(Locator.tagWithText("span", "Weight Kg"));
//        waitForGridCount(700);
//
//        click(Locators.cdsButtonLocator("Sources"));
//        waitAndClick(Locator.linkWithText("Sources"));
//        waitForText("Pulled from Atlas", CDS_WAIT);
//        assertTextPresent("Demo study data delivered by spreadsheet");
//        click(Locators.cdsButtonLocator("Close"));
//        waitForGridCount(700);
//
//        gridColumnSelector.removeGridColumn("Physical Exam", "Weight Kg", false);
//        waitForGridCount(668);
//
//        // 15267
//        gridColumnSelector.addGridColumn("Physical Exam", "Source", true, true);
//        gridColumnSelector.addGridColumn("NAb", "Source", false, true);
//        waitForGridCount(700);
//        setDataFilter("Source", "Demo"); // Hopefully get text on page
//        waitForText("Demo study physical exam", CDS_WAIT);
//        waitForText("Demo study final NAb data", CDS_WAIT);
//
//        openFilterPanel("Source");
//        click(Locators.cdsButtonLocator(GRID_CLEAR_FILTER));
//    }

    @Test
    public void verifyCounts()
    {
        assertAllSubjectsPortalPage();

        // 14902
        clickBy("Studies");
        applySelection(STUDIES[0]);
        assertSelectionStatusCounts(6, 1, 2);

        // Verify multi-select tooltip -- this only shows the first time
        assertTextPresent(TOOLTIP);

        useSelectionAsFilter();
        click(Locators.cdsButtonLocator("hide empty"));
        waitForElementToDisappear(Locator.css("span.barlabel").withText(STUDIES[1]), CDS_WAIT);
        assertFilterStatusCounts(6, 1, 2);
        goToAppHome();

        // Verify multi-select tooltip has dissappeared
        assertTextNotPresent(TOOLTIP);

        clickBy("Studies");
        applySelection(STUDIES[0]);
        assertSelectionStatusCounts(6, 1, 2);
        sleep(500);
        clearFilter();
        waitForElement(Locator.css("span.barlabel").withText(STUDIES[2]), CDS_WAIT);
        goToAppHome();
        // end 14902

        clickBy("Studies");
        applySelection(STUDIES[1]);
        assertSelectionStatusCounts(12, 1, 2);
        assertTextNotPresent(TOOLTIP);
        applySelection(STUDIES[2]);
        assertSelectionStatusCounts(5, 1, 1);
        goToAppHome();
        clearSelection();
        clickBy("Assay antigens");
        pickCDSSort("Tier", "1A");
        toggleExplorerBar("3");
        applySelection("H061.14");
        assertSelectionStatusCounts(12, 1, 2);
        toggleExplorerBar("1A");
        applySelection("SF162.LS");
        assertSelectionStatusCounts(6, 1, 2);
        toggleExplorerBar("1B");
        applySelection("ZM109F.PB4");
        assertSelectionStatusCounts(6, 1, 2);
        goToAppHome();
        clickBy("Assays");
        //TODO: enable this and update counts when issue 20000 is resolved
        //applySelection("Unknown");
        //assertSelectionStatusCounts(23, 3, 5, 3, 31);
        applySelection("ADCC-Ferrari");
        assertSelectionStatusCounts(12, 1, 2);
        applySelection("Luminex-Sample-LabKey");
        assertSelectionStatusCounts(6, 1, 2);
        applySelection("NAb-Sample-LabKey");
        assertSelectionStatusCounts(29, 4, 4);
        applySelection("mRNA assay");
        assertSelectionStatusCounts(5, 1, 2);
        goToAppHome();
        clickBy("Labs");
        applySelection(LABS[0]);
        assertSelectionStatusCounts(6, 1, 2);
        applySelection(LABS[1]);
        assertSelectionStatusCounts(23, 3, 4);
        applySelection(LABS[2]);
        assertSelectionStatusCounts(18, 3, 2);
        goToAppHome();
        clickBy("Subject characteristics");
        clearSelection();
        assertDefaultFilterStatusCounts();
        pickCDSSort("Country");
        applySelection("South Africa");
        assertSelectionStatusCounts(5, 1, 1);
        applySelection("USA");
        assertSelectionStatusCounts(19, 3, 3);
        applySelection("Thailand");
        assertSelectionStatusCounts(5, 1, 2);
    }

    @Test
    public void verifyFilters()
    {
        log("Verify multi-select");

        // 14910
        clickBy("Assay antigens");
        waitForBarToAnimate("Unknown");
        click(Locators.cdsButtonLocator("hide empty"));
        waitForBarToAnimate("Unknown");
        pickCDSSort("Tier", "1A");
        toggleExplorerBar("1A");
        toggleExplorerBar("1B");
        shiftSelectBars("SF162.LS", "DJ263.8");
        waitForElement(Locators.filterMemberLocator("DJ263.8"), WAIT_FOR_JAVASCRIPT);
        assertElementPresent(Locators.filterMemberLocator(), 4);
        assertSelectionStatusCounts(6, 1, 2);
        clearSelection();
        assertDefaultFilterStatusCounts();
        goToAppHome();
        // end 14910

        clickBy("Labs");
        selectBars(LABS[0], LABS[1]);
        assertSelectionStatusCounts(6, 1, 2);
        selectBars(LABS[0], LABS[2]);
        assertSelectionStatusCounts(0, 0, 0);
        selectBars(LABS[1], LABS[2]);
        assertSelectionStatusCounts(12, 1, 2);
        useSelectionAsFilter();
        saveGroup(GROUP_NAME, GROUP_DESC);
        waitForElementToDisappear(Locator.css("span.barlabel").withText(LABS[0]), CDS_WAIT);
        assertFilterStatusCounts(12, 1, 2);
        clearFilter();
        waitForElement(Locator.css("span.barlabel").withText(LABS[0]), CDS_WAIT);
        assertDefaultFilterStatusCounts();

        goToAppHome();
        assertAllSubjectsPortalPage();

        log("Verify operator filtering");
        clickBy("Studies");
        selectBars(STUDIES[0], STUDIES[1]);
        assertSelectionStatusCounts(18, 2, 3);  // or
        assertElementPresent(Locator.css("option").withText("OR"));
        mouseOver(Locator.css("option").withText("OR"));

        WebElement selector = Locator.css("select").findElement(getDriver());
        assertEquals("Wrong initial combo selection", "UNION", selector.getAttribute("value"));
        selectOptionByValue(selector, "INTERSECT");
        assertSelectionStatusCounts(0, 0, 0); // and
        useSelectionAsFilter();
        waitForElementToDisappear(Locator.css("span.barlabel"), CDS_WAIT);
        assertFilterStatusCounts(0, 0, 0); // and

        selector = Locator.css("select").findElement(getDriver());
        waitForElement(Locator.css("option").withText("AND"));
        mouseOver(Locator.css("option").withText("AND"));

        assertEquals("Combo box selection changed unexpectedly", "INTERSECT", selector.getAttribute("value"));
        selectOptionByValue(selector, "UNION");
        assertFilterStatusCounts(18, 2, 3);  // or
        assertElementPresent(Locator.css("span.barlabel").withText(STUDIES[0]));
        goToAppHome();
        waitForText(STUDIES[1], CDS_WAIT);
        clickBy("Labs");
        assertElementPresent(Locators.filterMemberLocator(STUDIES[0]));
        assertElementPresent(Locator.css("option").withText("OR"));
        assertFilterStatusCounts(18, 2, 3);  // and
        clearFilter();
        waitForText("All subjects");
        assertDefaultFilterStatusCounts();
        assertTextPresent("All subjects");
        goToAppHome();

        log("Verify selection messaging");
        clickBy("Assays");
        selectBars("ADCC-Ferrari", "Luminex-Sample-LabKey");
        assertSelectionStatusCounts(0, 0, 0);
        pickCDSDimension("Studies");
        assertSelectionStatusCounts(0, 0, 0);
        clearSelection();
        waitForText(STUDIES[2], CDS_WAIT);
        selectBars(STUDIES[0]);
        pickCDSDimension("Assays");
        assertSelectionStatusCounts(6, 1, 2);
        useSelectionAsFilter();
        goToAppHome();

        //test more group saving
        clickBy("Subject characteristics");
        pickCDSSort("Sex");
        selectBars("f");

        // save the group and request cancel
        click(Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_NULL);
        click(Locators.cdsButtonLocator("cancel", "cancelgroupsave"));
        waitForElementToDisappear(Locator.xpath("//div[starts-with(@id, 'groupsave')]").notHidden());

        selectBars("f");

        // save the group and request save
        saveGroup(GROUP_NAME2, null);

        selectBars("f");

        // save a group with an interior group
        saveGroup(GROUP_NAME3, null);

        clearFilter();
        goToAppHome();
    }

    @Test
    @Ignore("Single Noun Pages NYI")
    public void verifyNounPages()
    {
        // placeholder pages
        clickBy("Assay antigens");
        waitForBarToAnimate("Unknown");
        pickCDSSort("Tier", "1A");
        toggleExplorerBar("1A");
        assertNounInfoPage("MW965.26", Arrays.asList("Clade", "Tier", "MW965.26", "U08455"));
        assertNounInfoPage("SF162.LS", Arrays.asList("Clade", "Tier", "SF162.LS", "EU123924"));
        toggleExplorerBar("1B");
        assertNounInfoPage("ZM109F.PB4", Arrays.asList("Zambia", "Tier", "AY424138"));

        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Studies");
        assertNounInfoPage(STUDIES[0], Arrays.asList("Igra M", "Fitzsimmons K", "Trial", "LabKey"));
        assertNounInfoPage(STUDIES[1], Arrays.asList("Bellew M", "Arnold N", "Observational", "CHAVI"));
        assertNounInfoPage(STUDIES[3], Arrays.asList("Piehler B", "Lum K", "Trial", "USMHRP"));

        // Labs info pages are currently disabled
//        goToAppHome();
//        clickBy("Labs");
//        assertNounInfoPage("Arnold/Bellew Lab", Arrays.asList("Description", "PI", "Nick Arnold"));
//        assertNounInfoPage("LabKey Lab", Arrays.asList("Description", "PI", "Mark Igra"));
//        assertNounInfoPage("Piehler/Eckels Lab", Arrays.asList("Description", "PI", "Britt Piehler"));

        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Assays");

        AssayDetailsPage labResults = AssayDetailsPage.labResults(this);
        verifyAssayInfo(labResults);

        AssayDetailsPage adccFerrari = AssayDetailsPage.adccFerrari(this);
        verifyAssayInfo(adccFerrari);

        AssayDetailsPage luminexSampleLabKey = AssayDetailsPage.luminexSampleLabKey(this);
        verifyAssayInfo(luminexSampleLabKey);

        AssayDetailsPage mrnaAssay = AssayDetailsPage.mrnaAssay(this);
        verifyAssayInfo(mrnaAssay);

        AssayDetailsPage nabSampleLabKey = AssayDetailsPage.nabSampleLabKey(this);
        verifyAssayInfo(nabSampleLabKey);


        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Study products");

        assertVaccineTypeInfoPage("VRC-HIVADV014-00-VP", "The recombinant adenoviral vector product VRC-HIVADV014-00-VP (Ad5)");
        assertVaccineTypeInfoPage("VRC-HIVDNA016-00-VP", "VRC-HIVDNA016-00-VP is manufactured by Vical Incorporated");
    }

    @Test
    public void testLearnAboutStudies()
    {
        viewLearnAboutPage("Studies");

        List<String> studies = Arrays.asList(STUDIES);
        verifyLearnAboutPage(studies);
    }

    @Test
    public void testLearnAboutAssays()
    {
        viewLearnAboutPage("Assays");

        List<String> assays = Arrays.asList(ASSAYS);
        verifyLearnAboutPage(assays);
    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        viewLearnAboutPage("Study products");

        List<String> studyProducts = Arrays.asList("AIDSVAX B/E (gp120)", "VRC-HIVADV014-00-VP", "VRC-HIVDNA016-00-VP");
        verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void testLearnAboutLabs()
    {
        viewLearnAboutPage("Labs");

        List<String> labs = Arrays.asList("Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab");
        verifyLearnAboutPage(labs);
    }

    //@Test
    // Sites have been disabled until it is no longer dependent on the demographics dataset
    public void testLearnAboutSites()
    {
        viewLearnAboutPage("Sites");

        List<String> sites = Collections.emptyList();
        verifyLearnAboutPage(sites);
    }

    protected static final String MOUSEOVER_FILL = "#01BFC2";
    protected static final String MOUSEOVER_STROKE = "#00EAFF";
    protected static final String BRUSHED_FILL = "#14C9CC";
    protected static final String BRUSHED_STROKE = "#00393A";
    protected static final String NORMAL_COLOR = "#000000";

    @Test
    public void verifyScatterPlot()
    {
        //getText(Locator.css("svg")) on Chrome
        final String CD4_LYMPH = "200\n400\n600\n800\n1000\n1200\n200\n400\n600\n800\n1000\n1200\n1400\n1600\n1800\n2000\n2200\n2400";
        final String HEMO_CD4_UNFILTERED = "6\n8\n10\n12\n14\n16\n18\n20\n100\n200\n300\n400\n500\n600\n700\n800\n900\n1000\n1100\n1200\n1300";
        final String WT_PLSE_LOG = "1\n10\n100\n1\n10\n100";

        makeNavigationSelection(NavigationLink.PLOT);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "CD4");
        xaxis.confirmSelection();
        waitForElement(Locator.css(".curseltitle").containing("Y AXIS"));
        yaxis.pickMeasure("Lab Results", "Lymphocytes");
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        assertSVG(CD4_LYMPH);

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Lab Results", "CD4");
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "Hemoglobin");
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        assertSVG(HEMO_CD4_UNFILTERED);

        // Test log scales
        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Physical Exam", "Weight Kg");
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();
        waitForText("Points outside the plotting area have no match");
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Physical Exam", "Pulse");
        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
        xaxis.confirmSelection();
        assertSVG(WT_PLSE_LOG);

        Actions builder = new Actions(getDriver());
        List<WebElement> points;
        points = Locator.css("svg g a.point path").findElements(getDriver());

        // Test hover events
        builder.moveToElement(points.get(33)).perform();

        // Check that related points are colored appropriately.
        for (int i = 33; i < 38; i++)
        {
            assertEquals("Related point had an unexpected fill color", MOUSEOVER_FILL, points.get(i).getAttribute("fill"));
            assertEquals("Related point had an unexpected stroke color", MOUSEOVER_STROKE, points.get(i).getAttribute("stroke"));
        }

        builder.moveToElement(points.get(33)).moveByOffset(10, 10).perform();

        // Check that the points are no longer highlighted.
        for (int i = 33; i < 38; i++)
        {
            assertEquals("Related point had an unexpected fill color", NORMAL_COLOR, points.get(i).getAttribute("fill"));
            assertEquals("Related point had an unexpected stroke color", NORMAL_COLOR, points.get(i).getAttribute("stroke"));
        }

        // Test brush events.
        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();

        for (int i = 10; i < 15; i++)
        {
            assertEquals("Brushed point had an unexpected fill color", BRUSHED_FILL, points.get(i).getAttribute("fill"));
            assertEquals("Brushed point had an unexpected stroke color", BRUSHED_STROKE, points.get(i).getAttribute("stroke"));
        }

        builder.moveToElement(points.get(37)).moveByOffset(-25, 0).clickAndHold().release().perform();

        // Check that the points are no longer brushed.
        for (int i = 10; i < 15; i++)
        {
            assertEquals("Related point had an unexpected fill color", NORMAL_COLOR, points.get(i).getAttribute("fill"));
            assertEquals("Related point had an unexpected stroke color", NORMAL_COLOR, points.get(i).getAttribute("stroke"));
        }

        // Test that variable selectors are reset when filters are cleared (Issue 20138).
        clearFilter();
        waitForElement(Locator.css(".yaxisbtn span.x-btn-button").withText("choose variable"));
        waitForElement(Locator.css(".xaxisbtn span.x-btn-button").withText("choose variable"));
    }

    @Test
    public void testSummaryPageSingleAxisLinks()
    {
        Locator dimensionGroup = Locator.css("div.dimgroup");
        Locator dimensionSort = Locator.css("div.dimensionsort");

        waitAndClick(Locator.linkWithText("races & subtypes"));
        waitForElement(dimensionGroup.withText("Subject characteristics"));
        waitForElement(dimensionSort.withText("SORTED BY: RACE"));
        goToAppHome();
        sleep(250);

        waitAndClick(Locator.linkWithText("countries"));
        waitForElement(dimensionGroup.withText("Subject characteristics"));
        waitForElement(dimensionSort.withText("SORTED BY: COUNTRY"));
        goToAppHome();
        sleep(250);

        waitAndClick(Locator.linkWithText("clades"));
        waitForElement(dimensionGroup.withText("Assay antigens"));
        waitForElement(dimensionSort.withText("SORTED BY: CLADE"));
        goToAppHome();
        sleep(250);

        waitAndClick(Locator.linkWithText("tiers"));
        waitForElement(dimensionGroup.withText("Assay antigens"));
        waitForElement(dimensionSort.withText("SORTED BY: TIER"));
        goToAppHome();
        sleep(250);

        waitAndClick(Locator.linkWithText("sample types"));
        waitForElement(dimensionGroup.withText("Assay antigens"));
        waitForElement(dimensionSort.withText("SORTED BY: SAMPLE TYPE"));
        goToAppHome();
    }

    @Test
    @Ignore("Multi-noun details for antigens NYI")
    public void testMultiAntigenInfoPage()
    {
        viewLearnAboutPage("Antigens");

        List<String> assays = Arrays.asList("ADCC-Ferrari", "Lab Results", "Luminex-Sample-LabKey", "mRNA assay", "NAb-Sample-LabKey");
        assertElementPresent(Locator.tagWithClass("div", "detail-container"), assays.size());

        for (String assay : assays)
        {
            assertElementPresent(Locator.tagWithClass("div", "study-description").append(Locator.tag("h2").withText(assay)));
        }

        // just do simple checks for the placeholder noun pages for now, layout will change so there is no use
        // investing too much automation right now.
        List<String> labels = Arrays.asList("96ZM651.02", "CAP210.2.00.E8", "BaL.01",
                "Zambia", "S. Africa", "USA",
                "AF286224", "DQ435683", "AF063223");
        waitForText(labels.get(0));
        assertTextPresent(labels);

        closeInfoPage();
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

        int participantCount = liveGroupMembersBefore.length;

        // exit the app and verify no live filter groups exist
        beginAt("/cds/" + getProjectName() + "/begin.view?");
        updateParticipantGroups();

        // use this search method to only search body text instead of html source
        assertTextPresentInThisOrder("No Participant Groups with Live Filters were defined.");

        // create two groups one that is a live filter and one that is not
        enterApplication();
        goToAppHome();

        // create live filter group
        clickBy("Subject characteristics");
        pickCDSSort("Race");
        selectBars("White");
        useSelectionAsFilter();
        click(Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_LIVE_FILTER);
        click(Locator.radioButtonByNameAndValue("groupselect", "live"));
        click(Locators.cdsButtonLocator("save", "groupcreatesave"));
        waitForElement(Locators.filterMemberLocator(GROUP_LIVE_FILTER), WAIT_FOR_JAVASCRIPT);

        // create static filter group
        click(Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_STATIC_FILTER);
        click(Locator.radioButtonByNameAndValue("groupselect", "live"));
        click(Locators.cdsButtonLocator("save", "groupcreatesave"));
        waitForElement(Locators.filterMemberLocator(GROUP_STATIC_FILTER), WAIT_FOR_JAVASCRIPT);

        // exit the app and verify
        beginAt("/cds/" + getProjectName() + "/begin.view?");
        updateParticipantGroups();
        waitForText(GROUP_LIVE_FILTER + " now has participants:");
        verifyParticipantIdsOnPage(liveGroupMembersBefore, null);
        assertTextNotPresent(GROUP_STATIC_FILTER);

        // now repopulate the cube with a subset of subjects and ensure the live filter is updated while the static filter is not
        updateParticipantGroups("NAb", "Lab Results", "ADCC");
        waitForText(GROUP_LIVE_FILTER + " now has participants:");
        assertTextNotPresent(GROUP_STATIC_FILTER);
        verifyParticipantIdsOnPage(liveGroupMembersAfter, excludedMembers);

        // verify that our static group still ha the original members in it now
        clickTab("Manage");
        clickAndWait(Locator.linkContainingText("Manage Participant Groups"));
        verifyParticipantIds(GROUP_LIVE_FILTER, liveGroupMembersAfter, excludedMembers);
        verifyParticipantIds(GROUP_STATIC_FILTER, liveGroupMembersBefore, null);
    }

    @Test
    public void testXAxisVariableSelectorDefinitionPanel()
    {
        makeNavigationSelection(NavigationLink.PLOT);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);

        xaxis.openSelectorWindow();

        Locator.XPathLocator definitionPanel = Locator.tagWithClass("div", "definitionpanel");

        assertElementNotPresent(definitionPanel.notHidden());

        xaxis.pickSource("ADCC");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: ADCC")
                .containing("Contains up to one row of ADCC data for each Participant/visit/TARGET_CELL_PREP_ISOLATE combination."));

        xaxis.pickMeasure("ADCC", "ACTIVITY PCT");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: ACTIVITY PCT")
                .containing("Percent activity observed"));

        click(Locators.cdsButtonLocator("go to assay page"));

        verifyLearnAboutPage(Arrays.asList(ASSAYS));
    }

    @Test
    public void testYAxisVariableSelectorDefinitionPanel()
    {
        makeNavigationSelection(NavigationLink.PLOT);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        yaxis.openSelectorWindow();

        Locator.XPathLocator definitionPanel = Locator.tagWithClass("div", "definitionpanel");

        assertElementNotPresent(definitionPanel.notHidden());

        yaxis.pickSource("MRNA");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: MRNA")
                .containing("Contains up to one row of MRNA data for each Participant/visit combination."));

        yaxis.pickMeasure("MRNA", "CCL5");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: CCL5")
                .containing("Expression levels for CCL5"));

        click(Locators.cdsButtonLocator("go to assay page"));
        verifyLearnAboutPage(Arrays.asList(ASSAYS));
    }

    private void verifyAssayInfo(AssayDetailsPage assay)
    {
        viewInfo(assay.getAssayName());
        assay.assertAssayInfoPage();
        closeInfoPage();
    }

    private void verifyLearnAboutPage(List<String> axisItems)
    {
        for (String item : axisItems)
        {
            waitForElement(Locator.tagWithClass("div", "detail-wrapper").append("/div/div/h2").withText(item));
        }
        assertElementPresent(Locator.tagWithClass("div", "detail-wrapper"), axisItems.size());
    }

    @LogMethod(quiet = true)
    private void pickCDSSort(@LoggedParam String sortBy)
    {
        click(Locator.css(".sortDropdown"));
        waitAndClick(Locator.xpath("//span[text()='" + sortBy + "' and contains(@class, 'x-menu-item-text')]"));
    }

    private void pickCDSSort(String sort, String waitValue)
    {
        pickCDSSort(sort);
        waitForText(waitValue, CDS_WAIT);
    }

    private void pickCDSDimension(String dimension)
    {
        click(Locators.cdsDropDownButtonLocator("dimselectdrop"));
        waitAndClick(Locator.xpath("//span[@class='x-menu-item-text' and text()='" + dimension + "']"));
    }

    private void waitForFilterAnimation()
    {
        Locator floatingFilterLoc = Locator.css(".barlabel.selected");
        waitForElementToDisappear(floatingFilterLoc);
    }

    private void waitForBarToAnimate(final String barLabel)
    {
        waitFor(new Checker()
        {
            @Override
            public boolean check()
            {
                Locator barLocator = Locator.tag("div").withClass("bar").withDescendant(Locator.tag("span").withClass("barlabel").withText(barLabel))
                        .append(Locator.tag("span").withClass("index"));
                String width1 = barLocator.findElement(getDriver()).getCssValue("width");
                sleep(50);
                String width2 = barLocator.findElement(getDriver()).getCssValue("width");
                return !"0px".equals(width1) && width1.equals(width2);
            }
        }, "Bar didn't stop animating: " + barLabel, CDS_WAIT * 10);
    }

    private void saveGroup(String name, @Nullable String description)
    {
        click(Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), name);
        if (null != description)
            setFormElement(Locator.name("groupdescription"), description);
        click(Locators.cdsButtonLocator("save", "groupcreatesave"));
    }

    private void selectBarsHelper(boolean isShift, String...bars)
    {
        Keys multiSelectKey;
        if (isShift)
            multiSelectKey = Keys.SHIFT;
        else if (isMac())
            multiSelectKey = Keys.COMMAND;
        else
            multiSelectKey = Keys.CONTROL;

        waitForBarToAnimate(bars[0]);

        String subselect = bars[0];
        if (subselect.length() > 10)
            subselect = subselect.substring(0, 9);
        WebElement el = shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//span[@class='barlabel' and text() = '" + bars[0] + "']").toBy()));
        clickAt(el, 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
        waitForElement(Locators.filterMemberLocator(subselect), CDS_WAIT);
        waitForFilterAnimation();
        if(bars.length > 1)
        {
            Actions builder = new Actions(getDriver());

            builder.keyDown(multiSelectKey).build().perform();

            for(int i = 1; i < bars.length; i++)
            {
                el = shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//span[@class='barlabel' and text() = '" + bars[i] + "']").toBy()));
                clickAt(el, 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
                subselect = bars[i];
                if (subselect.length() > 10)
                    subselect = subselect.substring(0, 9);
                waitForElement(Locators.filterMemberLocator(subselect));
                waitForFilterAnimation();
            }

            builder.keyUp(multiSelectKey).build().perform();
        }
    }

    private void applySelection(String barLabel)
    {
        applySelection(barLabel, barLabel);
    }

    private void applySelection(String barLabel, String filteredLabel)
    {
        selectBars(barLabel);
        waitForElement(Locators.filterMemberLocator(filteredLabel), WAIT_FOR_JAVASCRIPT);
    }

    private void selectBars(String... bars)
    {
        selectBarsHelper(false, bars);
    }

    private void shiftSelectBars(String... bars)
    {
        selectBarsHelper(true, bars);
    }

    private void goToAppHome()
    {
        click(Locator.xpath("//div[contains(@class, 'connectorheader')]//div[contains(@class, 'logo')]"));
        waitForElement(Locators.getByLocator("Studies"));
    }

    private void clearFilter()
    {
        waitForElement(Locators.cdsButtonLocator("clear", "filterclear"));
        waitAndClick(Locators.cdsButtonLocator("clear", "filterclear"));
        waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));
    }

    private void useSelectionAsFilter()
    {
        click(Locators.cdsButtonLocator("use as filter"));
        waitForClearSelection(); // wait for animation
    }

    private void clearSelection()
    {
        click(Locators.cdsButtonLocator("clear", "selectionclear"));
        waitForClearSelection();
    }

    private void waitForClearSelection()
    {
        Locator.XPathLocator panel = Locator.tagWithClass("div", "selectionpanel");
        shortWait().until(ExpectedConditions.invisibilityOfElementLocated(panel.toBy()));
    }

    private void clickBy(String byNoun)
    {
        Locator.XPathLocator loc = Locators.getByLocator(byNoun);
        waitForElement(loc);
        click(loc);
        waitForElement(Locator.css("div.label").withText("Showing number of: Subjects"), CDS_WAIT);
        waitForElement(Locator.css(".dimgroup").withText(byNoun));
    }

    private enum NavigationLink
    {
        HOME("Home", Locator.tagContainingText("h1", "Welcome to the")),
        LEARN("Learn about studies, assays", Locator.tagWithClass("div", "titlepanel").withText("Learn About...")),
        SUMMARY("Find subjects", Locator.tagWithClass("div", "titlepanel").withText("find subjects...")),
        PLOT("Plot data", Locator.tagWithClass("a", "yaxisbtn")),
        GRID("View data grid", Locator.tagWithClass("div", "titlepanel").withText("view data grid"));

        private String _linkText;
        private Locator.XPathLocator _expectedElement;

        private NavigationLink(String linkText, Locator.XPathLocator expectedElement)
        {
            _linkText = linkText;
            _expectedElement = expectedElement.notHidden();
        }

        public String getLinkText()
        {
            return _linkText;
        }

        public Locator.XPathLocator getLinkLocator()
        {
            return Locator.tagWithClass("div", "navigation-view").append(Locator.tagWithClass("div", "nav-label").withText(_linkText));
        }

        public Locator.XPathLocator getExpectedElement()
        {
            return _expectedElement;
        }
    }

    private void makeNavigationSelection(NavigationLink navLink)
    {
        click(navLink.getLinkLocator());
        waitForElement(navLink.getExpectedElement());
    }

    public void viewInfo(String barLabel)
    {
        waitForBarToAnimate(barLabel);
        Locator.XPathLocator barLocator = Locator.tag("div").withClass("small").withDescendant(Locator.tag("span").withClass("barlabel").withText(barLabel));
        scrollIntoView(barLocator); // screen might be too small
        mouseOver(barLocator);
        fireEvent(barLocator.append("//button"), SeleniumEvent.click); // TODO: FirefoxDriver doesn't tigger :hover styles. Click with Javascript.
        waitForElement(Locators.cdsButtonLocator("Close"));
        waitForElement(Locator.css(".savetitle").withText(barLabel), WAIT_FOR_JAVASCRIPT);
    }

    private void viewLearnAboutPage(String learnAxis)
    {
        makeNavigationSelection(NavigationLink.LEARN);

        WebElement initialLearnAboutPanel = Locator.tag("div").withClass("learncolumnheader").parent().index(0).waitForElement(getDriver(), WAIT_FOR_JAVASCRIPT);
        click(Locator.tag("div").withClass("learn-header-container").append(Locator.tag("h1").withClass("lhdv").withText(learnAxis)));
        shortWait().until(ExpectedConditions.stalenessOf(initialLearnAboutPanel));
    }

    public void closeInfoPage()
    {
        click(Locators.cdsButtonLocator("Close"));
        waitForElementToDisappear(Locator.button("Close"), WAIT_FOR_JAVASCRIPT);
    }

    private void ensureGroupsDeleted(List<String> groups)
    {
        List<String> deletable = new ArrayList<>();
        for (String group : groups)
        {
            if (isTextPresent(group))
                deletable.add(group);
        }

        if (deletable.size() > 0)
        {
            for (String d : deletable)
            {
                deleteGroupFromSummaryPage(d);
            }
        }
    }

    private void deleteGroupFromSummaryPage(String name)
    {
        shortWait().until(ExpectedConditions.elementToBeClickable(Locator.tagWithClass("div", "nav-label").withText(name).toBy()));
        click(Locator.tagWithClass("div", "nav-label").withText(name));
        waitForText(name);
        click(Locators.cdsButtonLocator("delete"));
        waitForText("Are you sure you want to delete");
        click(Locator.linkContainingText("Delete"));
        waitForText("Welcome to the HIV Vaccine Data Connector.");
        waitForElementToDisappear(Locator.tagWithClass("div", "nav-label").withText(name));
    }

/// CDS App asserts

    private void assertAllSubjectsPortalPage()
    {
        assertCDSPortalRow("Studies", "4 studies");
        assertCDSPortalRow("Subject characteristics", "32 subject characteristics", "3 countries", "2 genders", "6 races & subtypes");
        assertCDSPortalRow("Assays", "4 assays", "1 target areas", "3 methodologies");
        assertCDSPortalRow("Assay antigens", "31 assay antigens", "5 clades", "5 sample types", "5 tiers");
        assertCDSPortalRow("Labs", "3 labs");
    }

    private void assertCDSPortalRow(String byNoun, String expectedTotal, String... expectedDetails)
    {
        waitForElement(Locators.getByLocator(byNoun), 120000);
        assertTrue("'by " + byNoun + "' search option is not present", isElementPresent(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div[" +
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' " + byNoun + "']]")));

        Set<String> expectedDetailsSet = new HashSet<>(Arrays.asList(expectedDetails));
        String actualDetail = getText(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div["+
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' "+byNoun+"']]"+
                "/div[contains(@class, 'detailcolumn')]"));
        Set<String> splitDetailsSet = new HashSet<>();
        if (actualDetail.length() > 0) splitDetailsSet.addAll(Arrays.asList(actualDetail.split(", ?")));
        assertEquals("Wrong details for search by " + byNoun + ".", expectedDetailsSet, splitDetailsSet);

        String actualTotal = getText(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div["+
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' "+byNoun+"']]"+
                "/div[contains(@class, 'totalcolumn')]"));
        assertEquals("Wrong total for search by " + byNoun + ".", expectedTotal, actualTotal);
    }

    private void assertSelectionStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int assayCount, int contributorCount, int antigenCount, int maxCount)
    {
        selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, assayCount);
        waitForElement(Locators.filterMemberLocator(filteredLabel), WAIT_FOR_JAVASCRIPT);
    }

    // Sequential calls to this should have different subject counts.
    private void assertFilterStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int assayCount, int contributorCount, int antigenCount, int maxCount)
    {
        selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, assayCount);
        waitForElement(Locators.filterMemberLocator(filteredLabel), WAIT_FOR_JAVASCRIPT);
    }

    private void assertDefaultFilterStatusCounts()
    {
        assertFilterStatusCounts(29, 4, 4);
    }

    private void assertSelectionStatusCounts(int subjectCount, int studyCount, int assayCount)
    {
        waitForElement(Locators.getSelectionStatusLocator(subjectCount, "Subject"));
        waitForElement(Locators.getSelectionStatusLocator(studyCount, "Stud"));
        waitForElement(Locators.getSelectionStatusLocator(assayCount, "Assay"));
    }

    private void assertFilterStatusCounts(int subjectCount, int studyCount, int assayCount)
    {
        waitForElement(Locators.getFilterStatusLocator(subjectCount, "Subject", "Subjects", true));
        waitForElement(Locators.getFilterStatusLocator(studyCount, "Study", "Studies", true));
        waitForElement(Locators.getFilterStatusLocator(assayCount, "Assay", "Assays", true));
    }

    @LogMethod
    private void assertVaccineTypeInfoPage(@LoggedParam String vaccineType, String vaccineInfo)
    {
        viewInfo(vaccineType);

        Locator.CssLocator loc = Locator.css(".vaccine-single-body");
        waitForElement(loc);
        assertElementContains(loc, vaccineInfo);
        closeInfoPage();
    }

    @LogMethod
    private void assertVaccineComponentInfoPage(@LoggedParam String vaccineComponent, String conponentInfo)
    {
        viewInfo(vaccineComponent);
        assertElementContains(Locator.css(".component-single-body"), conponentInfo);
        closeInfoPage();
    }

    @LogMethod
    private void assertNounInfoPage(@LoggedParam String noun, List<String> textToCheck)
    {
        viewInfo(noun);

        // just do simple checks for the placeholder noun pages for now, layout will change so there is no use
        // investing too much automation right now.
        waitForText(textToCheck.get(0));
        assertTextPresent(textToCheck);
        closeInfoPage();
        waitForBarToAnimate(noun);
    }

    @LogMethod
    private void verifyParticipantIdsOnPage(String[] membersIncluded, String[] membersExcluded)
    {
        if (membersIncluded != null)
            for (String member : membersIncluded)
                assertElementPresent(Locator.linkContainingText(member));

        if (membersExcluded != null)
            for (String member : membersExcluded)
                assertElementNotPresent(Locator.linkContainingText(member));
    }

    @LogMethod
    private void verifyParticipantIds(String groupName, String[] membersIncluded, String[] membersExcluded)
    {
        waitForText(groupName);

        String ids = _studyHelper.getParticipantIds(groupName, "Participant");
        if (membersIncluded != null)
            for (String member : membersIncluded)
                assertTrue(ids.contains(member));

        if (membersExcluded != null)
            for (String member : membersExcluded)
                assertFalse(ids.contains(member));
    }

    @LogMethod(quiet = true)
    private void verifyStudyDetailsFromSummary(@LoggedParam StudyDetailsPage study)
    {
        waitAndClick(Locator.linkWithText(study.getStudyName()));
        study.assertStudyInfoPage();
        closeInfoPage();
    }

    @LogMethod(quiet = true)
    private void verifyAssayDetailsFromSummary(@LoggedParam AssayDetailsPage study)
    {
        waitAndClick(Locator.linkWithText(study.getAssayName()));
        study.assertAssayInfoPage();
        closeInfoPage();
    }

    private void assertPeopleTip(String cls, String name, String portraitFilename, String role)
    {
        Locator btnLocator = Locator.xpath("//a[contains(@class, '" + cls + "') and contains(text(), '" + name + "')]");
        waitForElement(btnLocator);
        mouseOver(btnLocator);

        Locator.XPathLocator portraitLoc = Locator.xpath("//img[@src='/labkey/cds/images/pictures/" + portraitFilename + "']").notHidden();
        waitForElement(portraitLoc);
        Locator.XPathLocator roleLoc = Locator.tag("div").withClass("tip-role").notHidden().withText(role);
        assertElementPresent(roleLoc);
        fireEvent(btnLocator, SeleniumEvent.mouseout);
        waitForElementToDisappear(portraitLoc);
        assertElementNotPresent(roleLoc);
    }

    private void toggleExplorerBar(String largeBarText)
    {
        sleep(500);
        click(Locator.xpath("//div[@class='bar large']//span[contains(@class, 'barlabel') and text()='" + largeBarText + "']//..//..//div[contains(@class, 'saecollapse')]"));
        sleep(500);
    }

    public static class Locators
    {

        public static Locator.XPathLocator getByLocator(String byNoun)
        {
            return Locator.xpath("//div[contains(@class, 'bycolumn')]//span[contains(@class, 'label') and contains(text(), '" + byNoun + "')]");
        }

        public static Locator.XPathLocator cdsButtonLocator(String text)
        {
            return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsButtonLocator(String text, String cssClass)
        {
            return Locator.xpath("//a[contains(@class, '" + cssClass + "')]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsButtonLocatorContainingText(String text)
        {
            return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and contains(text(),'" + text + "')]"));
        }

        public static Locator.XPathLocator cdsDropDownButtonLocator(String cssClass)
        {
            return Locator.xpath("//button[contains(@class, 'imgbutton') and contains(@class, '" + cssClass + "')]");
        }

        public static Locator.XPathLocator filterMemberLocator()
        {
            return Locator.tagWithClass("div", "memberitem");
        }

        public static Locator.XPathLocator filterMemberLocator(String filterText)
        {
            return filterMemberLocator().containing(filterText);
        }

        public static Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural)
        {
            return getFilterStatusLocator(count, singular, plural, false);
        }

        public static Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural, boolean highlight)
        {
            return Locator.xpath("//li//span[text()='" + (count != 1 ? plural : singular) + "']/../span[contains(@class, '" + (highlight ? "hl-" : "") + "status-count') and text()='" + count + "']");
        }

        public static Locator.XPathLocator getSelectionStatusLocator(int count, String match)
        {
            return Locator.xpath("//li//span[contains(text(), '" + match + "')]/../span[contains(@class, 'status-subcount') and text()='" + count + "']");
        }
    }
}
