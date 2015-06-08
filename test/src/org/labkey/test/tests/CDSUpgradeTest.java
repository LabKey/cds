package org.labkey.test.tests;

import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.util.CDSUpgrader;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;

import java.util.Collections;
import java.util.List;

@Category({CustomModules.class, CDS.class})
public class CDSUpgradeTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    @Nullable
    @Override
    protected String getProjectName()
    {
        return "CDSUpgradeTest Project";
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Collections.singletonList("CDS");
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        CDSUpgradeTest initTest = (CDSUpgradeTest) getCurrentTest();
        CDSUpgrader _initializer = new CDSUpgrader(initTest, initTest.getProjectName());
        _initializer.setupDataspace();
    }

    @Test
    public void verifyNothing()
    {
        /* Nope, nothing */
    }
}
