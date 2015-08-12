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

public class YAxisVariableSelector extends DataspaceVariableSelector
{
    private final String XPATHID = "y-axis-selector";

    public YAxisVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "yaxispicker";
    }

    public Locator.CssLocator window()
    {
        return Locator.css(".y-axis-selector");
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "yaxisbtn").notHidden();
    }

    @Override
    public void openSelectorWindow()
    {
        WebElement openButton = _test.longWait().until(ExpectedConditions.visibilityOfElementLocated(getOpenButton().toBy()));
        _test.sleep(750); // Don't know why, but more reliable with the wait.
        openButton.click();
        _test.longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.divByInnerText("y-axis").toBy()));
        _test.longWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//a[not(contains(@style, 'display: none'))]//span[(contains(@class, 'x-btn-inner'))][text()='Cancel']").toBy()));

    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return false;
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("Set y-axis"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    @Override
    public void pickSource(String source){
        // If not currently on the source page, move there.
        if(_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//span[contains(@class, 'back-action')]")))
        {
            backToSource();
        }
        super.pickSource(source);
    }

    public void backToSource(){
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//span[contains(@class, 'back-action')]"));
        _test.sleep(750);
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//div[text()='Scale:']/following-sibling::div"));
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "-option-scale-dropdown')]//table[contains(@class, 'x-form-type-radio')]//tbody//tr//td//label[.='" + scale + "']"));
        // Do the next click to close the drop down.
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//div[text()='Scale:']"));

    }

    public void setCellType(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.CellType, value);
    }

    public void setTargetCell(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.TargetCell, value);
    }

    public void setAntigen(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.AntigenName, value);
    }

    public Locator openAntigenPanel()
    {
        return super.openAntigenPanel(XPATHID);
    }

    public void setVirusName(String... test_data_value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.VirusName, test_data_value);
    }

    public void setDataSummaryLevel(String summaryLevel)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.DataSummaryLevel, summaryLevel);
    }

    public void setProtein(String... test_data_value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.Protein, test_data_value);
    }

}
