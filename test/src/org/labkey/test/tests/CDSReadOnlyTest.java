package org.labkey.test.tests;

import org.apache.http.HttpStatus;
import org.jetbrains.annotations.Nullable;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.InDevelopment;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ReadOnlyTest;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Category({InDevelopment.class})
public class CDSReadOnlyTest extends BaseWebDriverTest implements ReadOnlyTest, PostgresOnlyTest
{
    @Nullable
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

    @Override @LogMethod (quiet = true)
    public boolean needsSetup()
    {
        try
        {
            return HttpStatus.SC_NOT_FOUND == WebTestHelper.getHttpGetResponse(WebTestHelper.buildURL("project", getProjectName(), "begin"));
        }
        catch (IOException e)
        {
            return true;
        }
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        Ext4Helper.resetCssPrefix();
    }
}