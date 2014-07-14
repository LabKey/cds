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
package org.labkey.test.tests;

import org.jetbrains.annotations.Nullable;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.pages.CDSLoginPage;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PostgresOnlyTest;

import static org.junit.Assert.*;
import static org.labkey.test.pages.CDSLoginPage.Locators.*;

@Category({CustomModules.class, CDS.class})
public class CDSLoginTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private final CDSHelper _cds = new CDSHelper(this);
    private static String _cdsAppURL;

    @BeforeClass
    public static void setUpProject()
    {
        CDSLoginTest initTest = (CDSLoginTest)getCurrentTest();

        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName(), CDSHelper.EMAILS, CDSHelper.PICTURE_FILE_NAMES);
        _initializer.setDesiredStudies(new String[] {"DemoSubset"});
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

    @Test
    public void testLoginPage()
    {
        assertFalse(emailField.findElement(getDriver()).isEnabled());
        assertFalse(passwordField.findElement(getDriver()).isEnabled());
        assertFalse(rememberMeCheckbox.findElement(getDriver()).isEnabled());
        assertTrue(rememberMeCheckbox.findElement(getDriver()).isSelected());
        assertElementNotPresent(Locator.linkWithText("Logout"));

        checkCheckbox(termsCheckbox);

        CDSLoginPage loginPage = new CDSLoginPage(this);
        loginPage.logIn();

        waitForElement(Locator.linkWithText("Logout"));
    }

    @Nullable
    @Override
    protected String getProjectName()
    {
        return "CDSLoginTest Project";
    }

    @Override
    public String getAssociatedModuleDirectory()
    {
        return "CDS";
    }
}
