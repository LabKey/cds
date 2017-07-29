/*
 * Copyright (c) 2016-2017 LabKey Corporation
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

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.CDSExcel;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataGrid;
import org.labkey.test.pages.cds.DataGridVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

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
            _asserts.assertFilterStatusCounts(777, 48, 1, 1, 152); // TODO Test data dependent.
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
        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_TITERID50, false, true);
        grid.ensureColumnsPresent(CDSHelper.NAB_TITERID50);

        if (CDSHelper.validateCounts)
        {
            grid.assertPageTotal(32); // TODO Test data dependent.
            grid.assertRowCount(792); // TODO Test data dependent.
            _asserts.assertFilterStatusCounts(777, 48, 1, 1, 152); // TODO Test data dependent.
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
    public void verifyGridCheckerboarding()
    {
        log("Verify Grid with filters and checkerboarding.");

        DataGrid grid = new DataGrid(this);
        DataGridVariableSelector gridColumnSelector = new DataGridVariableSelector(this, grid);

        log("Filter on race.");
        cds.goToSummary();
        cds.clickBy(CDSHelper.SUBJECT_CHARS);
        cds.pickSort("Race");
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
        _asserts.assertFilterStatusCounts(159, 13, 1, 1, 45);
        grid.assertPageTotal(27);
        CDSExcel exported = new CDSExcel(658);
        exported.setFilterTitles(Arrays.asList("Intracellular Cytokine Staining", "", "", "", "Subject (Race)"));
        exported.setFilterValues(Arrays.asList("Data summary level: Protein Panel", "Functional marker name: IL2/ifngamma", "", "", "Subjects related to any: Asian"));
        exported.setStudyNetworks(Arrays.asList("ROGER", "ROGER", "ROGER", "ZED", "ZED", "ZED", "ZED", "ZED", "ZED", "ZED", "ZED", "ZED", "ZED"));
        exported.setStudies(Arrays.asList("RED 4", "RED 5", "RED 6", "ZAP 102", "ZAP 105", "ZAP 106", "ZAP 134",
                "ZAP 136", "ZAP 113", "ZAP 115", "ZAP 116", "ZAP 117", "ZAP 118"));
        exported.setAssays(Arrays.asList("HIV Binding Antibody", "HIV Neutralizing Antibody", "HIV Neutralizing Antibody", "HIV Neutralizing Antibody", "IFNg ELISpot"));
        exported.setAssayProvenances(Arrays.asList("VISC analysis dataset", "LabKey dataset", "VISC analysis dataset", "VISC analysis dataset", "VISC analysis dataset"));
        exported.setFieldLabels(Arrays.asList("Cell type", "Data summary level", "Functional marker name", "Lab ID", "Magnitude (% cells) - Background subtracted",
                "Peptide Pool", "Protein", "Protein panel", "Specimen type"));
        grid.verifyCDSExcel(exported, false);

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
        gridColumnSelector.addGridColumn(CDSHelper.NAB, CDSHelper.GRID_TITLE_NAB, CDSHelper.NAB_TITERID50, false, true);

        _asserts.assertFilterStatusCounts(2, 2, 1, 1, 2);
        grid.assertPageTotal(1);
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.NAB_TITERID50, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_VIRUS_NAME);
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
        grid.ensureColumnsPresent(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.NAB_TITERID50, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_VIRUS_NAME);
        grid.assertRowCount(17);

        cds.goToAppHome();
        cds.clearFilters();
    }

    // TODO: Still needs work, mainly blocked by issue https://www.labkey.org/issues/home/Developer/issues/details.view?issueId=24128
    @Test //@Ignore
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
        grid.ensureColumnsPresent(CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY,
                CDSHelper.GRID_COL_STUDY_DAY, CDSHelper.ICS_ANTIGEN,
                CDSHelper.NAB_TITERID50, CDSHelper.DEMO_RACE);

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
                CDSHelper.NAB_TITERID50, CDSHelper.DEMO_RACE, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);

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
                CDSHelper.NAB_TITERID50, CDSHelper.DEMO_RACE);

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

        expectedText = "ICS (Intracellular Cytokine Staining)\n  Magnitude (% cells) - Background subtracted\n  Antigen name\n  Cell type\n  Data summary level\n  Functional marker name\n" +
                "  Lab ID\n  Peptide Pool\n  Protein\n  Protein panel\n  Specimen type\nNAb (Neutralizing antibody)\n  Titer ID50\nStudy and treatment variables\n  Study Name\n" +
                "Subject characteristics\n  Race\n  Subject Id\nTime points\n  Study days";
        expectedTextClean = expectedText.toLowerCase().replaceAll("\\n", "");
        expectedTextClean = expectedTextClean.replaceAll("\\s+", "");

        assertTrue("Values not as expected in all variables. Expected: '" + expectedText + "' Actual: '" + selectorText + "'.", expectedTextClean.equals(selectorTextClean));

        gridColumnSelector.pickSource(CDSHelper.GRID_COL_CUR_COL);
        selectorText = Locator.xpath("//div[contains(@class, 'column-axis-selector')]//table[contains(@role, 'presentation')]").findElement(getDriver()).getText();
        selectorText = selectorText.trim();

        assertTrue("Expected no text in Current columns. Found: '" + selectorText + "'.", selectorText.equals("Study and treatment variables\n  Study Name\nSubject characteristics\n" +
                "  Subject Id\nTime points\n  Study days"));

        gridColumnSelector.confirmSelection();

        log("Validating treatment and study variables");
        gridColumnSelector.openSelectorWindow();
        gridColumnSelector.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        click(Locator.xpath("//div[contains(@class, 'column-axis-selector')]//div[contains(@class, 'x-column-header-checkbox')]"));
        gridColumnSelector.confirmSelection();
        sleep(500); //Wait for mask to appear.
        _ext4Helper.waitForMaskToDisappear();

        grid.ensureColumnsPresent(CDSHelper.DEMO_STUDY, CDSHelper.DEMO_TREAT_SUMM);

        columns.clear();
        columns.put(CDSHelper.DEMO_STUDY_NAME, false);
        columns.put(CDSHelper.DEMO_TREAT_SUMM, true);
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

}
