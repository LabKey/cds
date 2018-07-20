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
package org.labkey.test.pages.cds;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.junit.Assert;
import org.labkey.api.util.Pair;
import org.labkey.api.writer.ZipUtil;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.util.ExcelHelper;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertTrue;

public class DataGrid
{
    protected BaseWebDriverTest _test;

    public DataGrid(BaseWebDriverTest test)
    {
        _test = test;
    }

    public String getActiveDataTab()
    {
        return Locators.tabHeaderContainer.append(Locators.activeHeader).findElement(_test.getDriver()).getText();
    }

    public boolean hasDataTab(String tabName)
    {
        Locator tabLoc = Locators.tabHeaderContainer.append(Locators.header.withText(tabName));
        _test.sleep(1000);
        return _test.isElementPresent(tabLoc);
    }

    public List<String> getDataTabs()
    {
        List<String> tabs = new ArrayList<>();
        Locator tabLoc = Locators.tabHeaderContainer.append(Locators.header);
        tabLoc.findElements(_test.getDriver()).forEach(element -> tabs.add(element.getText()));
        return tabs;
    }

    public boolean isDataTabsEquals(List<String> expected)
    {
        List<String> actual = getDataTabs();
        if (expected.size() != actual.size())
            return false;
        for (int i = 0; i < expected.size(); i++)
        {
            if (!expected.get(i).equals(actual.get(i)))
                return false;
        }
        return true;
    }

    public void goToDataTab(String tabName)
    {
        Locator.XPathLocator activeTabLoc = Locators.getActiveHeader(tabName);
        if (!_test.isElementPresent(activeTabLoc))
        {
            Locator tabLoc = Locators.tabHeaderContainer.append(Locators.header.withText(tabName));
            _test.waitForElement(tabLoc);
            _test.click(tabLoc);
            WebElement activeTabHeader = activeTabLoc.waitForElement(_test.getDriver(), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
            _test.shortWait().until(ExpectedConditions.visibilityOf(activeTabHeader));
            _test._ext4Helper.waitForMaskToDisappear();
        }
        _test.sleep(1000);
    }

    public void assertColumnsNotPresent(String... columns)
    {
        for (String column : columns)
            _test.assertElementNotPresent(Locators.columnHeaderLocator(column));
    }

    public void ensureColumnsPresent(String... columns)
    {
        ensureColumnsPresent(false, columns);
    }

    public void ensureSubjectCharacteristicsColumnsPresent(String... columns)
    {
        ensureColumnsPresent(true, columns);
    }

    public void ensureColumnsPresent(boolean isSubjectCharacteristics, String... columns)
    {
        String[] defaultColumns = getDefaultColumns(isSubjectCharacteristics);

        for (String column : defaultColumns)
            _test.waitForElement(Locators.columnHeaderLocator(column));

        for (String column : columns)
            _test.waitForElement(Locators.columnHeaderLocator(column));

    }

    public String[] getDefaultColumns(boolean isSubjectCharacteristics)
    {
        if (isSubjectCharacteristics)
        {
            return new String[]{
                    CDSHelper.GRID_COL_SUBJECT_ID, "Study Name", CDSHelper.GRID_COL_TREATMENT_SUMMARY
            };

        }

        return new String[]{
                CDSHelper.GRID_COL_SUBJECT_ID, CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY, CDSHelper.GRID_COL_STUDY_DAY
        };
    }

    public boolean isColumnFiltered(String columnHeaderName)
    {
        return _test.isElementPresent(Locators.filteredColumnHeaderLocator(columnHeaderName));
    }

    @LogMethod(quiet = true)
    public void openFilterPanel(@LoggedParam String columnHeaderName)
    {
        Locator.XPathLocator columnHeader = Locators.columnHeaderLocator(columnHeaderName);
        Locator.XPathLocator filterIcon = columnHeader.append(Locator.tagWithClass("div", "x-column-header-trigger"));
        _test.waitForElement(filterIcon);
        _test.scrollIntoView(filterIcon);
        _test.mouseOver(filterIcon);
        Locator.XPathLocator hoveredColumn = columnHeader.append("[contains(concat(' ',normalize-space(@class),' '), ' x-column-header-over ')]");
        _test.waitForElement(hoveredColumn);
        _test.click(filterIcon);
        _test._ext4Helper.waitForMask();
        // Sometimes the tooltip sticks around, wait for it's style to change.
        _test.waitForElement(Locator.tagWithId("div", "ext-quicktips-tip").append("[contains(@style, 'display: none')]"), 10000);
    }

    public void setCheckBoxFilter(String columnName, Boolean clearFirst, String... values)
    {

        String cellXpathContst = "//div[contains(@class, 'x-window-filterwindow')]//tr[contains(@class, 'x-grid-data-row')]//td[contains(@role, 'gridcell')]//div[text()='*']";
        String cellXpath;

        openFilterPanel(columnName);
        _test.shortWait().until(LabKeyExpectedConditions.animationIsDone(Locator.xpath("//div[contains(@class, 'x-window-filterwindow')]//div[contains(@class, 'x-toolbar-text')][text()='" + columnName + "']")));

        if(clearFirst)
        {
            String allXpath = "//div[contains(@class, 'x-window-filterwindow')]//div[contains(@class, 'x-column-header')]";
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath(allXpath)));
            _test.scrollIntoView(Locator.xpath(allXpath));
            _test.click(Locator.xpath(allXpath));
        }

