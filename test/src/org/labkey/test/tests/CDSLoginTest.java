package org.labkey.test.tests;

import org.jetbrains.annotations.Nullable;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.Ext4Helper;

import static org.junit.Assert.*;

public class CDSLoginTest extends BaseWebDriverTest
{
    private final CDSHelper _cds = new CDSHelper(this);
    private static String _cdsAppURL;

    @BeforeClass
    public static void setUpProject()
    {
        CDSLoginTest initTest = new CDSLoginTest();

        initTest.doCleanup(false);
        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setupProject();
        initTest._cds.enterApplication();
        _cdsAppURL = initTest.getCurrentRelativeURL();

        currentTest = initTest;
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
        assertFalse(Locator.id("emailField").findElement(getDriver()).isEnabled());
        assertFalse(Locator.id("passwordField").findElement(getDriver()).isEnabled());
        assertFalse(Locator.id("rememberMeCheck").findElement(getDriver()).isEnabled());
        assertTrue(Locator.id("rememberMeCheck").findElement(getDriver()).isSelected());
        assertElementNotPresent(Locator.linkWithText("Logout"));

    }

    @Nullable
    @Override
    protected String getProjectName()
    {
        return "Empty Dataspace Project";
    }

    @Override
    public String getAssociatedModuleDirectory()
    {
        return null;
    }
}
