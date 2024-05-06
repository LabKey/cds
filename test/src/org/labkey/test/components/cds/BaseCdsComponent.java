package org.labkey.test.components.cds;

import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.openqa.selenium.WebDriver;

public abstract class BaseCdsComponent<EC extends Component<?>.ElementCache> extends WebDriverComponent<EC>
{
    private final WebDriverWrapper _wdw;

    protected BaseCdsComponent(WebDriverWrapper wdw)
    {
        _wdw = wdw;
    }

    @Override
    public final WebDriver getDriver()
    {
        return _wdw.getDriver();
    }

    @Override
    public final WebDriverWrapper getWrapper()
    {
        // Avoid creating a new `Ext4Helper`, which resets the css prefix
        return _wdw;
    }
}
