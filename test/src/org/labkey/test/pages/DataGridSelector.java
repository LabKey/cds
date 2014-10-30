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
        _test.click(CDSHelper.Locators.cdsButtonLocator("Filter"));
        _test.waitForElement(CDSHelper.Locators.filterMemberLocator(columnName));
    }

    public void setFacet(String columnName, String label)
    {
        openFilterPanel(columnName);
        _test.waitForText(label);

        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");
        Locator.XPathLocator row = gridLoc.append(Locator.tagWithClass("div", "x-grid-cell-inner").containing(label));

        _test.waitAndClick(10000, row, 0);

        Locator.XPathLocator update = CDSHelper.Locators.cdsButtonLocator("Update");
        Locator.XPathLocator filter = CDSHelper.Locators.cdsButtonLocator("Filter");

        if (_test.isElementPresent(update))
            _test.click(update);
        else
            _test.click(filter);
    }

    public void clearFilters(String columnName)
    {
        openFilterPanel(columnName);
        _test.waitAndClick(CDSHelper.Locators.cdsButtonLocator("Clear"));
        _test.waitForText("Filter removed.");
    }

    public void waitForCount(int count)
    {
        String displayText = "Row Count: " + count;
        _test.waitForElement(Locator.id("gridrowcount").withText(displayText));
    }
}
