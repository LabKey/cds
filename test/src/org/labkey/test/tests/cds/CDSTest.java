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
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.InfoPane;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelpCenterUtil;
import org.labkey.test.util.cds.CDSHelper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 5)
public class CDSTest extends CDSReadOnlyTest
{

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final CDSHelpCenterUtil _helpCenterUtil = new CDSHelpCenterUtil(this);


    private static final String HOME_PAGE_GROUP = "A Plotted Group For Home Page Verification and Testing.";
    private static final String GROUP_NAME = "A Plottable group";

    public static final String WHAT_YOU_NEED_TO_KNOW_WIKI_TITLE = "What you need to know";
    public static final String WHAT_YOU_NEED_TO_KNOW_WIKI_CONTENT = "<h3 id=\"what-you-need-title-id\" class=\"tile-title\">What you need to know</h3>\n" +
            "<ul>\n" +
            "    <li><a id=\"study-link-id\" href=\"#learn/learn/Study\">Types of studies in DataSpace</a></li>\n" +
            "    <li><a id=\"assay-link-id\" href=\"#learn/learn/Assay\">Assay data available by study</a></li>\n" +
            "</ul>";
    public static final String TOURS_WIKI_TITLE = "Take a tour";
    public static final String TOURS_WIKI_CONTENT = "<h3 id=\"take-tour-title-id\" class=\"tile-title\">Take a guided tour</h3>";

