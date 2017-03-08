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
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.dumbster.EmailRecordTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertTrue;

@Category({})
public class CDSSecurityTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    private final String[] PERM_GROUPS = {"CDSSecurity Test Group01", "CDSSecurity Test Group02", "CDSSecurity Test Group03"};

    private final String[] NEW_USER_ACCOUNTS = {"addusertest01@nowhere.com", "addusertest02@nowhere.com", "addusertest03@nowhere.com", "addusertest04@nowhere.com"};

    @Before
    public void preTest()
    {
        Ext4Helper.setCssPrefix("x-");

        log("Deleting groups that may be left over from a previous run.");
        deletePermissionGroups();

        log("Deleting user email accounts that may be left over from a previous run.");
        deleteUsersIfPresent(NEW_USER_ACCOUNTS);

        beginAt("project/" + getProjectName() + "/begin.view?");
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        CDSSecurityTest init = (CDSSecurityTest)getCurrentTest();

        init.log("Cleaning up and deleting groups that were created.");
        init.deletePermissionGroups();

        init.log("Cleaning up and deleting user email accounts that were created.");
        init.deleteUsersIfPresent(init.NEW_USER_ACCOUNTS);

    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Test
    public void verifyUserPermissions()
    {

        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        _permissionsHelper.createPermissionsGroup(PERM_GROUPS[0]);
        if (isElementPresent(Locator.permissionRendered()) && isButtonPresent("Save and Finish"))
        {
            clickButton("Save and Finish");
        }

        goToProjectHome();
        clickFolder("z119");
        _permissionsHelper.enterPermissionsUI();
        sleep(1000);
        _permissionsHelper.uncheckInheritedPermissions();
        clickButton("Save", 0);

        //This is the workaround for issue 20329
        sleep(1000);
        _permissionsHelper.uncheckInheritedPermissions();
        clickButton("Save", 0);

        waitForElement(Locator.permissionRendered());

        _securityHelper.setProjectPerm(PERM_GROUPS[0], "Reader");
        clickButton("Save and Finish");

        goToProjectHome();
        _permissionsHelper.enterPermissionsUI();
        _securityHelper.setProjectPerm(PERM_GROUPS[0], "Reader");
        clickButton("Save and Finish");

        _permissionsHelper.createPermissionsGroup(PERM_GROUPS[1]);
        if (isElementPresent(Locator.permissionRendered()) && isButtonPresent("Save and Finish"))
        {
            clickButton("Save and Finish");
        }

        _permissionsHelper.enterPermissionsUI();
        _securityHelper.setProjectPerm(PERM_GROUPS[1], "Reader");
        clickButton("Save and Finish");

        impersonateGroup(PERM_GROUPS[0], false);

        cds.enterApplication();
        _asserts.assertFilterStatusCounts(8, 1, 1, 1, 2);

        cds.viewLearnAboutPage("Studies");
        List<String> studies = Arrays.asList("ZAP 119");
        _asserts.verifyLearnAboutPage(studies);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();

        //TODO The call to stopImpersonatingGroup goes to home.
        // The group is not available from home, only from the CDS project.
        goToProjectHome();

        impersonateGroup(PERM_GROUPS[1], false);

        cds.enterApplication();
        _asserts.assertFilterStatusCounts(0, 0, 0, 0, 0);
        cds.viewLearnAboutPage("Studies");
        _asserts.verifyEmptyLearnAboutStudyPage();

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();
    }

    @Test
    public void verifyFirstTimeUse()
    {
        final String cssAddUsersLink = "a.labkey-text-link[href$='addUsers.view?provider=cds']";
        String[] welcomeUrls;

        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        goToProjectHome();

        waitForElement(Locator.css(cssAddUsersLink));
        clickAndWait(Locator.css(cssAddUsersLink));

        log("Adding user " + NEW_USER_ACCOUNTS[3] + " this user will validate the Sign-in help.");
        setFormElement(Locator.css("textarea[name='newUsers']"), NEW_USER_ACCOUNTS[3]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(NEW_USER_ACCOUNTS[3] + " added as a new user to the system and emailed successfully.");

        log("Adding user " + NEW_USER_ACCOUNTS[2] + " this user will be deleted before his invitation link is clicked.");
        setFormElement(Locator.css("textarea[name='newUsers']"), NEW_USER_ACCOUNTS[2]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(NEW_USER_ACCOUNTS[2] + " added as a new user to the system and emailed successfully.");

        log("Adding user " + NEW_USER_ACCOUNTS[1] + " this user will be added with no permissions.");
        setFormElement(Locator.css("textarea[name='newUsers']"), NEW_USER_ACCOUNTS[1]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(NEW_USER_ACCOUNTS[1] + " added as a new user to the system and emailed successfully.");

        log("Adding user " + NEW_USER_ACCOUNTS[0] + " this user will be added with all permissions.");
        log("Setting clone permission to account: " + getCurrentUser());
        click(Locator.css("input[name='cloneUserCheck']"));
        setFormElement(Locator.css("input[name='cloneUser']"), getCurrentUser());
        setFormElement(Locator.css("textarea[name='newUsers']"), NEW_USER_ACCOUNTS[0]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(NEW_USER_ACCOUNTS[0] + " added as a new user to the system and emailed successfully.");

        log("Go look at the emails that were generated.");

        welcomeUrls = getWelcomeLinks();

        for(int i=0; i < welcomeUrls.length; i++)
        {
            log("Email: " + NEW_USER_ACCOUNTS[i] + " welcome url: " + welcomeUrls[i]);
        }

        log("Delete user " + NEW_USER_ACCOUNTS[2] + " then test that first time sign-on behaves as expected for this user.");
        deleteUsersIfPresent(NEW_USER_ACCOUNTS[2]);

        log("Now sign out and validate the welcome urls.");
        signOut();

        log("Validate behavior with the deleted user.");
        getDriver().navigate().to(welcomeUrls[2]);
        handleCreateAccount("P@$$w0rd", true);
        waitForText("Create account failed.");

        log("Validate behavior with the user who does not have permissions to CDS.");
        getDriver().navigate().to(welcomeUrls[1]);
        handleCreateAccount("P@$$w0rd", true);
        waitForTextToDisappear("Thanks for creating your account.");
        sleep(5000);
        assertTrue("Login dialog should have been shown again with a blank password. I did not find an empty password field.", getFormElement(Locator.css("input[name='password']")).trim().length() == 0);

        // This sleep is unfortunate. I thought that the delay in the following waitForElementText would be enough, but it's not.
        sleep(5000);

        waitForElementText(Locator.css("h1"), "CAVD DataSpace member sign-in", 15000);
        handleSimpleLogin(NEW_USER_ACCOUNTS[1], "P@$$w0rd");
        sleep(5000);
        waitForElementText(Locator.css("td.x-form-display-field-body[role='presentation']"), "Forbidden", 15000);

        log("Click the ok button on the 'Forbidden' dialog to dismiss and continue.");
        click(Locator.xpath("//div[contains(@class, 'x-message-box')]//a[contains(@class, 'x-btn-noicon')][not(contains(@style, 'display: none'))]"));
        sleep(5000);

        // Even though this account doesn't have permissions it is still logged into labkey so
        // we need to log it out before we test the next user. You have strange sessions states if you don't do this.
        log("Logout the user without permissions.");
        click(Locator.xpath("//a[contains(@class, 'logout')][contains(text(), 'Logout')]"));
        sleep(5000);
        refresh();

        log("Validate behavior with the user who has full permissions to CDS.");
        getDriver().navigate().to(welcomeUrls[0]);
        sleep(5000);
        assertElementVisible(Locator.xpath("//div[contains(@class, 'mfp-content')]//div[contains(@class, 'title')]//h1[contains(text(), 'Create your account')]"));

        log("Close the dialog and validate the 'Create Account' button is present.");
        click(Locator.xpath("//div[contains(@class, 'mfp-content')]//div[contains(@class, 'modal')]//button[contains(@class, 'mfp-close')]"));
        assertElementVisible(Locator.xpath("//div[@class='links']/span//following-sibling::a[contains(@class, 'create-account-modal-trigger')][contains(text(), 'Create Account')]"));

        log("Go back to the 'Create Account' dialog.");
        click(Locator.xpath("//div[@class='links']/span//following-sibling::a[contains(@class, 'create-account-modal-trigger')][contains(text(), 'Create Account')]"));

        log("Validate Terms of Use.");
        click(Locator.css("div.tos a.expand-tos strong.highlight"));
        assertElementVisible(Locator.xpath("//div[@class='mfp-content']//form//div[contains(@class, 'tos')]//div[contains(@class, 'terms-of-service')][contains(@class, 'open')]"));

        log("Try to create the account without agreeing to the Terms Of Service.");
        handleCreateAccount("P@$$w0rd", false);

        // Don't have a good way to capture the dialog shown saying you need to accept the TOS.
        // So simply validating that the success message was not shown.
        assertTextNotPresent("Create account successful.");

        log("Now accept the Terms Of Use and try to create password again.");
        checkCheckbox(Locator.css("input[id='tos-create-account']"));
        click(Locator.css("input[id='createaccountsubmit']"));
        waitForText("Thanks for creating your account.");
        waitForTextToDisappear("Thanks for creating your account.");

        // Another unfortunate sleep. Again I thought that the delay in the following waitForElementText would be enough, but it's not.
        sleep(5000);

        waitForElementText(Locator.css("h1"), "CAVD DataSpace member sign-in", 15000);
        handleSimpleLogin(NEW_USER_ACCOUNTS[0], "P@$$w0rd");
        sleep(5000);
        log("Validate we are on the CDS home page.");
        assertTextPresent("Welcome to the CAVD DataSpace.");

        log("Done. Signing back into main site with default test account to clean up.");
        click(Locator.xpath("//a[contains(@class, 'logout')][contains(text(), 'Logout')]"));
        sleep(5000);
        refresh();

        log("Validate that the 'Sign In' button is visible and the 'Create Account' button is not.");
        beginAt(WebTestHelper.buildURL("cds", getProjectName(), "app"));
        assertElementPresent(Locator.css("div.links > a.signin-modal-trigger"));
        assertElementNotVisible(Locator.css("div.links > a.create-account-modal-trigger"));

        log("Validate using the 'Sign-in Help' button.");
        click(Locator.xpath("(//a[@class='signin-modal-trigger'][text()='Sign In'])[2]"));
        waitForElementText(Locator.css("h1"), "CAVD DataSpace member sign-in", 15000);
        setFormElement(Locator.css("input[name='email']"), NEW_USER_ACCOUNTS[3]);
        setFormElement(Locator.css("input[name='password']"), "P@$$w0rd");
        click(Locator.tagWithClass("a", "help"));
        waitForElement(Locator.tagWithText("h1", "Sign-in Help"));
        assertTextPresent("To set or reset your password, type in your email address and click the submit button.");
        assertTrue("Did not find email '" + NEW_USER_ACCOUNTS[3] + "' in text box.", getFormElement(Locator.inputById("emailhelp")).toLowerCase().equals(NEW_USER_ACCOUNTS[3].toLowerCase()));
        click(Locator.linkWithText("Cancel"));

        // Log in as admin, like start of test, this will allow test to clean up correctly.
        ensureSignedInAsPrimaryTestUser();

    }

    private String[] getWelcomeLinks()
    {
        String usrEmail = "", msgSubject = " : Welcome to the Demo Installation LabKey Server Web Site new user registration";
        String[] urls = new String[NEW_USER_ACCOUNTS.length];

        goToModule("Dumbster");

        EmailRecordTable emailRecordTable = new EmailRecordTable(this);
        EmailRecordTable.EmailMessage msg = new EmailRecordTable.EmailMessage();

        for(int index=0; index < NEW_USER_ACCOUNTS.length; index++)
        {
            msg.setSubject(NEW_USER_ACCOUNTS[index] + msgSubject);
            emailRecordTable.clickMessage(msg);
            usrEmail = NEW_USER_ACCOUNTS[index].substring(0, NEW_USER_ACCOUNTS[index].indexOf("@"));
            urls[index] = getAttribute(Locator.css("a[href*='&email=" + usrEmail + "']"), "href");
        }

        return urls;

    }

    private void handleCreateAccount(String password, boolean agreeToTOS)
    {
        setFormElement(Locator.css("input[name='password']"), password);
        setFormElement(Locator.css("input[name='reenter-password']"), password);
        if(agreeToTOS)
        {
            checkCheckbox(Locator.css("input[id='tos-create-account']"));
        }
            click(Locator.css("input[id='createaccountsubmit']"));
    }

    private void handleSimpleLogin(String email, String password)
    {
        setFormElement(Locator.css("input[name='email']"), email);
        setFormElement(Locator.css("input[name='password']"), password);
        checkCheckbox(Locator.css("input[id='tos-checkbox']"));
        click(Locator.css("input[id='signin']"));
    }

    private void deletePermissionGroups()
    {
        String ExtDialogTitle;

        log("Refreshing the browser.");
        refresh();
        sleep(1000);
        beginAt("project/" + getProjectName() + "/begin.view?");
        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        if (!isElementPresent(Locator.permissionRendered()))
        {
            _permissionsHelper.enterPermissionsUI();
        }

        _ext4Helper.clickTabContainingText("Project Groups");

        for(String group : PERM_GROUPS)
        {
            log("Looking for text: " + group);
            if (isTextPresent(group))
            {
                ExtDialogTitle = group + " Information";

                _permissionsHelper.openGroupPermissionsDisplay(group);
                _extHelper.waitForExtDialog(ExtDialogTitle);
                _permissionsHelper.deleteAllUsersFromGroup();
                clickButton("Delete Empty Group", 0);
                log("Have deleted the empty group.");
                waitForElement(Locator.css(".groupPicker .x4-grid-cell-inner").withText("Users"), WAIT_FOR_JAVASCRIPT);
                sleep(500);
                clickButton("Cancel");

                if (!isElementPresent(Locator.permissionRendered()))
                {
                    _permissionsHelper.enterPermissionsUI();
                }

                _ext4Helper.clickTabContainingText("Project Groups");

            }

        }

        clickButton("Cancel");
    }

}
