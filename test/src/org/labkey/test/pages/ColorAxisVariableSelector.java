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
        return "colorpicker";
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "colorbtn").notHidden();
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("set x axis"));
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[@id='plotxmeasurewin']//td[contains(@class, 'x-form-cb-wrap')][.//label[text()='" + scale + "']]//input"));
    }
}
