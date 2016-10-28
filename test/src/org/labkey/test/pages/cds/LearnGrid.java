/*
 * Copyright (c) 2016 LabKey Corporation
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

import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

public class LearnGrid
{
    protected BaseWebDriverTest _test;

    public LearnGrid(BaseWebDriverTest test)
    {
        _test = test;
    }

    @LogMethod
    public int getRowCount()
    {
        int numRowsWithLockedPortion = Locators.lockedRow.findElements(_test.getDriver()).size();
        int numRowsWithUnlockedPortion = Locators.unlockedRow.findElements(_test.getDriver()).size();
        Assert.assertTrue(numRowsWithLockedPortion == numRowsWithUnlockedPortion);
        return numRowsWithUnlockedPortion;
    }

    @LogMethod(quiet = true)
    public LearnGrid openFilterPanel(@LoggedParam String columnHeaderName)
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

        return this;
    }

    @LogMethod
    public LearnGrid setFacet(@LoggedParam String columnName, @LoggedParam String... labels)
    {
        setWithOptionFacet(columnName, null, labels);
        return this;
    }

    public LearnGrid setWithOptionFacet(@LoggedParam String columnName, @LoggedParam String option, @LoggedParam String... labels)
    {
        openFilterPanel(columnName);

        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);

        if (option != null)
        {
            _test.click(Locator.css(".sortDropdown"));
            _test.click(Locator.css(".x-menu-item").withText(option));
            BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);
        }

        _test.click(Locator.css(".x-column-header-checkbox").findElements(_test.getDriver()).stream().filter(WebElement::isDisplayed).findFirst().get());

        for (String label : labels)
        {
            _test.click(Locators.getFacetCheckboxForValue(label));
        }

        Locator.XPathLocator search = CDSHelper.Locators.cdsButtonLocator("Search", "filter-btn");
        search.findElement(_test.getDriver()).click();
        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);

        return this;
    }

    @LogMethod
    public LearnGrid clearFilters(@LoggedParam String columnName)
    {
        clearFiltersWithOption(columnName, null);
        return this;
    }

    public LearnGrid clearFiltersWithOption(@LoggedParam String columnName, @LoggedParam String option)
    {
        openFilterPanel(columnName);

        if (option != null)
        {
            _test.click(Locator.css(".sortDropdown"));
            _test.click(Locator.css(".x-menu-item").withText(option));
            BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);
        }

        _test.waitAndClick(CDSHelper.Locators.cdsButtonLocator("Clear", "filter-btn"));
        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);

        return this;
    }

    public LearnGrid assertSortPresent(String columnName)
    {
        _test.waitForElement(Locator.tagWithClassContaining("div", "x-column-header-sort-").withText(columnName));
        return this;
    }

    @LogMethod
    public LearnGrid sort(@LoggedParam final String columnName)
    {
        _test.click(Locators.columnHeaderLocator(columnName));
        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);
        assertSortPresent(columnName);

        return this;
    }

    // Columns are separated by a \n.
    public String getRowText(int rowIndex)
    {
        _test.scrollIntoView(Locators.lockedRow.findElements(_test.getDriver()).get(rowIndex)); // Why do I have to scroll this into view to get the text?
        return Locators.lockedRow.findElements(_test.getDriver()).get(rowIndex).getText() + "\n" + Locators.unlockedRow.findElements(_test.getDriver()).get(rowIndex).getText();
    }

    // Assume 0 based for rows and columns.
    public String getCellText(int rowIndex, int cellIndex)
    {
        return getCellWebElement(rowIndex, cellIndex).getText();
    }

    public LearnGrid showDataAddedToolTip(int rowIndex, int cellIndex)
    {
        // Scroll the row into view.
        _test.scrollIntoView(Locators.lockedRow.findElements(_test.getDriver()).get(rowIndex));

        // The tool-tip shows up on a mouse enter event. So first go to the grey text under the icon then move over it.
        _test.mouseOver(getCellWebElement(rowIndex, cellIndex).findElement(By.className("detail-gray-text")));
        _test.sleep(500); // If the mouse moves too quickly ext may not always see it, so pause for a moment.
        _test.mouseOver(getCellWebElement(rowIndex, cellIndex).findElement(By.className("detail-has-data")));

        // The tool-tip has a small delay before it is shown.
        _test.waitForElement(Locator.css("div.hopscotch-bubble-container"), 5000, true);

        return this;
    }

    // Assume 0 based for both.
    public WebElement getCellWebElement(int rowIndex, int cellIndex)
    {
        int cellCountLocked;
        WebElement cellWebElement;

        cellWebElement = Locators.lockedRow.findElements(_test.getDriver()).get(rowIndex);
        _test.scrollIntoView(cellWebElement);

        cellCountLocked = cellWebElement.findElements(By.tagName("td")).size();

        if(cellIndex < cellCountLocked)
        {
            return cellWebElement.findElements(By.tagName("td")).get(cellIndex);
        }
        else
        {
            // The index is not in the locked columns, so we have to do a little offset and need to look at the unlocked grid.
            cellWebElement = Locators.unlockedRow.findElements(_test.getDriver()).get(rowIndex);
            return cellWebElement.findElements(By.tagName("td")).get(cellIndex - cellCountLocked);
        }

    }

    // There should only be one tool-tip present at a time.
    public String getToolTipText()
    {
        return _test.getText(Locator.css("div.hopscotch-bubble-container"));
    }

    // Text values in each of the columns is separated by a \n.
    public List<String> getGridText()
    {
        List<String> gridText = new ArrayList<>();

        for(int i=0; i < getRowCount(); i++)
        {
            gridText.add(getRowText(i));
        }

        return gridText;
    }

    public String[] getColumnNames()
    {
        String colHeaderStr;
        colHeaderStr = Locators.lockedRowHeader.findElement(_test.getDriver()).getText() + "\n" + Locators.unlockedRowHeader.findElement(_test.getDriver()).getText();
        return colHeaderStr.split("\n");
    }

    public int getColumnIndex(String columnName)
    {
        String[] columns = getColumnNames();
        int index = -1;

        for(int i = 0; i < columns.length; i++)
        {
            if(columns[i].trim().toLowerCase().equals(columnName.trim().toLowerCase()))
            {
                index = i;
                break;
            }
        }

        return index;
    }

    public static class Locators
    {
        public static final Locator.XPathLocator grid = Locator.xpath("//div[contains(@class, 'learngrid')][not(contains(@style, 'display: none'))]");
        public static final Locator.XPathLocator unlockedRow = grid.append("/div/div/div/div[not(contains(@class, 'x-grid-inner-locked'))]/div/div/table/tbody/tr");
        public static final Locator.XPathLocator unlockedRowHeader = grid.append("/div/div/div/div[not(contains(@class, 'x-grid-inner-locked'))]/div[contains(@class, 'x-grid-header-ct')]");
        public static final Locator.XPathLocator lockedRow = grid.append("/div/div/div/div[contains(@class, 'x-grid-inner-locked')]/div/div/table/tbody/tr");
        public static final Locator.XPathLocator lockedRowHeader = grid.append("/div/div/div/div[contains(@class, 'x-grid-inner-locked')]/div[contains(@class, 'x-grid-header-ct')]");

        public static Locator.XPathLocator getFacetCheckboxForValue(String label)
        {
            return Locator.xpath("//tr[contains(@class, 'x-grid-row')]//td/div[contains(text(), '"
                    + label + "')]/../preceding-sibling::td/div/div[contains(@class, 'x-grid-row-checker')]");
        }

        public static Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "x-column-header-inner").withText(columnHeaderName);
        }
    }
}
