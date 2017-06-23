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

import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.ExcelHelper;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import com.google.common.base.Function;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class DataGrid
{
    protected BaseWebDriverTest _test;

    public DataGrid(BaseWebDriverTest test)
    {
        _test = test;
    }

    public void assertColumnsNotPresent(String... columns)
    {
        for (String column : columns)
            _test.assertElementNotPresent(Locators.columnHeaderLocator(column));
    }

    public void ensureColumnsPresent(String... columns)
    {
        String[] defaultColumns = {
            CDSHelper.GRID_COL_SUBJECT_ID, CDSHelper.GRID_COL_STUDY, CDSHelper.GRID_COL_TREATMENT_SUMMARY, CDSHelper.GRID_COL_STUDY_DAY
        };

        for (String column : defaultColumns)
            _test.waitForElement(Locators.columnHeaderLocator(column));

        for (String column : columns)
            _test.waitForElement(Locators.columnHeaderLocator(column));
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
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath(allXpath).toBy()));
            _test.scrollIntoView(Locator.xpath(allXpath));
            _test.click(Locator.xpath(allXpath));
        }

        for(String val : values)
        {
            cellXpath = cellXpathContst.replaceAll("[*]", val);
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath(cellXpath).toBy()));
            _test.scrollIntoView(Locator.xpath(cellXpath));
            _test.click(Locator.xpath(cellXpath));
        }

        applyAndWaitForGrid(aVoid -> {
            _test.click(CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn"));
            return null;
        });

    }

    public void setFilter(String columnName, String value)
    {
        setFilter(columnName, null, value);
    }

    @LogMethod
    public void setFilter(@LoggedParam String columnName, @LoggedParam String filter, @LoggedParam String value)
    {
        openFilterPanel(columnName);
        if (null != filter)
            _test._ext4Helper.selectComboBoxItem("Value:", filter);

        _test.waitForElement(Locator.id("value_1"));
        _test.setFormElement(Locator.css("#value_1 input"), value);
        applyAndWaitForGrid(aVoid -> {
            _test.click(CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn"));
            return null;
        });
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

        applyAndWaitForGrid(aVoid -> {
            button.click();
            _test.sleep(500);
            _test._ext4Helper.waitForMaskToDisappear();
            return null;
        });
    }

    @LogMethod
    public void clearFilters(@LoggedParam String columnName)
    {
        openFilterPanel(columnName);
        applyAndWaitForGrid(aVoid -> {
            _test.waitAndClick(CDSHelper.Locators.cdsButtonLocator("Clear", "filter-btn"));
            return null;
        });
        _test.waitForElement(Locators.sysmsg.containing("Filter removed."));
    }

    public void assertRowCount(int expCount)
    {
        if (expCount > 25)
        {
            long actualCount = getExportRowCount();
            _test.waitForElements(Locators.dataRow, 25);
            Assert.assertEquals("Wrong number of rows in export.", expCount, actualCount);
        }
        else
        {
            _test.waitForElements(Locators.dataRow, expCount);
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
        applyAndWaitForGrid(aVoid -> {
            _test.click(Locators.columnHeaderLocator(columnName));
            _test.sleep(500);
            _test._ext4Helper.waitForMaskToDisappear();
            return null;
        });
        assertSortPresent(columnName);
    }

    public int getExportRowCount()
    {
        File export = exportGrid();
        try
        {
            Workbook wb = ExcelHelper.create(export);
            Sheet sheet = wb.getSheetAt(0);
            return sheet.getLastRowNum(); // +1 for zero-based, -1 for header row
        }
        catch (IOException | InvalidFormatException fail)
        {
            throw new RuntimeException("Error reading exported grid file", fail);
        }
    }

    public File exportGrid()
    {
        return _test.clickAndWaitForDownload(Locator.css("a.gridexportbtn"));
    }

    public void applyAndWaitForGrid(Function<Void, Void> function)
    {
        WebElement gridView = Locators.grid.append(Locator.css("table.x-grid-table")).findElement(_test.getDriver());

        function.apply(null);

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

        public static Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "x-column-header-inner").withText(columnHeaderName);
        }

        public static Locator.XPathLocator cellLocator(String cellContent)
        {
            return Locator.tagWithClass("div", "x-grid-cell-inner").containing(cellContent);
        }
    }
}
