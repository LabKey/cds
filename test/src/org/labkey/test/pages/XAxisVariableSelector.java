package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;
import org.openqa.selenium.support.ui.ExpectedConditions;

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
    protected boolean isMeasureMultiSelect()
    {
        return false;
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("set x axis"));
        if (_test.isElementPresent(Locator.tagWithClass("button", "yaxisbtn").notHidden()))
        {
            _test._ext4Helper.waitForMaskToDisappear();
        }
        else // Opens y-axis dialog automatically
        {
            YAxisVariableSelector yaxis = new YAxisVariableSelector(_test);
            _test.shortWait().until(ExpectedConditions.elementToBeClickable(yaxis.sourcePanelRow().toBy()));
        }
    }

    public void setScale(Scale scale)
    {
        _test.click(Locator.xpath("//div[@id='plotxmeasurewin']//td[contains(@class, 'x-form-cb-wrap')][.//label[text()='" + scale + "']]//input"));
    }
}
