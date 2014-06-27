/*
 * Copyright (c) 2014 LabKey Corporation
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
package org.labkey.test.pages;

import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.PasswordUtil;

import static org.labkey.test.pages.CDSLoginPage.Locators.*;

public class CDSLoginPage
{
    private final BaseWebDriverTest _test;

    public CDSLoginPage(BaseWebDriverTest test)
    {
        _test = test;
    }

    public void logIn()
    {
        logIn(PasswordUtil.getUsername(), PasswordUtil.getPassword());
    }

    public void logIn(String user, String password)
    {
        Assert.assertTrue("Must agree to terms of use before logging in", termsCheckbox.findElement(_test.getDriver()).isSelected());
        _test.setFormElement(emailField, user);
        _test.setFormElement(passwordField, password);
        _test.clickAndWait(signInButton);
    }

    public static class Locators
    {
        public static Locator emailField = Locator.id("emailField");
        public static Locator passwordField = Locator.id("passwordField");
        public static Locator rememberMeCheckbox = Locator.checkboxById("rememberMeCheck");
        public static Locator termsCheckbox = Locator.checkboxById("termsCheck");
        public static Locator signInButton = Locator.tagWithId("input", "signin");
    }
}
