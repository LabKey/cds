/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.cds.ChangePasswordDialog;
import org.labkey.test.pages.cds.CDSLoginPage;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.PermissionsHelper;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.core.login.DbLoginUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 12)
public class CDSLoginTest extends CDSReadOnlyTest
{
    private static final String CDS_LOGIN_TESTUSER = "user_passwordtest@cds.test";

    @Before
    public void preTest()
    {
        _userHelper.deleteUsers(false, CDS_LOGIN_TESTUSER);
        signOut();
        Map<String, String> loginParams = new HashMap<>();
        loginParams.put("login", "true");
        beginAt(WebTestHelper.buildURL("cds", getProjectName(), "app", loginParams));
    }

    @Test
    public void testLoginPage()
    {
        assertEquals("Wrong sign in page", "CAVD DataSpace", getDriver().getTitle());
//        assertFalse(emailField.findElement(getDriver()).isEnabled());
//        assertFalse(passwordField.findElement(getDriver()).isEnabled());
//        assertFalse(rememberMeCheckbox.findElement(getDriver()).isEnabled());
//        assertTrue(rememberMeCheckbox.findElement(getDriver()).isSelected());
        assertElementNotPresent(Locator.linkWithText("Logout"));

        CDSLoginPage loginPage = new CDSLoginPage(this);
        checkCheckbox(loginPage.termsCheckbox());
        loginPage.logIn();
    }

    @Test
    public void testSessionTimeoutIntercept()
    {
        CDSLoginPage loginPage = new CDSLoginPage(this);
        checkCheckbox(loginPage.termsCheckbox());
        loginPage.logIn();

        signOutHTTP();

        sleep(1000);

        // It looks like there was a change in the behavior. If the test runs quickly calling signOutHTTP
        // will generate a session time out. If the test run slowly (like you are stepping through it) you will
        // see the grid navigation link and clicking on it will generate a time out message.
        if (isElementPresent(CDSHelper.NavigationLink.GRID.getLinkLocator()) && isElementVisible(CDSHelper.NavigationLink.GRID.getLinkLocator()))
        {
            click(CDSHelper.NavigationLink.GRID.getLinkLocator());
        }

        waitForElement(Locator.css("p").withText("Your session has timed out. Please login to continue."));
    }

    @Test
    public void testPasswordStrength()
    {
        String goodPwd = "cdsDummy1!";
        String strongPwd = PasswordUtil.getPassword();

        log("Set password strength to Good");
        DbLoginUtils.setDbLoginConfig(createDefaultConnection(),
                DbLoginUtils.PasswordStrength.Good,
                DbLoginUtils.PasswordExpiration.Never);

        log("Creating a user with password strength as Good");
        _userHelper.createUser(CDS_LOGIN_TESTUSER);
        setInitialPassword(CDS_LOGIN_TESTUSER); //set goodPwd

        log("Make the user as folder admin for CDS");
        ApiPermissionsHelper apiPermissionsHelper = new ApiPermissionsHelper(this);
        apiPermissionsHelper.addMemberToRole(CDS_LOGIN_TESTUSER, "Folder Administrator", PermissionsHelper.MemberType.user);

        log("Set password strength to Strong");
        DbLoginUtils.setDbLoginConfig(createDefaultConnection(),
                DbLoginUtils.PasswordStrength.Strong,
                DbLoginUtils.PasswordExpiration.Never);

        log("Log in with good password to get prompted for change password");
        CDSLoginPage loginPage = new CDSLoginPage(this);
        checkCheckbox(loginPage.termsCheckbox());
        ChangePasswordDialog changePasswordDialog = loginPage.logInToChangePwd(CDS_LOGIN_TESTUSER, goodPwd);
        Assert.assertEquals("Incorrect error message",
                "Your password does not meet the complexity requirements; please choose a new password.",
                changePasswordDialog.getErrorMessage());
        changePasswordDialog.setPreviousPassword(goodPwd);

        log("Verifying password is not complex enough");
        changePasswordDialog.setPassword("weakPwd");
        changePasswordDialog.setReEnterPassword("weakPwd");
        changePasswordDialog.submit();
        Assert.assertEquals("Incorrect error message", "Your password is not complex enough.", changePasswordDialog.getErrorMessage());

        log("Verifying re-entered password matches");
        changePasswordDialog.setPassword(strongPwd);
        changePasswordDialog.setReEnterPassword("WrongRe-enter");
        changePasswordDialog.submit();
        Assert.assertEquals("Incorrect error message", "Your password entries didn't match.", changePasswordDialog.getErrorMessage());

        changePasswordDialog.setReEnterPassword(strongPwd);
        changePasswordDialog.submit();
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
