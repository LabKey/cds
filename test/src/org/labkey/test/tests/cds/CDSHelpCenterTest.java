/*
 * Copyright (c) 2015-2016 LabKey Corporation
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

import org.jetbrains.annotations.Nullable;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CDS;
import org.labkey.test.util.cds.CDSHelpCenterUtil;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.cds.CDSInitializer;
import org.labkey.test.util.PostgresOnlyTest;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertTrue;

@Category({CDS.class})
public class CDSHelpCenterTest extends BaseWebDriverTest implements PostgresOnlyTest
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

    private final CDSHelpCenterUtil helpCenter = new CDSHelpCenterUtil(this);
    private final CDSHelper cds = new CDSHelper(this);

    @Test
    public void verifyHelpCenter()
    {
        // set up wikis, enter app, open help popup
        helpCenter.setUpWikis();
        cds.enterApplication();
        openHelpCenter();

        // verify home page and open individual wiki
        verifyAtHomePage();
        mouseOverClick(Locator.linkWithText(CDSHelpCenterUtil.HELP_1_2_TITLE));
        assertTextPresent(CDSHelpCenterUtil.HELP_1_2_CONTENT_SUB);
        verifyAndClickBackButton();
        verifyAtHomePage();

        // verify See all link and Back action
        int seeAllCount = Locator.css(CDSHelpCenterUtil.HELP_SEE_ALL_CSS).findElements(getDriver()).size();
        assertTrue("See all link count is incorrect", seeAllCount == 1);
        List<WebElement> seeAlls = Locator.css(CDSHelpCenterUtil.HELP_SEE_ALL_CSS).findElements(getDriver());
        doShortWait();
        fireEvent(seeAlls.get(seeAlls.size() - 1), SeleniumEvent.mouseup);
        doShortWait();
        assertElementPresent(Locator.linkWithText(CDSHelpCenterUtil.HELP_3_1_TITLE));
        mouseOverClick(Locator.linkWithText(CDSHelpCenterUtil.HELP_3_1_TITLE));
        assertTextPresent(CDSHelpCenterUtil.HELP_3_1_TITLE);
        verifyAndClickBackButton();
        verifyAndClickBackButton();
        verifyAtHomePage();

        // verify search
        assertElementPresent(CDSHelpCenterUtil.HELP_SEARCH_INPUT);
        setFormElement(CDSHelpCenterUtil.HELP_SEARCH_INPUT, "cds");
        doShortWait();
        int searchResultCount = Locator.css(CDSHelpCenterUtil.HELP_SEARCH_RESULT_CSS).findElements(getDriver()).size();
        assertTrue("See result for key word cds is incorrect", searchResultCount > 6);
        assertElementPresent(Locator.linkWithText(CDSHelpCenterUtil.HELP_1_1_TITLE));
        mouseOverClick(Locator.linkWithText(CDSHelpCenterUtil.HELP_1_1_TITLE));
        assertTextPresent(CDSHelpCenterUtil.HELP_1_1_TITLE);
        verifyAndClickBackButton();

        // verify search change
        doShortWait();
        searchResultCount = Locator.css(CDSHelpCenterUtil.HELP_SEARCH_RESULT_CSS).findElements(getDriver()).size();
        assertTrue("See result for key word cds is incorrect", searchResultCount > 6);
        assertElementPresent(Locator.linkWithText(CDSHelpCenterUtil.HELP_1_1_TITLE));
        assertElementPresent(CDSHelpCenterUtil.HELP_SEARCH_INPUT);
        setFormElement(CDSHelpCenterUtil.HELP_SEARCH_INPUT, "");
        doShortWait();
        verifyAtHomePage();
        assertElementPresent(CDSHelpCenterUtil.HELP_SEARCH_INPUT);
        setFormElement(CDSHelpCenterUtil.HELP_SEARCH_INPUT, "data");
        doShortWait();
        searchResultCount = Locator.css(CDSHelpCenterUtil.HELP_SEARCH_RESULT_CSS).findElements(getDriver()).size();
        assertTrue("See result for key word data is incorrect", searchResultCount > 5);
        assertElementPresent(Locator.linkWithText(CDSHelpCenterUtil.CATEGORY_1_TITLE));
        doShortWait();

        // verify closing and re-opening help center
        List<WebElement> logos = Locator.css(CDSHelpCenterUtil.OUTSIDE_POPUP_LOGO_CSS).findElements(getDriver());
        doShortWait();
        WebElement element = logos.get(logos.size() - 1);
        Actions builder = new Actions(getDriver());
        builder.moveToElement(element, 10, 10).click().build().perform(); // click outside popup should close the popup
        doShortWait();

        openHelpCenter();
        verifyAtHomePage();

     }

    private void openHelpCenter()
    {
        doShortWait();
        assertElementNotPresent(CDSHelpCenterUtil.HELP_POPUP_XPATH);
        assertElementPresent(Locator.linkWithText(CDSHelpCenterUtil.HELP_BUTTON_TEXT));
        mouseOverClick(Locator.linkWithText(CDSHelpCenterUtil.HELP_BUTTON_TEXT));
        longWait().until(ExpectedConditions.visibilityOfElementLocated(CDSHelpCenterUtil.HELP_POPUP_XPATH.toBy()));
        doShortWait();
    }

    private void verifyAtHomePage()
    {
        doShortWait();
        assertTextPresent(CDSHelpCenterUtil.HELP_CENTER_TITLE);
        assertTextPresent(CDSHelpCenterUtil.CATEGORY_1_TITLE);
        assertElementPresent(Locator.linkWithText(CDSHelpCenterUtil.HELP_1_1_TITLE));
        doShortWait();
    }

    private void doShortWait()
    {
        sleep(500);
    }

    private void mouseOverClick(Locator loc)
    {
        mouseOver(loc);
        doShortWait();
        click(loc);
        doShortWait();
    }

    private void verifyAndClickBackButton()
    {
        doShortWait();
        assertElementPresent(CDSHelpCenterUtil.HELP_BACK_XPATH);
        mouseOverClick(CDSHelpCenterUtil.HELP_BACK_XPATH);
        doShortWait();
    }

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        helpCenter.deleteWikis();
    }

    @BeforeClass
    public static void doSetup() throws Exception
    {
        CDSHelpCenterTest initTest = (CDSHelpCenterTest)getCurrentTest();

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

}
