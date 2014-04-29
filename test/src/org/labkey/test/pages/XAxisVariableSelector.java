package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.CDSTest;

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

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "xaxisbtn").notHidden();
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSTest.Locators.cdsButtonLocator("set x axis"));
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[@id='plotxmeasurewin']//td[contains(@class, 'x-form-cb-wrap')][.//label[text()='" + scale + "']]//input"));
    }
}
