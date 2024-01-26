package org.labkey.test.components.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.html.Input;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ChangePasswordDialog extends WebDriverComponent<ChangePasswordDialog.ElementCache>
{
    private final WebElement _dialogEl;
    private final WebDriverWrapper _webDriverWrapper;

    public ChangePasswordDialog(BaseWebDriverTest test)
    {
        _webDriverWrapper = test;
        _dialogEl = Locator.tagWithAttribute("div", "data-form", "account-change-password").refindWhenNeeded(_webDriverWrapper.getDriver());
    }

    @Override
    public WebElement getComponentElement()
    {
        return _dialogEl;
    }

    @Override
    protected WebDriver getDriver()
    {
        return _webDriverWrapper.getDriver();
    }

    public ChangePasswordDialog setPreviousPassword(String value)
    {
        elementCache().previousPwd.set(value);
        return this;
    }

    public ChangePasswordDialog setPassword(String value)
    {
        elementCache().password.set(value);
        return this;
    }

    public ChangePasswordDialog setReEnterPassword(String value)
    {
        elementCache().reEnterPassword.set(value);
        return this;
    }

    public String getErrorMessage()
    {
        return elementCache().notification.getText();
    }

    public void submit()
    {

        elementCache().submitButton.click();
        waitForReady();

    }

    public void submitExpectingError()
    {
        elementCache().submitButton.click();
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    public class ElementCache extends Component<?>.ElementCache
    {
        Input previousPwd = new Input(Locator.id("prevPassword").findWhenNeeded(_dialogEl), getDriver());
        Input password = new Input(Locator.id("password1").findWhenNeeded(_dialogEl), getDriver());
        Input reEnterPassword = new Input(Locator.id("password2").findWhenNeeded(_dialogEl), getDriver());

        final WebElement notification = Locator.tagWithClass("div", "notifications").findWhenNeeded(_dialogEl);
        final WebElement strengthGuidance = Locator.id("password-gauge").findWhenNeeded(_dialogEl);
        final WebElement submitButton = Locator.id("changepasswordsubmit").findWhenNeeded(_dialogEl);
    }
}
