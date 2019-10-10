/*
 * Copyright (c) 2018-2019 LabKey Corporation
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

import org.junit.Test;
import org.labkey.test.Locator;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public abstract class CDSGroupBaseTest extends CDSReadOnlyTest
{
    public ApiPermissionsHelper _apiPermissionsHelper = new ApiPermissionsHelper(this);

    protected final CDSHelper cds = new CDSHelper(this);
    protected final CDSAsserts _asserts = new CDSAsserts(this);


    protected final String[] NEW_USER_ACCOUNTS = {"cds_alice@cdsgroup.test", "cds_bob@cdsgroup.test", "cds_eve@cdsgroup.test"};
    //this test case focuses on whether groups are shared properly.
    protected final String[] PRIVATE_GROUP_NAME = {"test_Group_reader", "test_Group_editor"};
    protected final String[] PRIVATE_GROUP_NAME_DESCRIPTION = {"This group selects studies", "This group selects studies"};
    protected static final String SHARED_GROUP_NAME = "shared_Group";
    protected static final String SHARED_MAB_GROUP_NAME = "shared_mab_Group";


    abstract void _composeGroup();

    protected boolean isMab()
    {
        return false;
    }

    public void verifySharedGroups()
    {
        //Ensure test users don't already exist
        _userHelper.deleteUser(NEW_USER_ACCOUNTS[0]);
        _userHelper.deleteUser(NEW_USER_ACCOUNTS[1]);
        _userHelper.deleteUser(NEW_USER_ACCOUNTS[2]);

        String privateGroupOneName = PRIVATE_GROUP_NAME[0] + (isMab() ? "_mab" : "");
        String privateGroupTwoName = PRIVATE_GROUP_NAME[1] + (isMab() ? "_mab" : "");
        String sharedGroupName = isMab() ? SHARED_MAB_GROUP_NAME : SHARED_GROUP_NAME;

        log("Testing permissions for creating a shared "  + "group");
        //Validate a user with Reader role can create a group without issue.
        _impersonateRole("Reader");
        //Create a group.
        _composeGroup();
        //saveGroup verifies that the shared group checkbox is not present.
        boolean result = cds.saveGroup(privateGroupOneName, PRIVATE_GROUP_NAME_DESCRIPTION[0], true, false, isMab());
        assertFalse("Updating shared status of " + (isMab() ? "mab " : "") + "group should fail.", result);
        result = cds.saveGroup(privateGroupOneName, PRIVATE_GROUP_NAME_DESCRIPTION[0], false, false, isMab());
        assertTrue("Failed to update " + (isMab() ? "mab " : "") + "group", result);
        cds.goToAppHome();
        cds.deleteGroupFromSummaryPage(privateGroupOneName);
        _stopImpersonatingRole();

        _impersonateRole("Editor");
        _composeGroup();
        result = cds.saveGroup(privateGroupTwoName, PRIVATE_GROUP_NAME_DESCRIPTION[1], true, false, isMab());
        assertTrue("Failed to create new shared " + (isMab() ? "mab " : "") + "group as Editor.", result);
        cds.goToAppHome();
        cds.deleteGroupFromSummaryPage(privateGroupTwoName);
        _stopImpersonatingRole();

        String rootContainer = getProjectName();

        _userHelper.createUser(NEW_USER_ACCOUNTS[0], false, true);
        _userHelper.createUser(NEW_USER_ACCOUNTS[1], false, true);
        _userHelper.createUser(NEW_USER_ACCOUNTS[2], false, true);

        goToProjectHome();

        Ext4Helper.resetCssPrefix();
        _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[0], "Editor");
        _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[1], "Reader");
        _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[2], "Editor");

        //Arbitrary amount of studies to run through
        List<Integer> studyIndices = Arrays.asList(0, 1, 2, 3, 7);
        for (Integer itr : studyIndices)
        {
            String studyName = CDSHelper.PROTS[itr];
            goToProjectHome(rootContainer + "/" + studyName);
            _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[0], "Editor");
            _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[1], "Reader");
            _apiPermissionsHelper.setUserPermissions(NEW_USER_ACCOUNTS[2], "Editor");
        }
        Ext4Helper.setCssPrefix("x-");

        //As an editor, make a shared group and a private group
        _impersonateUser(NEW_USER_ACCOUNTS[0]);
        _composeGroup();
        cds.saveGroup(privateGroupOneName, PRIVATE_GROUP_NAME_DESCRIPTION[0], false, false, isMab());
        cds.saveGroup(sharedGroupName, "", true, false, isMab());
        _stopImpersonatingRole();


        //Impersonate the reader
        _impersonateUser(NEW_USER_ACCOUNTS[1]);
        cds.enterApplication();

        Locator sharedGroupLoc = getSharedGroupLoc(sharedGroupName);
        //Verify that private group is not shared and that public group is
        Locator mineHeader = Locator.xpath("//h2[contains(text(), 'My saved groups and plots')][contains(@class, 'section-title')]");
        assertElementNotPresent("User should not have any of their own " + (isMab() ? "mab " : "") + "groups.", mineHeader);
        assertElementNotPresent(privateGroupOneName + " should not been visible to this user",
                Locator.xpath("//div[contains(@class, 'grouplabel')][contains(text(), '" + privateGroupOneName + "')]"));
        assertTrue("Shared " + (isMab() ? "mab " : "") + "group should be visible", isElementPresent(sharedGroupLoc));

        //Examine shared group
        click(sharedGroupLoc);
        waitForText("Edit details");

        log("verify that reader cannot edit");
        click(CDSHelper.Locators.cdsButtonLocator("Edit details"));
        click(CDSHelper.Locators.cdsButtonLocator("Save").notHidden());
        waitForText(isMab() ? "User does not have permission to update a shared mab group" : "ERROR");
        click(CDSHelper.Locators.cdsButtonLocator("OK", "x-toolbar-item").notHidden());
        _ext4Helper.waitForMaskToDisappear();

        log("Verify that reader cannot delete");
        click(CDSHelper.Locators.cdsButtonLocator("Delete"));
        waitForText("Are you sure you want to delete");
        click(CDSHelper.Locators.cdsButtonLocator("Delete", "x-toolbar-item").notHidden());
        waitForText("ERROR");
        click(CDSHelper.Locators.cdsButtonLocator("OK", "x-toolbar-item").notHidden());

        //switch to other editor account
        _stopImpersonatingUser();
        _impersonateUser(NEW_USER_ACCOUNTS[2]);
        cds.enterApplication();

        log("verify that another editor can update shared group");
        boolean updateSuccess = cds.updateSharedGroupDetails(sharedGroupName, null, "Updated Description", null);
        assertTrue("Expected to successfully update " + (isMab() ? "mab " : "") + "group description", updateSuccess);

        log("Verify user is not able to unshare other user's group");
        updateSuccess = cds.updateSharedGroupDetails(sharedGroupName, null, null, false); //should fail
        assertFalse("Expected to fail " + (isMab() ? "mab " : "") + "group update. Should not be able to unshared other user's group", updateSuccess);

        //delete group
        click(sharedGroupLoc);
        waitForText("Edit details");
        click(CDSHelper.Locators.cdsButtonLocator("Delete"));
        waitForText("Are you sure you want to delete");
        click(CDSHelper.Locators.cdsButtonLocator("Delete", "x-toolbar-item").notHidden());
        waitForText("groups and plots");
        refresh();
        assertElementNotPresent("Group: " + sharedGroupName + " should not have been present after deletion",
                Locator.xpath("//*[contains(@class, 'section-title')]" +
                        "[contains(text(), 'Curated groups and plots')]" +
                        "/following::div[contains(@class, 'grouprow')]" +
                        "/div[contains(text(), '" + sharedGroupName + "')]"));
        _stopImpersonatingUser();

        _userHelper.deleteUser(NEW_USER_ACCOUNTS[0]);
        _userHelper.deleteUser(NEW_USER_ACCOUNTS[1]);
        _userHelper.deleteUser(NEW_USER_ACCOUNTS[2]);

    }


    protected Locator getSharedGroupLoc(String sharedGroupName)
    {
        return Locator.xpath("//*[contains(@class, 'section-title')][contains(text(), 'Curated groups and plots')]" +
                "/following::div[contains(@class, 'grouprow')]/div[contains(text(), '" + sharedGroupName + "')]");
    }

    protected void _impersonateRole(String role)
    {
        doActionInStandardLabkey(() -> impersonateRole(role));
    }

    protected void _stopImpersonatingRole()
    {
        doActionInStandardLabkey(this::stopImpersonatingRole);
    }

    protected void _impersonateUser(String user)
    {
        doActionInStandardLabkey(() -> impersonate(user));
    }

    protected void _stopImpersonatingUser()
    {
        doActionInStandardLabkey(this::stopImpersonating);
    }

    protected void doActionInStandardLabkey(Runnable action)
    {
        goToProjectHome();
        Ext4Helper.resetCssPrefix();
        action.run();
        Ext4Helper.setCssPrefix("x-");
        cds.enterApplication();
    }

}
