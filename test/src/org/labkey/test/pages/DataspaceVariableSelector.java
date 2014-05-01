package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.CDSTest;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public abstract class DataspaceVariableSelector
{
    protected BaseWebDriverTest _test;

    public DataspaceVariableSelector(BaseWebDriverTest test)
    {
        _test = test;
    }

    protected abstract String getPickerClass();
    protected abstract Locator getOpenButton();

    public void openSelectorWindow()
    {
        WebElement openButton = _test.shortWait().until(ExpectedConditions.elementToBeClickable(getOpenButton().toBy()));

        openButton.click();

        _test.shortWait().until(ExpectedConditions.elementToBeClickable(sourcePanelRow().toBy()));
    }

    protected Locator.CssLocator pickerPanel()
    {
        return Locator.css("." + getPickerClass());
    }

    protected Locator.CssLocator sourcePanelRow()
    {
        return Locator.CssLocator.union(pickerPanel().append(".sourcepanel div.itemrow span.val"), // selects rows with counts
                                        pickerPanel().append(".sourcepanel div.itemrow")); // selects rows without counts (also rows with counts due to CSS limitations)
    }

    public void pickSource(String source)
    {
        _test.waitAndClick(sourcePanelRow().containing(source));
    }

    //Pick measure from one of multiple split panel measure pickers
    public void pickMeasure(String source, String measure, boolean isMultiSelect, boolean keepSelection)
    {
        pickSource(source);
        //select measure
        if (isMultiSelect)
        {
            Locator.CssLocator _variablePanelRow = pickerPanel().append(".measuresgrid ." + Ext4Helper.getCssPrefix() + "grid-row");
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(_variablePanelRow.toBy())); // if one row is ready, all should be
            _test._ext4Helper.selectGridItem("label", measure, -1, getPickerClass() + " .measuresgrid", keepSelection);
        }
        else
        {
            Locator.CssLocator _variablePanelRow = pickerPanel().append(".measuresgrid div.itemrow");
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(_variablePanelRow.toBy())); // if one row is ready, all should be
            _test.click(_variablePanelRow.withText(measure));
        }
    }

    public void pickMeasure(String source, String measure)
    {
        pickMeasure(source, measure, false, false);
    }

    public abstract void setScale(Scale scale);

    public abstract void confirmSelection();

    public static enum Scale
    {
        Log,
        Linear
    }
}