    @Before
    public void preTest()
    {

        cds.enterApplication();

        // clean up groups
        cds.goToAppHome();
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // let the group display load

        List<String> groups = new ArrayList<>();
        groups.add(GROUP_NAME);
        groups.add(HOME_PAGE_GROUP);
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

    @Override
    public Timeout testTimeout()
    {
        return new Timeout(60, TimeUnit.MINUTES);
    }

    @Test
    public void verifyHomePage()
    {
        log("Verify Home Page");

        //
        // Validate splash counts and home header
        //
        Locator.XPathLocator studyPoints = Locator.tagContainingText("h1", "55 studies to ");
        Locator.XPathLocator dataPoints = Locator.tagContainingText("h1", "46,644 data points from 51 studies to ");
        waitForElement(studyPoints);
        waitForElement(dataPoints);
        click(Locator.linkWithText("learn about"));
        CDSHelper.NavigationLink.LEARN.waitForReady(this);
        InfoPane infoPane = new InfoPane(this);
        infoPane.waitForSpinners();

        log("Verify show/hide quick links bar");
        Locator.XPathLocator hiddenShowBarLink = Locator.xpath("//a[contains(@class, 'started-show')][contains(@style, 'display: none')]");
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        // if it's already hidden, click to show
        if (!isElementPresent(hiddenShowBarLink))
        {
            click(Locator.linkContainingText("Show tips for getting started "));
            sleep(500);
        }
        assertElementPresent(hiddenShowBarLink);
        click(Locator.linkContainingText("Hide "));
        waitForElement(Locator.xpath("//div[contains(@class, 'expanded-intro')][contains(@style, 'display: none')]"));
        assertElementNotPresent(hiddenShowBarLink);
        waitForElement(Locator.linkContainingText("Show tips for getting started "));
        click(Locator.linkContainingText("Show tips for getting started "));
        waitForElement(Locator.xpath("//a[@id='showlink'][contains(@style, 'display: none')]"));
        assertElementPresent(hiddenShowBarLink);

        log("Verify open video popup");
        click(Locator.linkContainingText("Get Started"));
        waitForElement(Locator.xpath("id('started-video-frame')"));
        infoPane.waitForSpinners();
        waitForElement(Locator.tagWithId("div", "started-video-frame"));
        clickAt(Locator.xpath(CDSHelper.LOGO_IMG_XPATH), 10, 10, 0);
        waitForElement(Locator.linkWithId("learn-about-link"));

        log("Verify Try it out links");
        click(Locator.linkWithId("learn-about-link"));
        waitForText("Name & Description");
        clickAt(Locator.xpath(CDSHelper.LOGO_IMG_XPATH), 10, 10, 0);
        refresh();

        waitForElement(Locator.linkWithId("find-subjects-link"));
        click(Locator.linkWithId("find-subjects-link"));
        waitForText("Find subjects of interest with assay data in DataSpace.");
        clickAt(Locator.xpath(CDSHelper.LOGO_IMG_XPATH), 10, 10, 0);
        refresh();

        waitForElement(Locator.linkWithId("plot-link"));
        click(Locator.linkWithId("plot-link"));
        waitForText("Choose a \"y\" variable and up to two more to plot at a time");
        clickAt(Locator.xpath(CDSHelper.LOGO_IMG_XPATH), 10, 10, 0);
        refresh();

        waitForElement(Locator.linkWithId("monoclonal-antibodies-link"));
        click(Locator.linkWithId("monoclonal-antibodies-link"));
        waitForText("Explore monoclonal antibody (mAb) characterization data");
        clickAt(Locator.xpath(CDSHelper.LOGO_IMG_XPATH), 10, 10, 0);
        refresh();

        //
        // Validate News feed
        //
        waitForText("LabKey looks forward to sponsoring the Association of Independent Research Institutes");

        //
        // Validate Plot data
        //
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yAxis = new YAxisVariableSelector(this);
        sleep(CDSHelper.CDS_WAIT_ANIMATION); // Not sure why I need this but test is more reliable with it.
        yAxis.openSelectorWindow();
        yAxis.pickSource(CDSHelper.ICS);
        yAxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yAxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yAxis.confirmSelection();

        XAxisVariableSelector xAxis = new XAxisVariableSelector(this);
        xAxis.openSelectorWindow();
        xAxis.pickSource(CDSHelper.ICS);
        xAxis.pickVariable(CDSHelper.ICS_ANTIGEN);
        xAxis.confirmSelection();

        ColorAxisVariableSelector colorAxis = new ColorAxisVariableSelector(this);
        colorAxis.openSelectorWindow();
        colorAxis.pickSource(CDSHelper.SUBJECT_CHARS);
        colorAxis.pickVariable(CDSHelper.DEMO_RACE);
        colorAxis.confirmSelection();

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        _ext4Helper.waitForMaskToDisappear(30000);
        waitForText(CDSHelper.SUBJECT_CHARS);
        cds.clickBy(CDSHelper.SUBJECT_CHARS);
        cds.pickSort("Race");
        cds.selectBars(CDSHelper.RACE_VALUES[2]);
        cds.useSelectionAsSubjectFilter();
        waitForElement(CDSHelper.Locators.filterMemberLocator(CDSHelper.RACE_VALUES[2]));
        _asserts.assertFilterStatusCounts(139, 12, 1, 3, 42);

        final String clippedGroup = HOME_PAGE_GROUP.substring(0, 20);
        final String saveLabel = "Group \"A Plotted...\" saved.";
        Locator.XPathLocator clippedLabel = Locator.tagWithClass("div", "grouplabel").containing(clippedGroup);

        cds.saveGroup(HOME_PAGE_GROUP, GROUP_NAME);
        waitForText(saveLabel);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElement(Locator.css("div.groupicon img"));
        assertElementPresent(clippedLabel);
        cds.ensureNoFilter();

        new CDSHelper(this).clickHelper(clippedLabel.findElement(getWrappedDriver()), voidFunc -> {waitForText("Your filters have been"); return null;});
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("In the plot: " + CDSHelper.ICS_ANTIGEN + ", " + CDSHelper.ICS_MAGNITUDE_BACKGROUND + ", " + CDSHelper.DEMO_RACE));
        _asserts.assertFilterStatusCounts(139, 12, 1, 3, 42); // TODO Test data dependent.

        // remove just the plot filter
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        int plotFilterCount = Locator.css("div.groupicon img").findElements(getWrappedDriver()).size();
        cds.clearFilter(0);
        cds.saveOverGroup(HOME_PAGE_GROUP);
        waitForText(saveLabel);
        _asserts.assertFilterStatusCounts(829, 48, 1, 3, 155); // TODO Test data dependent.
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElements(Locator.css("div.groupicon img"), plotFilterCount - 1);
    }

    @Test
    public void verifyDynamicContentOnHomePage()
    {
        setupSharedHomePageWikis();
        cds.enterApplication();
        refresh();
        assertElementPresent(Locator.tagWithId("h3", "take-tour-title-id"));
        assertElementPresent(Locator.tagWithId("h3", "what-you-need-title-id"));
    }

