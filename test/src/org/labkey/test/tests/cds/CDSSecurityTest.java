/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
import org.labkey.remoteapi.CommandException;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.dumbster.EmailRecordTable;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.util.ApiPermissionsHelper;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PermissionsHelper;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.tests.cds.CDSTestLearnAbout.XPATH_TEXTBOX;

@Category({})
public class CDSSecurityTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    private final String[] _permGroups = {"CDSSecurity Test Group01", "CDSSecurity Test Group02", "CDSSecurity Test Group03"};

    private final String[] _newUserAccounts = {"addusertest01@cdssecurity.test", "addusertest02@cdssecurity.test", "addusertest03@cdssecurity.test", "addusertest04@cdssecurity.test"};

    @Before
    public void preTest()
    {
        super.preTest();
        Ext4Helper.setCssPrefix("x-");

        log("Deleting groups that may be left over from a previous run.");
        deletePermissionGroups();

        log("Deleting user email accounts that may be left over from a previous run.");
        deleteUsersIfPresent(_newUserAccounts);

        beginAt("project/" + getProjectName() + "/begin.view?");
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
    public void testUserPermissions()
    {

        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        Map<String, String> studyPermissions = new HashMap<>();
        studyPermissions.put("z119", "Reader");
        cds.setUpPermGroup(_permGroups[0], studyPermissions);

        studyPermissions = new HashMap<>();
        cds.setUpPermGroup(_permGroups[1], studyPermissions);

        impersonateGroup(_permGroups[0], false);

        cds.enterApplication();
        // Because of the feature change 30212 two studies (z120 & z121) will always be included.
        _asserts.assertFilterStatusCounts(278, 3, 1, 1, 8);

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

        impersonateGroup(_permGroups[1], false);

        cds.enterApplication();
        _asserts.assertFilterStatusCounts(270, 2, 1, 1, 6);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();
    }

    @Test
    public void testLearnAboutListingWithLimitedAccess()
    {
        Map<String, String> studyPermissions = new HashMap<>();
        log("Create a user group with Read permission to project but no permission to any study folder");
        cds.setUpPermGroup(_permGroups[0], studyPermissions);
        impersonateGroup(_permGroups[0], false);
        cds.enterApplication();

        log("Verify users with no study permission can see all study listing on Learn About.");
        cds.viewLearnAboutPage("Studies");
        List<String> allStudies = Arrays.asList(CDSHelper.STUDIES);
        _asserts.verifyLearnAboutPage(allStudies);

        log("Verify users with no study permission can see all assay listing on Learn About.");
        cds.viewLearnAboutPage("Assays");
        List<String> allAssays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(allAssays);

        log("Verify users with no study permission can see all product listing on Learn About.");
        cds.viewLearnAboutPage("Products");
        List<String> allProducts = Arrays.asList(CDSHelper.PRODUCTS);
        _asserts.verifyLearnAboutPage(allProducts);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();
    }

    @Test
    public void testLearnStudyDataAvailabilityWithLimitedAccess()
    {
        Map<String, String> studyPermissions = new HashMap<>();
        log("Create a user group with Read permission to project but no permission to any study folder");
        cds.setUpPermGroup(_permGroups[0], studyPermissions);
        impersonateGroup(_permGroups[0], false);
        cds.enterApplication();

        cds.viewLearnAboutPage("Studies");

        validateStudyListDataAdded(false);
        validateStudyDetailDataAvailability(false);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();

        studyPermissions = new HashMap<>();
        studyPermissions.put("q1", "Reader");
        studyPermissions.put("q2", "Reader");
        log("Create a user group with Read permission to project, q1 and q2.");
        cds.setUpPermGroup(_permGroups[1], studyPermissions);
        impersonateGroup(_permGroups[1], false);
        cds.enterApplication();

        cds.viewLearnAboutPage("Studies");

        validateStudyListDataAdded(true);
        validateStudyDetailDataAvailability(true);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();
    }

    private void validateStudyDetailDataAvailability(boolean hasAccessToQ2)
    {
        final String ACCESSIBLE_ICON = "smallCheck.png";
        final String NOT_ACCESSIBLE_ICON = "grayCheck.png";
        final String HAS_NO_DATA_ICON = "smallGreyX.png";

        String dataIcon = hasAccessToQ2 ? ACCESSIBLE_ICON : NOT_ACCESSIBLE_ICON;

        log("Verify detailed Data Availability for QED 2");
        String study = "QED 2";
        Locator element = Locator.xpath("//tr[contains(@class, 'has-data')]/td/div/div/h2[contains(text(), '" + study + "')]");
        assertElementPresent(element);
        scrollIntoView(element);
        mouseOver(element);
        waitForElement(Locator.tagWithClass("tr", "detail-row-hover"));
        waitAndClick(element);
        waitForText("Data Availability");
        Assert.assertTrue("Data Availability status for NAB is not as expected", isElementPresent(cds.getDataRowXPath("NAB").append("//td//img[contains(@src, '" + dataIcon + "')]")));

        cds.viewLearnAboutPage("Studies");
        log("Verify detailed Data Availability for RED 4");
        study = "RED 4";
        element = Locator.xpath("//tr[contains(@class, 'has-data')]/td/div/div/h2[contains(text(), '" + study + "')]");
        assertElementPresent(element);
        scrollIntoView(element);
        mouseOver(element);
        waitForElement(Locator.tagWithClass("tr", "detail-row-hover"));
        waitAndClick(element);
        waitForText("Data Availability");

        Assert.assertTrue("Data Availability status for ICS is not as expected", isElementPresent(cds.getDataRowXPath("ICS").append("//td//img[contains(@src, '" + NOT_ACCESSIBLE_ICON + "')]")));
        Assert.assertTrue("Data Availability status for IFNg ELISpot is not as expected", isElementPresent(cds.getDataRowXPath("IFNg ELISpot").append("//td//img[contains(@src, '" + NOT_ACCESSIBLE_ICON + "')]")));
        Assert.assertTrue("Data Availability status for BAMA is not as expected", isElementPresent(cds.getDataRowXPath("BAMA").append("//td//img[contains(@src, '" + HAS_NO_DATA_ICON + "')]")));

        cds.viewLearnAboutPage("Studies");
    }

    private void validateStudyListDataAdded(boolean hasAccessToQ2)
    {
        final int STUDY_WITH_DATA_ADDED = 24;
        int dataAddedCount = hasAccessToQ2 ? (STUDY_WITH_DATA_ADDED - 1) : STUDY_WITH_DATA_ADDED;
        int dataAccessibleCount = hasAccessToQ2 ? 2 : 1;

        List<WebElement> hasDataIcons = LearnGrid.Locators.rowsWithDataNotAccessible.findElements(getDriver());
        List<WebElement> hasAccessIcons = LearnGrid.Locators.rowsWithDataAccessible.findElements(getDriver());

        Assert.assertTrue("Number of studies without Data Accessible is not as expected",hasDataIcons.size() == dataAddedCount);
        assertTrue("Number of studies with Data Accessible is not as expected", hasAccessIcons.size() == dataAccessibleCount);

        LearnGrid learnGrid = new LearnGrid(this);
        int dataAddedColumn = learnGrid.getColumnIndex("Data Added");
        String qed2DataAddedText = hasAccessToQ2 ? "1 Assay Accessible" : "0/1 Assay Accessible";
        String cellText = learnGrid.getCellText(1, dataAddedColumn);
        Assert.assertTrue("Data Added' column text for study 'QED 2' not as expected. Expected: '" + qed2DataAddedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(qed2DataAddedText.trim().toLowerCase()));
        log("'Data Added' column text as expected for study 'QED 2'.");

        String toolTipText = learnGrid.showDataAddedToolTip(1, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        if (hasAccessToQ2)
            validateToolTipText(toolTipText, "Assays with Data Accessible", "NAB");
        else
            validateToolTipText(toolTipText, "Assays without Data Accessible", "NAB");

        String red4DataAddedText = "0/2 Assays Accessible";
        cellText = learnGrid.getCellText(7, dataAddedColumn);
        Assert.assertTrue("Data Added' column text for study 'RED 4' not as expected. Expected: '" + red4DataAddedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(red4DataAddedText.trim().toLowerCase()));
        log("'Data Added' column text as expected for study 'RED 4'.");

        toolTipText = learnGrid.showDataAddedToolTip(7, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, "Assays without Data Accessible", "ICS", "IFNg ELISpot");
    }

    private void validateToolTipText(String toolTipText, String... expectedText)
    {
        for(String expected : expectedText)
        {
            Assert.assertTrue("Tool tip did not contain text: '" + expected + "'. Found: '" + toolTipText + "'.", toolTipText.trim().toLowerCase().contains(expected.trim().toLowerCase()));
        }
    }

    @Test
    public void testStudyDocumentsWithLimitedAccess()
    {
        Map<String, String> studyPermissions = new HashMap<>();
        log("Create a user group with Read permission to project but no permission to any study folder");
        cds.setUpPermGroup(_permGroups[0], studyPermissions);
        impersonateGroup(_permGroups[0], false);
        cds.enterApplication();

        log("Verify users with no study permission can see study documents with public access only.");
        cds.viewLearnAboutPage("Studies");
        validateStudyDocumentForR2(false);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();

        studyPermissions = new HashMap<>();
        studyPermissions.put("r2", "Reader");
        log("Create a user group with Read permission to project and R2 folder.");
        cds.setUpPermGroup(_permGroups[1], studyPermissions);
        impersonateGroup(_permGroups[1], false);
        cds.enterApplication();

        log("Verify users with study permission can see all study documents.");
        cds.viewLearnAboutPage("Studies");
        validateStudyDocumentForR2(true);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();
    }

    private void validateStudyDocumentForR2(boolean hasAccessToR2)
    {
        String study = "RED 2";
        setFormElement(Locator.xpath(XPATH_TEXTBOX), study);
        sleep(CDSHelper.CDS_WAIT);

        List<WebElement> returnedItems  = LearnGrid.Locators.lockedRow.findElements(getDriver());
        returnedItems.get(0).click();
        waitForText("Study information");
        sleep(2000);

        WebElement documentLink;

        log("Verify public Reports");
        documentLink = CDSHelper.Locators.studyReportLink("ADCC Data Summary").findElementOrNull(getDriver());
        Assert.assertTrue("Was not able to find link to the public report document for study '" + study + "'.", documentLink != null);
        String documentName = "cvd256_Ferrari_ADCC_Pantaleo_EV03_logscale.pdf";
        cds.validatePDFLink(documentLink, documentName);

        log("Verify restricted Reports");
        documentLink = CDSHelper.Locators.studyReportLink("BAMA Results Summary").findElementOrNull(getDriver());
        if (hasAccessToR2)
        {
            Assert.assertTrue("Was not able to find link to the restricted report document for study '" + study + "'.", documentLink != null);
            documentName = "cvd256_ev03_iga_igg.pdf";
            cds.validatePDFLink(documentLink, documentName);
        }
        else
        {
            log("'BAMA Results Summary' access_level is blank so it should be treated as restricted access" );
            Assert.assertTrue("User should not see link to restricted report document for study '" + study + "'.", documentLink == null);
        }

        log("Verify restricted study grant");
        documentLink = cds.getVisibleGrantDocumentLink();
        if (hasAccessToR2)
        {
            Assert.assertTrue("Was not able to find link to the restricted grant document for study '" + study + "'.", documentLink != null);
        }
        else
        {
            Assert.assertTrue("There was a visible link to a grant document for this study, and there should not be.", documentLink == null);
        }

        log("Verify restricted study protocol");
        List<WebElement> protocolLinksLinks = cds.getVisibleStudyProtocolLinks();
        if (hasAccessToR2)
        {
            Assert.assertTrue("Was not able to find link to the restricted protocol for study '" + study + "'.", protocolLinksLinks != null);
        }
        else
        {
            Assert.assertTrue("There was a visible link to a protocol for this study, and there should not be.", protocolLinksLinks == null);
        }

    }

    @Test
    public void verifyImportTableAccessibility()
    {
        log("Verify Site Admin user won't see restricted import tables");
        verifyRestrictedImportTable(true);

        Map<String, String> studyPermissions = new HashMap<>();
        log("Create a user group with Editor permission to project");
        cds.setUpPermGroup(_permGroups[0], studyPermissions, "Editor");
        impersonateGroup(_permGroups[0], false);
        log("Verify Editor user won't see restricted import tables");
        verifyRestrictedImportTable(false);
        stopImpersonatingGroup();

        log("Create a user group with Folder Administrator permission to project");
        cds.setUpPermGroup(_permGroups[1], studyPermissions, "Folder Administrator");
        impersonateGroup(_permGroups[1], false);
        log("Verify Folder Admin user have access to restricted import tables");
        verifyRestrictedImportTable(true);
        stopImpersonatingGroup();
    }

    private void verifyRestrictedImportTable(boolean isAdmin)
    {
        final String schemaName = "CDS";
        for (String queryName : CDSHelper.IMPORT_TABLES_WITH_ADMIN_ACCESS)
        {
            goToProjectHome();
            clickAndWait(Locator.linkWithText("Browse Schema"), 10000);
            waitForElement(Locator.tagWithClass("span", "labkey-link").withText("ds_assay").notHidden());
            Locator loc = Locator.tagWithClass("span", "labkey-link").withText(queryName).notHidden();

            if (isAdmin)
            {
                waitAndClick(loc);
                waitForElementToDisappear(Locator.xpath("//tbody[starts-with(@id, 'treeview')]/tr[not(starts-with(@id, 'treeview'))]"));
                waitForElement(Locator.xpath("//div[contains(./@class,'lk-qd-name')]/h2/a[contains(text(), '" + schemaName + "." + queryName + "')]"), 30000);
            }
            else
            {
                assertElementNotPresent(loc);
            }
        }
    }

    @Test
    public void testSiteUserGroups() throws IOException, CommandException
    {

        StringBuilder errorMessage = new StringBuilder();
        boolean allGood = true;
        ApiPermissionsHelper _apiPermissionHelper = new ApiPermissionsHelper(this);

        goToHome();

        log("For each of the expected groups validate that the containers and access are as expected.");
        for(String groupName : CDSHelper.siteGroupRoles.keySet()) {

            log("Checking group: '" + groupName + "'.");

            // Get a map of the containers and associated access for this group.
            Map<String, String> containerAccess = getContainerListAndPermissionFromPermissionView(_apiPermissionHelper.getGroupId(groupName));

            log("Validate that the list of expected studies/containers are present and with the expected permissions.");
            for(String study : CDSHelper.siteGroupStudies.get(groupName)) {
                // Validate that the container is in the key set for the map of containers & access.
                if(containerAccess.keySet().contains(study)) {
                    // Now check that the permission for the container is as expected.
                    if(!containerAccess.get(study).toLowerCase().equals(CDSHelper.siteGroupRoles.get(groupName).toLowerCase())){
                        allGood = false;
                        errorMessage.append("For group '" + groupName + "' container/study '" + study +"' was listed but permission was listed as '" + containerAccess.get(study) + "' expected '" + CDSHelper.siteGroupRoles.get(groupName) + "'.\n");
                    }
                    // Since the container was in the key set (as expected) remove it from the map.
                    containerAccess.remove(study);
                }
                else {
                    allGood = false;
                    errorMessage.append("For group '" + groupName + "' container/study '" + study +"' was not listed.\n");
                }
            }

            // If there is anything left in the map of containers and access it means there was a container that this group has access to that wasn't expected.
            log("Validate that there are no extra studies/containers listed for the group.");
            if(containerAccess.size() > 0 && !groupName.equalsIgnoreCase(CDSHelper.GROUP_DATA_IMPORT))
            {
                log("Found entries in the list that should not be there!");
                allGood = false;
                for(String extraStudy : containerAccess.keySet())
                {
                    errorMessage.append("For group '" + groupName + "' found extra container/study '" + extraStudy +"'.\n");
                }
            }

        }

        log("Now special case the studies that inherit from parent.");
        goToHome();

        log("Assign the site user group '" + CDSHelper.GROUP_DATA_IMPORT + "' as a reader of the CDS project.");
        _apiPermissionHelper.addMemberToRole(CDSHelper.GROUP_DATA_IMPORT, "Reader", PermissionsHelper.MemberType.siteGroup, getProjectName());

        log("Get the updated list of containers and the associated permissions for group '" + CDSHelper.GROUP_DATA_IMPORT + "'.");
        Map<String, String> containerAccess = getContainerListAndPermissionFromPermissionView(_apiPermissionHelper.getGroupId(CDSHelper.GROUP_DATA_IMPORT));

        // Created an expected list of containers.
        List<String> inheritedStudyList = new LinkedList<>();
        inheritedStudyList.addAll(CDSHelper.siteGroupStudies.get(CDSHelper.GROUP_DATA_IMPORT));
        inheritedStudyList.add(CDSHelper.PROT_Z120);
        inheritedStudyList.add(CDSHelper.PROT_Z121);

        log("Validate that the list of expected studies/containers have been updated with the inherited permissions.");
        // Basically the same loop as above.
        for(String study : inheritedStudyList) {
            // Validate that the container is in the key set for the map of containers & access.
            if(containerAccess.keySet().contains(study)) {

                // Special case the inherited studies.
                String expectedAccess;
                if((study.toLowerCase().equals(CDSHelper.PROT_Z120.toLowerCase())) || (study.toLowerCase().equals(CDSHelper.PROT_Z121.toLowerCase()))){
                    expectedAccess = "Reader*";
                }
                else {
                    expectedAccess = CDSHelper.siteGroupRoles.get(CDSHelper.GROUP_DATA_IMPORT);
                }

                if (!containerAccess.get(study).toLowerCase().equals(expectedAccess.toLowerCase()))
                {
                    allGood = false;
                    errorMessage.append("For special case of inherited permissions group '" + CDSHelper.GROUP_DATA_IMPORT + "' container/study '" + study + "' was listed but permission was listed as '" + containerAccess.get(study) + "' expected '" + expectedAccess + "'.\n");
                }

                containerAccess.remove(study);

            }
            else {
                allGood = false;
                errorMessage.append("For special case of inherited permissions group '" + CDSHelper.GROUP_DATA_IMPORT + "' container/study '" + study +"' was not listed.\n");
            }

        }

        log("For the special case of inherited permissions validate that there are no extra studies/containers listed for the group.");
        if(containerAccess.size() > 0)
        {
            log("Found entries in the list that should not be there!");
            allGood = false;
            for(String extraStudy : containerAccess.keySet())
            {
                errorMessage.append("For special case of inherited permissions group '" + CDSHelper.GROUP_DATA_IMPORT + "' found extra container/study '" + extraStudy +"' was not listed.");
            }
        }

        assertTrue(errorMessage.toString(), allGood);

        goToHome();

    }

    private Map<String, String> getContainerListAndPermissionFromPermissionView(int groupId) throws IOException, CommandException
    {
        // Go to the groupPermissions-view page and create a map object from the grid returned.
        // The key will be the container and it's value will be the access permissions.
        final String CONTAINER_CELL_XPATH = "//table[@lk-region-name='access']//td[not(contains(@class, 'labkey-nav-tree-text'))]/a[not(contains(@class, 'labkey-text-link'))]";
        final String PERMISSION_CELL_XPATH = CONTAINER_CELL_XPATH + "[text()='$']/parent::td/following-sibling::td//table[contains(@class, 'labkey-nav-tree')]//td[contains(@class, 'labkey-nav-tree-text')]";

        URL groupPermissionView = new URL(WebTestHelper.getBaseURL().concat("/security-groupPermission.view?id=" + groupId));
        goToURL(groupPermissionView, 10000);

        log("Get the list of containers and the associated permissions for this group.");
        Map<String, String> containerAccess = new HashMap<>();
        List<WebElement> containerElements = Locator.findElements(getDriver(), Locator.xpath(CONTAINER_CELL_XPATH));
        for(WebElement we : containerElements) {
            if(!we.getText().toLowerCase().equals(getProjectName().toLowerCase())) {
                containerAccess.put(we.getText(), Locator.xpath(PERMISSION_CELL_XPATH.replace("$", we.getText())).findElement(getDriver()).getText());
            }
        }

        return containerAccess;
    }

    @Test
    public void testFirstTimeUse()
    {
        final String cssAddUsersLink = "a.labkey-text-link[href$='addUsers.view?provider=cds']";
        String[] welcomeUrls;

        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        goToProjectHome();

        waitForElement(Locator.css(cssAddUsersLink));
        clickAndWait(Locator.css(cssAddUsersLink));

        log("Adding user " + _newUserAccounts[3] + " this user will validate the Sign-in help.");
        setFormElement(Locator.css("textarea[name='newUsers']"), _newUserAccounts[3]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(_newUserAccounts[3] + " added as a new user to the system and emailed successfully.");

        log("Adding user " + _newUserAccounts[2] + " this user will be deleted before his invitation link is clicked.");
        setFormElement(Locator.css("textarea[name='newUsers']"), _newUserAccounts[2]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(_newUserAccounts[2] + " added as a new user to the system and emailed successfully.");

        log("Adding user " + _newUserAccounts[1] + " this user will be added with no permissions.");
        setFormElement(Locator.css("textarea[name='newUsers']"), _newUserAccounts[1]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(_newUserAccounts[1] + " added as a new user to the system and emailed successfully.");

        log("Adding user " + _newUserAccounts[0] + " this user will be added with all permissions.");
        log("Setting clone permission to account: " + getCurrentUser());
        click(Locator.css("input[name='cloneUserCheck']"));
        setFormElement(Locator.css("input[name='cloneUser']"), getCurrentUser());
        setFormElement(Locator.css("textarea[name='newUsers']"), _newUserAccounts[0]);
        click(Locator.css("input[type='submit'] + a.labkey-button"));
        waitForText(_newUserAccounts[0] + " added as a new user to the system and emailed successfully.");

        log("Go look at the emails that were generated.");

        welcomeUrls = getWelcomeLinks();

        for(int i=0; i < welcomeUrls.length; i++)
        {
            log("Email: " + _newUserAccounts[i] + " welcome url: " + welcomeUrls[i]);
        }

        log("Delete user " + _newUserAccounts[2] + " then test that first time sign-on behaves as expected for this user.");
        deleteUsersIfPresent(_newUserAccounts[2]);

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
        handleSimpleLogin(_newUserAccounts[1], "P@$$w0rd");
        sleep(5000);
        waitForElement(Locator.css("td.x-form-display-field-body[role='presentation']"), 15000);

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
        handleSimpleLogin(_newUserAccounts[0], "P@$$w0rd");
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
        setFormElement(Locator.css("input[name='email']"), _newUserAccounts[3]);
        setFormElement(Locator.css("input[name='password']"), "P@$$w0rd");
        click(Locator.tagWithClass("a", "help"));
        waitForElement(Locator.tagWithText("h1", "Sign-in Help"));
        assertTextPresent("To set or reset your password, type in your email address and click the submit button.");
        assertTrue("Did not find email '" + _newUserAccounts[3] + "' in text box.", getFormElement(Locator.inputById("emailhelp")).toLowerCase().equals(_newUserAccounts[3].toLowerCase()));
        click(Locator.linkWithText("Cancel"));

        // Log in as admin, like start of test, this will allow test to clean up correctly.
        ensureSignedInAsPrimaryTestUser();

    }

    @Test
    public void testApplyingGroupsWithLimitedAccess()
    {
        final String LIMITED_USER_ACCOUNT = "cds_limited_access@cdssecurity.test";
        final String PRIVATE_GROUP_NAME = "cds_private_group";
        final String SHARED_GROUP_NAME = "cds_shared_group";
        final String SHARED_GROUP_NAME_DESCRIPTION = "This group selects 3 studies: QED 1, QED 2 and RED 4";
        final Locator SHARED_GROUP_LOC = Locator.xpath("//*[contains(@class, 'section-title')][contains(text(), 'Curated groups and plots')]" +
                "/following::div[contains(@class, 'grouprow')]/div[contains(text(), '" + SHARED_GROUP_NAME + "')]");
        final Locator PRIVATE_GROUP_LOC = Locator.xpath("//*[contains(@class, 'section-title')][contains(text(), 'My saved groups and plots')]" +
                "/following::div[contains(@class, 'grouprow')]/div[contains(text(), '" + PRIVATE_GROUP_NAME + "')]");

        ensureAdminMode();
        Ext4Helper.resetCssPrefix();

        Map<String, String> studyPermissions = new HashMap<>();
        studyPermissions.put("q1", "Reader");
        studyPermissions.put("q2", "Reader");
        cds.setUpUserPerm(LIMITED_USER_ACCOUNT, "Reader", studyPermissions);

        log("Admin creates a shared group consisting of QED 1, QED 2 and RED 4.");
        cds.enterApplication();
        composeGroup(SHARED_GROUP_NAME, SHARED_GROUP_NAME_DESCRIPTION, true);
        verifyGroupWarningMessage(SHARED_GROUP_LOC, true, true);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();

        impersonate(LIMITED_USER_ACCOUNT);
        cds.enterApplication();
        log("User with limited access create a private group");
        composeGroup(PRIVATE_GROUP_NAME, "", false);
        log("Verify user with limited access sees a warning message when applying a shared group");
        verifyGroupWarningMessage(SHARED_GROUP_LOC, true, false);
        log("Verify user with limited access doesn't see a warning message when applying a private group");
        verifyGroupWarningMessage(PRIVATE_GROUP_LOC, false, false);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.deleteGroupFromSummaryPage(PRIVATE_GROUP_NAME); //clean up

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonating();
        _userHelper.deleteUser(LIMITED_USER_ACCOUNT);
        cds.enterApplication();
        cds.deleteGroupFromSummaryPage(SHARED_GROUP_NAME); //clean up
        cds.clearFilters();
    }

    private void composeGroup(String groupName, String groupDesc, boolean shared)
    {
        cds.goToSummary();
        cds.clickBy("Studies");
        if (shared)
            cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1], "RED 4");
        else // limited user (without access to RED 4) creates private group
            cds.selectBars(CDSHelper.STUDIES[0], CDSHelper.STUDIES[1]);
        cds.useSelectionAsSubjectFilter();
        cds.saveGroup(groupName, groupDesc, shared);
    }

    @LogMethod
    private void verifyGroupWarningMessage(Locator groupLoc, boolean isSharedGroup, boolean hasFullAccess)
    {
        Locator warningLoc = Locator.css("div.cds-group-limited-access");
        cds.clearFilters();
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        click(groupLoc);
        waitForText("No plot saved for this group.");
        sleep(2000); // wait for access check to complete
        if (isSharedGroup)
        {
            if (hasFullAccess)
            {
                assertFalse("Limited access warning message shouldn't show up for users with access to all studies", isElementVisible(warningLoc));
            }
            else
            {
                assertTrue("Limited access warning message should show up for users without access to some studies", isElementVisible(warningLoc));
            }
        }
        else
        {
            assertFalse("Limited access warning message shouldn't show up for private groups", isElementVisible(warningLoc));
        }
    }

    @Test
    public void testInfoPaneAndFindWithLimitedAccess()
    {
        Map<String, String> studyPermissions = new HashMap<>();
        log("Create a user group with Read permission to project but no permission to any study folder (they will see studies z120 &z121 by default).");
        cds.setUpPermGroup(_permGroups[0], studyPermissions);
        impersonateGroup(_permGroups[0], false);
        cds.enterApplication();

        log("Verify users with no study permission sees info pane with data only for studies z120 and z121.");
        verifyInfoPaneWithLimitedAccess(false);
        log("Verify users with no study permission sees data only for studies z120 and z121 in find subject.");
        verifyFindSubjectWithLimitedAccess(false);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();

        studyPermissions = new HashMap<>();
        studyPermissions.put("q1", "Reader");
        studyPermissions.put("q2", "Reader");
        studyPermissions.put("r4", "Reader");
        log("Create a user group with Read permission to project, q1, q2 and r4.");
        cds.setUpPermGroup(_permGroups[1], studyPermissions);
        impersonateGroup(_permGroups[1], false);
        cds.enterApplication();

        log("Verify user with limited study permissions only sees a subset of info pane entries.");
        verifyInfoPaneWithLimitedAccess(true);
        log("Verify user with limited study permissions only sees a subset of find subject entries.");
        verifyFindSubjectWithLimitedAccess(true);

        beginAt("project/" + getProjectName() + "/begin.view?");
        Ext4Helper.resetCssPrefix();
        stopImpersonatingGroup();
        assertSignedInNotImpersonating();

    }

    private void verifyFindSubjectWithLimitedAccess(boolean hasAccessToQ1Q2R4)
    {
        cds.goToSummary();
        log("Verify Find subject counts on summary page");
        if (!hasAccessToQ1Q2R4)
        {
            _asserts.assertCDSPortalRow("Subject characteristics", "10 subject characteristics", "1 species", "6 decades by age", "3 ethnicities", "33 countries", "2 sexes", "10 races");
            _asserts.assertCDSPortalRow("Products", "1 products", "1 product", "1 class", "1 developer", "1 type");
            _asserts.assertCDSPortalRow("Studies", "2 studies", "1 network", "1 study type", "5 coded labels", "6 treatments", "2 pi", "2 strategy");
        }
        else
        {
            _asserts.assertCDSPortalRow("Subject characteristics", "10 subject characteristics", "1 species", "6 decades by age", "3 ethnicities", "42 countries", "2 sexes", "10 races");
            _asserts.assertCDSPortalRow("Products", "3 products", "3 products", "3 classes", "3 developers", "2 types");
            _asserts.assertCDSPortalRow("Studies", "5 studies", "3 networks", "2 study types", "13 coded labels", "16 treatments", "5 pi", "4 strategy");
        }

        click(CDSHelper.Locators.getByLocator("Studies"));
        sleep(2000);

        Locator.XPathLocator studyQED1 = CDSHelper.Locators.barLabel.withText("QED 1");
        Locator.XPathLocator studyQED3 = CDSHelper.Locators.barLabel.withText("QED 3");
        assertFalse("Study that user does not have access to shouldn't show up on Find Subject", isElementPresent(studyQED3));
        if (!hasAccessToQ1Q2R4)
        {
            assertFalse("No studies should be present on Find Subject as user has no permission to any studies", isElementPresent(studyQED1));
        }
        else
        {
            assertTrue("Study QED 1 should show up on Find Subject since user has permission to it", isElementPresent(studyQED1));
        }

    }

    private void verifyInfoPaneWithLimitedAccess(boolean hasAccessToQ1Q2R4)
    {
        log("Verify info pane count");
        // Since studies z220 & z221 are included from the parent even with limited access these studies will still be visible.
        if (!hasAccessToQ1Q2R4)
            _asserts.assertFilterStatusCounts(270, 2, 1, 1, 6);
        else
            _asserts.assertFilterStatusCounts(449, 5, 1, 3, 16);

        log("Verify expanded info pane for Studies");
        cds.openStatusInfoPane("Studies");
        assertElementNotPresent(CDSHelper.Locators.INFO_PANE_NO_DATA);
        log("Verify study that user doesn't have access to is not present in Info Pane options");
        Locator.XPathLocator studyQED1 = Locator.tagWithClass("div", "x-grid-cell-inner").containing("QED 1");
        Locator.XPathLocator studyQED3 = Locator.tagWithClass("div", "x-grid-cell-inner").containing("QED 3");
        assertElementNotPresent(studyQED3);
//        if (!hasAccessToQ1Q2R4)
//        {
//            log("Verify no option is present if user doesn't have access to any study");
//            assertElementNotPresent(CDSHelper.Locators.INFO_PANE_HAS_DATA);
//            assertElementNotPresent(studyQED1);
//        }
//        else
//        {
//            log("Verify studies that the user have access to are present in info pane options");
//            assertElementPresent(CDSHelper.Locators.INFO_PANE_HAS_DATA);
//            assertElementPresent(studyQED1);
//        }
    }

    private String[] getWelcomeLinks()
    {
        String usrEmail = "", msgSubject = " : Welcome to the Demo Installation LabKey Server Web Site new user registration";
        String[] urls = new String[_newUserAccounts.length];

        goToModule("Dumbster");

        EmailRecordTable emailRecordTable = new EmailRecordTable(this);
        EmailRecordTable.EmailMessage msg = new EmailRecordTable.EmailMessage();

        for(int index = 0; index < _newUserAccounts.length; index++)
        {
            msg.setSubject(_newUserAccounts[index] + msgSubject);
            emailRecordTable.clickMessage(msg);
            usrEmail = _newUserAccounts[index].substring(0, _newUserAccounts[index].indexOf("@"));
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

        for(String group : _permGroups)
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
