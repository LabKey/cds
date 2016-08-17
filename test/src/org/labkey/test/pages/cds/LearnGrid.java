package org.labkey.test.pages.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.cds.CDSHelper;

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
        return Locators.row.findElements(_test.getDriver()).size();
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
        openFilterPanel(columnName);

        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT);

        _test.click(Locator.css(".x-column-header-checkbox"));

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
        openFilterPanel(columnName);
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

    public static class Locators
    {
        public static Locator.XPathLocator grid = Locator.xpath("//div[contains(@class, 'learngrid')][not(contains(@style, 'display: none'))]");
        public static Locator.XPathLocator row = grid.append("/div/div/div/div/div/div/table/tbody/tr");

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
