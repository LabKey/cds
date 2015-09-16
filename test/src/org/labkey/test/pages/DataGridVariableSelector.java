/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import com.google.common.base.Function;

public class DataGridVariableSelector extends DataspaceVariableSelector
{
    private DataGrid _dataGrid;
    public static Locator.XPathLocator titleLocator = Locator.tagWithClass("div", "title").withText("View data grid");
    private final String XPATH = "column-axis-selector";

    public DataGridVariableSelector(BaseWebDriverTest test, DataGrid grid)
    {
        super(test);
        _dataGrid = grid;
    }

    @Override
    protected String getPickerClass()
    {
        return XPATH;
    }

    public Locator.CssLocator window()
    {
        return Locator.css("." + getPickerClass());
    }

    @Override
    public Locator getOpenButton()
    {
        return CDSHelper.Locators.cdsButtonLocator("select columns", "gridcolumnsbtn");
    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return true;
    }

    public void addGridColumn(String source, String measure, boolean keepOpen, boolean keepSelection)
    {
        addGridColumn(source, source, measure, keepOpen, keepSelection);
    }

    public void openSelectorWindow()
    {
//        if (!_test.isElementPresent(window()) || !_test.isElementVisible(window()))
//        {
//            _test.click(getOpenButton());
//            _test.waitForElement(window());
//        }
        super.openSelectorWindow(XPATH, "choose columns");
    }

    public void pickSource(String source){
        // If not currently on the source page, move there.
        if(_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + getPickerClass() + "')]//span[contains(@class, 'back-action')]")))
        {
            backToSource();
        }
        super.pickSource(XPATH, source);
    }

    public void backToSource(){
        _test.click(Locator.xpath("//div[contains(@class, '" + getPickerClass() + "')]//span[contains(@class, 'back-action')]"));
        _test.sleep(750);
    }

    public void pickVariable(String variable, boolean keepSelection)
    {
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(measuresPanelRow().toBy())); // if one row is ready, all should be
        _test._ext4Helper.selectGridItem("label", variable, -1, getPickerClass() + " .content-multiselect", keepSelection);
    }

    public void addGridColumn(String source, String sourceColumnTitle, String measure, boolean keepOpen, boolean keepSelection)
    {
        _test.waitForElement(titleLocator); // make sure we are looking at grid

        if((!_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + XPATH + "')]"))) || (!_test.isElementVisible(Locator.xpath("//div[contains(@class, '" + XPATH + "')]"))))
        {
            openSelectorWindow();
        }
        pickSource(source);
        pickVariable(measure, keepSelection);

        if (!keepOpen)
        {
            confirmSelection();
            // confirm source header
            _test.waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText(sourceColumnTitle));
            // confirm column header
            _test.waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText(measure));
        }
    }

    public void addLookupColumn(String source, String measure, String lookup)
    {
        addGridColumn(source, measure, true, true);

        Locator.CssLocator _variablePanelRow = pickerPanel().append(" .measuresgrid ." + Ext4Helper.getCssPrefix() + "grid-row");
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(_variablePanelRow.toBy()));
        _test.click(_variablePanelRow.withText(measure));

        _test.waitForElement(Locator.tagWithClass("div", "curselauth").withText("Definition: " + measure));

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

        if((!_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + XPATH + "')]"))) || (!_test.isElementVisible(Locator.xpath("//div[contains(@class, '" + XPATH + "')]"))))
        {
            openSelectorWindow();
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
        _dataGrid.applyAndWaitForGrid(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(CDSHelper.Locators.cdsButtonLocator("Done"));
                return null;
            }
        });
    }
}
