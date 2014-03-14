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
import org.labkey.test.pages.StudyDetailsPage;
import org.labkey.test.util.Ext4HelperWD;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ext4cmp.Ext4CmpRefWD;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * User: t.chadick
 * Date: Mar 23, 2012
 */
@Category(CustomModules.class)
public class CDSTest extends BaseWebDriverMultipleTest implements PostgresOnlyTest
{
    private static final String PROJECT_NAME = "CDSTest Project";
    private static final File FOLDER_ZIP = new File(getSampledataPath(), "CDS/Dataspace.folder.zip");
    private static final String STUDIES[] = {"Demo Study", "Not Actually CHAVI 001", "NotRV144"};
    private static final String LABS[] = {"Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab"};
    private static final String GROUP_NAME = "CDSTest_AGroup";
    private static final String GROUP_NAME2 = "CDSTest_BGroup";
    private static final String GROUP_NAME3 = "CDSTest_CGroup";
    private static final String GROUP_LIVE_FILTER = "CDSTest_DGroup";
    private static final String GROUP_STATIC_FILTER = "CDSTest_EGroup";
    private static final String GROUP_NULL = "Group creation cancelled";
    private static final String GROUP_DESC = "Intersection of " +LABS[1]+ " and " + LABS[2];
    private static final String TOOLTIP = "Hold Shift, CTRL, or CMD to select multiple";

