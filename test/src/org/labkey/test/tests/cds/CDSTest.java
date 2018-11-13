/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 90)
public class CDSTest extends CDSReadOnlyTest
{

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    private static final String HOME_PAGE_GROUP = "A Plotted Group For Home Page Verification and Testing.";
    private static final String GROUP_NAME = "A Plottable group";

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
        waitForElement(CDSHelper.NavigationLink.LEARN.getExpectedElement());
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

        log("Verify tile text");
        String[] tileTitles = {"Answer questions", "Find a cohort", "Explore relationships", "Get started!"};
        String[] tileDetails = {"Learn about ", "55", " CAVD studies, ", "90", " products, and ", "5", " assays.",
                                "Find subjects based on attributes that span studies.",
                                "Plot assay results across ", "51", " studies and years of research.",
                                "Watch the most powerful ways to explore the DataSpace."};
        List<String> tites = Arrays.asList(tileTitles);
        tites.stream().forEach((tite) ->  {
            assertTextPresent(tite);
        });
        tites = Arrays.asList(tileDetails);
        tites.stream().forEach((tite) ->  {
            assertTextPresent(tite);
        });

        log("Verify tile link");
        mouseOver(Locator.xpath("//div[contains(@class, 'home_text')]"));
        sleep(500);
        infoPane.waitForSpinners();
        click(Locator.xpath("//div[contains(@class, 'home_text')]"));
        waitForElement(CDSHelper.NavigationLink.LEARN.getExpectedElement());
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        mouseOver(Locator.xpath("//div[contains(@class, 'home_plot')]"));
        sleep(500);
        infoPane.waitForSpinners();
        click(Locator.xpath("//div[contains(@class, 'home_plot')]"));
        waitForElement(CDSHelper.NavigationLink.PLOT.getExpectedElement());
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);

        log("Verify open video popup");
        mouseOver(Locator.xpath("//div[contains(@class, 'home_video')]"));
        sleep(500);
        infoPane.waitForSpinners();
        click(Locator.xpath("//div[contains(@class, 'home_video')]"));
        waitForElement(Locator.xpath("id('started-video-frame')"));
        sleep(500);
        infoPane.waitForSpinners();
        clickAt(Locator.css("div.x-mask"), 10, 10, 0);
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
        _asserts.assertFilterStatusCounts(139, 12, 1, 1, 42);

        final String clippedGroup = HOME_PAGE_GROUP.substring(0, 20);
        final String saveLabel = "Group \"A Plotted...\" saved.";
        Locator.XPathLocator clippedLabel = Locator.tagWithClass("div", "grouplabel").containing(clippedGroup);

        cds.saveGroup(HOME_PAGE_GROUP, GROUP_NAME);
        waitForText(saveLabel);

        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElement(Locator.css("div.groupicon img"));
        assertElementPresent(clippedLabel);
        cds.ensureNoFilter();

        waitAndClick(clippedLabel);
        waitForText("Your filters have been");
        assertElementPresent(CDSHelper.Locators.filterMemberLocator("In the plot: " + CDSHelper.ICS_ANTIGEN + ", " + CDSHelper.ICS_MAGNITUDE_BACKGROUND + ", " + CDSHelper.DEMO_RACE));
        _asserts.assertFilterStatusCounts(139, 12, 1, 1, 42); // TODO Test data dependent.

        // remove just the plot filter
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        cds.clearFilter(0);
        cds.saveOverGroup(HOME_PAGE_GROUP);
        waitForText(saveLabel);
        _asserts.assertFilterStatusCounts(829, 48, 1, 1, 155); // TODO Test data dependent.
        CDSHelper.NavigationLink.HOME.makeNavigationSelection(this);
        waitForElementToDisappear(Locator.css("div.groupicon img"));
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
}
