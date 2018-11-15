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
package org.labkey.test.tests.cds;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ReadOnlyTest;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.cds.CDSInitializer;
import org.openqa.selenium.NoSuchElementException;

import java.util.Arrays;
import java.util.List;

@BaseWebDriverTest.ClassTimeout(minutes = 120)
public class CDSReadOnlyTest extends BaseWebDriverTest implements ReadOnlyTest, PostgresOnlyTest
{
    @Override
    protected final String getProjectName()
    {
        return "CDSTest Project";
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @BeforeClass
    public static void doSetup() throws Exception
    {
        CDSReadOnlyTest initTest = (CDSReadOnlyTest)getCurrentTest();
        if (initTest.needsSetup())
        {
            CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
            _initializer.setupDataspace();
        }
    }

    @Override
    public boolean needsSetup()
    {
        try
        {
            goToProjectHome();
            new CDSHelper(this).enterApplication();
            return false;
        }
        catch (NoSuchElementException e)
        {
            return true;
        }
    }

    @Before
    @LogMethod
    public void preTest()
    {
        if (isImpersonating())
            stopImpersonating();
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        Ext4Helper.resetCssPrefix();
    }
}