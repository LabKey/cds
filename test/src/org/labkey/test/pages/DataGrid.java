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
package org.labkey.test.pages;

import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.ExcelHelper;
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
        Locator.XPathLocator hoveredColumn = columnHeader.append(Locator.tagWithClass("div", "x-column-header-over"));
        _test.waitForElement(hoveredColumn);
        _test.click(filterIcon);
        _test._ext4Helper.waitForMask();
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
        applyAndWaitForGrid(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(CDSHelper.Locators.cdsButtonLocator("filter", "filter-btn"));
                return null;
            }
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

        Locator.XPathLocator update = CDSHelper.Locators.cdsButtonLocator("update", "filter-btn");
        Locator.XPathLocator filter = CDSHelper.Locators.cdsButtonLocator("filter", "filter-btn");

        List<WebElement> buttons = new ArrayList<>();
        buttons.addAll(update.findElements(_test.getDriver()));
        buttons.addAll(filter.findElements(_test.getDriver()));

        Assert.assertEquals("Error getting filter/update button", 1, buttons.size());

        final WebElement button = buttons.get(0);

        applyAndWaitForGrid(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                button.click();
                return null;
            }
        });
    }

    @LogMethod
    public void clearFilters(@LoggedParam String columnName)
    {
        openFilterPanel(columnName);
        applyAndWaitForGrid(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.waitAndClick(CDSHelper.Locators.cdsButtonLocator("clear", "filter-btn"));
                return null;
            }
        });
        _test.waitForElement(Locators.sysmsg.containing("Filter removed."));
    }

    public void assertRowCount(int count)
    {
        if (count > 1000)
        {
            _test.waitForElements(Locators.dataRow, 1000);
            Assert.assertEquals("Wrong number of rows in export", count, getExportRowCount());
        }
        else
        {
            _test.waitForElements(Locators.dataRow, count);
        }
    }

    public void assertSortPresent(String columnName)
    {
        _test.waitForElement(Locator.tagWithClassContaining("div", "x-column-header-sort-").withText(columnName));
    }

    @LogMethod
    public void sort(@LoggedParam final String columnName)
    {
        applyAndWaitForGrid(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(Locators.columnHeaderLocator(columnName).append(Locator.tagWithClass("div", "x-column-header-inner")));
                return null;
            }
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

    public static class Locators
    {
        public static Locator.CssLocator grid = Locator.css("div.connector-grid");
        public static Locator.CssLocator dataRow = grid.append(Locator.css("tr.x-grid-data-row"));
        public static Locator.CssLocator sysmsg = Locator.css("div.sysmsg");

        public static Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "x-column-header").withText(columnHeaderName);
        }

        public static Locator.XPathLocator cellLocator(String cellContent)
        {
            return Locator.tagWithClass("div", "x-grid-cell-inner").containing(cellContent);
        }
    }
}
