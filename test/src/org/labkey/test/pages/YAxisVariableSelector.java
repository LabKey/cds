package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;

public class YAxisVariableSelector extends DataspaceVariableSelector
{
    public YAxisVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "yaxispicker";
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "yaxisbtn").notHidden();
    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return false;
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("set y axis"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[@id='plotymeasurewin']//td[contains(@class, 'x-form-cb-wrap')][.//label[text()='" + scale + "']]//input"));
    }
}
