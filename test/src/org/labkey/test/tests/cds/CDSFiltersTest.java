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

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 18)
public class CDSFiltersTest extends CDSReadOnlyTest
{

    private static final String GROUP_NULL = "Group creation cancelled";
    private static final String GROUP_DESC = "Intersection of " + CDSHelper.STUDIES[1] + " and " + CDSHelper.STUDIES[4];

    private static final String GROUP_NAME = "CDSTest_AGroup";
    private static final String GROUP_NAME2 = "CDSTest_BGroup";
    private static final String GROUP_NAME3 = "CDSTest_CGroup";

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    @Before
    public void preTest()
    {

        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // let the group display load

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_NAME);
        groups.add(GROUP_NAME2);
        groups.add(GROUP_NAME3);
        cds.ensureGroupsDeleted(groups);

        cds.ensureNoFilter();
        cds.ensureNoSelection();

        // go back to app starting location
        cds.goToAppHome();
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
    public void verifyFilterPane()
    {
        log("Verify Filter Pane");

        String studyMember = "ZAP 117";
        String studyMember2 = "RED 4";
        String studyMember3 = "YOYO 55";
        String productMember = "Unknown";
        String productMember2 = "MENTHOL";

        //
        // Open an filter pane and close it
        //
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.openStatusInfoPane("Studies");
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
        _asserts.assertDefaultFilterStatusCounts();

        //
        // Open a filter pane and create filter
        //
        cds.openStatusInfoPane("Studies");
        cds.selectInfoPaneItem(studyMember, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember));
        _asserts.assertFilterStatusCounts(80, 1, 1, 1, 8); // TODO Test data dependent.

