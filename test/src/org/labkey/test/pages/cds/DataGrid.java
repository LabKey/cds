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
package org.labkey.test.pages.cds;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.assertj.core.api.Assertions;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.cds.BaseCdsComponent;
import org.labkey.test.components.cds.CdsGrid;
import org.labkey.test.util.ExcelHelper;
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
import java.util.UUID;

import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.TestLogger.log;

public class DataGrid extends BaseCdsComponent<DataGrid.ElementCache>
{
    private final WebElement _el;

    public DataGrid(WebDriverWrapper test)
    {
        super(test);
        _el = Locator.byClass("connector-grid-container").findWhenNeeded(test.getDriver());
    }

    @Override
    public WebElement getComponentElement()
    {
        return _el;
    }

    public String getActiveDataTab()
    {
        return Locators.tabHeaderContainer.append(Locators.activeHeader).findElement(this).getText();
    }

    public boolean hasDataTab(String tabName)
    {
        Locator tabLoc = Locators.tabHeaderContainer.append(Locators.header.withText(tabName));
        WebDriverWrapper.sleep(1000);
        return getWrapper().isElementPresent(tabLoc);
    }

    public List<String> getDataTabs()
    {
        List<String> tabs = new ArrayList<>();
        Locator tabLoc = Locators.tabHeaderContainer.append(Locators.header);
        tabLoc.findElements(this).forEach(element -> tabs.add(element.getText()));
        return tabs;
    }

