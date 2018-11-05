/*
 * Copyright (c) 2016 LabKey Corporation
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
package org.labkey.test.pages.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.interactions.Actions;

import java.util.Map;

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
        return Locator.css("." + XPATHID);
    }

    public Locator.XPathLocator xpathWindow()
    {
        return Locator.xpath("//div[contains(@class, '" + XPATHID + "')][not(contains(@style, 'display: none'))]");
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "yaxisbtn").notHidden();
    }

    public void openSelectorWindow()
    {
        super.openSelectorWindow(XPATHID, "y-axis");
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
        // This code should wait for the plot to draw and if there is a 'Median values' pop-up wait for it to go away as well.
        _test.sleep(1500);
        _test._ext4Helper.waitForMaskToDisappear(120000);  // Wait 2 mins. The test have much lower performance on TC. Until we have a real performance test (consistent environment etc...) I would rather not fail function test for it.
        // There is a bug where the mouse can end up over a time axis data point which will generate a hopscotch bubble.
        // However that is not the bubble indicating median values. So moving mouse out of the way.
        _test.mouseOver(Locator.xpath("//img[contains(@src, 'logo.png')]"));
        _test.sleep(500);
        _test.mouseOut();
        _test.waitForElementToDisappear(Locator.css("div.hopscotch-bubble.animated.hopscotch-callout.no-number"));
    }

    public void pickSource(String source)
    {
        // If not currently on the source page, move there.
        if (!_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")))
        {
            backToSource();
        }
        super.pickSource(XPATHID, source);
    }

    public void backToSource()
    {
        super.backToSource(XPATHID);
    }

    public void back()
    {
        super.back(XPATHID);
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//div[text()='Scale:']/following-sibling::div"));
        _test.waitForElement(Locator.xpath("//div[contains(@class, '" + XPATHID + "-option-scale-dropdown')][not(contains(@style, 'display: none'))]//table[contains(@class, 'x-form-type-radio')]//tbody//tr//td//label[contains(text(), '" + scale.getScaleLabel() + "')]"), CDSHelper.CDS_WAIT * 2);
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "-option-scale-dropdown')][not(contains(@style, 'display: none'))]//table[contains(@class, 'x-form-type-radio')]//tbody//tr//td//label[contains(text(), '" + scale.getScaleLabel() + "')]"));

        // Move the mouse so the drop down can close.
        Actions builder = new Actions(_test.getDriver());
        builder.moveToElement(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//div[text()='Scale:']").findElement(_test.getWrappedDriver()), 50, -50).build().perform();

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

    public void setAntigensAggregated(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.AntigensAggregated, value);
    }

    public Locator openAntigenPanel()
    {
        return super.openAntigenPanel(XPATHID);
    }

    public void setIsotype(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.Isotype, value);
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

    public void validateAntigenSubjectCount(Map<String, String> counts, Boolean cancelAtEnd)
    {
        super.verifyParticipantCount(XPATHID, AssayDimensions.AntigenName, counts, cancelAtEnd);
    }

    public void validatePeptidePoolSubjectCount(Map<String, String> counts, Boolean cancelAtEnd)
    {
        super.verifyParticipantCount(XPATHID, AssayDimensions.PeptidePool, counts, cancelAtEnd);
    }

    public void validateProteinSubjectCount(Map<String, String> counts, Boolean cancelAtEnd)
    {
        super.verifyParticipantCount(XPATHID, AssayDimensions.Protein, counts, cancelAtEnd);
    }

    public void validateProteinPanelSubjectCount(Map<String, String> counts, Boolean cancelAtEnd)
    {
        super.verifyParticipantCount(XPATHID, AssayDimensions.ProteinPanel, counts, cancelAtEnd);
    }

    public void validateVirusSubjectCount(Map<String, String> counts, Boolean cancelAtEnd)
    {
        super.verifyParticipantCount(XPATHID, AssayDimensions.VirusName, counts, cancelAtEnd);
    }

}
