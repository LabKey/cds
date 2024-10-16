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

import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.labkey.test.pages.cds.DataspaceVariableSelector.AssayDimensions.CellType;
import static org.labkey.test.pages.cds.XAxisVariableSelector.XPATHID;

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

    public void openSelectorWindow(String selector, String selectorTitle)
    {
        String xpathToCancel = "//div[contains(@class, '" + selector + "')]//a[not(contains(@style, 'display: none'))]//span[(contains(@class, 'x-btn-inner'))][text()='Cancel']";

        WebElement openButton = _test.longWait().until(ExpectedConditions.visibilityOfElementLocated(getOpenButton()));
        _test.sleep(500);
        _test._ext4Helper.waitForMaskToDisappear();
        openButton.click();
        _test.longWait().until(ExpectedConditions.visibilityOfElementLocated(CDSHelper.Locators.divByInnerText(selectorTitle)));

        // Use the cancel button as a validation that the selector is ready.
        _test.longWait().until(LabKeyExpectedConditions.animationIsDone(Locator.xpath(xpathToCancel)));
        _test.longWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath(xpathToCancel)));

        // Wait for the spinning orange circle to go away. In some cases don't even see that so wait until counts show up (possible bug?)
        while(!_test.isElementPresent(Locator.xpath("//div[contains(@class, 'content-count')]"))
                || (_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + selector + "')][contains(@class, 'item-spinner-mask-orange')]"))))
        {
            _test.log("Waiting for subject counts to complete before returning.");
            _test.sleep(1000);
        }

    }

    public Locator.CssLocator pickerPanel()
    {
        return Locator.css("." + getPickerClass());
    }

    public Locator sourcePanelRow()
    {
        return Locator.CssLocator.union(pickerPanel().append(" .sourcepanel div.itemrow span.val"), // selects rows with counts
                pickerPanel().append(" .sourcepanel div.itemrow")); // selects rows without counts (also rows with counts due to CSS limitations)
    }

    public Locator.CssLocator measuresPanelRow()
    {
        return isMeasureMultiSelect() ?
                pickerPanel().append(" .content-multiselect tr." + Ext4Helper.getCssPrefix() + "grid-data-row"):
                pickerPanel().append(" .content div.content-item");
    }

    public Locator.CssLocator variableOptionsRow()
    {
        return window().append(" .variableoptionsgrid tr." + Ext4Helper.getCssPrefix() + "grid-data-row");
    }

    public void pickSource(String selector, String source)
    {
        // Wait for the spinning orange circle to go away. In some cases don't even see that so wait until counts show up (possible bug?)
        while(!_test.isElementPresent(Locator.xpath("//div[contains(@class, 'content-count')]"))
                || (_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + selector + "')][contains(@class, 'item-spinner-mask-orange')]"))))
        {
            _test.log("Waiting for subject counts before clicking source.");
            _test.sleep(5000);
        }
        _test.waitAndClick(window().append(" div.content-label").withText(source));

        // Click the title (try to get rid of tool-tip bubble.
        _test.click(Locator.xpath("//span[@class='section-title']").notHidden());

        // Move the mouse to the LabKey icon (again trying to remove the tool tip).
        _test.mouseOver(Locator.xpath(CDSHelper.LOGO_IMG_XPATH));

