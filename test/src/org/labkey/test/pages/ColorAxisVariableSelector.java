package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;

public class ColorAxisVariableSelector extends DataspaceVariableSelector
{
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
        return Locator.id("plotcolorwin").toCssLocator();
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
        _test.click(CDSHelper.Locators.cdsButtonLocator("set color variable"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void setScale(Scale scale)
    {
        throw new UnsupportedOperationException("No log scale for color variable");
    }
}