    public void goToDataTab(String tabName)
    {
        Locator.XPathLocator activeTabLoc = Locators.getActiveHeader(tabName);
        if (!activeTabLoc.existsIn(this))
        {
            WebElement tabEl = Locators.tabHeaderContainer.append(Locators.header.withText(tabName)).waitForElement(this, 2_000);
            elementCache().grid.applyAndWaitForGrid(() -> {
                        tabEl.click();
                        WebElement activeTabHeader = activeTabLoc.waitForElement(this, BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
                        getWrapper().shortWait().until(ExpectedConditions.visibilityOf(activeTabHeader));
                    });
        }
    }

    public void assertColumnsNotPresent(String... columns)
    {
        Assertions.assertThat(elementCache().grid.getColumnNames()).doesNotContain(columns);
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
        List<String> expectedColumns = new ArrayList<>(List.of(columns));
        expectedColumns.addAll(List.of(getDefaultColumns(isSubjectCharacteristics)));
//        expectedColumns = expectedColumns.stream().map(WordUtils::capitalize).toList();

        Assertions.assertThat(elementCache().grid.getColumnNames()).containsAll(expectedColumns);
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

    public WebElement openFilterPanel(String columnHeaderName)
    {
        return elementCache().grid.openFilterPanel(columnHeaderName);
    }

    public void setCheckBoxFilter(String columnName, Boolean clearFirst, String... values)
    {
        elementCache().grid.setCheckBoxFilter(columnName, clearFirst, values);
    }

    public void setFilter(String columnName, String value)
    {
        elementCache().grid.setFilter(columnName, value);
    }

    public void setFilter(String columnName, String filter, String value)
    {
        elementCache().grid.setFilter(columnName, filter, value);
    }

    public void setFacet(String columnName, String label)
    {
        elementCache().grid.setFacet(columnName, label);
    }

    public boolean isHasData(String columnName, String value)
    {
        return isFacetContains(columnName, true, value);
    }

    public boolean isNoData(String columnName, String value)
    {
        return isFacetContains(columnName, false, value);
    }

   public boolean isFacetContains(String columnName, boolean hasData, String value)
    {
        return elementCache().grid.isFacetContains(columnName, hasData, value);
    }

    @LogMethod
    public void clearFilters(@LoggedParam String columnName)
    {
        elementCache().grid.clearFilters(columnName);
    }

    @LogMethod
    public void assertRowCount(int expCount)
    {
        if (expCount <= 25)
        {
            Assert.assertEquals("Grid row count", expCount, elementCache().grid.getDataRows().size());;
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
                    String tabName = tabHeader.getLeft();
                    List<String> expHeaders = tabHeader.getRight();
                    Sheet sheet = wb.getSheet(tabName);
                    verifyHeaderValues(sheet, expHeaders);
                }
            }
        }
        catch (IOException fail)
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
        catch (IOException fail)
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
        catch (IOException fail)
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
        catch (IOException fail)
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
        catch (IOException fail)
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
        dataTabCounts.forEach(pair -> missingDataFiles.add(pair.getLeft()));
        for (int i = 0; i < dataTabCounts.size(); i++)
        {
            Pair<String, Integer> dataTabCount = dataTabCounts.get(i);
            String tab = dataTabCount.getLeft();
            int expCount = dataTabCount.getRight();
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
        catch (IOException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    public void assertPageTotal(int pages)
    {
        getWrapper().waitForElement(Locators.totalPages.containing(Integer.toString(pages)));
    }

    public void assertCurrentPage(int page)
    {
        getWrapper().assertElementContains(Locators.currentPage, Integer.toString(page));
    }

    public void assertCellContent(String content)
    {
        getWrapper().waitForElement(CdsGrid.Locators.cellLocator(content));
    }

    public void sort(String columnName)
    {
        elementCache().grid.sort(columnName);
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
        getWrapper().waitForElement(Locator.css(("a.export-data"))).click();
        Locator item = Locator.css("span.x-menu-item-text").withText(isExcel ? "Excel (*.XLS)" : "Comma separated values (*.CSV)");
        WebElement menuItem = getWrapper().waitForElement(item);

        return getWrapper().clickAndWaitForDownload(menuItem);
    }

    private void verifyExportedCSVContent(File export, List<String> expectedContent)
    {
        if (expectedContent == null)
            return;
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
        File dir = new File(TestFileUtils.getTestTempDir().getAbsolutePath() + "/" + UUID.randomUUID());

        if (dir.exists())
        {
            log("Target directory (" + dir + ") for unzip already exists, going to delete it.");
            if (dir.delete())
                log("Successfully deleted the directory.");
            else
                log("Could not delete the directory.");
        }
        else
        {
            log("The target directory for unzip (" + dir + ") does not already exists.");
        }

        if (!dir.mkdirs())
            log("Caution: mkdirs returned false for target directory. It is possible that unzip will fail.");

        File exportedZip = exportCSV();

        List<String> missingDataFiles = new ArrayList<>();
        expected.getDataTabCounts().forEach(pair -> missingDataFiles.add(pair.getLeft()));

        for (File file : TestFileUtils.unzipToDirectory(exportedZip, dir))
        {
            String filename = file.getName();
            if ("Metadata.txt".equals(filename))
            {
                CDSExport.TOCS.forEach(expectedContent -> verifyExportedCSVContent(file, expectedContent));
                verifyExportedCSVContent(file, expected.getFilterTitles());
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
                    String dataName = dataCount.getLeft();
                    int expCount = dataCount.getRight();
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
                        String dataName = header.getLeft();
                        List<String> expHeaders = header.getRight();
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

    public void doAndWaitForUpdate(Runnable function)
    {
        elementCache().grid.applyAndWaitForGrid(function);
    }

    public void goToLastPage()
    {
        getWrapper().click(Locators.lastPage);
        WebDriverWrapper.sleep(500);
        getWrapper()._ext4Helper.waitForMaskToDisappear();
    }

    public void goToFirstPage()
    {
        doAndWaitForUpdate(() -> getWrapper().click(Locators.firstPage));
    }

    public void clickPreviousBtn()
    {
        doAndWaitForUpdate(() -> getWrapper().click(Locators.previousBtn));
    }

    public void clickNextBtn()
    {
        doAndWaitForUpdate(() -> getWrapper().click(Locators.nextBtn));
    }

    public void goToPreviousPage()
    {
        doAndWaitForUpdate(() -> getWrapper().click(Locators.previousPage));
    }

    public void goToNextPage()
    {
        doAndWaitForUpdate(() -> getWrapper().click(Locators.nextPage));
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

        public static Locator.XPathLocator getActiveHeader(String tabname)
        {
            return Locators.tabHeaderContainer.append(Locators.activeHeader.withText(tabname));
        }

    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    public class ElementCache extends Component<?>.ElementCache
    {
        private final CdsGrid grid = new CdsGrid("connector-grid", DataGrid.this);
    }

}