//        _test.shortWait().until(LabKeyExpectedConditions.animationIsDone(window().append(" div.content-label").withText(source)));
        _test.sleep(1000);
    }

    public void removeVariable()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("Remove variable"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    protected void backToSource(String selector)
    {
        while(!_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + selector + "')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")))
        {
            _test.click(Locator.xpath("//div[contains(@class, '" + selector + "')]//span[contains(@class, 'back-action')]"));
            _test.sleep(750);
        }
    }

    protected void back(String selector)
    {
        _test.click(Locator.xpath("//div[contains(@class, '" + selector + "')]//span[contains(@class, 'back-action')]"));
        _test.sleep(750);
    }

    // TODO remove, and update/remove sourcePanelRow / measuresPanelRow
    public void pickMultiPanelSource(String source)
    {
        _test.waitAndClick(sourcePanelRow().containing(source)); // This is used in multi-panel select.
    }

    public void pickVariable(String variable)
    {
        Locator variableLock = window().append(" div.content-label").withText(variable);
        _test.waitForElementToBeVisible(variableLock);
        _test.scrollIntoView(variableLock);
        _test.click(variableLock);
        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
    }

    public List<String> getAvailableVariables()
    {
        List<String> variables = new ArrayList<>();
        Locator.XPathLocator selectorPanelLoc = Locator.tagWithClass("div", "variable-selector");
        Locator.XPathLocator variableLoc = selectorPanelLoc.append(Locator.tagWithClass("div", "content-label").notHidden());
        variableLoc.findElements(_test.getDriver())
                .forEach(webElement -> variables.add(webElement.getText()));
        return variables;
    }

    //Pick measure from one of multiple split panel measure pickers
    public void pickMeasure(String source, String measure, boolean keepSelection)
    {
        pickMultiPanelSource(source);
        //select measure
        if (isMeasureMultiSelect())
        {
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(measuresPanelRow())); // if one row is ready, all should be
            _test._ext4Helper.selectGridItem("label", measure, -1, getPickerClass() + " .measuresgrid", keepSelection);
        }
        else
        {
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(measuresPanelRow())); // if one row is ready, all should be
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
            WebElement rowChecker = row.findElement(Locator.css(String.format(".%sgrid-row-checker", Ext4Helper.getCssPrefix())));
            rowChecker.click();
        }
    }

    public void clearVariableOptions()
    {
        _test._ext4Helper.clearGridSelection(window().append(" .variableoptionsgrid").findElement(_test.getDriver()));
    }

    public void selectAllVariableOptions()
    {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    public void setVariableRadio(String text)
    {
        Locator radioRows = Locator.css(".variableoptions .x-checkboxgroup-form-item");
        WebElement row = radioRows.withText(text).findElement(_test.getDriver());
        Locator.css("input").findElement(row).click();
    }

    public void pickMeasure(String source, String measure)
    {
        pickMeasure(source, measure, false);
    }

    public void cancelSelection()
    {
        _test.click(window().append(" a.x-btn").withText("Cancel"));
        // Hopscotch bubbles aren't always going away. So move off of the selector to help it disappear.
        new CDSHelper(_test).dismissTooltip();
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public Locator openAntigenPanel(String selector)
    {
        String xpathDimField, xpathPanelSelector;
        Locator locDimField;

        xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-antigen')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
        xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
        locDimField = Locator.xpath(xpathDimField);
        _test.click(locDimField);
        _test.waitForElement(Locator.xpath(xpathPanelSelector), CDSHelper.CDS_WAIT * 3);
        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION); // Yuck!
        _test.waitForElement(Locator.xpath(xpathPanelSelector + "//div[contains(@class, 'col-title')][contains(text(), 'Antigen')]"), CDSHelper.CDS_WAIT * 3);

        return Locator.xpath(xpathPanelSelector);

    }

    private void participantCountHelper(String selector, AssayDimensions dimension, Map<String, String> counts, Boolean cancelAtEnd, String xpathDimField, String xpathPanelSelector)
    {
        Locator locDimField;
        String actualCount, xpathToElement;
        String xpath = "//div[translate(@test-data-value, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='*']";

        locDimField = Locator.xpath(xpathDimField);
        _test.click(locDimField);
        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
        _test.waitForElement(Locator.xpath(xpathPanelSelector), CDSHelper.CDS_WAIT * 3);
        LabKeyExpectedConditions.animationIsDone(Locator.xpath(xpathPanelSelector));

        for (Map.Entry<String, String> entry : counts.entrySet())
        {
            xpathToElement = xpath.replaceAll("[*]", entry.getKey().toLowerCase());
            _test.waitForElement(Locator.xpath(xpathPanelSelector + xpathToElement), CDSHelper.CDS_WAIT * 3);

            actualCount = _test.getText(Locator.xpath(xpathPanelSelector + xpathToElement));

            // If expected count is -1 don't validate count.
            if (entry.getValue() != "-1")
            {

                Assert.assertEquals("Count for " + entry.getKey() + " not as expected. Expected: " + entry.getValue() + " found: " + actualCount, actualCount, entry.getValue());

                // If count is 0 validate UI as expected.
                if (entry.getValue() == "0")
                {
                    Locator.XPathLocator parent = Locator.xpath(xpathPanelSelector + xpathToElement + "/./parent::div");
                    _test.assertElementPresent(parent.withAttributeContaining("class", "col-disable"));
                }

            }

        }

        if (cancelAtEnd)
        {
            _test.click(CDSHelper.Locators.cdsSelectorButtonLocator(selector, "Cancel"));
        }

    }

    // This can be used to verify participant counts on the detail panels.
    protected void verifyParticipantCount(String selector, AssayDimensions dimension, Map<String, String> counts, Boolean cancelAtEnd)
    {
        String xpathDimField, xpathPanelSelector;

        switch(dimension)
        {
            case AntigenName:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-antigen')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                participantCountHelper(selector, dimension, counts, cancelAtEnd, xpathDimField, xpathPanelSelector);
                break;
            case PeptidePool:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-peptide_pool')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                participantCountHelper(selector, dimension, counts, cancelAtEnd, xpathDimField, xpathPanelSelector);
                break;
            case Protein:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-protein')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                participantCountHelper(selector, dimension, counts, cancelAtEnd, xpathDimField, xpathPanelSelector);
                break;
            case ProteinPanel:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-protein_panel')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                participantCountHelper(selector, dimension, counts, cancelAtEnd, xpathDimField, xpathPanelSelector);
                break;
            case VirusName:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-virus')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                participantCountHelper(selector, dimension, counts, cancelAtEnd, xpathDimField, xpathPanelSelector);
                break;
        }

    }

    private void commonAssayDimensionSelection(String selector, String xpathDimField, String xpathDimDropDown, String... value)
    {

        Locator.XPathLocator locDimField = Locator.xpath(xpathDimField);

        if (_test.isElementPresent(locDimField))
        {
            _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimField));
            _test.mouseOver(locDimField);
            _test.click(locDimField);

            // Let the drop down render.
            _test.longWait().until(LabKeyExpectedConditions.animationIsDone(Locator.xpath(xpathDimDropDown)));

            for (String val : value)
                _test.click(Locator.xpath(xpathDimDropDown + "//label[text()='" +val + "']"));

            // The drop down does not close after a selection is made, so need to close it by moving away from it.
            _test.mouseOut();

        }

    }

    protected void selectTimeOptionAdvancedOption(String axisSelector, String fieldLabel, String... value)
    {
        String xpathDimField = getTimeOptionAdvancedOptionXPathDimField(fieldLabel);
        String xpathDimDropDown = "//div[contains(@class, 'advanced-dropdown')][not(contains(@style, 'display: none'))]";

        commonAssayDimensionSelection(axisSelector, xpathDimField, xpathDimDropDown, value);
    }

    protected String getTimeOptionAdvancedOptionXPathDimField(String fieldLabel)
    {
        return "//div[contains(@class, '" + XPATHID + "')]//div[contains(@class, 'advanced')]//div[contains(@class, 'field-label')][text()='" +
                fieldLabel + ":']/./following-sibling::div[contains(@class, 'field-display')]//div[contains(@class, 'main-label')]";
    }

    // TODO Still working on this as part of the detail selection.
    protected void setAssayDimension(String selector, AssayDimensions dimension, String... value)
    {
        String xpathDimField, xpathDimDropDown, xpathPanelSelector;
        Locator.XPathLocator locDimField, allTag;
        CDSHelper cds = new CDSHelper(_test);
        Actions builder = new Actions(_test.getDriver());

        switch(dimension)
        {
            case AlignBy:
                selectTimeOptionAdvancedOption(selector, "Aligned by", value);
                break;
            case PlotType:
                selectTimeOptionAdvancedOption(selector, "Plot type", value);
                break;

            case AntigenName:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-antigen')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                locDimField = Locator.xpath(xpathDimField);

                _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimField));
                _test.click(locDimField);

                allTag = Locator.xpath(xpathPanelSelector + "//label[text()='All']/./preceding-sibling::input");

                _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
                _test.longWait().until(LabKeyExpectedConditions.animationIsDone(allTag));
                _test.longWait().until(ExpectedConditions.elementToBeClickable(allTag));

                // Clear the current selection.
                if (!cds.isCheckboxChecked(xpathPanelSelector + "//label[text()='All']"))
                {
                    _test.click(allTag);
                }
                _test.click(allTag);

                for (String val : value)
                    _test.click(Locator.xpath(xpathPanelSelector + "//label[text()='" + val + "']"));

                // Hopscotch bubbles aren't always going away. So move off of the selector to help it disappear.
                new CDSHelper(_test).dismissTooltip();
                _test.click(CDSHelper.Locators.cdsButtonLocator("Done"));

                break;

            case CellType:
            case AntigensAggregated:
                String option = dimension == CellType ? "cell_type" : "pooled_info";
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-" + option + "')]//div[contains(@class, 'main-label')]";
                xpathDimDropDown = "//div[contains(@class, '" + selector + "-option-" + option + "-dropdown')][not(contains(@style, 'display: none'))]";

                locDimField = Locator.xpath(xpathDimField);
                allTag = Locator.xpath(xpathDimDropDown + "//label[text()='All']");

                if (_test.isElementPresent(locDimField))
                {
                    _test.mouseOver(locDimField);

                    _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimField));
                    _test.click(locDimField);

                    // Let the drop down render.
                    _test.longWait().until(LabKeyExpectedConditions.animationIsDone(Locator.xpath(xpathDimDropDown)));
                    _test.longWait().until(ExpectedConditions.elementToBeClickable(allTag));

                    // Clear the current selection.
                    if (!cds.isCheckboxChecked(xpathDimDropDown + "//label[text()='All']"))
                    {
                        _test.click(allTag);
                    }
                    _test.click(allTag);

                    for (String val : value)
                        _test.click(Locator.xpath(xpathDimDropDown + "//label[text()='" +val + "']"));

                    // Move the mouse so the drop down can close.
                    _test.mouseOut();

                }

                break;

            case DataSummaryLevel:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-summary_level')]//div[contains(@class, 'main-label')]";
                xpathDimDropDown = "//div[contains(@class, '" + selector + "-option-summary_level-dropdown')][not(contains(@style, 'display: none'))]";

                commonAssayDimensionSelection(selector, xpathDimField, xpathDimDropDown, value);

                break;

            case Isotype:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-antibody_isotype')]//div[contains(@class, 'main-label')]";
                xpathDimDropDown = "//div[contains(@class, '" + selector + "-option-antibody_isotype-dropdown')][not(contains(@style, 'display: none'))]";

                commonAssayDimensionSelection(selector, xpathDimField, xpathDimDropDown, value);

                break;

            case Protein:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-protein')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                locDimField = Locator.xpath(xpathDimField);
                _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimField));
                _test.click(locDimField);
                _test.sleep(CDSHelper.CDS_WAIT);
                _test.waitForElement(Locator.xpath(xpathPanelSelector + "//label[@test-data-value='protein_panel-all']"), CDSHelper.CDS_WAIT * 3);

                // Since a protein has multiple columns the allTag will point to the all tag in the far left column.
                allTag = Locator.xpath(xpathPanelSelector + "//label[@test-data-value='protein_panel-all']");

                _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
                _test.longWait().until(LabKeyExpectedConditions.animationIsDone(allTag));
                _test.longWait().until(ExpectedConditions.elementToBeClickable(allTag));

                // Clear the current selection.
                if (!cds.isCheckboxChecked(xpathPanelSelector + "//label[@test-data-value='protein_panel-all']"))
                {
                    _test.click(allTag);
                }
                _test.click(allTag);

                for (String val : value)
                {
                    // The translate function will turn the value for @test-data-value to lowercase. The function lower-case is only available in XPath 2.0
                    _test.click(Locator.xpath(xpathPanelSelector + "//label[translate(@test-data-value, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='" + val.toLowerCase() + "']"));
                }

                // Hopscotch bubbles aren't always going away. So move off of the selector to help it disappear.
                new CDSHelper(_test).dismissTooltip();
                _test.click(CDSHelper.Locators.cdsButtonLocator("Done"));

                break;

            case TargetCell:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-target_cell')]//div[contains(@class, 'main-label')]";
                xpathDimDropDown = "//div[contains(@class, '" + selector + "-option-target_cell-dropdown')][not(contains(@style, 'display: none'))]";

                commonAssayDimensionSelection(selector, xpathDimField, xpathDimDropDown, value);

                break;

            case VirusName:
                xpathDimField = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'advanced')]//fieldset[contains(@class, '" + selector + "-option-virus')][not(contains(@style, 'display: none'))]//div[contains(@class, 'main-label')]";
                xpathPanelSelector = "//div[contains(@class, '" + selector + "')]//div[contains(@class, 'content')]";
                locDimField = Locator.xpath(xpathDimField);
