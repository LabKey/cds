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
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class DataGridVariableSelector extends DataspaceVariableSelector
{
    private int columnCount = 0;
    private Locator.XPathLocator titleLocator = Locator.tagWithClass("div", "titlepanel").withText("view data grid");

    public DataGridVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "gridcolumnpicker";
    }

    public Locator.CssLocator window()
    {
        return Locator.id("gridmeasurewin").toCssLocator();
    }

    @Override
    public Locator getOpenButton()
    {
        return CDSHelper.Locators.cdsButtonLocator("choose from " + columnCount +" columns", "gridcolumnsbtn");
    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return true;
    }

    public void setColumnCount(int columnCount)
    {
        this.columnCount = columnCount;
    }

    public void addGridColumn(String source, String measure, boolean keepOpen, boolean keepSelection)
    {
        _test.waitForElement(titleLocator); // make sure we are looking at grid

        // allow for already open measures
        if (!_test.isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            _test.click(getOpenButton());
            _test.waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        pickMeasure(source, measure, keepSelection);

        if (!keepOpen)
        {
            confirmSelection();
            // confirm source header
            _test.waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText(source));
            // confirm column header
            _test.waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText(measure));
        }
    }

    public void addLookupColumn(String source, String measure, String lookup)
    {
        addGridColumn(source, measure, true, true);

        Locator.CssLocator _variablePanelRow = pickerPanel().append(".measuresgrid ." + Ext4Helper.getCssPrefix() + "grid-row");
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(_variablePanelRow.toBy()));
        _test.click(_variablePanelRow.withText(measure));

        _test.waitForElement(Locator.tagWithClass("div", "curselauth").withText(measure + " details"));

        String lookupClass = "variableoptions .lookupgrid";
        Locator.CssLocator _lookupPanelRow = Locator.css("." + lookupClass + " ." + Ext4Helper.getCssPrefix() + "grid-row");
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(_lookupPanelRow.toBy()));
        _test._ext4Helper.selectGridItem("shortCaption", lookup, -1, lookupClass, true);

        confirmSelection();
    }

    public void removeLookupColumn(String source, String measure, String lookup)
    {
        // TODO: Implement this
    }

    public void removeGridColumn(String source, String measure, boolean keepOpen)
    {
        _test.waitForElement(titleLocator); // make sure we are looking at grid

        // allow for already open measures
        if (!_test.isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            _test.click(getOpenButton());
            _test.waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        pickSource(source);
        _test._ext4Helper.uncheckGridRowCheckbox(measure);

        if (!keepOpen)
        {
            confirmSelection();
            // confirm column removal
            _test.waitForElementToDisappear(Locator.tagWithClass("span", "x-column-header-text").withText(measure));
        }
    }

    @Override
    public void setScale(Scale scale)
    {
        throw new UnsupportedOperationException("Grid does not have a scale");
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("select"));
        _test._ext4Helper.waitForMaskToDisappear();
    }
}