    public final static int CDS_WAIT = 5000;

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
    }

    @Before
    public void preTest()
    {
        Ext4HelperWD.setCssPrefix("x-");

        windowMaximize(); // Provides more useful screenshots on failure
        enterApplication();

        List<WebElement> filterCloseButtons = Locator.css("div.filtermember img[alt=delete]").findElements(getDriver());
        while (filterCloseButtons.size() > 0)
        {
            int filterCount = filterCloseButtons.size();
            Actions builder = new Actions(getDriver());
            builder.moveToElement(filterCloseButtons.get(0)).click().build().perform();
            shortWait().until(ExpectedConditions.stalenessOf(filterCloseButtons.get(0)));
            filterCloseButtons = Locator.css("div.filtermember img[alt=delete]").findElements(getDriver());
            assertEquals("Filter not deleted", filterCount - 1, filterCloseButtons.size());
        }
    }

    @AfterClass
    public static void postTest()
    {
        Ext4HelperWD.resetCssPrefix();
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void setupProject()
    {
        _containerHelper.createProject(PROJECT_NAME, "Study");
        enableModule(PROJECT_NAME, "CDS");
        importFolderFromZip(FOLDER_ZIP);
        goToProjectHome();
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void importData()
    {
        importCDSData("Antigens",          "antigens.tsv");
        importCDSData("Sites",             "sites.tsv");
        importCDSData("Assays",            "assays.tsv");
        importCDSData("Studies",           "studies.tsv");
        importCDSData("Labs",              "labs.tsv");
        importCDSData("People",            "people.tsv");
        importCDSData("Citable",           "citable.tsv");
        importCDSData("Citations",         "citations.tsv");
        importCDSData("AssayPublications", "assay_publications.tsv");
        importCDSData("Vaccines",          "vaccines.tsv");
        importCDSData("VaccineComponents", "vaccinecomponents.tsv");
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void importCDSData(String query, String dataFilePath)
    {
        clickProject(PROJECT_NAME);
        waitForTextWithRefresh("Fact Table", defaultWaitForPage*4);  //wait for study to fully load
        clickAndWait(Locator.linkWithText(query));
        _listHelper.clickImportData();

        setFormElementJS(Locator.id("tsv3"), getFileContents(new File(getSampledataPath(), "CDS/" + dataFilePath)));
        clickButton("Submit");
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    private void populateFactTable()
    {
        clickProject(PROJECT_NAME);
        clickAndWait(Locator.linkWithText("Populate Fact Table"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "HIV Test Results"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "Physical Exam"));
        uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "ParticipantVaccines"));
        submit();

        assertElementPresent(Locator.linkWithText("NAb"));
        assertElementPresent(Locator.linkWithText("Luminex"));
        assertElementPresent(Locator.linkWithText("Lab Results"));
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
        String studyGroup = "Study Group Verify";
        String studyGroupDesc = "A set of defined studies.";
        String assayGroup = "Assay Group Verify";
        String subjectGroup = "Study Characteristics Race Group";

        Set<String> groups = new HashSet<>();
        groups.add(studyGroup);
        groups.add(assayGroup);
        groups.add(subjectGroup);

        //
        // Ensure that none of the Group names already exist
        //
        List<String> deletable = new ArrayList<>();
        makeNavigationSelection(NavigationLink.HOME);
        sleep(500); // let the group display load
        for (String group : groups)
        {
            if (isTextPresent(group))
                deletable.add(group);
        }

        ensureGroupsDeleted(deletable);

        //
        // Compose Groups
        //
        goToAppHome();
        clickBy("Studies");
        selectBars(STUDIES[0], STUDIES[1]);
        useSelectionAsFilter();
        saveGroup(studyGroup, studyGroupDesc);

        // verify group save messaging
        waitForText("Group \"Study Group...\" saved.");

        // verify filter is still applied
        assertElementPresent(filterMemberLocator(STUDIES[0]));
        assertElementPresent(filterMemberLocator(STUDIES[1]));

        // verify group can be updated
        click(cdsButtonLocator("save", "filtersave"));
        waitForText("replace an existing group");
        click(cdsButtonLocator("replace an existing group"));

        Locator.XPathLocator listGroup = Locator.tagWithClass("div", "save-label");
        waitAndClick(listGroup.withText(studyGroup));

        //
        // TODO: Would be best if we could somehow verify that the description is updated,
        // however, I see no way to tell the current value of a 'textarea'.
        //
//        waitForText(studyGroupDesc);

        setFormElement(Locator.id("updategroupdescription-inputEl"), studyGroupDesc + " More info added.");
        click(cdsButtonLocator("save", "groupupdatesave"));

        // verify group save messaging
        waitForText("Group \"Study Group...\" saved.");
        assertFilterStatusCounts(18, 2, 4, 3, 28);

        // verify 'whoops' case
        click(cdsButtonLocator("save", "filtersave"));
        waitForText("create a new group");
        click(cdsButtonLocator("cancel", "groupupdatecancel"));
        clearFilter();

        refresh(); // refresh due to home page not updating currently

        // add a filter, which should be blown away when a group filter is selected
        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Assays");
        selectBars("Luminex-Sample-LabKey");
        useSelectionAsFilter();
        assertFilterStatusCounts(6, 1, 3, 2, 20);

        makeNavigationSelection(NavigationLink.HOME);
        sleep(500); // let the group display load
        click(Locator.tagWithClass("div", "nav-label").withText(studyGroup));

        waitForElement(filterMemberLocator(STUDIES[0]));
        assertElementPresent(filterMemberLocator(STUDIES[1]));
        assertFilterStatusCounts(18, 2, 4, 3, 28);
        assertTextPresent("Study Group Verify", "DESCRIPTION", "UPDATES", "A set of defined studies. More info added.");

        clearFilter();
        makeNavigationSelection(NavigationLink.SUMMARY);
    }

    @Test
    public void verifyFilterDisplays()
    {
        log("verify filter displays");

        goToAppHome();
        clickBy("Studies");
        selectBars(STUDIES[0]);

        // verify "Study: Demo Study" selection
        waitForElement(filterMemberLocator("Study: " + STUDIES[0]));

        // verify buttons available
        assertElementPresent(cdsButtonLocator("use as filter"));
        assertElementPresent(cdsButtonLocator("label as subgroup"));
        assertElementPresent(cdsButtonLocator("clear"));

        // verify split display
        clearSelection();
        goToAppHome();
        clickBy("Studies");
        selectBars(STUDIES[0], STUDIES[1]);
        waitForElement(filterMemberLocator(STUDIES[0]));
        assertElementPresent(filterMemberLocator(STUDIES[1]));
        assertElementPresent(Locator.tagWithClass("div", "selitem").withText("Study"));
        assertFilterStatusCounts(18, 2, 4, 3, 28);

        // clear by selection
        selectBars(STUDIES[1]);
        waitForElement(filterMemberLocator("Study: " + STUDIES[1]));
        assertFilterStatusCounts(12, 1, 3, 2, 8);

        // verify multi-level filtering
        goToAppHome();
        clickBy("Assays");
        selectBars("ADCC-Ferrari", "Innate");
        waitForElement(filterMemberLocator("Assay: ADCC-Ferrari"));
        assertElementPresent(filterMemberLocator("Assay (Target Area): Innate"));

        useSelectionAsFilter();
        assertElementPresent(filterMemberLocator("Assay: ADCC-Ferrari"), 1);
        assertElementPresent(filterMemberLocator("Assay (Target Area): Innate"), 1);
        assertFilterStatusCounts(0, 0, 0, 0, 0);

        // remove a subfilter
        click(filterMemberLocator("Assay: ADCC-Ferrari").append(Locator.tagWithClass("div", "closeitem")));
        waitForText("Filter removed.");
        assertFilterStatusCounts(5, 1, 3, 1, 3);
        assertElementNotPresent(filterMemberLocator("Assay: ADCC-Ferrari"));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(filterMemberLocator("Assay: ADCC-Ferrari"));
        assertFilterStatusCounts(0, 0, 0, 0, 0);

        // remove a subfilter
        click(filterMemberLocator("Assay: ADCC-Ferrari").append(Locator.tagWithClass("div", "closeitem")));
        waitForText("Filter removed.");
        assertFilterStatusCounts(5, 1, 3, 1, 3);
        assertElementNotPresent(filterMemberLocator("Assay: ADCC-Ferrari"));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(filterMemberLocator("Assay: ADCC-Ferrari"));
        assertFilterStatusCounts(0, 0, 0, 0, 0);

        clearFilter();
    }

    @Test
    public void verifyGrid()
    {
        log("Verify Grid");

        final String GRID_CLEAR_FILTER = "Clear Filters";

        clickBy("Studies");
        makeNavigationSelection(NavigationLink.GRID);
        addGridColumn("NAb", "Point IC50", true, true);
        addGridColumn("NAb", "Study Name", false, true);

        waitForGridCount(668);
        assertElementPresent(Locator.tagWithText("span", "Point IC50"));
        assertElementPresent(Locator.tagWithText("span", "Study Name"));
        makeNavigationSelection(NavigationLink.SUMMARY);
        clickBy("Studies");
        click(cdsButtonLocator("hide empty"));
        selectBars("Demo Study");
        useSelectionAsFilter();

        waitForElementToDisappear(Locator.css("span.barlabel").withText("Not Actually CHAVI 001"), CDS_WAIT);

        //Check to see if grid is properly filtering based on explorer filter
        makeNavigationSelection(NavigationLink.GRID);
        waitForGridCount(437);
        clearFilter();
        waitForElement(Locator.tagWithText("span", "NotRV144"));
        waitForGridCount(668);

        addGridColumn("Demographics", "Gender", true, true);
        addGridColumn("Demographics", "Ethnicity", false, true);

        waitForElement(Locator.tagWithText("span", "Gender"));
        waitForElement(Locator.tagWithText("span", "Ethnicity"));

        log("Remove a column");
        removeGridColumn("NAb", "Point IC50", false);

        waitForElementToDisappear(Locator.tagWithText("span", "Point IC50"));
        //But other column from same table is still there
        waitForElement(Locator.tagContainingText("span", "Study Name"));

        setRawDataFilter("Ethnicity", "White");
        waitForGridCount(246);

        log("Change column set and ensure still filtered");
        addGridColumn("NAb", "Point IC50", false, true);
        waitForElement(Locator.tagWithText("span", "Point IC50"));
        waitForGridCount(246);

        openFilterPanel("Study Name");
        waitForElement(Locator.tagWithText("div", "PI1"));
        _ext4Helper.checkGridRowCheckbox("PI1");
        click(cdsButtonLocator("OK"));

        log("Filter on a looked-up column");
        waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText("PI1"));
        waitForElement(Locator.tagWithClass("div", "x-grid-cell-inner").withText("Igra M"));
        setRawDataFilter("PI1", "Igra");
        waitForGridCount(152);

        log("Ensure filtering goes away when column does");
        openFilterPanel("Study Name");
        _ext4Helper.uncheckGridRowCheckbox("PI1");
        click(cdsButtonLocator("OK"));
        waitForGridCount(246);

        setRawDataFilter("Point IC50", "Is Greater Than", "60");
        waitForGridCount(2);
        openFilterPanel("Ethnicity");
        waitAndClick(cdsButtonLocator(GRID_CLEAR_FILTER));

        // TODO: Workaround for duplicate filters on Firefox
        List<WebElement> closers = Locator.tag("div").withClass("hierfilter").containing("Ethnicity").append("//img").findElements(getDriver());
        if (closers.size() > 0)
            closers.get(0).click();

        waitForGridCount(5);

        openFilterPanel("Point IC50");
        waitAndClick(cdsButtonLocator(GRID_CLEAR_FILTER));
        waitForGridCount(668);

        log("Verify citation sources");
        click(cdsButtonLocator("Sources"));
        waitForText("References", CDS_WAIT);
        assertTextPresent(
                "Demo study final NAb data",
                "NAb Data From Igra Lab",
                "Data extracted from LabKey lab site on Atlas"
        );
        click(Locator.xpath("//a[text()='References']"));
        waitForText("Recent advances in assay", CDS_WAIT);
        click(cdsButtonLocator("Close"));
        waitForGridCount(668);

        log("Verify multiple citation sources");
        addGridColumn("Physical Exam", "Weight Kg", false, true);
        waitForElement(Locator.tagWithText("span", "Weight Kg"));
        waitForGridCount(700);

        click(cdsButtonLocator("Sources"));
        waitAndClick(Locator.linkWithText("Sources"));
        waitForText("Pulled from Atlas", CDS_WAIT);
        assertTextPresent("Demo study data delivered by spreadsheet");
        click(cdsButtonLocator("Close"));
        waitForGridCount(700);

        removeGridColumn("Physical Exam", "Weight Kg", false);
        waitForGridCount(668);

        // 15267
        addGridColumn("Physical Exam", "Source", true, true);
        addGridColumn("NAb", "Source", false, true);
        waitForGridCount(700);
        setRawDataFilter("Source", "Demo"); // Hopefully get text on page
        waitForText("Demo study physical exam", CDS_WAIT);
        waitForText("Demo study final NAb data", CDS_WAIT);

        openFilterPanel("Source");
        click(cdsButtonLocator(GRID_CLEAR_FILTER));
    }

    @Test
    public void verifyCounts()
    {
        assertAllSubjectsPortalPage();

        // 14902
        clickBy("Studies");
        assertFilterStatusPanel(STUDIES[0], STUDIES[0], 6, 1, 3, 2, 20, 12);

        // Verify multi-select tooltip -- this only shows the first time
        assertTextPresent(TOOLTIP);

        useSelectionAsFilter();
        click(cdsButtonLocator("hide empty"));
        waitForElementToDisappear(Locator.css("span.barlabel").withText(STUDIES[1]), CDS_WAIT);
        assertFilterStatusCounts(6, 1, 3, 2, 20);
        goToAppHome();

        // Verify multi-select tooltip has dissappeared
        assertTextNotPresent(TOOLTIP);

        clickBy("Studies");
        assertFilterStatusPanel(STUDIES[0], STUDIES[0], 6, 1, 3, 2, 20, 12);
        sleep(500);
        clearFilter();
        waitForElement(Locator.css("span.barlabel").withText(STUDIES[2]), CDS_WAIT);
        goToAppHome();
        // end 14902

        clickBy("Studies");
        assertFilterStatusPanel(STUDIES[1], STUDIES[1], 12, 1, 3, 2, 8, 12);
        assertTextNotPresent(TOOLTIP);
        assertFilterStatusPanel(STUDIES[2], STUDIES[2], 11, 1, 3, 2, 3, 12);
        goToAppHome();
        clearSelection();
        clickBy("Assay antigens");
        pickCDSSort("Tier", "1A");
        toggleExplorerBar("3");
        assertFilterStatusPanel("H061.14", "H061.14", 12, 1, 3, 2, 8, 12);
        toggleExplorerBar("1A");
        assertFilterStatusPanel("SF162.LS", "SF162.LS", 6, 1, 3, 2, 20, 12);
        toggleExplorerBar("1B");
        assertFilterStatusPanel("ZM109F.PB4", "ZM109F.PB4", 6, 1, 3, 2, 20, 6);
        goToAppHome();
        clickBy("Assays");
        assertFilterStatusPanel("Lab Results", "Lab Results", 23, 3, 5, 3, 31, 29);
        assertFilterStatusPanel("ADCC-Ferrari", "ADCC-Ferrari", 12, 1, 3, 2, 8, 29);
        assertFilterStatusPanel("Luminex-Sample-LabKey", "Luminex-Sample-LabKey", 6, 1, 3, 2, 20, 29);
        assertFilterStatusPanel("NAb-Sample-LabKey", "NAb-Sample-LabKey", 29, 3, 5, 3, 31, 29);
        assertFilterStatusPanel("mRNA assay", "mRNA assay", 5, 1, 3, 1, 3, 0);
        goToAppHome();
        clickBy("Labs");
        assertFilterStatusPanel(LABS[0], LABS[0], 6, 1, 3, 2, 20, 23);
        assertFilterStatusPanel(LABS[1], LABS[1], 23, 3, 5, 3, 31, 23);
        assertFilterStatusPanel(LABS[2], LABS[2], 18, 2, 3, 2, 11, 23);
        goToAppHome();
        clickBy("Subject characteristics");
        clearSelection();
        assertDefaultFilterStatusCounts();
        pickCDSSort("Country");
        assertFilterStatusPanel("South Africa", "South Africa", 5, 1, 1, 1, 3, 18);
        assertFilterStatusPanel("USA", "USA", 19, 3, 4, 3, 31, 19);
        assertFilterStatusPanel("Thailand", "Thailand", 5, 1, 3, 1, 3, 18);
    }

    //@Test
    public void verifyFilters()
    {
        log("Verify multi-select");

        // 14910
        clickBy("Assay antigens");
        waitForBarToAnimate("Unknown");
        click(cdsButtonLocator("hide empty"));
        waitForBarToAnimate("Unknown");
        pickCDSSort("Tier", "1A");
        toggleExplorerBar("1A");
        toggleExplorerBar("1B");
        shiftSelectBars("DJ263.8", "SF162.LS");
        waitForElement(filterMemberLocator("SF162.LS"), WAIT_FOR_JAVASCRIPT);
        assertElementPresent(filterMemberLocator(), 6);
        assertFilterStatusCounts(6, 1, 3, 2, 20);
        clearSelection();
        assertDefaultFilterStatusCounts();
        goToAppHome();
        // end 14910

        clickBy("Labs");
        selectBars(LABS[0], LABS[1]);
        assertFilterStatusCounts(6, 1, 3, 2, 20);
        selectBars(LABS[0], LABS[2]);
        assertFilterStatusCounts(0, 0, 0, 0, 0);
        selectBars(LABS[1], LABS[2]);
        assertFilterStatusCounts(12, 1, 3, 2, 8);
        useSelectionAsFilter();
        saveGroup(GROUP_NAME, GROUP_DESC);
        waitForElementToDisappear(Locator.css("span.barlabel").withText(LABS[0]), CDS_WAIT);
//        waitForElement(filterMemberLocator(GROUP_NAME), WAIT_FOR_JAVASCRIPT);
        assertFilterStatusCounts(12, 1, 3, 2, 8);
        clearFilter();
        waitForElement(Locator.css("span.barlabel").withText(LABS[0]), CDS_WAIT);
        assertFilterStatusCounts(29,3,5,3,31);

        goToAppHome();
        assertAllSubjectsPortalPage();

        log("Verify operator filtering");
        clickBy("Studies");
        selectBars(STUDIES[0], STUDIES[1]);
        assertFilterStatusCounts(18, 2, 4, 3, 28);  // or
        assertElementPresent(Locator.css("option").withText("OR"));
        mouseOver(Locator.css("option").withText("OR"));

        WebElement selector = Locator.css("select").findElement(getDriver());
        assertEquals("Wrong initial combo selection", "UNION", selector.getAttribute("value"));
        selectOptionByValue(selector, "INTERSECT");
        assertFilterStatusCounts(0, 0, 0, 0, 0); // and
        useSelectionAsFilter();
        waitForElementToDisappear(Locator.css("span.barlabel"), CDS_WAIT);
        assertFilterStatusCounts(0, 0, 0, 0, 0); // and

        selector = Locator.css("select").findElement(getDriver());
        waitForElement(Locator.css("option").withText("AND"));
        mouseOver(Locator.css("option").withText("AND"));

        assertEquals("Combo box selection changed unexpectedly", "INTERSECT", selector.getAttribute("value"));
        selectOptionByValue(selector, "UNION");
        assertFilterStatusCounts(18, 2, 4, 3, 28);  // or
        assertElementPresent(Locator.css("span.barlabel").withText(STUDIES[0]));
        goToAppHome();
        waitForText(STUDIES[1], CDS_WAIT);
        clickBy("Labs");
        assertElementPresent(filterMemberLocator(STUDIES[0]));
        assertElementPresent(Locator.css("option").withText("OR"));
        assertFilterStatusCounts(18, 2, 4, 3, 28);  // and
        clearFilter();
        waitForText("All subjects");
        assertDefaultFilterStatusCounts();
        assertTextPresent("All subjects");
        goToAppHome();

        log("Verify selection messaging");
        clickBy("Assays");
        selectBars("ADCC-Ferrari", "Luminex-Sample-LabKey");
        assertFilterStatusCounts(0, 0, 0, 0, 0);
        pickCDSDimension("Studies");
        assertFilterStatusCounts(0, 0, 0, 0, 0);
        clearSelection();
        waitForText(STUDIES[2], CDS_WAIT);
        selectBars(STUDIES[0]);
        pickCDSDimension("Assays");
        assertFilterStatusCounts(6, 1, 3, 2, 20);
        useSelectionAsFilter();
        goToAppHome();

        //test more group saving
        clickBy("Subject characteristics");
        pickCDSSort("Sex");
        selectBars("f");

        // save the group and request cancel
        click(cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
//        click(Locator.css(".withSelectionRadio input"));
        setFormElement(Locator.name("groupname"), GROUP_NULL);
        click(cdsButtonLocator("cancel", "cancelgroupsave"));
        waitForElementToDisappear(Locator.xpath("//div[starts-with(@id, 'groupsave')]").notHidden());

        selectBars("f");

        // save the group and request save
        saveGroup(GROUP_NAME2, null);
//        waitForElement(filterMemberLocator(GROUP_NAME2), WAIT_FOR_JAVASCRIPT);

        selectBars("f");

        // save a group with an interior group
        saveGroup(GROUP_NAME3, null);
//        waitForElement(filterMemberLocator(GROUP_NAME3), WAIT_FOR_JAVASCRIPT);

        // saved filter without including current selection (should be the same as initial group)
        goToAppHome();

        clickBy("Labs");
        assertFilterStatusCounts(4,1,3,2,20);

        // Group creation cancelled
        clearFilter();
        goToAppHome();
//        assertTextNotPresent(GROUP_NULL);
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
        assertNounInfoPage("Demo Study", Arrays.asList("Igra M", "Fitzsimmons K", "Trial", "LabKey"));
        assertNounInfoPage("Not Actually CHAVI 001", Arrays.asList("Bellew M", "Arnold N", "Observational", "CHAVI"));
        assertNounInfoPage("NotRV144", Arrays.asList("Piehler B", "Lum K", "Trial", "USMHRP"));

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

        List<String> studies = Arrays.asList("Demo Study", "Not Actually CHAVI 001", "NotRV144");
        verifyLearnAboutPage(studies);
    }

    @Test
    public void testLearnAboutAssays()
    {
        viewLearnAboutPage("Assays");

        List<String> assays = Arrays.asList("ADCC-Ferrari", "Lab Results", "Luminex-Sample-LabKey", "mRNA assay", "NAb-Sample-LabKey");
        verifyLearnAboutPage(assays);
    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        viewLearnAboutPage("Study products");

        List<String> studyProducts = Arrays.asList("VRC-HIVADV014-00-VP", "VRC-HIVDNA016-00-VP");
        verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void testLearnAboutLabs()
    {
        viewLearnAboutPage("Labs");

        List<String> labs = Arrays.asList("Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab");
        verifyLearnAboutPage(labs);
    }

    @Test
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

        clickBy("Studies");

        String X_AXIS_BUTTON_TEXT = "\u25b2";
        String Y_AXIS_BUTTON_TEXT = "\u25ba";

        makeNavigationSelection(NavigationLink.PLOT);
        WebElement xAxisButton = shortWait().until(ExpectedConditions.elementToBeClickable(cdsButtonLocator(X_AXIS_BUTTON_TEXT).toBy()));
        WebElement yAxisButton = shortWait().until(ExpectedConditions.elementToBeClickable(cdsButtonLocator(Y_AXIS_BUTTON_TEXT).toBy()));

        xAxisButton.click();
        waitForElement(Locator.css(".xaxispicker tr.x-grid-row").withText("Physical Exam (6)"));
        _extHelper.pickMeasure("xaxispicker", "Lab Results", "CD4");
        click(cdsButtonLocator("Set X-Axis"));
        waitForElement(Locator.css(".curselhdr").withText("Choose Y Axis"));
        _extHelper.pickMeasure("yaxispicker", "Lab Results", "Lymphocytes");
        click(cdsButtonLocator("Set Y-Axis"));
        _ext4Helper.waitForMaskToDisappear();
        assertSVG(CD4_LYMPH);

        yAxisButton.click();
        _ext4Helper.waitForMask();
        _extHelper.pickMeasure("yaxispicker", "Lab Results", "CD4");
        click(cdsButtonLocator("Set Y-Axis"));
        _ext4Helper.waitForMaskToDisappear();
        xAxisButton.click();
        _ext4Helper.waitForMask();
        _extHelper.pickMeasure("xaxispicker", "Lab Results", "Hemoglobin");
        click(cdsButtonLocator("Set X-Axis"));
        _ext4Helper.waitForMaskToDisappear();
        assertSVG(HEMO_CD4_UNFILTERED);

        // Test log scales
        yAxisButton.click();
        _ext4Helper.waitForMask();
        _extHelper.pickMeasure("yaxispicker", "Physical Exam", "Weight Kg");
        // set Y to log scale
        click(Locator.xpath("//div[@id='plotymeasurewin']//td[contains(@class, 'x-form-cb-wrap')][.//label[text()='Log']]//input"));
        click(cdsButtonLocator("Set Y-Axis"));
        waitForText("Points outside the plotting area have no match");
        xAxisButton.click();
        _ext4Helper.waitForMask();
        _extHelper.pickMeasure("xaxispicker", "Physical Exam", "Pulse");
        // set X to log scale
        click(Locator.xpath("//div[@id='plotxmeasurewin']//td[contains(@class, 'x-form-cb-wrap')][.//label[text()='Log']]//input"));
        click(cdsButtonLocator("Set X-Axis"));
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
        builder.moveToElement(points.get(10)).moveByOffset(-10, -5).clickAndHold().moveByOffset(35, 30).release().perform();

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
    }

    @Test
    @Ignore("Individual noun detail pages NYI")
    public void testSummaryPageDetailsLinks()
    {
        StudyDetailsPage demoStudy = StudyDetailsPage.demoStudy(this);
        verifyStudyDetailsFromSummary(demoStudy);

        StudyDetailsPage notActuallyCHAVI001 = StudyDetailsPage.notActuallyCHAVI001(this);
        verifyStudyDetailsFromSummary(notActuallyCHAVI001);

        StudyDetailsPage notRV144 = StudyDetailsPage.notRV144(this);
        verifyStudyDetailsFromSummary(notRV144);

        AssayDetailsPage labResults = AssayDetailsPage.labResults(this);
        verifyAssayDetailsFromSummary(labResults);

        AssayDetailsPage adccFerrari = AssayDetailsPage.adccFerrari(this);
        verifyAssayDetailsFromSummary(adccFerrari);

        AssayDetailsPage luminexSampleLabKey = AssayDetailsPage.luminexSampleLabKey(this);
        verifyAssayDetailsFromSummary(luminexSampleLabKey);

        AssayDetailsPage mrnaAssay = AssayDetailsPage.mrnaAssay(this);
        verifyAssayDetailsFromSummary(mrnaAssay);

        AssayDetailsPage nabSampleLabKey = AssayDetailsPage.nabSampleLabKey(this);
        verifyAssayDetailsFromSummary(nabSampleLabKey);
    }

    @Test
    public void testSummaryPageSingleAxisLinks()
    {
        Locator dimensionGroup = Locator.css("div.dimgroup");
        Locator dimensionSort = Locator.css("div.dimensionsort");

        waitAndClick(Locator.linkWithText("races"));
        waitForElement(dimensionGroup.withText("Subject characteristics"));
        waitForElement(dimensionSort.withText("SORTED BY: RACE"));
        goToAppHome();
        sleep(250);

        waitAndClick(Locator.linkWithText("locations"));
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
        click(cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_LIVE_FILTER);
        click(Locator.radioButtonByNameAndValue("groupselect", "live"));
        click(cdsButtonLocator("save", "groupcreatesave"));
        waitForElement(filterMemberLocator(GROUP_LIVE_FILTER), WAIT_FOR_JAVASCRIPT);

        // create static filter group
        click(cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_STATIC_FILTER);
        click(Locator.radioButtonByNameAndValue("groupselect", "live"));
        click(cdsButtonLocator("save", "groupcreatesave"));
        waitForElement(filterMemberLocator(GROUP_STATIC_FILTER), WAIT_FOR_JAVASCRIPT);

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
        click(Locator.xpath("//a[contains(@class, 'dropdown')]"));
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
        }, "Bar didn't stop animating: " + barLabel, WAIT_FOR_JAVASCRIPT);
    }

    private void saveGroup(String name, @Nullable String description)
    {
        click(cdsButtonLocator("save", "filtersave"));
        waitForText("Live: Update group with new data");
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), name);
        if (null != description)
            setFormElement(Locator.name("groupdescription"), description);
        click(cdsButtonLocator("save", "groupcreatesave"));
    }

    private void selectBarsHelper(boolean isShift, String...bars)
    {
        waitForBarToAnimate(bars[0]);

        String subselect = bars[0];
        if (subselect.length() > 10)
            subselect = subselect.substring(0, 9);
        WebElement el = shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//span[@class='barlabel' and text() = '" + bars[0] + "']").toBy()));
        clickAt(el, 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
        waitForElement(filterMemberLocator(subselect), CDS_WAIT);
        waitForFilterAnimation();
        if(bars.length > 1)
        {
            Actions builder = new Actions(getDriver());

            if (isShift)
                builder.keyDown(Keys.SHIFT).build().perform();
            else
                builder.keyDown(Keys.CONTROL).build().perform();

            for(int i = 1; i < bars.length; i++)
            {
                el = shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//span[@class='barlabel' and text() = '" + bars[i] + "']").toBy()));
                clickAt(el, 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
                subselect = bars[i];
                if (subselect.length() > 10)
                    subselect = subselect.substring(0, 9);
                waitForElement(filterMemberLocator(subselect));
                waitForFilterAnimation();
            }

            if (isShift)
                builder.keyUp(Keys.SHIFT).build().perform();
            else
                builder.keyUp(Keys.CONTROL).build().perform();
        }
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
        waitForElement(getByLocator("Studies"));
    }

    private void clearFilter()
    {
        click(cdsButtonLocator("clear", "filterclear"));
        waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));
    }

    private void useSelectionAsFilter()
    {
        click(cdsButtonLocator("use as filter"));
        waitForClearSelection(); // wait for animation
    }

    private void clearSelection()
    {
        click(cdsButtonLocator("clear", "selectionclear"));
        waitForClearSelection();
    }

    private void waitForClearSelection()
    {
        Locator.XPathLocator panel = Locator.tagWithClass("div", "selectionpanel");
        shortWait().until(ExpectedConditions.invisibilityOfElementLocated(panel.toBy()));
    }

    private Locator.XPathLocator getByLocator(String byNoun)
    {
        return Locator.xpath("//div[contains(@class, 'bycolumn')]//span[contains(@class, 'label') and contains(text(), '" + byNoun + "')]");
    }

    private Locator.XPathLocator cdsButtonLocator(String text)
    {
        return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
    }

    private Locator.XPathLocator cdsButtonLocator(String text, String cssClass)
    {
        return Locator.xpath("//a[contains(@class, '" + cssClass + "')]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
    }

    private Locator.XPathLocator filterMemberLocator()
    {
        return Locator.tagWithClass("div", "memberitem");
    }

    private Locator.XPathLocator filterMemberLocator(String filterText)
    {
        return filterMemberLocator().containing(filterText);
    }

    private void clickBy(String byNoun)
    {
        Locator.XPathLocator loc = getByLocator(byNoun);
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
        PLOT("Plot data", Locator.tagWithClass("a", "yaxisbutton")),
        GRID("View data grid", Locator.tagWithClass("div", "dimgroup").withText("Data Grid"));

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
        waitForElement(cdsButtonLocator("Close"));
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
        click(cdsButtonLocator("Close"));
        waitForElementToDisappear(Locator.button("Close"), WAIT_FOR_JAVASCRIPT);
    }

    private void addGridColumn(String source, String measure, boolean keepOpen, boolean keepSelection)
    {
        waitForElement(Locator.css("div.dimgroup").withText("Data Grid")); // make sure we are looking at grid

        // allow for already open measures
        if (!isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            click(cdsButtonLocator("Choose Columns"));
            waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        _extHelper.pickMeasure(source, measure, keepSelection);

        if (!keepOpen)
        {
            click(cdsButtonLocator("select"));
        }
    }

    private void removeGridColumn(String source, String measure, boolean keepOpen)
    {
        waitForElement(Locator.css("div.dimgroup").withText("Data Grid")); // make sure we are looking at grid

        // allow for already open measures
        if (!isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            click(cdsButtonLocator("Choose Columns"));
            waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        _extHelper.pickMeasure(source, measure, true); // Just get the right source selected
        _ext4Helper.uncheckGridRowCheckbox(measure);

        if (!keepOpen)
        {
            click(cdsButtonLocator("select"));
        }
    }

    private void setRawDataFilter(String colName, String value)
    {
        setRawDataFilter(colName, null, value);
    }

    private void setRawDataFilter(String colName, String filter, String value)
    {
        openFilterPanel(colName);
        if (null != filter)
            _ext4Helper.selectComboBoxItem("Value:", filter);

        waitForElement(Locator.id("value_1"));
        setFormElement(Locator.css("#value_1 input"), value);
        click(cdsButtonLocator("OK"));
        String filterText = colName.length() > 9 ? colName.replace(" ", "").substring(0, 9) : colName.replace(" ", "");
        waitForElement(filterMemberLocator(filterText));
        waitForFilterAnimation();
    }

    private void openFilterPanel(String colHeader)
    {
        waitForElement(Locator.tag("span").withText(colHeader));

        List<Ext4CmpRefWD> dataViews = _ext4Helper.componentQuery("#raw-data-view", Ext4CmpRefWD.class);
        Ext4CmpRefWD dataView = dataViews.get(0);

        log("openFilterWindow: " + colHeader);
        dataView.eval("openFilterWindow(\'" + colHeader + "\');");
        waitForElement(Locator.css(".filterheader").withText(colHeader));
    }

    private void waitForGridCount(int count)
    {
        String displayText;
        if (count == 0)
            displayText = "No data to display";
        else if (count < 100)
            displayText = "Displaying 1 - " + count + " of " + count;
        else
            displayText = "Displaying 1 - 100 of " + count;

        waitForFilterAnimation();
        waitForElement(Locator.tagContainingText("div", displayText));
    }

    private void ensureGroupsDeleted(List<String> groups)
    {
        if (groups.size() > 0)
        {
            Ext4HelperWD.setCssPrefix("x4-");

            // leave the app
            beginAt("/cds/" + getProjectName() + "/begin.view?");
            for (String g : groups)
            {
                _studyHelper.deleteCustomParticipantGroup(g, "Participant");
            }

            Ext4HelperWD.setCssPrefix("x-");
            enterApplication();
        }
    }

/// CDS App asserts

    private void assertAllSubjectsPortalPage()
    {
        assertCDSPortalRow("Studies", "", "3 studies");
        assertCDSPortalRow("Assay antigens", "5 clades, 5 tiers, 5 sample types", "31 antigens");
        assertCDSPortalRow("Assays", "", "5 assays");
        assertCDSPortalRow("Labs", "", "3 labs");
        assertCDSPortalRow("Subject characteristics", "6 races, 3 locations, 18 female, 11 male", "29 subjects");
    }

    private void assertCDSPortalRow(String byNoun, String expectedDetail, String expectedTotal)
    {
        waitForElement(getByLocator(byNoun), 120000);
        assertTrue("'by " + byNoun + "' search option is not present", isElementPresent(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div[" +
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' " + byNoun + "']]")));
        String actualDetail = getText(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div["+
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' "+byNoun+"']]"+
                "/div[contains(@class, 'detailcolumn')]"));
        assertEquals("Wrong details for search by " + byNoun + ".", expectedDetail, actualDetail);
        String actualTotal = getText(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div["+
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' "+byNoun+"']]"+
                "/div[contains(@class, 'totalcolumn')]"));
        assertEquals("Wrong total for search by " + byNoun + ".", expectedTotal, actualTotal);
    }

    // Sequential calls to this should have different subject counts.
    private void assertFilterStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int assayCount, int contributorCount, int antigenCount, int maxCount)
    {
        selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, assayCount, contributorCount, antigenCount);
        waitForElement(filterMemberLocator(filteredLabel), WAIT_FOR_JAVASCRIPT);
    }

    private void assertDefaultFilterStatusCounts()
    {
        assertFilterStatusCounts(29, 3, 5, 3, 31);
    }

    private Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural)
    {
        return Locator.xpath("//li//span[text()='" + (count != 1 ? plural : singular) + "']/../span[contains(@class, 'status-count') and text()='" + count + "']");
    }

    private void assertFilterStatusCounts(int subjectCount, int studyCount, int assayCount, int contributorCount, int antigenCount)
    {
        waitForElement(Locator.xpath("//span[contains(@class, 'hl-status-count') and text()='" + subjectCount + "']"), WAIT_FOR_JAVASCRIPT);
        waitForElement(getFilterStatusLocator(studyCount, "Study", "Studies"));
        waitForElement(getFilterStatusLocator(assayCount, "Assay", "Assays"));
        waitForElement(getFilterStatusLocator(contributorCount, "Lab", "Labs"));
        waitForElement(getFilterStatusLocator(antigenCount, "Antigen", "Antigens"));
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
        sleep(350);
        click(Locator.xpath("//div[@class='bar large']//span[contains(@class, 'barlabel') and text()='" + largeBarText + "']//..//..//div[contains(@class, 'saecollapse')]"));
        sleep(350);
    }
}
