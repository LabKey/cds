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

import org.jetbrains.annotations.Nullable;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CDS;
import org.labkey.test.pages.CDSLoginPage;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.UIContainerHelper;

import java.util.Arrays;

import static org.junit.Assert.*;
import static org.labkey.test.pages.CDSLoginPage.Locators.*;

@Category({CDS.class})
public class CDSLoginTest extends BaseWebDriverTest implements PostgresOnlyTest
{

    private static final String PROJECT_NAME = "CDSTest Project";
    private final int WAIT_FOR_DELETE = 5 * 60 * 1000;

    private final CDSHelper _cds = new CDSHelper(this);
    private static String _cdsAppURL;

    @BeforeClass
    public static void doSetup() throws Exception
    {
        CDSLoginTest initTest = (CDSLoginTest)getCurrentTest();

        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setupDataspace();

        initTest._cds.enterApplication();
        _cdsAppURL = initTest.getCurrentRelativeURL();
    }

    @Before
    public void preTest()
    {
        signOut();
        beginAt(_cdsAppURL);
        Ext4Helper.setCssPrefix("x-");
    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {

        if(!CDSHelper.debugTest){
            // TODO Seeing errors when trying to delete via API, UI was more reliable. Need to investigate.
            _containerHelper = new UIContainerHelper(this);
            _containerHelper.deleteProject(PROJECT_NAME, afterTest, WAIT_FOR_DELETE);
        }

    }

    @Test
    public void testLoginPage()
    {
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

    @Nullable
    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
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
