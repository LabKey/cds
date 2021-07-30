package org.labkey.test.pages.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.ext4.Checkbox;
import org.openqa.selenium.WebElement;

import java.util.List;

// This is a page in only the general sense. It is not like current pages in other automation but is similar to other
// sign-in page in CDS. yes it should be updated, but so should all of CDS, and no we don't have the time or budget to do that.
public class CDSCreateAccountPage
{
    private final BaseWebDriverTest _test;

    public CDSCreateAccountPage(BaseWebDriverTest test)
    {
        _test = test;
        // Wait until the signInButton is visible (not null) before returning.
        WebDriverWrapper.waitFor(()->submitButton() != null, "Create Account page did not load.", 5_000);
    }

    public void setPasswordField(String password)
    {
        _test.setFormElement(passwordField(), password);
    }

    public void setReenterPasswordField(String password)
    {
        _test.setFormElement(reenterPasswordField(), password);
    }

    public void clickSubmitButton()
    {
        submitButton().click();
    }

    public void checkTermsBox(boolean check)
    {
        if(check && !termsCheckbox().isChecked())
        {
            termsCheckbox().check();
        }

        if(!check && termsCheckbox().isChecked())
        {
            termsCheckbox().uncheck();
        }
    }

    private WebElement findVisible(Locator locator)
    {
        // Yes this is ugly. This is the check to identify the visible control. Currently for the number of CDS tests
        // that use the login page the call to findElements for the page will return only two or three controls.
        WebElement element = null;
        List<WebElement> elements = locator.findElements(_test.getDriver());
        for(WebElement el : elements)
        {
            if(el.isDisplayed())
            {
                element = el;
                break;
            }
        }

        return element;
    }

    public WebElement passwordField()
    {
        return findVisible(Locator.name("password"));
    }

    public WebElement reenterPasswordField()
    {
        return findVisible(Locator.name("reenter-password"));
    }

    public WebElement submitButton()
    {
        return findVisible(Locator.tagWithId("input", "createaccountsubmit"));
    }

    public Checkbox termsCheckbox()
    {
        return new Checkbox(findVisible(Locator.checkboxById("tos-create-account")));
    }

}