    @Test
    public void testOutagesAnnouncement()
    {
        log("Turning on the ribbon bar notification with custom HTML message");
        goToAdminConsole().clickSiteSettings();
        waitForElement(Locator.name("showRibbonMessage"));
        checkCheckbox(Locator.checkboxByName("showRibbonMessage"));
        Locator.name("ribbonMessage").findElement(getDriver()).clear();
        Locator.name("ribbonMessage").findElement(getDriver())
                .sendKeys("Testing User notice on public page to announce outages");
        clickButton("Save");

        log("Verifying the message in the CDS application - Home");
        cds.enterApplication();
        cds.goToAppHome();
        assertElementPresent(Locator.tagWithClass("div", "notification-messages").
                withChild(Locator.tagWithText("span", "Testing User notice on public page to announce outages")));

        log("Verifying the message is displayed in learn about");
        cds.viewLearnAboutPage("Assays");
        assertElementPresent(Locator.tagWithClass("div", "notification-messages").
                withChild(Locator.tagWithText("span", "Testing User notice on public page to announce outages")));

        log("Verifying the message is displayed in summary");
        cds.goToSummary();
        assertElementPresent(Locator.tagWithClass("div", "notification-messages").
                withChild(Locator.tagWithText("span", "Testing User notice on public page to announce outages")));

        cds.logOutFromApplication();
        assertElementPresent(Locator.tagWithClass("div", "notification-messages").
                withChild(Locator.tagWithText("span", "Testing User notice on public page to announce outages")));

        log("Turning off the notification");
        simpleSignIn();

        goToProjectHome();
        goToAdminConsole().clickSiteSettings();
        waitForElement(Locator.name("showRibbonMessage"));
        uncheckCheckbox(Locator.checkboxByName("showRibbonMessage"));
        Locator.name("ribbonMessage").findElement(getDriver()).clear();
        clickButton("Save");

        log("Verifying the message is not present");
        cds.enterApplication();
        cds.goToAppHome();
        assertElementNotPresent(Locator.tagWithClass("div", "notification-messages").
            withChild(Locator.tagWithText("span", "Testing User notice on public page to announce outages")));
    }


    @Test
    public void verifyAssaySummary()
    {
        log("Verify Assay Summary View");
        cds.goToSummary();
        cds.clickBy("Assays");
        cds.pickSort("Lab");
        for (String assay : CDSHelper.SUBJECT_ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String lab : CDSHelper.LABS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(lab));
        }
        cds.pickSort("Immunogenicity Type");
        for (String assay : CDSHelper.SUBJECT_ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String i_type : CDSHelper.I_TYPES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(i_type));
        }
        cds.pickSort("Study");
        for (String assay : CDSHelper.SUBJECT_ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String protocol : CDSHelper.PROT_NAMES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(protocol));
        }
        cds.pickSort("Assay Type");
        for (String assay : CDSHelper.SUBJECT_ASSAYS)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(assay));
        }
        for (String h_type : CDSHelper.H_TYPES)
        {
            assertElementPresent(CDSHelper.Locators.barLabel.withText(h_type));
        }
    }

    @Test
    public void testSummaryPageSingleAxisLinks()
    {
        Locator hierarchySelector = Locator.input("sae-hierarchy");

        cds.goToSummary();
        waitAndClick(Locator.linkWithText("races"));
        waitForElement(CDSHelper.Locators.activeDimensionHeaderLocator("Subject characteristics"));
        waitForFormElementToEqual(hierarchySelector, "Race");
        cds.goToSummary();
        sleep(250);

        waitAndClick(Locator.linkWithText("countries"));
        waitForElement(CDSHelper.Locators.activeDimensionHeaderLocator("Subject characteristics"));
        waitForFormElementToEqual(hierarchySelector, "Country at enrollment");
        cds.goToSummary();
    }

    public void setupSharedHomePageWikis()
    {
        goToProjectHome("Shared");

        if(!isElementPresent(Locator.tagWithName("a", "Pages")))
        {
            PortalHelper portalHelper = new PortalHelper(this);
            portalHelper.addWebPart("Wiki Table of Contents");
        }

        if(isElementPresent(Locator.linkWithText(WHAT_YOU_NEED_TO_KNOW_WIKI_TITLE)))
        {
            _helpCenterUtil.deleteWiki(WHAT_YOU_NEED_TO_KNOW_WIKI_TITLE);
        }
        goToProjectHome("Shared");
        _helpCenterUtil.createWikiPage(CDSHelper.WHAT_YOU_NEED_TO_KNOW_WIKI, WHAT_YOU_NEED_TO_KNOW_WIKI_TITLE, WHAT_YOU_NEED_TO_KNOW_WIKI_CONTENT, null, null, true);

        if(isElementPresent(Locator.linkWithText(TOURS_WIKI_TITLE)))
        {
            _helpCenterUtil.deleteWiki(TOURS_WIKI_TITLE);
        }
        goToProjectHome("Shared");
        _helpCenterUtil.createWikiPage(CDSHelper.TOURS_WIKI, TOURS_WIKI_TITLE, TOURS_WIKI_CONTENT, null, null, true);
    }
}
