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

import org.apache.commons.lang3.tuple.Pair;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.CDSExport;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataGrid;
import org.labkey.test.pages.cds.DataGridVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.cds.CDSHelper.GRID_COL_SUBJECT_ID;
import static org.labkey.test.util.cds.CDSHelper.GRID_TITLE_NAB;

@Category({})
public class CDSGridTest extends CDSReadOnlyTest
{

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    @Before
    public void preTest()
    {

        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // let the group display load

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
    public void verifyGrid()
    {
        log("Verify Grid");

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);

        waitForText("View data grid"); // grid warning

        gridColumnSelector.addGridColumn(CDSHelper.NAB, GRID_TITLE_NAB, CDSHelper.NAB_ASSAY, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.NAB, GRID_TITLE_NAB, CDSHelper.NAB_LAB, false, true);

        grid.goToDataTab(GRID_TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB);
        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(432); // TODO Test data dependent.
        }

        //
        // Check paging buttons with known dataset. Verify with first and last subject id on page.
        //
        log("Verify grid paging");
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
            grid.assertPageTotal(43); // TODO Test data dependent.
        }

        cds.clearFilters();
        _ext4Helper.waitForMaskToDisappear();

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(10783); // TODO Test data dependent.
            assertElementPresent(DataGrid.Locators.cellLocator("q2-003")); // TODO Test data dependent.
        }

        gridColumnSelector.addGridColumn(CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_SEX, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_RACE, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB);

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(10783); // TODO Test data dependent.
        }

        grid.goToDataTab("Subject characteristics");
        grid.ensureSubjectCharacteristicsColumnsPresent(CDSHelper.DEMO_SEX, CDSHelper.DEMO_RACE);

        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(332); // TODO Test data dependent.
        }

        log("Remove a column");
        gridColumnSelector.removeGridColumn(CDSHelper.NAB, CDSHelper.NAB_ASSAY, false);
        grid.goToDataTab("NAb");
        grid.assertColumnsNotPresent(CDSHelper.NAB_ASSAY);
        grid.ensureColumnsPresent(CDSHelper.NAB_LAB); // make sure other columns from the same source still exist

        if (CDSHelper.validateCounts)
        {
            grid.assertRowCount(10783); // TODO Test data dependent.
        }

        grid.goToDataTab("Subject characteristics");
        grid.setFacet(CDSHelper.DEMO_RACE, "White");

        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(32); // TODO Test data dependent.
            grid.assertRowCount(792); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(777, 48, 1, 3, 152); // TODO Test data dependent.
        }

        //
        // More page button tests
        //
        log("Verify grid paging with filtered dataset");
        grid.goToDataTab("NAb");
        grid.sort(GRID_COL_SUBJECT_ID);
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
        gridColumnSelector.addGridColumn(CDSHelper.NAB, GRID_TITLE_NAB, CDSHelper.NAB_TITERID50, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50);

        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(32); // TODO Test data dependent.
            grid.assertRowCount(792); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(777, 48, 1, 3, 152); // TODO Test data dependent.
        }


        log("Verify Aligned Time Point Columns");
        Map<String, Boolean> columns = new HashMap<>();
        columns.put(CDSHelper.TIME_POINTS_DAYS, false);
        columns.put(CDSHelper.TIME_POINTS_WEEKS, true);
        columns.put(CDSHelper.TIME_POINTS_MONTHS, true);
        columns.put(CDSHelper.TIME_POINTS_DAYS_FIRST_VACC, true);
        columns.put(CDSHelper.TIME_POINTS_WEEKS_FIRST_VACC, true);
        columns.put(CDSHelper.TIME_POINTS_MONTHS_FIRST_VACC, true);
        columns.put(CDSHelper.TIME_POINTS_DAYS_LAST_VACC, true);
        columns.put(CDSHelper.TIME_POINTS_WEEKS_LAST_VACC, true);
        columns.put(CDSHelper.TIME_POINTS_MONTHS_LAST_VACC, true);

        gridColumnSelector.openSelectorWindow();
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.TIME_POINTS, columns);

    }

    @Test
    public void verifyGridExport() throws IOException
    {
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        sleep(1000);
        DataGrid grid = new DataGrid(this);
        log("Export without filter or additional columns");
        CDSExport exported = new CDSExport(Arrays.asList(Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT, 14285)));
        exported.setDataTabHeaders(Arrays.asList(Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT,
                Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days"))));
        exported.setAssays(Collections.emptyList());
        exported.setFieldLabels(Collections.emptyList());
        grid.verifyCDSExcel(exported, false);
        grid.verifyCDSCSV(exported);

        setUpGridStep1();
        exported = new CDSExport(Arrays.asList(Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT, 495),
                Pair.of(CDSHelper.TITLE_ICS, 658)));
        exported.setDataTabHeaders(Arrays.asList(
                Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT,
                        Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days")),
                Pair.of(CDSHelper.GRID_TITLE_ICS,
                        Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days", "Antigen name", "Antigens aggregated"))
        ));
        exported.setFilterTitles(Arrays.asList("Intracellular Cytokine Staining", "", "", "", "Subject (Race)"));
        exported.setFilterValues(Arrays.asList("Data summary level: Protein Panel", "Functional marker name: IL2/ifngamma", "", "", "Subjects related to any: Asian"));
        exported.setStudyNetworks(Arrays.asList("HVTN", "HVTN", "HVTN", "HVTN", "HVTN", "HVTN", "HVTN", "HVTN", "HVTN", "HVTN", "ROGER", "ROGER", "ROGER"));
        exported.setStudies(Arrays.asList("ZAP 102", "ZAP 105", "ZAP 106", "ZAP 134",
                "ZAP 136", "ZAP 113", "ZAP 115", "ZAP 116", "ZAP 117", "ZAP 118", "RED 4", "RED 5", "RED 6"));
        exported.setAssays(Arrays.asList("Intracellular Cytokine Staining", "Intracellular Cytokine Staining", "Intracellular Cytokine Staining"));
        exported.setAssayProvenances(Arrays.asList("VISC analysis dataset", "VISC analysis dataset", "LabKey dataset", "VISC analysis dataset", "VISC analysis dataset"));
        exported.setFieldLabels(Arrays.asList("Antigen name", "Antigens aggregated", "Cell type", "Data summary level", "Functional marker name", "Lab ID", "Magnitude (% cells) - Background subtracted",
                "Peptide Pool", "Protein", "Protein panel", "Specimen type"));
        grid.verifyCDSExcel(exported, false);
        grid.verifyCDSCSV(exported);

        setUpGridStep2(false);

        exported = new CDSExport(Arrays.asList(Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT, 7),
                Pair.of(CDSHelper.GRID_TITLE_DEMO, 2),
                Pair.of(CDSHelper.GRID_TITLE_ICS, 2),
                Pair.of(CDSHelper.GRID_TITLE_NAB, 13)));
        exported.setDataTabHeaders(Arrays.asList(
                Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT,
                        Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days")),
                Pair.of(CDSHelper.GRID_TITLE_DEMO,
                        Arrays.asList("Subject Id", "Study Name", "Treatment Summary", "Sex at birth")),
                Pair.of(CDSHelper.GRID_TITLE_ICS,
                        Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days", "Antigen name", "Antigens aggregated"))
        ));
        exported.setFilterTitles(Arrays.asList("Demographics",
                "",
                "",
                "Intracellular Cytokine Staining",
                "",
                "",
                "",
                "",
                "Subject (Race)"));
        exported.setFilterValues(Arrays.asList("Sex at birth = Male",
                "",
                "",
                "Data summary level: Protein Panel",
                "Functional marker name: IL2/ifngamma",
                "Magnitude (% cells) - Background subtracted >= 1",
                "",
                "",
                "Subjects related to any: Asian"));
        exported.setStudyNetworks(Arrays.asList("HVTN", "HVTN"));
        exported.setStudies(Arrays.asList("ZAP 134", "ZAP 117"));
        exported.setAssays(Arrays.asList("HIV Neutralizing Antibody",
                "HIV Neutralizing Antibody",
                "Intracellular Cytokine Staining",
                "Intracellular Cytokine Staining"));
        exported.setAssayProvenances(Arrays.asList("LabKey dataset",
                "VISC analysis dataset",
                "VISC analysis dataset",
                "VISC analysis dataset"));
        exported.setFieldLabels(Arrays.asList("Subject Id",
                "Study Name",
                "Treatment Summary",
                "Sex at birth",
                "Antigen name",
                "Antigens aggregated",
                "Cell type",
                "Data summary level",
                "Functional marker name",
                "Lab ID",
                "Magnitude (% cells) - Background subtracted",
                "Peptide Pool",
                "Protein",
                "Protein panel",
                "Specimen type",
                "Data summary level",
                "Initial dilution",
                "Lab ID",
                "Specimen type",
                "Target cell",
                "Titer ID50",
                "Virus name"));
        grid.verifyCDSExcel(exported, false);
        grid.verifyCDSCSV(exported);
    }

    @Test
    public void verifyGridWithPlotAndFilters()
    {
        log("Verify Grid with gridbase field filters.");
        cds.openStatusInfoPane("Studies");
        String studyMember = "RED 5";
        cds.selectInfoPaneItem(studyMember, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember));

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        sleep(5000);
        DataGrid grid = new DataGrid(this);
        assertTrue(GRID_COL_SUBJECT_ID + " column facet is not as expected", grid.isHasData(GRID_COL_SUBJECT_ID, "r5-120"));
        assertTrue(GRID_COL_SUBJECT_ID + " column facet is not as expected", grid.isNoData(GRID_COL_SUBJECT_ID, "q1-001"));

        log("Create a plot with Study on X axis.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        YAxisVariableSelector yAxis = new YAxisVariableSelector(this);
        XAxisVariableSelector xAxis = new XAxisVariableSelector(this);

        yAxis.openSelectorWindow();
        yAxis.pickSource(CDSHelper.ICS);
        yAxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yAxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xAxis.openSelectorWindow();
        xAxis.pickSource(CDSHelper.TIME_POINTS);
        xAxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xAxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        CDSPlot cdsPlot = new CDSPlot(this);

        assertTrue("Plot is not rendered as expected.", cdsPlot.hasStudyAxis());

        cds.ensureNoFilter();
        cds.ensureNoSelection();

        log("Verify Grid with filters.");
        setUpGridStep1();

        log("Validate expected columns are present.");
        grid.goToDataTab(CDSHelper.TITLE_ICS);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);

        log("Validating grid counts");
        _asserts.assertFilterStatusCounts(159, 13, 1, 3, 45);
        grid.assertPageTotal(27);

        setUpGridStep2(true);

        _asserts.assertFilterStatusCounts(2, 2, 1, 3, 2);
        grid.assertPageTotal(1);
        grid.goToDataTab(CDSHelper.GRID_TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_VIRUS_NAME);
        grid.assertRowCount(13);
        grid.goToDataTab(CDSHelper.GRID_TITLE_ICS);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        grid.assertRowCount(2);

        log("Remove the plot and validate that the columns stay the same, but the counts could change.");
        cds.clearFilter(0);
        _asserts.assertFilterStatusCounts(2, 2, 1, 3, 2);
        grid.assertPageTotal(1);
        grid.goToDataTab(CDSHelper.GRID_TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_VIRUS_NAME);
        grid.assertRowCount(13);
        grid.goToDataTab(CDSHelper.GRID_TITLE_ICS);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        grid.assertRowCount(4);

        cds.goToAppHome();
        cds.clearFilters();
    }

    private void setUpGridStep1()
    {
        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        cds.goToSummary();
        cds.clickBy(CDSHelper.SUBJECT_CHARS);
        cds.pickSort("Race");
        cds.selectBars(CDSHelper.RACE_ASIAN);

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
        sleep(1000);

    }

    private void setUpGridStep2(boolean verifyGrid)
    {
        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        log("Applying a column filter.");
        grid.goToDataTab(CDSHelper.TITLE_ICS);
        grid.setFilter(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, "Is Greater Than or Equal To", "1");
        sleep(1000); // There is a brief moment where the grid refreshes because of filters applied in the grid.

        if (verifyGrid)
        {
            _asserts.assertFilterStatusCounts(4, 3, 1, 3, 3);
            grid.assertPageTotal(1);
            grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        }

        log("Go back to the grid and apply a color to it. Validate it appears as a column.");
        // Can't use CDSHelper.NavigationLink.Grid.makeNavigationSelection. It expects that it will be going to a blank plot.
        click(CDSHelper.NavigationLink.PLOT.getLinkLocator());

        sleep(1000); // There is a brief moment where the grid refreshes because of filters applied in the grid.

        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_SEX);
        coloraxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        sleep(1000); // There is a brief moment where the grid refreshes because of filters applied in the grid.

        grid.goToDataTab(CDSHelper.GRID_TITLE_DEMO);
        if (verifyGrid)
        {
            log("Validate new column added to grid.");
            grid.ensureSubjectCharacteristicsColumnsPresent(CDSHelper.DEMO_SEX);
        }

        log("Filter on new column.");
        grid.setCheckBoxFilter(CDSHelper.DEMO_SEX, true, "Male");
        sleep(1000); // There is a brief moment where the grid refreshes because of filters applied in the grid.
        if (verifyGrid)
        {
            _asserts.assertFilterStatusCounts(2, 2, 1, 3, 2);
            grid.assertRowCount(2);
        }

        log("Now add a new column to the mix.");
        gridColumnSelector.addGridColumn(CDSHelper.NAB, GRID_TITLE_NAB, CDSHelper.NAB_TITERID50, false, true);

        _ext4Helper.waitForMaskToDisappear();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        sleep(1000);
    }

    @Test
    public void verifyGridTabsAndColumns()
    {
        /*
         *                          Default Study And Time  | Added Study And Treatment | Added Time | Subject Characteristics
         * Study And Treatment      Y                           Y                           N           N
         * Subject Characteristics  N (demographics version)    Y                           N           Y
         * Assays                   Y                           N                           Y           N
         */

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        log("Verify Default Grid: " + CDSHelper.GRID_TITLE_STUDY_TREATMENT);
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        Locator.XPathLocator activeTabLoc = DataGrid.Locators.getActiveHeader(CDSHelper.GRID_TITLE_STUDY_TREATMENT);
        waitForElement(activeTabLoc);
        grid.ensureColumnsPresent(); // verify default columns

        log("Verify grid with added study and treatment columns");
        gridColumnSelector.addGridColumn(CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_NETWORK, true, true);
        gridColumnSelector.confirmSelection();
        sleep(2000);
        assertTrue("Grid tabs are not as expected", grid.isDataTabsEquals(Arrays.asList(CDSHelper.GRID_TITLE_STUDY_TREATMENT)));
        grid.ensureColumnsPresent(CDSHelper.DEMO_NETWORK);

        log("Verify grid with added assay columns");
        gridColumnSelector.addGridColumn(CDSHelper.NAB, GRID_TITLE_NAB, CDSHelper.NAB_ASSAY, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.NAB, GRID_TITLE_NAB, CDSHelper.NAB_LAB, false, true);
        assertTrue("Grid tabs are not as expected", grid.isDataTabsEquals(Arrays.asList(CDSHelper.GRID_TITLE_STUDY_TREATMENT, CDSHelper.GRID_TITLE_NAB)));
        grid.goToDataTab(GRID_TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB);

        log("Verify grid with subject characteristics and time point columns");
        gridColumnSelector.addGridColumn(CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_SEX, true, true);
        gridColumnSelector.addGridColumn(CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_RACE, false, true);
        assertTrue("Grid tabs are not as expected", grid.isDataTabsEquals(Arrays.asList(CDSHelper.GRID_TITLE_STUDY_TREATMENT, CDSHelper.GRID_TITLE_DEMO, CDSHelper.GRID_TITLE_NAB)));
        gridColumnSelector.addGridColumn(CDSHelper.TIME_POINTS, CDSHelper.TIME_POINTS_MONTHS, true, true);
        gridColumnSelector.confirmSelection();
        sleep(2000);

        assertTrue("Grid tabs are not as expected", grid.isDataTabsEquals(Arrays.asList(CDSHelper.GRID_TITLE_STUDY_TREATMENT, CDSHelper.GRID_TITLE_DEMO, CDSHelper.GRID_TITLE_NAB)));

        // go to another page and come back to grid
        cds.goToSummary();
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        assertEquals("Grid tab selection should not have changed", GRID_TITLE_NAB, grid.getActiveDataTab());
        grid.ensureColumnsPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.TIME_POINTS_MONTHS);

        log("Verify subject characteristics and study treatment columns are not added to assay tabs");
        grid.assertColumnsNotPresent(CDSHelper.DEMO_SEX, CDSHelper.DEMO_RACE, CDSHelper.DEMO_NETWORK);

        log("Verify assay and time columns are not added to subject characteristics tab");
        grid.goToDataTab(CDSHelper.GRID_TITLE_DEMO);
        grid.ensureSubjectCharacteristicsColumnsPresent(CDSHelper.DEMO_SEX, CDSHelper.DEMO_RACE, CDSHelper.DEMO_NETWORK);
        grid.assertColumnsNotPresent(CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.TIME_POINTS_MONTHS);

        log("Verify subject characteristics columns are not added to study and treatment tab");
        grid.goToDataTab(CDSHelper.GRID_TITLE_STUDY_TREATMENT);
        grid.assertColumnsNotPresent(CDSHelper.DEMO_SEX, CDSHelper.DEMO_RACE);
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

        YAxisVariableSelector yAxis = new YAxisVariableSelector(this);
        XAxisVariableSelector xAxis = new XAxisVariableSelector(this);
        ColorAxisVariableSelector colorAxis = new ColorAxisVariableSelector(this);

        yAxis.openSelectorWindow();
        yAxis.pickSource(CDSHelper.NAB);
        yAxis.pickVariable(CDSHelper.NAB_TITERID50);
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
        grid.goToDataTab(CDSHelper.TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50);
        grid.goToDataTab(CDSHelper.TITLE_ICS);
        grid.ensureColumnsPresent(CDSHelper.ICS_ANTIGEN);
        grid.goToDataTab(CDSHelper.SUBJECT_CHARS);
        grid.ensureSubjectCharacteristicsColumnsPresent(CDSHelper.DEMO_RACE);

        gridColumnSelector.openSelectorWindow();
        Map<String, Boolean> columns = new HashMap<>();
        columns.put(CDSHelper.ICS_ANTIGEN, false);
        columns.put(CDSHelper.NAB_TITERID50, false);
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
        oneColumn.put(CDSHelper.NAB_TITERID50, false);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.NAB, oneColumn);
        oneColumn.clear();

        log("Now add a new column to the mix.");
        gridColumnSelector.pickSource(CDSHelper.ICS);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-grid-cell-inner')][text()='" + CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB + "']"));

        log("Validate that Current columns are as expected and enabled or not as appropriate.");
        columns.put(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, true);
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_CUR_COL, columns);
        log("Validate that All columns are as expected and enabled or not as appropriate.");
        gridColumnSelectorValidator(gridColumnSelector, CDSHelper.GRID_COL_ALL_VARS, columns);

        gridColumnSelector.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        grid.goToDataTab(CDSHelper.TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50);
        grid.goToDataTab(CDSHelper.TITLE_ICS);
        grid.ensureColumnsPresent(CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        grid.goToDataTab(CDSHelper.SUBJECT_CHARS);
        grid.ensureSubjectCharacteristicsColumnsPresent(CDSHelper.DEMO_RACE);

        log("Filter on added column, check to make sure it is now 'locked' in the selector.");
        grid.goToDataTab(CDSHelper.TITLE_ICS);
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

        grid.goToDataTab(CDSHelper.TITLE_NAB);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50);
        grid.goToDataTab(CDSHelper.TITLE_ICS);
        grid.ensureColumnsPresent(CDSHelper.ICS_ANTIGEN);
        grid.goToDataTab(CDSHelper.SUBJECT_CHARS);
        grid.ensureSubjectCharacteristicsColumnsPresent(CDSHelper.DEMO_RACE);

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

        expectedText = "ICS (Intracellular Cytokine Staining)\n  Magnitude (% cells) - Background subtracted\n  Antigen name\n  Antigens aggregated\n  Cell type\n  Data summary level\n  Functional marker name\n" +
                "  Lab ID\n  Peptide Pool\n  Protein\n  Protein panel\n  Specimen type\nNAb (Neutralizing antibody)\n  Titer ID50\nStudy and treatment variables\n  Study Name\n  Treatment Summary\n" +
                "Subject characteristics\n  Race\n  Subject Id\nTime points\n  Study days";
        expectedTextClean = expectedText.toLowerCase().replaceAll("\\n", "");
        expectedTextClean = expectedTextClean.replaceAll("\\s+", "");

        assertTrue("Values not as expected in all variables. Expected: '" + expectedText + "' Actual: '" + selectorText + "'.", expectedTextClean.equals(selectorTextClean));

        gridColumnSelector.pickSource(CDSHelper.GRID_COL_CUR_COL);
        selectorText = Locator.xpath("//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]").findElement(getDriver()).getText();
        selectorText = selectorText.trim();

        assertTrue("Expected no text in Current columns. Found: '" + selectorText + "'.", selectorText.equals("Study and treatment variables\n  Study Name\n  Treatment Summary\nSubject characteristics\n" +
                "  Subject Id\nTime points\n  Study days"));

        gridColumnSelector.confirmSelection();

        log("Validating treatment and study variables");
        gridColumnSelector.openSelectorWindow();
        gridColumnSelector.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-column-header-checkbox')]"));
        gridColumnSelector.confirmSelection();
        sleep(500); //Wait for mask to appear.
        _ext4Helper.waitForMaskToDisappear();

        grid.ensureColumnsPresent();

        columns.clear();
        columns.put(CDSHelper.DEMO_STUDY_NAME, false);
        columns.put(CDSHelper.DEMO_TREAT_SUMM, false);
        columns.put(CDSHelper.DEMO_DATE_SUBJ_ENR, true);
        columns.put(CDSHelper.DEMO_DATE_FUP_COMP, true);
        columns.put(CDSHelper.DEMO_DATE_PUB, true);
        columns.put(CDSHelper.DEMO_DATE_START, true);
        columns.put(CDSHelper.DEMO_NETWORK, true);
        columns.put(CDSHelper.DEMO_STRATEGY, true);
        columns.put(CDSHelper.DEMO_PI, true);
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
    public void verifyPKPlotGrid()
    {
        goToProjectHome();
        cds.enterApplication();

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_WHITE);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Plot PK MAb");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.PKMAB);
        yaxis.pickVariable(CDSHelper.PKMAB_CONCENTRATION);
        yaxis.confirmSelection();

        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        sleep(5000);
        DataGrid grid = new DataGrid(this);

        log("Validate additional mab and visit columns are present in grid.");
        grid.goToDataTab(CDSHelper.TITLE_PKMAB);
        grid.ensureColumnsPresent(CDSHelper.PKMAB_MAB_LABEL, CDSHelper.PKMAB_MAB_ID, CDSHelper.PKMAB_VISIT_CODE, CDSHelper.PKMAB_VISIT_DESC);

        log("Verify PKMAb grid export");
        CDSExport exported = new CDSExport(Arrays.asList(Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT, 80),
                Pair.of(CDSHelper.TITLE_PKMAB, 116)));
        exported.setDataTabHeaders(Arrays.asList(
                Pair.of(CDSHelper.GRID_TITLE_STUDY_TREATMENT,
                        Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days")),
                Pair.of(CDSHelper.TITLE_PKMAB,
                        Arrays.asList("Subject Id", "Study", "Treatment Summary", "Study days", "Data summary level", "Lab ID",
                                "MAb concentration", "MAb or mixture id", "MAb or mixture label", "MAb or mixture standardized name",
                                "Source assay", "Specimen type", "Visit code", "Visit description"))
        ));

        exported.setStudyNetworks(Arrays.asList("HVTN"));
        exported.setAssays(Arrays.asList("Monoclonal Antibody Pharmacokinetics"));
        exported.setAssayProvenances(Arrays.asList("VISC analysis dataset"));
        exported.setFieldLabels(Arrays.asList("Data summary level", "Lab ID", "MAb concentration", "MAb or mixture id",
                "MAb or mixture label", "MAb or mixture standardized name", "Source assay", "Specimen type", "Visit code", "Visit description"));
        grid.verifyCDSExcel(exported, false);
    }

}