        for(String val : values)
        {
            cellXpath = cellXpathContst.replaceAll("[*]", val);
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath(cellXpath)));
            _test.scrollIntoView(Locator.xpath(cellXpath));
            _test.click(Locator.xpath(cellXpath));
        }

        applyAndWaitForGrid(() -> _test.click(CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn")));

    }

    public void setFilter(String columnName, String value)
    {
        setFilter(columnName, null, value);
    }

    @LogMethod
    public void setFilter(@LoggedParam String columnName, @LoggedParam String filter, @LoggedParam String value)
    {
        openFilterPanel(columnName);
        Locator filterBtn = CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn");
        _test.scrollIntoView(filterBtn);
        if (null != filter)
            _test._ext4Helper.selectComboBoxItem("Value:", filter);

        _test.waitForElement(Locator.id("value_1"));
        _test.setFormElement(Locator.css("#value_1 input"), value);
        applyAndWaitForGrid(() -> _test.click(filterBtn));
        _test.waitForElement(CDSHelper.Locators.filterMemberLocator(columnName));
    }

    @LogMethod
    public void setFacet(@LoggedParam String columnName, @LoggedParam String label)
    {
        openFilterPanel(columnName);

        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");
        Locator.XPathLocator row = gridLoc.append(Locator.tagWithClass("div", "x-grid-cell-inner").containing(label));

        _test.waitAndClick(10000, row, 0);

        Locator.XPathLocator update = CDSHelper.Locators.cdsButtonLocator("Update", "filter-btn");
        Locator.XPathLocator filter = CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn");

        List<WebElement> buttons = new ArrayList<>();
        buttons.addAll(update.findElements(_test.getDriver()));
        buttons.addAll(filter.findElements(_test.getDriver()));

        Assert.assertEquals("Error getting filter/update button", 1, buttons.size());

        final WebElement button = buttons.get(0);

        applyAndWaitForGrid(() -> {
            button.click();
            _test.sleep(500);
            _test._ext4Helper.waitForMaskToDisappear();
        });
    }

    @LogMethod
    public void clearFilters(@LoggedParam String columnName)
    {
        openFilterPanel(columnName);
        applyAndWaitForGrid(() -> _test.waitAndClick(CDSHelper.Locators.cdsButtonLocator("Clear", "filter-btn")));
        _test.waitForElement(Locators.sysmsg.containing("Filter removed."));
    }

    @LogMethod
    public void assertRowCount(int expCount)
    {
        if (expCount <= 25)
        {
            _test.waitForElements(Locators.dataRow, expCount);
            return;
        }
        int expectedPage = (int) Math.ceil(expCount / 25.0);
        assertPageTotal(expectedPage);
    }

    @LogMethod
    public void verifyCDSExcel(CDSExport expected, boolean countOnly)
    {
        File export = exportExcel();
        verifyExcelRowCount(expected, export);

        if (countOnly)
            return;

        verifyExcelTabHeaders(export, expected);
        verifyExportedMetadata(export, expected);
        verifyExportedStudies(export, expected);
        verifyExportedAssays(export, expected);
        verifyExportedVariables(export, expected);
    }

    private void verifyExcelTabHeaders(File export, CDSExport excel)
    {
        try
        {
            Workbook wb = ExcelHelper.create(export);
            List<Pair<String, List<String>>> tabHeaders = excel.getDataTabHeaders();
            if (tabHeaders != null)
            {
                for (int i = 0; i < tabHeaders.size(); i++)
                {
                    Pair<String, List<String>> tabHeader = tabHeaders.get(i);
                    String tabName = tabHeader.first;
                    List<String> expHeaders = tabHeader.second;
                    Sheet sheet = wb.getSheet(tabName);
                    verifyHeaderValues(sheet, expHeaders);
                }
            }
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    private void verifyHeaderValues(Sheet sheet, List<String> headerValues)
    {
        if (headerValues == null)
            return;
        String cellValue;
        Row headerRow = sheet.getRow(0);

        for (int i = 0; i < headerValues.size(); i++)
        {
            cellValue = headerRow.getCell(i).getStringCellValue();
            Assert.assertEquals(sheet.getSheetName() + " header is not as expected", headerValues.get(i), cellValue);
        }
    }

    private void verifyExportedVariables(File export, CDSExport excel)
    {
        try
        {
            Workbook wb = ExcelHelper.create(export);
            Sheet sheet = wb.getSheetAt(excel.getVariablesSheetIndex());
            verifySheetName(sheet,"Variable definitions");

            List<String> fieldLabels = excel.getFieldLabels();
            verifyColumnValues(sheet, fieldLabels, "Field label", 1);
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    private void verifyExportedAssays(File export, CDSExport excel)
    {
        try
        {
            Workbook wb = ExcelHelper.create(export);
            Sheet sheet = wb.getSheetAt(excel.getAssaysSheetIndex());
            verifySheetName(sheet,"Assays");

            List<String> assays = excel.getAssays();
            List<String> assayProvenances = excel.getAssayProvenances();
            verifyColumnValues(sheet, assays, "Assay Name", 1);
            verifyColumnValues(sheet, assayProvenances, "Data provenance - source", 2);
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    private void verifyExportedStudies(File export, CDSExport excel)
    {
        try
        {
            Workbook wb = ExcelHelper.create(export);
            Sheet sheet = wb.getSheetAt(excel.getStudiesSheetIndex());
            verifySheetName(sheet,"Studies");

            List<String> studyNetworks = excel.getStudyNetworks();
            List<String> studies = excel.getStudies();
            verifyColumnValues(sheet, studyNetworks, "Network", 0);
            verifyColumnValues(sheet, studies, "Study", 1);
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    private void verifyColumnValues(Sheet sheet, List<String> columnValues, String columnTitle, int columnIndex)
    {
        if (columnValues == null)
            return;
        String cellValue;
        cellValue = sheet.getRow(0).getCell(columnIndex).getStringCellValue();
        Assert.assertEquals("Column title is not as expected", columnTitle, cellValue);
        for (int i = 0; i < columnValues.size(); i++)
        {
            cellValue = sheet.getRow(i + 1).getCell(columnIndex).getStringCellValue();
            Assert.assertEquals(columnTitle + " is not as expected", columnValues.get(i), cellValue);
        }
    }

    @LogMethod
    private void verifyExportedMetadata(File export, CDSExport excel)
    {
        try
        {
            Workbook wb = ExcelHelper.create(export);
            Sheet sheet = wb.getSheetAt(excel.getMetadataSheetIndex());

            verifySheetName(sheet,"Metadata");
            verifyTOC(sheet);
            verifyFilters(sheet, excel);
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    @LogMethod
    private void verifySheetName(Sheet sheet, String expectedName)
    {
        Assert.assertEquals("Sheet name is not as expected", expectedName, sheet.getSheetName());
    }

    @LogMethod
    private void verifyFilters(Sheet sheet, CDSExport excel)
    {
        int startingRow = excel.getFilterStartRow();
        List<String> filterTitles = excel.getFilterTitles();
        List<String> filterValues = excel.getFilterValues();
        String cellValue;
        if (filterTitles != null)
            for (int i = 0; i < filterTitles.size(); i++)
            {
                if (StringUtils.isEmpty(filterTitles.get(i)))
                    continue;
                cellValue = sheet.getRow(i + startingRow).getCell(1).getStringCellValue();
                Assert.assertEquals("Filter title is not as expected", filterTitles.get(i), cellValue);
            }
        startingRow = excel.getFilterStartRow() + 1;
        if (filterValues != null)
            for (int i = 0; i < filterValues.size(); i++)
            {
                if (StringUtils.isEmpty(filterValues.get(i)))
                    continue;
                cellValue = sheet.getRow(i + startingRow).getCell(2).getStringCellValue();
                Assert.assertEquals("Filter value is not as expected", filterValues.get(i), cellValue);
            }
    }

    @LogMethod
    private void verifyTOC(Sheet sheet)
    {
        String cellValue = sheet.getRow(0).getCell(0).getStringCellValue();
        Assert.assertEquals("TOC is not as expected", CDSExport.TOCS.get(0).get(0), cellValue);

        for (int i = 1; i < 4; i++)
        {
            cellValue = sheet.getRow(i).getCell(1).getStringCellValue();
            Assert.assertEquals("TOC is note as expected", CDSExport.TOCS.get(i).get(1), cellValue);
        }
    }

    @LogMethod
    public void verifyExcelRowCount(CDSExport expectedExcel, File exported)
    {
        List<Pair<String, Integer>> dataTabCounts = expectedExcel.getDataTabCounts();
        List<String> missingDataFiles = new ArrayList<>();
        dataTabCounts.forEach(pair -> missingDataFiles.add(pair.first));
        for (int i = 0; i < dataTabCounts.size(); i++)
        {
            Pair<String, Integer> dataTabCount = dataTabCounts.get(i);
            String tab = dataTabCount.first;
            int expCount = dataTabCount.second;
            int exportedCount = getExportRowCount(exported, i, tab);
            Assert.assertEquals("Wrong number of rows in export.", expCount, exportedCount);
        }
    }

    @LogMethod
    public int getExportRowCount(File export, int tabIndex, String expectedName)
    {
        try
        {
            Workbook wb = ExcelHelper.create(export);
            Sheet sheet = wb.getSheetAt(tabIndex);
            if (expectedName != null)
                Assert.assertEquals("Sheet name not as expected: ", expectedName, sheet.getSheetName());
            return sheet.getLastRowNum(); // +1 for zero-based, -1 for header row
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    public void assertPageTotal(int pages)
    {
        _test.waitForElement(Locators.totalPages.containing(Integer.toString(pages)));
    }

    public void assertCurrentPage(int page)
    {
        _test.assertElementContains(Locators.currentPage, Integer.toString(page));
    }

    public void assertSortPresent(String columnName)
    {
        _test.waitForElement(Locator.tagWithClassContaining("div", "x-column-header-sort-").withText(columnName));
    }

    public void assertCellContent(String content)
    {
        _test.waitForElement(Locators.cellLocator(content));
    }

    @LogMethod
    public void sort(@LoggedParam final String columnName)
    {
        applyAndWaitForGrid(() -> {
            _test.click(Locators.columnHeaderLocator(columnName));
            _test.sleep(500);
            _test._ext4Helper.waitForMaskToDisappear();
        });
        assertSortPresent(columnName);
    }

    public File exportExcel()
    {
        return exportGrid(true);
    }

    public File exportCSV()
    {
        return exportGrid(false);
    }

    public File exportGrid(boolean isExcel)
    {
        return _test.clickAndWaitForDownload(Locator.css("a." + (isExcel ? "gridexportexcelbtn" : "gridexportcsvbtn")));
    }

    private void verifyExportedCSVContent(File export, List<String> expectedContent)
    {
        String exportedContent = TestFileUtils.getFileContents(export);
        for (String expectedFragment : expectedContent)
        {
            assertTrue("Exported file doesn't contain " + expectedFragment, exportedContent.contains(expectedFragment));
        }
    }

    private int getExportedCSVRowCount(File export) throws IOException
    {
        BufferedReader bufferedReader = new BufferedReader(new FileReader(export));
        String input;
        int rowCount = 0;
        while((input = bufferedReader.readLine()) != null)
        {
            rowCount++;
        }
        return rowCount;
    }

    @LogMethod
    public void verifyCDSCSV(CDSExport expected) throws IOException
    {
        File dir = TestFileUtils.getTestTempDir();
        dir.mkdirs();

        File exportedZip = exportCSV();

        List<String> missingDataFiles = new ArrayList<>();
        expected.getDataTabCounts().forEach(pair -> missingDataFiles.add(pair.first));

        for (File file : ZipUtil.unzipToDirectory(exportedZip, dir))
        {
            String filename = file.getName();
            if ("Metadata.txt".equals(filename))
            {
                CDSExport.TOCS.forEach(expectedContent -> verifyExportedCSVContent(file, expectedContent));
                if (expected.getFilterTitles() != null)
                    verifyExportedCSVContent(file, expected.getFilterTitles());
                if (expected.getFilterValues() != null)
                    verifyExportedCSVContent(file, expected.getFilterValues());
            }
            else if ("Studies.csv".equals(filename))
            {
                verifyExportedCSVContent(file, expected.getStudyNetworks());
                verifyExportedCSVContent(file, expected.getStudies());
            }
            else if ("Assays.csv".equals(filename))
            {
                verifyExportedCSVContent(file, expected.getAssays());
                verifyExportedCSVContent(file, expected.getAssayProvenances());
            }
            else if ("Variable definitions.csv".equals(filename))
            {
                verifyExportedCSVContent(file, expected.getFieldLabels());
            }
            else
            {
                for (Pair<String, Integer> dataCount :expected.getDataTabCounts())
                {
                    String dataName = dataCount.first;
                    int expCount = dataCount.second;
                    if (filename.equals(dataName + ".csv"))
                    {
                        missingDataFiles.remove(dataName);
                        int exportedCount = getExportedCSVRowCount(file) - 1;
                        Assert.assertEquals("Wrong number of rows for " + dataName, expCount, exportedCount);
                    }
                }
                if (expected.getDataTabHeaders() != null)
                {
                    for (Pair<String, List<String>> header :expected.getDataTabHeaders())
                    {
                        String dataName = header.first;
                        List<String> expHeaders = header.second;
                        if (filename.equals(dataName + ".csv"))
                        {
                            verifyExportedCSVContent(file, expHeaders);
                        }
                    }
                }
            }
        }
        Assert.assertTrue("Expected files missing from export: " + StringUtils.join(missingDataFiles), missingDataFiles.isEmpty());
    }

    public void applyAndWaitForGrid(Runnable function)
    {
        WebElement gridView = Locators.grid.append(Locator.css("table.x-grid-table")).findElement(_test.getDriver());

        function.run();

        _test.longWait().until(ExpectedConditions.stalenessOf(gridView));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void goToLastPage() {
        _test.click(Locators.lastPage);
        _test.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void goToFirstPage() {
        _test.click(Locators.firstPage);
    }

    public void clickPreviousBtn() {
        _test.click(Locators.previousBtn);
        _test.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void clickNextBtn() {
        _test.click(Locators.nextBtn);
        _test.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void goToPreviousPage() {
        _test.click(Locators.previousPage);
        _test.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void goToNextPage() {
        _test.click(Locators.nextPage);
        _test.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public static class Locators
    {
        public static Locator.CssLocator grid = Locator.css("div.connector-grid");
        public static Locator.CssLocator dataRow = grid.append(Locator.css("tr.x-grid-data-row"));
        public static Locator.CssLocator sysmsg = Locator.css("div.sysmsg");
        public static Locator.CssLocator totalPages = Locator.css("span.x-btn-inner.x-btn-inner-center");
        public static Locator.CssLocator currentPage = Locator.css("a.x-btn-paging-widget-pages-small.selected span.x-btn-inner");
        public static Locator.CssLocator lastPage = Locator.css("a.pager-last");
        public static Locator.CssLocator firstPage = Locator.css("a.pager-first");
        public static Locator.CssLocator previousBtn = Locator.css("a.paging-back-button");
        public static Locator.CssLocator nextBtn = Locator.css("a.paging-next-button");
        public static Locator.CssLocator previousPage = Locator.css("a.pager-previous");
        public static Locator.CssLocator nextPage = Locator.css("a.pager-next");
        public static Locator.XPathLocator header = Locator.tag("h1").withClass("lhdv");
        public static Locator.XPathLocator activeHeader = header.withClass("active");
        public static Locator.XPathLocator tabHeaderContainer = Locator.tag("div").withClass("grid-tab-selector");

        public static Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "x-column-header-inner").withText(columnHeaderName);
        }

        public static Locator.XPathLocator cellLocator(String cellContent)
        {
            return Locator.tagWithClass("div", "x-grid-cell-inner").containing(cellContent);
        }

        public static Locator.XPathLocator getActiveHeader(String tabname)
        {
            return Locators.tabHeaderContainer.append(Locators.activeHeader.withText(tabname));
        }

        public static Locator.XPathLocator filteredColumnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "filtered-column").withText(columnHeaderName);
        }

    }

}
