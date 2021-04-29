/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.test.pages.cds;

import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.util.PasswordUtil;
import org.openqa.selenium.WebElement;
import java.util.List;

// Like the other CDS pages it would be nice to convert this page to a LabKeyPage object.
// Even after that is done, one of the challenges with this and other CDS pages is that there might be several instances
// of the same control present in the DOM but not visible. For example, depending upon the order the tests, this page
// may have been hit before but in a slightly different way (valid user vs new user, etc...). The result is that the 'dialog'
// that has the various login controls might exists multiple times on this page, but only one is visible. As a result
// when the controls are referenced you need to make sure that it is visible control you have and not one of the hidden ones.
public class CDSLoginPage
{
    private final BaseWebDriverTest _test;

    public CDSLoginPage(BaseWebDriverTest test)
    {
        _test = test;
        // Wait until the signInButton is visible (not null) before returning.
        WebDriverWrapper.waitFor(()->signInButton() != null, "Sign-In page did not load.", 5_000);
    }

    public void logIn()
    {
        logIn(PasswordUtil.getUsername(), PasswordUtil.getPassword());
    }

    public void logIn(String user, String password)
    {
        Assert.assertTrue("Must agree to terms of use before logging in", termsCheckbox().isSelected());
        _test.setFormElement(emailField(), user);
        _test.setFormElement(passwordField(), password);
        _test.clickAndWait(signInButton());

        _test.waitForElement(Locator.linkWithText("Logout"));
    }

    private WebElement findVisible(Locator locator)
    {
        // Yes this is ugly. The findElements will return only two or three controls, it is the check to see if it is
        // visible that will take a while.
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

    public WebElement emailField()
    {
        return findVisible(Locator.id("email"));
    }

    public WebElement passwordField()
    {
        return findVisible(Locator.id("password"));
    }

    public WebElement signInButton()
    {
        return findVisible(Locator.tagWithId("input", "signin"));
    }

    public WebElement rememberMeCheckbox()
    {
        return findVisible(Locator.checkboxById("remember-me-checkbox"));
    }

    public WebElement termsCheckbox()
    {
        return findVisible(Locator.checkboxById("tos-checkbox"));
    }

}
