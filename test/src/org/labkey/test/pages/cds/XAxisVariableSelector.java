/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class XAxisVariableSelector extends DataspaceVariableSelector
{
    public static final String XPATHID = "x-axis-selector";

    public XAxisVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "xaxispicker";
    }

    @Override
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
        WebElement plot = Locator.css(".plot svg").findElement(_test.getDriver());

        _test.click(CDSHelper.Locators.cdsButtonLocator("Set x-axis"));
        if (_test.isElementPresent(Locator.tagWithClass("button", "yaxisbtn").notHidden()))
        {
            _test.shortWait().until(ExpectedConditions.stalenessOf(plot));
            _test._ext4Helper.waitForMaskToDisappear(120000); // Wait 2 mins. The test have much lower performance on TC. Until we have a real performance test (consistent environment etc...) I would rather not fail function test for it.
            // There is a bug where the mouse can end up over a time axis data point which will generate a hopscotch bubble.
            // However that is not the bubble indicating median values. So moving mouse out of the way.
            _test.mouseOut();
            _test.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(Locator.css("div.hopscotch-bubble.animated.hopscotch-callout.no-number")));
        }
        else // Opens y-axis dialog automatically
        {
            _test.waitForElement(CDSHelper.Locators.divByInnerText("y-axis")).isDisplayed();
        }
    }

    public void openSelectorWindow()
    {
        // There is a bug where the mouse can end up over a time axis data point which will generate a hopscotch bubble.
        // However that is not the bubble indicating median values. So moving mouse out of the way.
        _test.mouseOver(Locator.xpath(CDSHelper.LOGO_IMG_XPATH));
        super.openSelectorWindow(XPATHID, "x-axis");
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

    @Override
    public void setScale(Scale scale)
    {
        WebElement dropDownButton = Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//div[text()='Scale:']/following-sibling::div").findWhenNeeded(_test.getDriver());
        WebDriverWrapper.waitFor(dropDownButton::isDisplayed, "Dropdown button not visible.", 500);
        dropDownButton.click();

        WebElement dropDownOption = Locator
                .xpath("//div[contains(@class, '" + XPATHID + "-option-scale-dropdown')][not(contains(@style, 'display: none'))]//table[contains(@class, 'x-form-type-radio')]//tbody//tr//td//label[contains(text(), '" + scale.getScaleLabel() + "')]")
                .findWhenNeeded(_test.getDriver());
        WebDriverWrapper.waitFor(dropDownOption::isDisplayed, String.format("Drop down option '%s' not displayed.'", scale.getScaleLabel()), 1_000);
        dropDownOption.click();

        // Move the mouse so the drop down can close.
        _test.mouseOut();
        WebDriverWrapper.waitFor(
                ()->!Locator.tagWithClassContaining("div", XPATHID + "-option-scale-dropdown").findWhenNeeded(_test.getDriver()).isDisplayed(),
                "Drop-down for the scale selector did not go away.", 500);

    }

    public void setCellType(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.CellType, value);
    }

    public void setPlotType(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.PlotType, value);
    }

    public List<String> getTimePointPlotTypeOptions()
    {
        return getTimePointAdvancedOptions("Plot type");
    }

    public String getTimePointAdvancedOptionSelectedValue(String optionLabel)
    {
        _test.mouseOver(Locator.tagWithText("div", optionLabel + ":"));
        String xpathDimField = getTimeOptionAdvancedOptionXPathDimField(optionLabel);
        Locator.XPathLocator locDimField = Locator.xpath(xpathDimField);
        WebElement element = locDimField.findElementOrNull(_test.getDriver());
        if (element != null)
            return element.getText();
        return null;
    }

    public List<String> getTimePointAdvancedOptions(String optionLabel)
    {
        _test.mouseOver(Locator.tagWithText("div", optionLabel + ":"));
        List<String> options = new ArrayList<>();
        String xpathDimField = getTimeOptionAdvancedOptionXPathDimField(optionLabel);
        String xpathDimDropDown = "//div[contains(@class, 'advanced-dropdown')][not(contains(@style, 'display: none'))]";

        Locator.XPathLocator locDimField = Locator.xpath(xpathDimField);

        WebElement locDimFieldEl = locDimField.findElementOrNull(_test.getDriver());

        if (locDimFieldEl != null)
        {
            _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimFieldEl));
            locDimFieldEl.click();

            // Let the drop down render.
            Locator.XPathLocator dropdownLoc = Locator.xpath(xpathDimDropDown);
            _test.longWait().until(LabKeyExpectedConditions.animationIsDone(dropdownLoc));

            Locator.XPathLocator dropdownOptionsLoc = dropdownLoc.append(Locator.tagWithClass("label", "x-form-cb-label"));
            List<WebElement> dropdownOptions = dropdownOptionsLoc.findElements(_test.getDriver());
            if (dropdownOptions != null)
            {
                dropdownOptions.forEach(dropdown -> options.add(dropdown.getText()));
            }
        }
        return options;
    }

    public boolean isTimeOptionAlignedByDisabled()
    {
        _test.mouseOver(Locator.tagWithText("div", "Aligned by:"));
        String xpathDimField = getTimeOptionAdvancedOptionXPathDimField("Aligned by");
        String xpathDimDropDown = "//div[contains(@class, 'advanced-dropdown')][not(contains(@style, 'display: none'))]";

        Locator.XPathLocator locDimField = Locator.xpath(xpathDimField);

        if (_test.isElementPresent(locDimField))
        {
            _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimField));
            _test.click(locDimField);

            // Let the drop down render.
            Locator.XPathLocator dropdownLoc = Locator.xpath(xpathDimDropDown);
            Locator.XPathLocator disabledDropdownOptionsLoc = dropdownLoc.append(Locator.tagWithClass("table", "x-item-disabled"));
            _test.longWait().until(LabKeyExpectedConditions.animationIsDone(dropdownLoc));

            boolean isPresent = _test.isElementPresent(disabledDropdownOptionsLoc);
            _test.mouseOver(Locator.tagWithText("div", "Aligned by:"));
            return isPresent;
        }
        return false;
    }

    public boolean isTimeOptionAlignByPresent()
    {
        String xpathDimField = getTimeOptionAdvancedOptionXPathDimField("Aligned by");
        Locator.XPathLocator locDimField = Locator.xpath(xpathDimField);
        return _test.isElementVisible(locDimField);
    }

    public void setAlignedBy(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.AlignBy, value);
    }

    public void setIsotype(String... value)
    {
        super.setAssayDimension(XPATHID, AssayDimensions.Isotype, value);
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
