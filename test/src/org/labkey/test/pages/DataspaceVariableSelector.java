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

import org.labkey.api.search.SearchService;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public abstract class DataspaceVariableSelector
{
    protected BaseWebDriverTest _test;

    public DataspaceVariableSelector(BaseWebDriverTest test)
    {
        _test = test;
    }

    public abstract void setScale(Scale scale);
    public abstract void confirmSelection();
    protected abstract String getPickerClass();
    protected abstract boolean isMeasureMultiSelect();
    protected abstract Locator getOpenButton();
    public abstract Locator.CssLocator window();

    public void openSelectorWindow()
    {
        WebElement openButton = _test.shortWait().until(ExpectedConditions.elementToBeClickable(getOpenButton().toBy()));

        openButton.click();

        _test.shortWait().until(ExpectedConditions.elementToBeClickable(sourcePanelRow().toBy()));
    }

//    public void openSelectorWindow(String title)
//    {
//        WebElement openButton = _test.longWait().until(ExpectedConditions.elementToBeClickable(getOpenButton().toBy()));
//
//        openButton.click();
//
//        _test.waitForElement(Locator.divByInnerText(title));
//        _test.sleep(1000);
//
//    }

    public Locator.CssLocator pickerPanel()
    {
        return Locator.css("." + getPickerClass());
    }

    public Locator.CssLocator sourcePanelRow()
    {
        return Locator.CssLocator.union(pickerPanel().append(" .sourcepanel div.itemrow span.val"), // selects rows with counts
                pickerPanel().append(" .sourcepanel div.itemrow")); // selects rows without counts (also rows with counts due to CSS limitations)
    }

    public Locator.CssLocator measuresPanelRow()
    {
        return isMeasureMultiSelect() ?
                pickerPanel().append(" .measuresgrid tr." + Ext4Helper.getCssPrefix() + "grid-data-row"):
                pickerPanel().append(" .measuresgrid div.itemrow");
    }

    public Locator.CssLocator variableOptionsRow()
    {
        return window().append(" .variableoptionsgrid tr." + Ext4Helper.getCssPrefix() + "grid-data-row");
    }

    public void pickSource(String source)
    {
        _test.click(window().append(" div.content-label").withText(source));
        _test.sleep(500);
//        _test.waitAndClick(sourcePanelRow().containing(source)); // This is used in multi-panel select.
    }

    public void pickVariable(String source){
        _test.click(window().append(" div.content-label").withText(source));
        _test.sleep(500);
    }

    //Pick measure from one of multiple split panel measure pickers
    public void pickMeasure(String source, String measure, boolean keepSelection)
    {
        pickSource(source);
        //select measure
        if (isMeasureMultiSelect())
        {
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(measuresPanelRow().toBy())); // if one row is ready, all should be
            _test._ext4Helper.selectGridItem("label", measure, -1, getPickerClass() + " .measuresgrid", keepSelection);
        }
        else
        {
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(measuresPanelRow().toBy())); // if one row is ready, all should be
            _test.click(measuresPanelRow().withText(measure));
        }
    }

    public void setVariableOptions(String... options)
    {
        _test.waitForElement(variableOptionsRow());
        clearVariableOptions();

        for (String option : options)
        {
            WebElement row = variableOptionsRow().withText(option).findElement(_test.getDriver());
            WebElement rowChecker = row.findElement(By.cssSelector(String.format(".%sgrid-row-checker", Ext4Helper.getCssPrefix())));
            rowChecker.click();
        }
    }

    public void clearVariableOptions()
    {
        // TODO: remove 'x-body' once helper takes a css selector
        _test._ext4Helper.clearGridSelection("x-body " + window().getLocatorString() + " .variableoptionsgrid");
    }

    public void selectAllVariableOptions()
    {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    public void setVariableRadio(String text)
    {
        Locator radioRows = Locator.css(".variableoptions .x-checkboxgroup-form-item");
        WebElement row = radioRows.withText(text).findElement(_test.getDriver());
        row.findElement(Locator.css("input").toBy()).click();
    }

    public void pickMeasure(String source, String measure)
    {
        pickMeasure(source, measure, false);
    }

    public void cancelSelection()
    {
        _test.click(window().append(" a.x-btn").withText("Cancel"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public static enum Scale
    {
        Log,
        Linear
    }
}
