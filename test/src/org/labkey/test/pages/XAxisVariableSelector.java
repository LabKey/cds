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
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class XAxisVariableSelector extends DataspaceVariableSelector
{
    public XAxisVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "xaxispicker";
    }

    public Locator.CssLocator window()
    {
        return Locator.css(".x-axis-selector");
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "xaxisbtn").notHidden();
    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return false;
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("Set x-axis"));
        if (_test.isElementPresent(Locator.tagWithClass("button", "yaxisbtn").notHidden()))
        {
            _test._ext4Helper.waitForMaskToDisappear();
        }
        else // Opens y-axis dialog automatically
        {
            _test.waitForElement(Locator.divByInnerText("y-axis")).isDisplayed();
        }
    }

    @Override
    public void openSelectorWindow()
    {
        WebElement openButton = _test.longWait().until(ExpectedConditions.visibilityOfElementLocated(getOpenButton().toBy()));
        _test.sleep(750); // Don't know why, but more reliable with the wait.
        openButton.click();
        _test.longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.divByInnerText("x-axis").toBy()));
        _test.longWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//a[not(contains(@style, 'display: none'))]//span[(contains(@class, 'x-btn-inner'))][text()='Cancel']").toBy()));
    }

    @Override
    public void pickSource(String source){
        // If not currently on the source page, move there.
        if(_test.isElementPresent(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//span[contains(@class, 'back-action')]")))
        {
            backToSource();
        }
        super.pickSource(source);
    }

    public void backToSource(){
        _test.click(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//span[contains(@class, 'back-action')]"));
        _test.sleep(750);
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[text()='Scale:']/following-sibling::div"));
        _test.click(Locator.xpath("//div[contains(@class, 'x-axis-selector-option-scale-dropdown')]//table[contains(@class, 'x-form-type-radio')]//tbody//tr//td//label[.='" + scale + "']"));
        // Do the next click to close the drop down.
        _test.click(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[text()='Scale:']"));
    }

    public void setCellType(String value)
    {
        super.setAssayDimension("x-axis-selector", AssayDimensions.CellType, value);
    }
}
