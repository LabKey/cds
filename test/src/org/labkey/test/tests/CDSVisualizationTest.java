/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
package org.labkey.test.tests;

import org.jetbrains.annotations.Nullable;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.pages.ColorAxisVariableSelector;
import org.labkey.test.pages.DataspaceVariableSelector;
import org.labkey.test.pages.XAxisVariableSelector;
import org.labkey.test.pages.YAxisVariableSelector;
import org.labkey.test.util.CDSAsserts;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.CDSInitializer;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PostgresOnlyTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotBox;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotPoint;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotTick;

@Category({CustomModules.class, CDS.class})
public class CDSVisualizationTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String PGROUP1 = "visgroup 1";
    private final String PGROUP2 = "visgroup 2";
    private final String PGROUP3 = "visgroup 3";
    private final String PGROUP3_COPY = "copy of visgroup 3";
    private static final String[] DESIRED_STUDIES = {"DemoSubset", "NotCHAVI001", "NotCHAVI008", "NotRV144", "StudyAxisTest1", "StudyAxisTest11", "StudyAxisTest2", "StudyAxisTestA", "StudyAxisTestB"};

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        CDSVisualizationTest initTest = (CDSVisualizationTest)getCurrentTest();
        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName(), CDSHelper.EMAILS, CDSHelper.PICTURE_FILE_NAMES);
        _initializer.setDesiredStudies(DESIRED_STUDIES);
        _initializer.setupDataspace();
        initTest.createParticipantGroups();
  }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        deleteProject(getProjectName(), afterTest);
    }

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
    }

    protected static final String MOUSEOVER_FILL = "#01BFC2";
    protected static final String MOUSEOVER_STROKE = "#00EAFF";
    protected static final String BRUSHED_FILL = "#14C9CC";
    protected static final String BRUSHED_STROKE = "#00393A";
    protected static final String NORMAL_COLOR = "#000000";

    @Test
    public void verifyScatterPlot()
    {
        //getText(Locator.css("svg")) on Chrome
        final String CD4_LYMPH = "200\n400\n600\n800\n1000\n1200\n200\n400\n600\n800\n1000\n1200\n1400\n1600\n1800\n2000\n2200";
        final String HEMO_CD4_UNFILTERED = "8\n10\n12\n14\n16\n18\n20\n100\n200\n300\n400\n500\n600\n700\n800\n900\n1000\n1100\n1200\n1300";
        final String WT_PLSE_LOG = "60\n70\n80\n90\n100\n40\n50\n60\n70\n80\n90\n100";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "CD4");
        xaxis.confirmSelection();
        waitForElement(Locator.css(".curseltitle").containing("for the Y Axis"));
        yaxis.pickMeasure("Lab Results", "Lymphocytes");
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        assertSVG(CD4_LYMPH);

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Lab Results", "CD4");
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "Hemoglobin");
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
        assertSVG(HEMO_CD4_UNFILTERED);

        // Test log scales
        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Physical Exam", "Weight Kg");
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();
        waitForText("Points outside the plotting area have no match");
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Physical Exam", "Pulse");
        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
        xaxis.confirmSelection();
        assertSVG(WT_PLSE_LOG);

        // TODO: Figure out and enable these hover selectors with completed data filters feature
