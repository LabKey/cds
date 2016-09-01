package org.labkey.test.pages.cds;

import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.cds.CDSHelper;
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
    }

    @LogMethod
    public void setFacet(@LoggedParam String columnName, @LoggedParam String... labels)
    {
        setWithOptionFacet(columnName, null, labels);
    }

    public void setWithOptionFacet(@LoggedParam String columnName, @LoggedParam String option, @LoggedParam String... labels)
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
    }

    @LogMethod
    public void clearFilters(@LoggedParam String columnName)
    {
        clearFiltersWithOption(columnName, null);
    }

    public void clearFiltersWithOption(@LoggedParam String columnName, @LoggedParam String option)
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
    }

    public void assertSortPresent(String columnName)
    {
        _test.waitForElement(Locator.tagWithClassContaining("div", "x-column-header-sort-").withText(columnName));
    }

    @LogMethod
    public void sort(@LoggedParam final String columnName)
    {
        _test.click(Locators.columnHeaderLocator(columnName));
        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);
        assertSortPresent(columnName);
    }

    // Columns are separated by a \n.
    public String getRowText(int rowIndex)
    {
        _test.scrollIntoView(Locators.lockedRow.findElements(_test.getDriver()).get(rowIndex)); // Why do I have to scroll this into view to get the text?
        return Locators.lockedRow.findElements(_test.getDriver()).get(rowIndex).getText() + "\n" + Locators.unlockedRow.findElements(_test.getDriver()).get(rowIndex).getText();
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
