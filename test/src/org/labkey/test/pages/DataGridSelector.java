package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;

/**
 * Created by Nick Arnold on 4/29/14.
 */
public class DataGridSelector
{
    protected BaseWebDriverTest _test;

    public DataGridSelector(BaseWebDriverTest test)
    {
        _test = test;
    }

    public Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
    {
        return Locator.tagWithClass("div", "x-column-header").withText(columnHeaderName);
    }

    public Locator.XPathLocator cellLocator(String cellContent)
    {
        return Locator.tagWithClass("div", "x-grid-cell-inner").containing(cellContent);
    }

    public void assertColumnsNotPresent(String... columns)
    {
        for (String column : columns)
            _test.assertElementNotPresent(columnHeaderLocator(column));
    }

    public void ensureColumnsPresent(String... columns)
    {
        for (String column : columns)
            _test.waitForElement(columnHeaderLocator(column));
    }

    public void openFilterPanel(String columnHeaderName)
    {
        Locator.XPathLocator columnHeader = columnHeaderLocator(columnHeaderName);
        _test.waitForElement(columnHeader);

        Locator.XPathLocator filterIcon = columnHeader.append(Locator.tagWithClass("div", "x-column-header-trigger"));
        _test.waitAndClick(filterIcon);
    }

    public void setFilter(String columnName, String value)
    {
        setFilter(columnName, null, value);
    }

    public void setFilter(String columnName, String filter, String value)
    {
        openFilterPanel(columnName);
        if (null != filter)
            _test._ext4Helper.selectComboBoxItem("Value:", filter);

        _test.waitForElement(Locator.id("value_1"));
        _test.setFormElement(Locator.css("#value_1 input"), value);
        _test.click(CDSHelper.Locators.cdsButtonLocator("OK"));
        String filterText = columnName.replace(" ", "");
        _test.waitForElement(CDSHelper.Locators.filterMemberLocator(filterText));
    }

    public void clearFilters(String columnName)
    {
        openFilterPanel(columnName);
        _test.waitAndClick(CDSHelper.Locators.cdsButtonLocator("Clear Filters"));
        _test.waitForText("Filter removed.");
    }

    public void waitForCount(int count)
    {
        String displayText = "Row Count: " + count;
        _test.waitForElement(Locator.id("gridrowcount").withText(displayText));
    }
}
