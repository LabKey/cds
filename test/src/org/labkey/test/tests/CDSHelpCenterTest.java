package org.labkey.test.tests;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.Git;
import org.labkey.test.util.CDSHelpCenterUtil;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.openqa.selenium.NoSuchElementException;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by xingyang on 11/5/15.
 */
@Category({CDS.class, Git.class})
public class CDSHelpCenterTest extends CDSReadOnlyTest
{
    private final CDSHelpCenterUtil helpCenter = new CDSHelpCenterUtil(this);

    @Test
    public void verifyHelpCenter()
    {
        helpCenter.setUpWikis();
    }

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        helpCenter.deleteWikis();
    }

    @BeforeClass
    public static void doSetup() throws Exception
    {
        CDSReadOnlyTest initTest = (CDSReadOnlyTest)getCurrentTest();

        boolean needSetUp = false;
        try
        {
            initTest.goToProjectHome();
            new CDSHelper(initTest).enterApplication();
        }
        catch (NoSuchElementException e)
        {
            needSetUp = true;
        }

        if (needSetUp)
        {
            CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
            _initializer.setupDataspace();
        }
    }

    @Override
    public boolean needsSetup()
    {
        // return true so that cleanup can be done
        return true;
    }

}
