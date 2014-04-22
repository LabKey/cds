package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.CDSTest;

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
}
