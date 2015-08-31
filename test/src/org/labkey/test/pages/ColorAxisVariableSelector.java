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
import org.labkey.test.util.LabKeyExpectedConditions;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ColorAxisVariableSelector extends DataspaceVariableSelector
{
    private final String XPATHID = "color-axis-selector";

    public ColorAxisVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "coloraxispicker";
    }

    public Locator.CssLocator window()
    {
        return Locator.css(".color-axis-selector");
    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return false;
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "colorbtn").notHidden();
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("Set color"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void openSelectorWindow()
    {
        super.openSelectorWindow(XPATHID, "color");
    }

    public void pickSource(String source){
        // If not currently on the source page, move there.
        if(_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//span[contains(@class, 'back-action')]")))
        {
            backToSource();
        }
        super.pickSource(XPATHID, source);
    }

    public void backToSource(){
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//span[contains(@class, 'back-action')]"));
        _test.sleep(750);
    }

    public void setScale(Scale scale)
    {
        throw new UnsupportedOperationException("No log scale for color variable");
    }
}