//        Actions builder = new Actions(getDriver());
//       List<WebElement> points;
//       points = Locator.css("svg g a.point path").findElements(getDriver());
//
//       // Test hover events
//        builder.moveToElement(points.get(71)).perform();
//
//        // Check that related points are colored appropriately.
//       for (int i = 71; i < 76; i++)
//        {
//            assertEquals("Related point had an unexpected fill color", MOUSEOVER_FILL, points.get(i).getAttribute("fill"));
//            assertEquals("Related point had an unexpected stroke color", MOUSEOVER_STROKE, points.get(i).getAttribute("stroke"));
//
//        }
//
//        builder.moveToElement(points.get(33)).moveByOffset(10, 10).perform();
//
//        // Check that the points are no longer highlighted.
//        for (int i = 33; i < 38; i++)
//        {
//            assertEquals("Related point had an unexpected fill color", NORMAL_COLOR, points.get(i).getAttribute("fill"));
//            assertEquals("Related point had an unexpected stroke color", NORMAL_COLOR, points.get(i).getAttribute("stroke"));
//        }
//
//        // Test brush events.
//        builder.moveToElement(points.get(10)).moveByOffset(-45, -55).clickAndHold().moveByOffset(130, 160).release().perform();
//
//        for (int i = 10; i < 15; i++)
//        {
//            assertEquals("Brushed point had an unexpected fill color", BRUSHED_FILL, points.get(i).getAttribute("fill"));
//            assertEquals("Brushed point had an unexpected stroke color", BRUSHED_STROKE, points.get(i).getAttribute("stroke"));
//        }
//
//        builder.moveToElement(points.get(37)).moveByOffset(-25, 0).clickAndHold().release().perform();
//
//        // Check that the points are no longer brushed.
//        for (int i = 10; i < 15; i++)
//        {
//            assertEquals("Related point had an unexpected fill color", NORMAL_COLOR, points.get(i).getAttribute("fill"));
//            assertEquals("Related point had an unexpected stroke color", NORMAL_COLOR, points.get(i).getAttribute("stroke"));
//        }
//
//        // Brush the same area, then apply that selection as a filter.
//        builder.moveToElement(points.get(10)).moveByOffset(-45, -55).clickAndHold().moveByOffset(130, 160).release().perform();
//        waitForElement(plotSelection);
//
//        assertEquals("An unexpected number of plot selections were visible.", 2, plotSelection.findElements(getDriver()).size());
//        _asserts.assertSelectionStatusCounts(8, 1, 2);
//
//        plotSelectionCloseBtn.findElement(getDriver()).click(); // remove the x variable from the selection.
//        waitForElementToDisappear(plotSelectionCloseBtn.index(1));
//        _asserts.assertSelectionStatusCounts(13, 1, 2);
//        plotSelectionCloseBtn.findElement(getDriver()).click(); // remove the y variable from the selection.
//        assertElementNotPresent(plotSelection);
//
//        // Select them again and apply them as a filter.
//        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();
//       waitForElement(plotSelection);
//
//        assertEquals("An unexpected number of plot selections were visible.", 2, plotSelection.findElements(getDriver()).size());
//        _asserts.assertSelectionStatusCounts(3, 1, 2);
//
//        cds.useSelectionAsDataFilter();
//        assertEquals("An unexpected number of plot selection filters were visible", 2, plotSelectionFilter.findElements(getDriver()).size());
//        _asserts.assertFilterStatusCounts(3, 1, 2);
//
//        // Test that variable selectors are reset when filters are cleared (Issue 20138).
//        cds.clearFilter();
//        waitForElement(Locator.css(".yaxisbtn span.x-btn-button").withText("choose variable"));
//        waitForElement(Locator.css(".xaxisbtn span.x-btn-button").withText("choose variable"));
    }


    @Test
    public void verifyBoxPlots()
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        // Choose the y-axis and verify that only 1 box plot shows if there is no x-axis chosen.
        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Lab Results", "CD4");
        yaxis.confirmSelection();

        waitForElement(plotBox);
        assertElementPresent(plotBox, 1);
        assertElementPresent(plotPoint, 468);

        // Choose a categorical axis to verify that multiple box plots will appear.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Demographics", "Sex");
        xaxis.confirmSelection();

        waitForElement(Locators.plotTick.withText("f"));
        assertElementPresent(plotBox, 2);
        assertElementPresent(plotPoint, 468);

        // Choose a continuous axis and verify that the chart goes back to being a scatter plot.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "Hemoglobin");
        xaxis.confirmSelection();

        waitForElementToDisappear(plotBox);

        // Verify that we can go back to boxes after being in scatter mode.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Demographics", "Race");
        xaxis.confirmSelection();

        waitForElement(Locators.plotTick.withText("Asian"));
        assertElementPresent(plotBox, 8);
        assertElementPresent(plotPoint, 468);
    }

    @Test
    public void verifySavedGroupPlot()
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Physical Exam", "Diastolic Blood Pressure");
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("User groups", "My saved groups");
        xaxis.setVariableOptions(PGROUP1, PGROUP2, PGROUP3);
        xaxis.confirmSelection();

        waitForElement(plotTick.withText(PGROUP1));
        waitForElement(plotTick.withText(PGROUP2));
        waitForElement(plotTick.withText(PGROUP3));
        assertElementPresent(plotBox, 3);
        waitForElement(plotTick.withText("115"));
        waitForElement(plotTick.withText("70"));

        xaxis.openSelectorWindow();
        xaxis.setVariableOptions(PGROUP1, PGROUP2);
        xaxis.confirmSelection();

        waitForElement(plotTick.withText(PGROUP1));
        waitForElement(plotTick.withText(PGROUP2));
        waitForElementToDisappear(plotTick.withText(PGROUP3));
        assertElementPresent(plotBox, 2);
        waitForElementToDisappear(plotTick.withText("115"));
        waitForElementToDisappear(plotTick.withText("70"));

        xaxis.openSelectorWindow();
        xaxis.setVariableOptions(PGROUP3, PGROUP3_COPY);
        xaxis.confirmSelection();

        waitForElementToDisappear(plotTick.withText(PGROUP1));
        waitForElementToDisappear(plotTick.withText(PGROUP2));
        waitForElement(plotTick.withText(PGROUP3));
        waitForElement(plotTick.withText(PGROUP3_COPY));
        assertElementPresent(plotBox, 2);
        waitForElement(plotTick.withText("115"));
        waitForElement(plotTick.withText("70"));
    }

    @Test
    public void verifyXAxisSelector()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);

        xaxis.openSelectorWindow();

        Locator.XPathLocator definitionPanel = Locator.tagWithClass("div", "definitionpanel");

        assertElementNotPresent(definitionPanel.notHidden());

        xaxis.pickSource("ADCC");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: ADCC")
                .containing("Contains up to one row of ADCC data for each Participant/visit/TARGET_CELL_PREP_ISOLATE combination."));

        xaxis.pickMeasure("ADCC", "ACTIVITY PCT");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: ACTIVITY PCT")
                .containing("Percent activity observed"));

        click(CDSHelper.Locators.cdsButtonLocator("go to assay page"));
        waitForElement(Locator.tagWithText("h3", "Lead contributor"));
        assertElementPresent(Locator.tagWithText("h1", "Fake ADCC data"));
    }

    @Test
    public void verifyYAxisSelector()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        yaxis.openSelectorWindow();

        Locator.XPathLocator definitionPanel = Locator.tagWithClass("div", "definitionpanel");

        assertElementNotPresent(definitionPanel.notHidden());

        yaxis.pickSource("MRNA");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: MRNA")
                .containing("Contains up to one row of MRNA data for each Participant/visit combination."));

        yaxis.pickMeasure("MRNA", "CCL5");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: CCL5")
                .containing("Expression levels for CCL5"));

        click(CDSHelper.Locators.cdsButtonLocator("go to assay page"));
        waitForElement(Locator.tagWithText("h3", "Lead contributor"));
        assertElementPresent(Locator.tagWithText("h1", "mRNA assay"));
    }

    @Test
    public void verifyColorAxisSelector()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        ColorAxisVariableSelector color = new ColorAxisVariableSelector(this);

        color.openSelectorWindow();

        Locator.XPathLocator definitionPanel = Locator.tagWithClass("div", "definitionpanel");

        assertElementNotPresent(definitionPanel.notHidden());

        color.pickSource("ADCC");
        waitForElement(definitionPanel.notHidden()
                .containing("Definition: ADCC")
                .containing("Contains up to one row of ADCC data for each Participant/visit/TARGET_CELL_PREP_ISOLATE combination."));

        assertElementNotPresent(color.measuresPanelRow().withText("ACTIVITY PCT")); // Only categorical data can be used for color axis

        click(CDSHelper.Locators.cdsButtonLocator("go to assay page"));
        waitForElement(Locator.tagWithText("h3", "Lead contributor"));
        assertElementPresent(Locator.tagWithText("h1", "Fake ADCC data"));
    }

    @Test
    public void verifyScatterPlotColorAxis()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        ColorAxisVariableSelector color = new ColorAxisVariableSelector(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "Lymphocytes");
        xaxis.confirmSelection();
        // yaxis window opens automatically
        yaxis.pickMeasure("Lab Results", "Hemoglobin");
        yaxis.confirmSelection();
        color.openSelectorWindow();
        color.pickMeasure("Demographics", "Race");
        color.confirmSelection();

        Locator.CssLocator colorLegend = Locator.css("#color-legend > svg");
        Locator.CssLocator colorLegendGlyph = colorLegend.append("> .legend-point");
        waitForElement(colorLegend);
        assertElementPresent(colorLegendGlyph, 8);

        List<WebElement> legendGlyphs = colorLegendGlyph.findElements(getDriver());
        Map<String, Integer> raceCounts = new HashMap<>();
        raceCounts.put("American Indian/Alaska Native", 10); // too tired to fix this
        raceCounts.put("American Indian/Alaskan Native", 46);
        raceCounts.put("Asian", 62);
        raceCounts.put("Black/African American", 103);
        raceCounts.put("Indian", 81);
        raceCounts.put("Native Hawaiian or Other Pacific Islander", 16);
        raceCounts.put("Native Hawaiian/Pacific Islander", 21);
        raceCounts.put("White", 129);

        Set<String> foundRaces = new HashSet<>();

        // uncomment if you want help determining these counts
        for (WebElement el : legendGlyphs)
        {
            String fill = el.getAttribute("fill");
            String path = el.getAttribute("d");
            List<WebElement> points = Locator.css(String.format("a.point > path[fill='%s'][d='%s']", fill, path)).findElements(getDriver());

            String race = getPointProperty("Race", points.get(0).findElement(By.xpath("..")));
            log(race + ": (" + points.size() + ")");
        }

        for (WebElement el : legendGlyphs)
        {
            String fill = el.getAttribute("fill");
            String path = el.getAttribute("d");
            List<WebElement> points = Locator.css(String.format("a.point > path[fill='%s'][d='%s']", fill, path)).findElements(getDriver());

            String race = getPointProperty("Race", points.get(0).findElement(By.xpath("..")));
            assertEquals("Wrong number of points for race: " + race, raceCounts.get(race), (Integer)points.size());

            foundRaces.add(race);
        }

        assertEquals("Found incorrect Races", raceCounts.keySet(), foundRaces);

        int expectedPointCount = 0;
        for (Map.Entry<String, Integer> raceCount : raceCounts.entrySet())
        {
            expectedPointCount += raceCount.getValue();
        }
        assertEquals("Wrong number of points on scatter plot", expectedPointCount, Locator.css("a.point").findElements(getDriver()).size());

        // issue 20446
        color.openSelectorWindow();
        color.pickMeasure("Demographics", "Race");
        color.confirmSelection();
        assertEquals("Wrong number of points on scatter plot", expectedPointCount, Locator.css("a.point").findElements(getDriver()).size());
        waitForElement(colorLegendGlyph);
        assertElementPresent(colorLegendGlyph, 8);
    }

    @Test
    public void verifyStudyAxis()
    {
        // TODO: Need to test visit tag hovers as well as visit hovers.
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        Locator studyAxisLoc = Locator.css("#study-axis svg");
        Locator studyGroups = Locator.css("g.study");
        Locator studyVisits = Locator.css("rect.visit");
        Locator visitTags = Locator.css("path.visit-tag");
        Locator visitHover = Locator.css("div.study-axis-window");
        List<WebElement> studyVisitEls;
        Actions builder = new Actions(getDriver());

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Time points", "Study days");
        xaxis.confirmSelection();

        // yaxis window opens automatically
        yaxis.pickMeasure("MRNA", "CCL5");
        yaxis.confirmSelection();

        // Check to make sure study axis appears.
        waitForElement(studyAxisLoc);
        assertEquals("Unexpected number of visits on the study axis.", 37, studyVisits.findElements(getDriver()).size());
        assertEquals("Unexpected number of visit tagss on the study axis.", 25, visitTags.findElements(getDriver()).size());

        WebElement studyAxisTest1 = studyGroups.findElements(getDriver()).get(3);
        studyVisitEls = studyAxisTest1.findElements(studyVisits.toBy());

        // Check that study axis hovers appear when hovered over.
        builder.moveToElement(studyVisitEls.get(0)).perform();
        waitForElement(visitHover);
        assertElementPresent(visitHover.withText("Study Axis Test 11\nMonth 1"));

        // Check that hovers disappear
        builder.moveToElement(studyVisitEls.get(0)).moveByOffset(0, -500).perform();
        waitForElementToDisappear(visitHover);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Time points", "Study days");
        xaxis.setVariableRadio("Day 0 (meaning varies)");
        xaxis.confirmSelection();
        waitForTextToDisappear("NotRV144");

        assertEquals("Unexpected number of visits on the study axis.", 37, studyVisits.findElements(getDriver()).size());
        assertEquals("Unexpected number of visit tags on the study axis.", 25, visitTags.findElements(getDriver()).size());

        WebElement notRV144 = studyGroups.findElements(getDriver()).get(0);
        WebElement visit = notRV144.findElement(studyVisits.toBy());
        assertEquals("Visit had an unexpected width.", "10", visit.getAttribute("width"));

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Time points", "Study weeks");
        xaxis.setVariableRadio("Unaligned");
        xaxis.confirmSelection();
        waitForText("Study weeks, CCL5");

        // Assert that we have the same amount of visits even with study weeks.
        assertEquals("Unexpected number of visits on the study axis.", 37, studyVisits.findElements(getDriver()).size());
        assertEquals("Unexpected number of visit tags on the study axis.", 25, visitTags.findElements(getDriver()).size());
    }

    @Test
    public void verifyAntigenVariableSelector()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource("Luminex");
        waitForElement(yaxis.variableOptionsRow().withText("gp41"));
        assertEquals("Wrong number of antigens for Luminex", 1, getElementCount(yaxis.variableOptionsRow()));
        yaxis.pickSource("NAb");
        waitForElement(yaxis.variableOptionsRow().withText("BaL.01"));
        assertEquals("Wrong number of antigens for NAb", 91, getElementCount(yaxis.variableOptionsRow()));
        yaxis.cancelSelection();

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();
        xaxis.pickSource("Luminex");
        waitForElement(xaxis.variableOptionsRow().withText("gp41"));
        assertEquals("Wrong number of antigens for Luminex", 1, getElementCount(xaxis.variableOptionsRow()));
        xaxis.pickSource("NAb");
        waitForElement(xaxis.variableOptionsRow().withText("BaL.01"));
        assertEquals("Wrong number of antigens for NAb", 91, getElementCount(xaxis.variableOptionsRow()));
        xaxis.pickSource("ADCC");
        waitForElement(xaxis.variableOptionsRow().withText("pCenvFs2_Pt1086_B2"));
        assertEquals("Wrong number of antigens for ADCC", 4, getElementCount(xaxis.variableOptionsRow()));
        xaxis.cancelSelection();

        final ColorAxisVariableSelector color = new ColorAxisVariableSelector(this);
        color.openSelectorWindow();
        color.pickSource("Luminex");
        assertFalse("Antigen picker found in color variable selector", waitFor(new Checker()
        {
            @Override
            public boolean check()
            {
                return isElementPresent(color.variableOptionsRow());
            }
        }, 1000));
        color.cancelSelection();
    }

    @Test
    public void verifyAntigenBoxPlot()
    {
        String sharedVirus = "AC10.0.29";
        String uniqueVirus = "BaL.01";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("NAb", "Lab");
        xaxis.setVariableOptions(uniqueVirus);
        xaxis.confirmSelection();
        yaxis.pickMeasure("NAb", "AUC");
        yaxis.setVariableOptions(uniqueVirus);
        yaxis.confirmSelection();

        waitForElement(plotTick.withText(CDSHelper.LABS[1]));
        assertElementPresent(plotBox, 1);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        switchToWindow(1);
        DataRegionTable plotDataTable = new DataRegionTable("query", this);
        assertEquals(12, plotDataTable.getDataRowCount());
        assertEquals(12, getElementCount(Locator.linkWithText(uniqueVirus)));
        assertTextNotPresent(sharedVirus, CDSHelper.LABS[2]);
        getDriver().close();
        switchToMainWindow();

        xaxis.openSelectorWindow();
        xaxis.pickSource("NAb");
        xaxis.setVariableOptions(uniqueVirus, sharedVirus);
        xaxis.confirmSelection();

        waitForElement(plotTick.withText(CDSHelper.LABS[2]));
        assertElementPresent(plotBox, 2);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        switchToWindow(1);
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(24, plotDataTable.getDataRowCount());
        assertEquals(24, getElementCount(Locator.linkWithText(uniqueVirus)) + getElementCount(Locator.linkWithText(sharedVirus)));
        getDriver().close();
        switchToMainWindow();
    }

    @Test
    public void verifyAntigenScatterPlot()
    {
        String xVirus = "BaL.01";
        String yVirus = "AC10.0.29";
        String yVirus2 = "0013095-2.11";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("NAb", "AUC");
        xaxis.setVariableOptions(xVirus);
        xaxis.confirmSelection();
        yaxis.pickMeasure("NAb", "AUC");
        yaxis.setVariableOptions(yVirus);
        yaxis.confirmSelection();

        waitForElement(plotTick.withText("0.06"));
        assertElementPresent(plotPoint, 16);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        switchToWindow(1);
        Ext4Helper.resetCssPrefix();
        DataRegionTable plotDataTable = new DataRegionTable("query", this);
        assertEquals(16, plotDataTable.getDataRowCount());
        plotDataTable.setFilter("BaL$P01::study_NAb_AUC_MAX", "Is Not Blank", null);
        waitForElement(Locator.paginationText(12));
        getDriver().close();
        switchToMainWindow();
        Ext4Helper.setCssPrefix("x-");

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("NAb", "AUC");
        yaxis.setVariableOptions(yVirus, yVirus2);
        yaxis.confirmSelection();

        waitForElement(plotTick.withText("0.14"));
        assertElementPresent(plotPoint, 40);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        switchToWindow(1);
        Ext4Helper.resetCssPrefix();
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(28, plotDataTable.getDataRowCount());
        plotDataTable.setFilter("BaL$P01::study_NAb_AUC_MAX", "Is Not Blank", null);
        waitForElement(Locator.paginationText(12));
        getDriver().close();
        switchToMainWindow();
    }

    @Test
    public void verifyBinnedPlot()
    {
        // make choices that put us over the 'maxRows' parameter specified on the URL
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        // set the x-axis
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("NAb", "Point IC80");
        xaxis.setVariableOptions("0013095-2.11", "001428-2.42");
        xaxis.confirmSelection();

        // set the y-axis
        waitForElement(Locator.css(".curseltitle").containing("for the Y Axis"));
        yaxis.pickMeasure("NAb", "Curve IC80");
        yaxis.confirmSelection();

        // Verify the binning message
        waitForText("Heatmap enabled");
        click(Locator.linkWithText("Learn why"));
        waitForText("The color variable is disabled");

        // Verify the binning message layers correctly
        xaxis.openSelectorWindow();
        waitForTextToDisappear("Heatmap enabled");
        xaxis.cancelSelection();

        cds.ensureNoFilter();
    }

    @AfterClass
    public static void postTest()
    {
        Ext4Helper.resetCssPrefix();
    }

    private String getPointProperty(String property, WebElement point)
    {
        String titleAttribute = point.getAttribute("title");
        String[] pointProperties = titleAttribute.split(",\n");
        Map<String, String> propertyMap = new HashMap<>();

        for (String pointProperty : pointProperties)
        {
            String[] splitProperty = pointProperty.split(": ");
            propertyMap.put(splitProperty[0], splitProperty[1]);
        }

        return propertyMap.get(property);
    }

    @LogMethod
    private void createParticipantGroups()
    {
        Ext4Helper.resetCssPrefix();
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP1, "Subject", "249318596", "249320107");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP2, "Subject", "249320127", "249320489");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3, "Subject", "249320897", "249325717");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3_COPY, "Subject", "249320897", "249325717");
    }

    @Nullable
    @Override
    protected String getProjectName()
    {
        return "CDSTest Project";
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    public static class Locators
    {
        public static Locator plotSelection = Locator.css(".selectionfilter .plot-selection");
        public static Locator plotSelectionFilter = Locator.css(".activefilter .plot-selection");
        public static Locator plotSelectionCloseBtn = Locator.css("div.plot-selection div.closeitem");
        public static Locator plotBox = Locator.css("svg a.dataspace-box-plot");
        public static Locator plotTick = Locator.css("g.tick-text > g > text");
        public static Locator plotPoint = Locator.css("svg a.point");
    }
}