//                _test.longWait().until(LabKeyExpectedConditions.animationIsDone(locDimField));
                _test.click(locDimField);

                // Since a virus has multiple columns the allTag will point to the all tag in the far left column.
                allTag = Locator.xpath(xpathPanelSelector + "//label[@test-data-value='neutralization_tier-all']");

                _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
                _test.longWait().until(LabKeyExpectedConditions.animationIsDone(allTag));
                _test.scrollIntoView(allTag);
                _test.longWait().until(ExpectedConditions.elementToBeClickable(allTag));

                _test.waitForElement(allTag, CDSHelper.CDS_WAIT * 3);

                // Clear the current selection.
                if (!cds.isCheckboxChecked(xpathPanelSelector + "//label[@test-data-value='neutralization_tier-all']"))
                {
                    _test.click(allTag);
                }
                _test.click(allTag);

                for (String val : value)
                    _test.click(Locator.xpath(xpathPanelSelector + "//label[translate(@test-data-value, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='" + val.toLowerCase() + "']"));

                // Hopscotch bubbles aren't always going away. So move off of the selector to help it disappear.
                new CDSHelper(_test).dismissTooltip();
                _test.click(CDSHelper.Locators.cdsButtonLocator("Done"));

                break;
        }

        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
    }

    // TODO Still working on this as part of the detail selection.
    public static enum AssayDimensions
    {
        AlignBy,
        AntigenName,
        AntigensAggregated,
        CellType,
        DataSummaryLevel,
        DataSummaryLevelPKMAb,
        DetectionSystem,
        Dilution,
        FunctionalMarkerName,
        InstrumentCode,
        Isotype,
        LabId,
        PeptidePool,
        PlotType,
        Protein,
        ProteinPanel,
        SpecimenType,
        TargetCell,
        VirusName
    }

    public static enum Scale
    {
        Log("Log"),
        Linear("Linear");

        private final String scaleLabel;

        private Scale(String label)
        {
           this.scaleLabel = label;
        }

        public String getScaleLabel()
        {
            return this.scaleLabel;
        }
    }
}