        //
        // Undo a info pane generated filter
        //
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember));
        _asserts.assertFilterStatusCounts(80, 1, 1, 1, 8); // TODO Test data dependent.

        //
        // open the filter pane via a created filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(studyMember));
        assertElementPresent(CDSHelper.Locators.INFO_PANE_HAS_DATA);
        assertElementNotPresent(CDSHelper.Locators.INFO_PANE_NO_DATA);

        cds.selectInfoPaneItem(studyMember2, true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember2));
        _asserts.assertFilterStatusCounts(90, 1, 1, 1, 3); // TODO Test data dependent.

        //
        // update the current filter
        //
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(studyMember2));
        cds.selectInfoPaneItem(studyMember3, false);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));

        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember2));
        waitForElement(CDSHelper.Locators.filterMemberLocator(studyMember3));
        // TODO Test data dependent.
        _asserts.assertFilterStatusCounts(186, 2, 1, 1, 11);
        cds.ensureNoFilter();

        //
        // change the operator
        //
        cds.openStatusInfoPane("Products");
        cds.selectInfoPaneItem(productMember, true);
        cds.selectInfoPaneItem(productMember2, false);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        _asserts.assertFilterStatusCounts(7792, 49, 2, 2, 278); // default is 'OR'
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(productMember2));
        cds.selectInfoPaneOperator(true);
        click(CDSHelper.Locators.cdsButtonLocator("Update", "filterinfoaction"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(productMember));
        waitForElement(CDSHelper.Locators.filterMemberLocator(productMember2));
        // TODO Test data dependent.
        _asserts.assertFilterStatusCounts(7792, 49, 2, 2, 278); // now it's 'AND'
        cds.openFilterInfoPane(CDSHelper.Locators.filterMemberLocator(productMember2));
        assertElementPresent(CDSHelper.Locators.INFO_PANE_HAS_DATA);
        assertElementNotPresent(CDSHelper.Locators.INFO_PANE_NO_DATA);
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
        cds.ensureNoFilter();

        //
        // Check sort menu
        //
        cds.openStatusInfoPane("Studies");
        cds.changeInfoPaneSort("Name", "Study Type");
        cds.selectInfoPaneItem("Phase I", true);
        cds.selectInfoPaneItem("Phase II", true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        Locator.XPathLocator studyTypeFilter = CDSHelper.Locators.filterMemberLocator("Phase II");
        waitForElement(studyTypeFilter);
        _asserts.assertFilterStatusCounts(1109, 3, 1, 3, 7); // TODO Test data dependent.
        cds.openFilterInfoPane(studyTypeFilter);
        assertElementPresent(CDSHelper.Locators.infoPaneSortButtonLocator().notHidden());
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));
    }

    @Test
    public void verifyFilterDisplays()
    {
        //ISSUE 20013
        log("verify filter displays");

        cds.goToSummary();
        cds.clickBy("Studies");
        cds.selectBars(CDSHelper.STUDIES[0]);

        // verify study selection
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.STUDIES[0]));

        // verify buttons available
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("Filter"));
        assertElementPresent(CDSHelper.Locators.cdsButtonLocator("clear"));

        // verify split display
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Studies");
        cds.toggleExplorerBar(CDSHelper.STUDIES[1]);
        cds.selectBars("Group I Arm T1 Vaccine", "Group V Arm C Placebo");
        waitForElement(CDSHelper.Locators.filterMemberLocator("Group I Arm T1 Vaccine"));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("Group V Arm C Placebo"));
        assertElementPresent(Locator.tagWithClass("div", "selitem").withText("Study (Treatment)"));
        _asserts.assertSelectionStatusCounts(24, 1, 1, 1, 2); // TODO Test data dependent.

        // clear by selection
        cds.selectBars("Group V Arm C Placebo");
        waitForElement(CDSHelper.Locators.filterMemberLocator("Group V Arm C Placebo"));
        _asserts.assertSelectionStatusCounts(14, 1, 1, 1, 1); // TODO Test data dependent.
        cds.clearSelection();

        // verify multi-level filtering
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[1], CDSHelper.ASSAYS[4]);
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[4]));

        cds.useSelectionAsSubjectFilter();
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]), 1);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[4]), 1);
        _asserts.assertFilterStatusCounts(137, 3, 1, 3, 15); // TODO Test data dependent.

        // remove filter
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));

        // verify undo
        click(Locator.linkWithText("Undo"));
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));
        _asserts.assertFilterStatusCounts(137, 3, 1, 3, 15); // TODO Test data dependent.

        // remove an undo filter
        cds.clearFilters();
        waitForText("Filter removed.");
        _asserts.assertDefaultFilterStatusCounts();
        assertElementNotPresent(CDSHelper.Locators.filterMemberLocator(CDSHelper.ASSAYS[1]));

        // ensure undo is removed on view navigation
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        waitForTextToDisappear("Filter removed.", 5000);
    }

    @Test
    public void verifyCounts()
    {
        cds.goToSummary();
        _asserts.assertAllSubjectsPortalPage();

        // 14902
        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(5, 1, 1, 2, 2);

        cds.useSelectionAsSubjectFilter();
        cds.hideEmpty();
        waitForElementToDisappear(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[1]), CDSHelper.CDS_WAIT);
        _asserts.assertFilterStatusCounts(5, 1, 1, 2, 2);
        cds.goToSummary();

        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[0]);
        _asserts.assertSelectionStatusCounts(5, 1, 1, 2, 2);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        cds.clearFilters();
        waitForElement(Locator.css("span.barlabel").withText(CDSHelper.STUDIES[2]), CDSHelper.CDS_WAIT);
        // end 14902

        cds.goToSummary();
        cds.clickBy("Studies");
        cds.applySelection(CDSHelper.STUDIES[1]);
        _asserts.assertSelectionStatusCounts(84, 1, 1, 1, 5);
        cds.applySelection(CDSHelper.STUDIES[2]);
        _asserts.assertSelectionStatusCounts(30, 1, 1, 1, 4);
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.applySelection(CDSHelper.ASSAYS[0]);
        _asserts.assertSelectionStatusCounts(75, 1, 1, 1, 8);
        cds.applySelection(CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(1604, 14, 2, 3, 91);
        cds.applySelection(CDSHelper.ASSAYS[2]);
        _asserts.assertSelectionStatusCounts(477, 4, 1, 3, 31);
        cds.applySelection(CDSHelper.ASSAYS[3]);
        _asserts.assertSelectionStatusCounts(337, 5, 1, 1, 20);
        cds.clearSelection();
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        _asserts.assertDefaultFilterStatusCounts();
        cds.pickSort("Country at enrollment");
        cds.applySelection("South Africa");
        _asserts.assertSelectionStatusCounts(43, 21, 1, 3, 27);
        cds.applySelection("United States");
        _asserts.assertSelectionStatusCounts(2797, 49, 1, 5, 228);
        cds.applySelection("Thailand");
        _asserts.assertSelectionStatusCounts(98, 32, 1, 5, 45);
    }

    @Test
    public void verifyFilters()
    {
        // 14910
        log("Verify multi-select");
        cds.goToSummary();
        cds.clickBy("Products");
        cds.pickSort("Product Type");
        cds.shiftSelectBars("Adjuvant", "Risperidone");
        waitForElement(CDSHelper.Locators.filterMemberLocator("benztropine mesylate"), WAIT_FOR_JAVASCRIPT);
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("Adjuvant, benztropine mesylate, Risperidone"));
        _asserts.assertSelectionStatusCounts(5, 1, 1, 2, 2);
        cds.clearSelection();
        _asserts.assertDefaultFilterStatusCounts();
        // end 14910

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        cds.openStatusInfoPane("Studies");
        waitForText(CDSHelper.STUDIES[1]);
        cds.selectInfoPaneItem(CDSHelper.STUDIES[1], true);
        cds.selectInfoPaneItem(CDSHelper.STUDIES[4], false);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        cds.saveGroup(GROUP_NAME, GROUP_DESC);
        _asserts.assertFilterStatusCounts(194, 2, 1, 1, 8);
        cds.clearFilters();
        _asserts.assertDefaultFilterStatusCounts();

        log("Verify operator filtering");
        cds.goToSummary();
        cds.clickBy("Products");
        final String PRODUCT1 = "benztropine mesylate";
        final String PRODUCT2 = "MENTHOL";
        cds.selectBars(PRODUCT1, PRODUCT2);
        _asserts.assertSelectionStatusCounts(6, 2, 1, 3, 3);  // or

        WebElement selector = CDSHelper.Locators.subjectInfoPaneHeader().append(Locator.tag("select")).waitForElement(getDriver(), Duration.ofSeconds(2));
        Locator.css("option").index(1).waitForElement(selector, Duration.ofSeconds(2));
        assertEquals("Wrong initial combo selection", "UNION", selector.getAttribute("value"));
        selectOptionByValue(selector, "INTERSECT");
        _asserts.assertSelectionStatusCounts(0, 0, 0, 0, 0); // and
        cds.useSelectionAsSubjectFilter();
        cds.hideEmpty();
        waitForText("None of the selected");
        _asserts.assertFilterStatusCounts(0, 0, 0, 0, 0); // and

        selector = CDSHelper.Locators.subjectInfoPaneHeader().append(Locator.tag("select")).waitForElement(getDriver(), Duration.ofSeconds(2));
        Locator.css("option").index(1).waitForElement(selector, Duration.ofSeconds(2));
        assertEquals("Combo box selection changed unexpectedly", "INTERSECT", selector.getAttribute("value"));
        selectOptionByValue(selector, "UNION");
        _asserts.assertFilterStatusCounts(6, 2, 1, 3, 3);  // or
        waitForElement(Locator.css("span.barlabel").withText(PRODUCT1));
        cds.goToSummary();
        cds.clickBy("Assays");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator(PRODUCT1));
        assertElementPresent(Locator.css("option").withText("Subjects related to any (OR)"));
        _asserts.assertFilterStatusCounts(6, 2, 1, 3, 3);  // or
        cds.clearFilters();
        _asserts.assertDefaultFilterStatusCounts();

        log("Verify selection messaging");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[0], CDSHelper.ASSAYS[1]);
        _asserts.assertSelectionStatusCounts(75, 1, 1, 1, 8);
        cds.pickDimension("Studies");
        waitForText("Selection applied as filter.");
        _asserts.assertFilterStatusCounts(75, 1, 1, 1, 8);
        cds.clearFilters();
        waitForText(CDSHelper.CDS_WAIT, CDSHelper.STUDIES[32]);
        cds.selectBars(CDSHelper.STUDIES[32]);
        cds.pickDimension("Assays");
        waitForText("Selection applied as filter.");

        //test more group saving
        cds.goToSummary();
        cds.clickBy("Subject characteristics");
        cds.pickSort("Country at enrollment");
        cds.selectBars("United States");

        // save the group and request cancel
        click(CDSHelper.Locators.cdsButtonLocator("save", "filtersave"));
        waitForText("replace an existing group");
        setFormElement(Locator.name("groupname"), GROUP_NULL);
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "groupcancelcreate"));
        waitForElementToDisappear(Locator.xpath("//div[starts-with(@id, 'groupsave')]").notHidden());

        // save the group and request save
        cds.saveGroup(GROUP_NAME2, null);

        // save a group with an interior group
        cds.saveGroup(GROUP_NAME3, null);

        cds.clearFilters();
    }

}
