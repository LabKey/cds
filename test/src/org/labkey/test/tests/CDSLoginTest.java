/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
package org.labkey.test.tests;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.CDSLoginPage;
import org.labkey.test.util.CDSHelper;

import java.util.Arrays;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.pages.CDSLoginPage.Locators.emailField;
import static org.labkey.test.pages.CDSLoginPage.Locators.passwordField;
import static org.labkey.test.pages.CDSLoginPage.Locators.rememberMeCheckbox;
import static org.labkey.test.pages.CDSLoginPage.Locators.termsCheckbox;

@Category({CDS.class, Git.class})
public class CDSLoginTest extends CDSReadOnlyTest
{
    @Before
    public void preTest()
    {
        signOut();
        beginAt(WebTestHelper.buildURL("cds", getProjectName(), "begin"));
    }

    @Test
    public void testLoginPage()
    {
        assertEquals("Wrong sign in page", "HIV CDS", getDriver().getTitle());
        assertFalse(emailField.findElement(getDriver()).isEnabled());
        assertFalse(passwordField.findElement(getDriver()).isEnabled());
        assertFalse(rememberMeCheckbox.findElement(getDriver()).isEnabled());
        assertTrue(rememberMeCheckbox.findElement(getDriver()).isSelected());
        assertElementNotPresent(Locator.linkWithText("Logout"));

        CDSLoginPage loginPage = new CDSLoginPage(this);
        checkCheckbox(termsCheckbox);
        loginPage.logIn();
    }

    @Test
    public void testSessionTimeoutIntercept()
    {
        CDSLoginPage loginPage = new CDSLoginPage(this);
        checkCheckbox(termsCheckbox);
        loginPage.logIn();

        signOutHTTP();

        sleep(1000);

//        // It looks like there was a change in the behavior. If the test runs quickly calling signOutHTTP
//        // will generate a session time out. If the test run slowly (like you are stepping through it) you will
//        // see the grid navigation link and clicking on it will generate a time out message.
        if (isElementPresent(CDSHelper.NavigationLink.GRID.getLinkLocator()) && isElementVisible(CDSHelper.NavigationLink.GRID.getLinkLocator()))
        {
            clickAndWait(CDSHelper.NavigationLink.GRID.getLinkLocator());
        }

        waitForElement(Locator.css("p.errormsg").withText("Your session has timed out. Please login to continue."));
    }

    @Override
    public java.util.List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }
}
