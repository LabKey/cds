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

import org.apache.commons.lang3.SystemUtils;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.CDS;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.ColorAxisVariableSelector;
import org.labkey.test.pages.DataspaceVariableSelector;
import org.labkey.test.pages.XAxisVariableSelector;
import org.labkey.test.pages.YAxisVariableSelector;
import org.labkey.test.util.CDSAsserts;
import org.labkey.test.util.CDSHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.server.handler.FindElements;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotBox;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotPoint;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotTick;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotTickLinear;

@Category({CDS.class, Git.class})
public class CDSVisualizationTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String PGROUP1 = "visgroup 1";
    private final String PGROUP2 = "visgroup 2";
    private final String PGROUP3 = "visgroup 3";
    private final String PGROUP3_COPY = "copy of visgroup 3";
    private final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subject')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";

    protected static final String MOUSEOVER_FILL = "#41C49F";
    protected static final String MOUSEOVER_STROKE = "#00EAFF";
    protected static final String BRUSHED_FILL = "#14C9CC";
    protected static final String BRUSHED_STROKE = "#00393A";
    protected static final String NORMAL_COLOR = "#000000";

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
    }

    @BeforeClass
    public static void initTest() throws Exception
    {
        CDSVisualizationTest cvt = (CDSVisualizationTest)getCurrentTest();
        //TODO add back (and improve already exists test) when verifySavedGroupPlot is implemented.
//        cvt.createParticipantGroups();
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        CDSVisualizationTest cvt = (CDSVisualizationTest)getCurrentTest();
        //TODO add back (and improve already exists test) when verifySavedGroupPlot is implemented.
//        cvt.deleteParticipantGroups();
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

    @Test
    public void verifyGutterPlotBasic()
    {

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Validate that a y-axis gutter plot is generated.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ELISPOT);
        xaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_RAW);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        assertFalse("For BAMA Magnitude vs NAB Lab x-axis gutter plot was present it should not have been.", hasXGutter());
        assertTrue("For BAMA Magnitude vs NAB Lab y-axis gutter plot was not present.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        log("Validate that a x-axis gutter plot is generated.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC80);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        assertTrue("For NAB IC80 vs ICS Magnitude x-axis gutter plot was not present.", hasXGutter());
        assertFalse("For NAB IC80 vs ICS Magnitude y-axis gutter plot was present and it should not have been.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        log("Validate that a gutter plot is generated for both the x and y axis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.confirmSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();

        assertTrue("For ELISPOT Background vs ICS Visit x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For ELISPOT Background vs ICS Visit y-axis gutter plot was not present.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        log("Validate that a study axis (gutter plot with syringe glyph) is generated for the x axis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();

        assertTrue("For ELISPOT Background vs Time Visit Days a study axis was not present.", hasStudyAxis());
        assertFalse("For ELISPOT Background vs Time Visit Days x-axis gutter plot was present, it should not be.", hasXGutter());
        assertFalse("For ELISPOT Background vs Time Visit Days y-axis gutter plot was present, it should not be.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

    }

    @Test
    public void verifyScatterPlot()
    {
        //getText(Locator.css("svg")) on Chrome

        final String ELISPOT_DATA_PROV = "0\n500\n1000\n1500\n2000\n2500\n3000\n3500\n0\n5000\n10000\n15000\n20000\n25000\n30000\n35000\n40000\n45000"; // TODO Test data dependent.
        final String ICS_MAGNITUDE = "0\n1\n2\n3\n4\n5\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5"; // TODO Test data dependent.
        final String NAB_IC50 = "1\n10\n1\n10\n100\n1000"; // TODO Test data dependent.

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ELISPOT);
        xaxis.pickVariable(CDSHelper.ELISPOT_DATA_PROV);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        if (CDSHelper.validateCounts)
        {
            assertSVG(ELISPOT_DATA_PROV);
        }

        yaxis.openSelectorWindow();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        assertTrue("For ELISPOT vs ICS x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For ELISPOT vs ICS y-axis gutter plot was not present.", hasYGutter());

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        if (CDSHelper.validateCounts)
        {
            assertSVG(ICS_MAGNITUDE);
        }

        // Test log scales
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();

        assertTrue("For NAB vs ICS x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For NAB vs ICS y-axis gutter plot was not present.", hasYGutter());

        // Test disabled for now as a result of side effect of log transformation story. will re-enable when
        // filter refinement is done and compound filter is used to drop <=0 data but retain null.
//        xaxis.openSelectorWindow();
//        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
//        xaxis.pickVariable(CDSHelper.DEMO_AGE);
//        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
//        xaxis.confirmSelection();
//
//        assertTrue("For NAB vs Demographics x-axis gutter plot was not present.", hasXGutter());
//        assertFalse("For NAB vs Demographics y-axis gutter plot was present and it should not be.", hasYGutter());
//
//        if (CDSHelper.validateCounts)
//        {
//            assertSVG(NAB_IC50);
//        }
    }

    @Test
    public void verifyStudyAndTreatmentVars()
    {
        String expectedXYValues;
        int actualTickCount;

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        xaxis.pickVariable(CDSHelper.DEMO_STUDY_NAME);
        xaxis.confirmSelection();
        expectedXYValues = "HVTN 044\nHVTN 049\nHVTN 049x\nHVTN 054\nHVTN 055\nHVTN 065\nHVTN 068\nHVTN 069\nHVTN 070\nHVTN 071\nHVTN 077\nHVTN 078\nHVTN 080\nHVTN 204\nHVTN 503\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            assertSVG(expectedXYValues);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_SUMM);
        xaxis.confirmSelection();
        actualTickCount = Locator.css("div.plot > svg > g.axis > g.tick-text > a > rect.xaxis-tick-rect").findElements(getDriver()).size();

        assertEquals("Expected 60 tick marks on the x-axis. Found: " + actualTickCount, 60, actualTickCount);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_SUBJ_ENR);
        xaxis.confirmSelection();
        expectedXYValues = "9/8/2001\n4/10/2003\n11/9/2004\n6/10/2006\n1/10/2008\n8/11/2009\n3/12/2011\n10/11/2012\n5/13/2014\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        assertTrue("For Date First Subject Enrolled x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For Date First Subject Enrolled y-axis gutter plot was not present.", hasYGutter());

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues, 1);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_FUP_COMP);
        xaxis.confirmSelection();
        expectedXYValues = "4/10/2003\n11/9/2004\n6/10/2006\n1/10/2008\n8/11/2009\n3/12/2011\n10/11/2012\n5/13/2014\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        assertTrue("For Date Followed Up Complete x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For Date Followed Up Complete y-axis gutter plot was not present.", hasYGutter());

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues, 1);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_PUB);
        xaxis.confirmSelection();
        expectedXYValues = "6/10/2006\n1/10/2008\n8/11/2009\n3/12/2011\n10/11/2012\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        assertTrue("For Date Study Published x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For Date Study Published y-axis gutter plot was not present.", hasYGutter());

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues, 1);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_START);
        xaxis.confirmSelection();
        expectedXYValues = "4/10/2003\n11/9/2004\n6/10/2006\n1/10/2008\n8/11/2009\n3/12/2011\n10/11/2012\n5/13/2014\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        assertTrue("For Date Study Start x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For Date Study Start y-axis gutter plot was not present.", hasYGutter());

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues, 1);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_NETWORK);
        xaxis.confirmSelection();
        expectedXYValues = "HVTN\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_PROD_CLASS);
        xaxis.confirmSelection();
        expectedXYValues = "derived\nundefined\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_PROD_COMB);
        xaxis.confirmSelection();
        expectedXYValues = "derived\nundefined\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_STUDY_TYPE);
        xaxis.confirmSelection();
        expectedXYValues = "Phase I\nPhase II\nPhase IIB\nundefined\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_ARM);
        xaxis.confirmSelection();
        actualTickCount = Locator.css("div.plot > svg > g.axis > g.tick-text > a > rect.xaxis-tick-rect").findElements(getDriver()).size();

        assertEquals("Expected 28 tick marks on the x-axis. Found: " + actualTickCount, 28, actualTickCount);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_CODED);
        xaxis.confirmSelection();
        expectedXYValues = "undefined\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues);
        }

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_VACC_PLAC);
        xaxis.confirmSelection();
        expectedXYValues = "Placebo\nVaccine\nundefined\n0\n2\n4\n6\n8\n10\n12\n14"; // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            // Because there will be gutter plots the text we are interested in will be at svg 1.
            assertSVG(expectedXYValues);
        }

    }

    @Test
    public void verifyColorStudyAndTreatmentVars()
    {
        int actualTickCount;
        String cssColorLegend = "#colorvarselector-innerCt  svg > path.legend-point";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        cds.openStatusInfoPane("Races");
        sleep(500);
        cds.selectInfoPaneItem(CDSHelper.RACE_BLACK, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        sleep(500); // Wait for the mask to show up.
        _ext4Helper.waitForMaskToDisappear();

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        coloraxis.pickVariable(CDSHelper.DEMO_STUDY_NAME);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 15 Study Names in the color axis. Found: " + actualTickCount, 15, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_TREAT_SUMM);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 30 Treatment Summaries in the color axis. Found: " + actualTickCount, 30, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_NETWORK);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 1 Network in the color axis. Found: " + actualTickCount, 1, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_PROD_COMB);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 2 Product Class Combinations in the color axis. Found: " + actualTickCount, 2, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_PROD_CLASS);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 2 Product Classes in the color axis. Found: " + actualTickCount, 2, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_STUDY_TYPE);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 4 Study Types in the color axis. Found: " + actualTickCount, 4, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_TREAT_ARM);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 19 Treatment Arms in the color axis. Found: " + actualTickCount, 19, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_TREAT_CODED);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 1 Treatment Arm Coded Label in the color axis. Found: " + actualTickCount, 1, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_VACC_PLAC);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Expected 3 Vaccinne or Placebos in the color axis. Found: " + actualTickCount, 3, actualTickCount);

    }

        @Test
    public void verifyBoxPlots()
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        // Choose the y-axis and verify that only 1 box plot shows if there is no x-axis chosen.
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        waitForElement(plotBox);

        if (CDSHelper.validateCounts)
        {
            assertElementPresent(plotBox, 1);
            assertElementPresent(plotPoint, 3713); // TODO Test data dependent.
        }

        // Choose a categorical axis to verify that multiple box plots will appear.
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_SEX);
        xaxis.confirmSelection();

        waitForElement(Locators.plotTick.withText("Female"), 20000);

        waitForElement(Locators.plotBox);

        if (CDSHelper.validateCounts)
        {
            assertElementPresent(plotBox, 2);
            assertElementPresent(plotPoint, 3713); // TODO Test data dependent.
        }

        // Choose a continuous axis and verify that the chart goes back to being a scatter plot.
        xaxis.openSelectorWindow();
        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        waitForElementToDisappear(plotBox);

        // Verify that we can go back to boxes after being in scatter mode.
        xaxis.openSelectorWindow();
        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_RACE);
        xaxis.confirmSelection();

        waitForElement(Locators.plotBox);
        waitForElement(Locators.plotTick.withText("Asian"), 20000); // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            assertElementPresent(plotBox, 7); // TODO Test data dependent.
            assertElementPresent(plotPoint, 3713); // TODO Test data dependent.
        }

        //Verify x axis categories are selectable as filters
        mouseOver(Locators.plotTick.withText("Asian")); // TODO Test data dependent.

        if (CDSHelper.validateCounts)
        {
            assertEquals("incorrect number of points highlighted after mousing over x axis category", 76, getPointCountByColor(MOUSEOVER_FILL)); // TODO Test data dependent.
        }

        click(Locators.plotTick.withText("Asian")); // TODO Test data dependent.
        //ensure filter buttons are present
        waitForElement(Locators.filterDataButton);
        assertElementPresent(Locators.removeButton);

        if (CDSHelper.validateCounts)
        {
            //ensure correct number of points are highlighted
            assertEquals("incorrect number of points highlighted after clicking x axis category", 76, getPointCountByColor(MOUSEOVER_FILL)); // TODO Test data dependent.
            //ensure correct total number of points
            assertEquals("incorrect total number of points after clicking x axis category", 3713, getPointCount()); // TODO Test data dependent.
            //apply category selection as a filter
        }

        // Need to do this because there is more than one "Filter" buton in the OM, but only want the visible one.
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));

        if (CDSHelper.validateCounts)
        {
            waitForPointCount(76, 20000); // TODO Test data dependent.
        }

        //clear filter
        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW); // Work around for issue 23845.
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_RACE);
        xaxis.confirmSelection();

        if (CDSHelper.validateCounts)
        {
            waitForPointCount(3713, 20000); // TODO Test data dependent.
        }

        //verify multi-select of categories
        selectXAxes(false, "White", "Other", "Native Hawaiian/Paci", "Native American/Alas"); // TODO Test data dependent.
        sleep(3000); // Let the animation end.

        if (CDSHelper.validateCounts)
        {
            //ensure correct number of points are highlighted
            assertEquals("incorrect number of points highlighted after clicking x axis categories",2707, getPointCountByColor(MOUSEOVER_FILL)); // TODO Test data dependent.
            assertEquals("incorrect total number of points after clicking x axis categories",3713, getPointCount()); // TODO Test data dependent.
            //apply selection as exlusive filter
            waitAndClick(CDSHelper.Locators.cdsButtonLocator("Remove"));
            waitForPointCount(3713 - 2707, 10000); // TODO Test data dependent.
        }

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

    }

// TODO CDS does not work with groups created in LabKey, the groups need to be created in CDS.
//    @Test
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
    public void verifyAxisSelectors()
    {

        final String[][] Y_AXIS_SOURCES =
                {
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_AGE, CDSHelper.DEMO_BMI},
                        {CDSHelper.BAMA, CDSHelper.BAMA_MAGNITUDE_DELTA, CDSHelper.BAMA_MAGNITUDE_BLANK, CDSHelper.BAMA_MAGNITUDE_BASELINE, CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW, CDSHelper.BAMA_MAGNITUDE_RAW_BASELINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND, CDSHelper.ELISPOT_MAGNITUDE_RAW},
                        {CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ICS_MAGNITUDE_BACKGROUND, CDSHelper.ICS_MAGNITUDE_RAW},
                        {CDSHelper.NAB, CDSHelper.NAB_TITERIC50, CDSHelper.NAB_TITERIC80}
                };
        final String[][] X_AXIS_SOURCES =
                {
                        {CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_DATE_SUBJ_ENR, CDSHelper.DEMO_DATE_FUP_COMP, CDSHelper.DEMO_DATE_PUB, CDSHelper.DEMO_DATE_START, CDSHelper.DEMO_NETWORK, CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM, CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC},
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_AGE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_AGEGROUP, CDSHelper.DEMO_BMI, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SUBSPECIES},
                        {CDSHelper.TIME_POINTS, CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_WEEKS, CDSHelper.TIME_POINTS_MONTHS},
                        {CDSHelper.BAMA, CDSHelper.BAMA_MAGNITUDE_DELTA, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_DILUTION, CDSHelper.BAMA_EXP_ASSAYD, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_MAGNITUDE_BLANK, CDSHelper.BAMA_MAGNITUDE_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW, CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW_BASELINE, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_EXP_ASSAY, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND, CDSHelper.ELISPOT_MAGNITUDE_RAW, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_EXP_ASSAY, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_MAGNITUDE_BACKGROUND, CDSHelper.ICS_MAGNITUDE_RAW, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_RESPONSE, CDSHelper.NAB_TITERIC50, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_EXP_ASSAY, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_LAB, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL, CDSHelper.NAB_TITERIC80}
                };
        final String[][] COLOR_AXIS_SOURCES =
                {
                        {CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_NETWORK, CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM, CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC},
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_SUBSPECIES},
                        {CDSHelper.BAMA, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_CLADE, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.NAB_RESPONSE, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL}
                };

        final Map<String, String> SubjectCounts = new HashMap<>();
        SubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "8,469");   //8,373
        SubjectCounts.put(CDSHelper.SUBJECT_CHARS, "8,469");
        SubjectCounts.put(CDSHelper.TIME_POINTS, "8,469");
        SubjectCounts.put(CDSHelper.BAMA, "75");
        SubjectCounts.put(CDSHelper.ELISPOT, "477");
        SubjectCounts.put(CDSHelper.ICS, "1,690");
        SubjectCounts.put(CDSHelper.NAB, "899");

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        this.log("Validating the x-axis selector.");
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();

        log("Validating the x-axis header text.");
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'main-title')][text()='x-axis']")));
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")));
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'subject-count')][text()='Subject count']")));

        log("Validating the x-axis sources.");
        for (String[] src : X_AXIS_SOURCES)
        {
            assertTrue(isElementVisible(xaxis.window().append(" div.content-label").withText(src[0])));
            assertTrue(isElementVisible(xaxis.window().append(" div.content-count").withText(SubjectCounts.get(src[0])))); // TODO Bad test. It will pass if there is any tag wtih this count. Need to revisit.
            log("Validating variables for " + src[0]);
            click(xaxis.window().append(" div.content-label").withText(src[0]));
            waitForElement(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//span[contains(@class, 'section-title')][text()='" + src[0] + "']"));
            for (int i = 1; i < src.length; i++)
            {
                assertTrue(isElementVisible(xaxis.window().append(" div.content-label").withText(src[i])));
                click(xaxis.window().append(" div.content-label").withText(src[i]));
            }
            xaxis.backToSource();
        }

        log("Validating the x-axis cancel button.");
        xaxis.cancelSelection();

        log("Validating the y-axis selector.");
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        yaxis.openSelectorWindow();

        log("Validating the y-axis header text.");
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'main-title')][text()='y-axis']")));
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")));
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'subject-count')][text()='Subject count']")));

        log("Validating the y-axis sources.");
        for (String[] src : Y_AXIS_SOURCES)
        {
            assertTrue(isElementVisible(yaxis.window().append(" div.content-label").withText(src[0])));
            assertTrue(isElementVisible(yaxis.window().append(" div.content-count").withText(SubjectCounts.get(src[0])))); // TODO Bad test. It will pass if there is any tag wtih this count. Need to revisit.
            log("Validating variables for " + src[0]);
            click(yaxis.window().append(" div.content-label").withText(src[0]));
            waitForElement(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//span[contains(@class, 'section-title')][text()='" + src[0] + "']"));
            for (int i = 1; i < src.length; i++)
            {
                assertTrue(isElementVisible(yaxis.window().append(" div.content-label").withText(src[i])));
                click(yaxis.window().append(" div.content-label").withText(src[i]));
            }
            yaxis.backToSource();
        }

        log("Validating the y-axis cancel button.");
        yaxis.cancelSelection();

        log("Validating the color-axis selector.");
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);
        coloraxis.openSelectorWindow();

        log("Validating the color-axis header text.");
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'main-title')][text()='color']")));
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")));
        assertTrue(isElementVisible(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'subject-count')][text()='Subject count']")));

        log("Validating the color-axis sources.");
        for (String[] src : COLOR_AXIS_SOURCES)
        {
            assertTrue(isElementVisible(coloraxis.window().append(" div.content-label").withText(src[0])));
            assertTrue(isElementVisible(coloraxis.window().append(" div.content-count").withText(SubjectCounts.get(src[0])))); // TODO Bad test. It will pass if there is any tag wtih this count. Need to revisit.
            log("Validating variables for " + src[0]);
            click(coloraxis.window().append(" div.content-label").withText(src[0]));
            waitForElement(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//span[contains(@class, 'section-title')][text()='" + src[0] + "']"));
            for (int i = 1; i < src.length; i++)
            {
                assertTrue(isElementVisible(coloraxis.window().append(" div.content-label").withText(src[i])));
                click(coloraxis.window().append(" div.content-label").withText(src[i]));
            }
            coloraxis.backToSource();
        }

        log("Validating the color-axis cancel button.");
        coloraxis.cancelSelection();

    }

    @Test
    public void verifySubjectCounts()
    {

        // TODO all the counts here are very test data dependent.

        Map<String, String> sourcesSubjectCounts = new HashMap<>();
        CDSHelper cds = new CDSHelper(this);
        Map<String, String> antigenCounts = new HashMap<>();
        Map<String, String> peptidePoolCounts = new HashMap<>();
        Map<String, String> proteinCounts = new HashMap<>();
        Map<String, String> proteinPanelCounts = new HashMap<>();
        Map<String, String> virusCounts = new HashMap<>();

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        // Populate expected counts for antigens.
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A1_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A244_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_AE244_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_BCON_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_C1086_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_CCON_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_CONS_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_GP70_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_P24_NAME), "75");

        // Populate expected counts for peptide pools.
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV1PTEC), "156");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV2PTEC), "156");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV3PTEC), "154");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG1PTEC), "168");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG2PTEC), "167");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEC), "156");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL1PTEC), "168");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL2PTEC), "163");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL3PTEC), "159");

        // Populate expected counts for proteins.
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "178");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "1289");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "1146");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "739");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "1061");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "219");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "219");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "219");

        // Populate expected counts for protein panels.
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "178");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "1325");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "219");

        // Populate expected counts for viruses.
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "68");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "73");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "787");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "727");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "60");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_REJO), "119");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_RHPA), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SC422), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_WITO4), "60");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_92RW), "50");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "381");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "321");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_96ZM), "88");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_97ZA), "50");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "694");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_C1080), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_C3347), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CAAN), "60");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CH58), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CH77), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CM244), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CE1086), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CE1176), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_CE2010), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "741");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SIVLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SIVNL), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SVA), "67");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_TV1LUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_W61D), "120");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_WITO), "0");

        sourcesSubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "8,469");
        sourcesSubjectCounts.put(CDSHelper.SUBJECT_CHARS, "8,469");
        sourcesSubjectCounts.put(CDSHelper.TIME_POINTS, "8,469");
        sourcesSubjectCounts.put(CDSHelper.BAMA, "75");
        sourcesSubjectCounts.put(CDSHelper.ELISPOT, "477");
        sourcesSubjectCounts.put(CDSHelper.ICS, "1,690");
        sourcesSubjectCounts.put(CDSHelper.NAB, "899");

        subjectCountsHelper(sourcesSubjectCounts, antigenCounts, peptidePoolCounts, proteinCounts, proteinPanelCounts, virusCounts);

    }

    @Test
    public void verifySubjectCountsWithFilters()
    {

        // TODO all the counts here are very test data dependent.

        Map<String, String> sourcesSubjectCounts = new HashMap<>();
        Map<String, String> antigenCounts = new HashMap<>();
        Map<String, String> peptidePoolCounts = new HashMap<>();
        Map<String, String> proteinCounts = new HashMap<>();
        Map<String, String> proteinPanelCounts = new HashMap<>();
        Map<String, String> virusCounts = new HashMap<>();

        CDSHelper cds = new CDSHelper(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Validating subject count with a filter of BAMA assay.");

        cds.goToSummary();
        cds.clickBy("Assays");
        refresh(); // TODO working around an issue where reference is loss to element.
        cds.selectBars(CDSHelper.ASSAYS[0]); // Select BAMA

        // Populate expected counts for some of the antigens.
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A1_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A244_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_BCON_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_C1086_NAME), "75");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_P24_NAME), "75");

        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL1PTEC), "0");

        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "0");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "74");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "0");

        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "74");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "72");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "75");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "75");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "42");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "72");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "72");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "0");

        sourcesSubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "75");
        sourcesSubjectCounts.put(CDSHelper.SUBJECT_CHARS, "75");
        sourcesSubjectCounts.put(CDSHelper.TIME_POINTS, "75");
        sourcesSubjectCounts.put(CDSHelper.BAMA, "75");
        sourcesSubjectCounts.put(CDSHelper.ELISPOT, "0");
        sourcesSubjectCounts.put(CDSHelper.ICS, "75");
        sourcesSubjectCounts.put(CDSHelper.NAB, "75");

        subjectCountsHelper(sourcesSubjectCounts, antigenCounts, peptidePoolCounts, proteinCounts, proteinPanelCounts, virusCounts);

        cds.clearFilters();

        log("Validating subject count with a filter of race-asian.");

        cds.openStatusInfoPane("Races");
        cds.selectInfoPaneItem(CDSHelper.RACE_ASIAN, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        sourcesSubjectCounts.clear();

        antigenCounts.clear();
        peptidePoolCounts.clear();
        proteinCounts.clear();
        proteinPanelCounts.clear();
        virusCounts.clear();

        // Populate expected counts for some of the antigens.
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A1_NAME), "1");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_A244_NAME), "1");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_BCON_NAME), "1");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_C1086_NAME), "1");
        antigenCounts.put(cds.buildCountIdentifier(CDSHelper.ANTIGEN_P24_NAME), "1");

        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAG1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEC, CDSHelper.PROTEIN_POL, CDSHelper.PEPTIDE_POOL_POL1PTEC), "0");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV, CDSHelper.PEPTIDE_POOL_ENV2PTEG), "2");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF, CDSHelper.PEPTIDE_POOL_NEFPTEG), "2");
        peptidePoolCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_GAGB, CDSHelper.PROTEIN_GAG, CDSHelper.PEPTIDE_POOL_GAGCONB1), "18");

        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "9");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "27");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "0");

        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "9");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "27");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "18");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "12");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "15");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "2");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "1");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "17");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "13");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "2");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "6");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "3");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "13");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "15");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "0");

        sourcesSubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "150");
        sourcesSubjectCounts.put(CDSHelper.SUBJECT_CHARS, "150");
        sourcesSubjectCounts.put(CDSHelper.TIME_POINTS, "150");
        sourcesSubjectCounts.put(CDSHelper.BAMA, "1");
        sourcesSubjectCounts.put(CDSHelper.ELISPOT, "20");
        sourcesSubjectCounts.put(CDSHelper.ICS, "28");
        sourcesSubjectCounts.put(CDSHelper.NAB, "20");

        subjectCountsHelper(sourcesSubjectCounts, antigenCounts, peptidePoolCounts, proteinCounts, proteinPanelCounts, virusCounts);

        cds.clearFilters();

    }

    @Test
    public void verifySubjectCountsWithFiltersAdvancedOptions()
    {

        // TODO all the counts here are very test data dependent.

        Map<String, String> proteinCounts = new HashMap<>();
        Map<String, String> proteinPanelCounts = new HashMap<>();
        Map<String, String> virusCounts = new HashMap<>();

        CDSHelper cds = new CDSHelper(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Validating counts with filters of NAB A3R5 and then cell types of CD4+, CD8+ and both.");

        cds.goToSummary();
        cds.clickBy("Assays");
        cds.selectBars(CDSHelper.ASSAYS[3]); // Select NAb A3R5

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA), "0");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG), "58");
        proteinPanelCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503), "0");

        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEA, CDSHelper.PROTEIN_ENV), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_ENV), "58");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_GAG), "58");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_NEF), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_PTEG, CDSHelper.PROTEIN_POL), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_GAG), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_NEF), "0");
        proteinCounts.put(cds.buildCountIdentifier(CDSHelper.PROTEIN_PANEL_V503, CDSHelper.PROTEIN_POL), "0");

        log("Validating the x-axis selector.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        xaxis.validateProteinSubjectCount(proteinCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        xaxis.validateProteinSubjectCount(proteinCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        xaxis.validateProteinSubjectCount(proteinCounts, false);
        xaxis.backToSource();

        xaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // Counts for the y-axis are the same as x-axis. So no need to repopulate the counts.

        log("Validating the y-axis selector.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        yaxis.validateProteinSubjectCount(proteinCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        yaxis.validateProteinSubjectCount(proteinCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
        yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
        yaxis.validateProteinSubjectCount(proteinCounts, false);
        yaxis.backToSource();

        yaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        cds.clearFilters();


        log("Validating counts with filters of Race=white and target cell of A3R5 and TZM-bl.");

        cds.openStatusInfoPane("Races");
        cds.selectInfoPaneItem(CDSHelper.RACE_WHITE, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "58");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "65");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "541");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "492");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "34");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "34");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "50");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "235");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "195");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "473");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "504");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "4");

        log("Validating the x-axis selector.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.setTargetCell(CDSHelper.TARGET_CELL_TZM);
        xaxis.validateVirusSubjectCount(virusCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // Counts change when moving to A3R5.

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "83");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "222");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "140");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "82");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "34");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "236");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "236");

        xaxis.setTargetCell(CDSHelper.TARGET_CELL_A3R5);
        xaxis.validateVirusSubjectCount(virusCounts, false);
        xaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        xaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // Validating for the y-axis re-populate the counts like we did before.

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "58");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "65");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "541");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "492");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "34");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "34");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "50");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "235");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "195");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "473");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "504");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "4");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "4");

        log("Validating the y-axis selector.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.setTargetCell(CDSHelper.TARGET_CELL_TZM);
        yaxis.validateVirusSubjectCount(virusCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        virusCounts.clear();
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_A, CDSHelper.VIRUS_Q23), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_BX08), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_MN3), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SF162), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_SS1196), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_2, CDSHelper.ANTIGEN_CLADE_B, CDSHelper.VIRUS_TRO), "0");

        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, CDSHelper.VIRUS_TV1), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_NP03), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_CRF01, CDSHelper.VIRUS_TH023), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_9020), "83");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_BAL26), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU151), "222");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_DU422), "140");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_MW965), "0");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_R2184), "82");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_REJOLUC), "34");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_RHPALUC), "236");
        virusCounts.put(cds.buildCountIdentifier(CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, CDSHelper.VIRUS_SC22), "236");

        yaxis.setTargetCell(CDSHelper.TARGET_CELL_A3R5);
        yaxis.validateVirusSubjectCount(virusCounts, false);
        yaxis.back();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        yaxis.cancelSelection();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        cds.clearFilters();

    }

    @Test
    public void verifyScatterPlotColorAxis()
    {
        CDSHelper cds = new CDSHelper(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        ColorAxisVariableSelector color = new ColorAxisVariableSelector(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_DATA);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setVirusName(cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_NEUTRAL_TIER, CDSHelper.NEUTRAL_TIER_1));
        xaxis.confirmSelection();
        // yaxis window opens automatically
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setVirusName(cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_NEUTRAL_TIER, CDSHelper.NEUTRAL_TIER_1));
        yaxis.confirmSelection();
        color.openSelectorWindow();
        color.pickSource(CDSHelper.SUBJECT_CHARS);
        color.pickVariable(CDSHelper.DEMO_RACE);
        color.confirmSelection();

        Locator.CssLocator colorLegend = Locator.css("#color-legend > svg");
        Locator.CssLocator colorLegendGlyph = colorLegend.append("> .legend-point");
        waitForElement(colorLegend);
        assertElementPresent(colorLegendGlyph, 7);

        // TODO Need to revisit this part of the test. Specifically there no longer is a 'Race' attribute to look for.
/*
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
        */
    }

    @Test
    public void verifyTimeAxisBasic()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        Map expectedCounts = new HashMap<String, CDSHelper.TimeAxisData>();
        expectedCounts.put("HVTN_041", new CDSHelper.TimeAxisData("HVTN 041", 3, 6, 0, 0));
        expectedCounts.put("HVTN_049", new CDSHelper.TimeAxisData("HVTN 049", 6, 8, 0, 0));
        expectedCounts.put("HVTN_049x", new CDSHelper.TimeAxisData("HVTN 049x", 3, 7, 0, 0));
        expectedCounts.put("HVTN_094", new CDSHelper.TimeAxisData("HVTN 094", 6, 22, 0, 0));
        expectedCounts.put("HVTN_096", new CDSHelper.TimeAxisData("HVTN 096", 4, 9, 0, 0));
        expectedCounts.put("HVTN_203", new CDSHelper.TimeAxisData("HVTN 0203", 4, 6, 0, 0));
        expectedCounts.put("HVTN_205", new CDSHelper.TimeAxisData("HVTN 0205", 0, 0, 0, 0));

        final String yaxisScale = "\n0\n200\n400\n600\n800\n1000\n1200\n1400\n1600\n1800"; // TODO Test data dependent.
        final String studyDaysScales = "0\n100\n200\n300\n400\n500\n600" + yaxisScale; // TODO Test data dependent.
        final String studyDaysScaleAligedVaccination = "-300\n-200\n-100\n0\n100\n200\n300" + yaxisScale; // TODO Test data dependent.
        final String studyWeeksScales = "0\n20\n40\n60\n80" + yaxisScale; // TODO Test data dependent.
        final String studyWeeksScalesAlignedVaccination = "-40\n-20\n0\n20\n40" + yaxisScale; // TODO Test data dependent.
        final String studyMonthsScales = "0\n5\n10\n15\n20" + yaxisScale; // TODO Test data dependent.
        final String studyMonthsScalesAlignedVaccination = "-10\n-5\n0\n5\n10" + yaxisScale; // TODO Test data dependent.

        log("Verify NAb Titer IC50, A3R5 and Study Days.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setTargetCell(CDSHelper.TARGET_CELL_A3R5);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();

        assertTrue("For NAb Titer 50, A3R5 vs Time Visit Days a study axis was not present.", hasStudyAxis());
        List<WebElement> studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found" + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyDaysScales);

        log("Change x-axis to Study weeks, verify visit counts don't change.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyWeeksScales);

        log("Change x-axis to Study months, verify visit counts don't change.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.confirmSelection();

        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected 7 studies in the Time Axis, found " + studies.size() + ".", studies.size() == 7);
        log("Study count was as expected.");

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyMonthsScales);

        log("Change x-axis to Study days, change alignment to Enrollment, verify visit counts are as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();

        // When changing the alignment to anything other than Day 0 study HVTN 205 will not appear because it has no visit information.
        expectedCounts.remove("HVTN_205");

        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyDaysScales);

        log("Change x-axis alignment to Last Vaccination, verify visit counts are as expected.");
        expectedCounts.replace("HVTN_041", new CDSHelper.TimeAxisData("HVTN 041", 3, 6, 0, 1));
        expectedCounts.replace("HVTN_049", new CDSHelper.TimeAxisData("HVTN 049", 6, 8, 0, 1));
        expectedCounts.replace("HVTN_049x", new CDSHelper.TimeAxisData("HVTN 049x", 3, 7, 0, 1));
        expectedCounts.replace("HVTN_096", new CDSHelper.TimeAxisData("HVTN 096", 4, 9, 0, 1));
        expectedCounts.replace("HVTN_203", new CDSHelper.TimeAxisData("HVTN 0203", 4, 6, 0, 1));
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.setAlignedBy("Last Vaccination");
        xaxis.confirmSelection();

        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyDaysScaleAligedVaccination);

        log("Change x-axis to Study weeks, and go back to aligned by Enrollment, verify visit are as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        expectedCounts.replace("HVTN_041", new CDSHelper.TimeAxisData("HVTN 041", 3, 6, 0, 0));
        expectedCounts.replace("HVTN_049", new CDSHelper.TimeAxisData("HVTN 049", 6, 8, 0, 0));
        expectedCounts.replace("HVTN_049x", new CDSHelper.TimeAxisData("HVTN 049x", 3, 7, 0, 0));
        expectedCounts.replace("HVTN_096", new CDSHelper.TimeAxisData("HVTN 096", 4, 9, 0, 0));
        expectedCounts.replace("HVTN_203", new CDSHelper.TimeAxisData("HVTN 0203", 4, 6, 0, 0));

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyWeeksScales);

        log("Change x-axis Aligned by Last Vaccination, verify visit are as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        expectedCounts.replace("HVTN_041", new CDSHelper.TimeAxisData("HVTN 041", 3, 6, 0, 1));
        expectedCounts.replace("HVTN_049", new CDSHelper.TimeAxisData("HVTN 049", 6, 8, 0, 1));
        expectedCounts.replace("HVTN_049x", new CDSHelper.TimeAxisData("HVTN 049x", 3, 7, 0, 1));
        expectedCounts.replace("HVTN_096", new CDSHelper.TimeAxisData("HVTN 096", 4, 9, 0, 1));
        expectedCounts.replace("HVTN_203", new CDSHelper.TimeAxisData("HVTN 0203", 4, 6, 0, 1));

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyWeeksScalesAlignedVaccination);

        log("Change x-axis to Study months, and go back to aligned by Enrollment, verify visit are as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        expectedCounts.replace("HVTN_041", new CDSHelper.TimeAxisData("HVTN 041", 3, 6, 0, 0));
        expectedCounts.replace("HVTN_049", new CDSHelper.TimeAxisData("HVTN 049", 6, 8, 0, 0));
        expectedCounts.replace("HVTN_049x", new CDSHelper.TimeAxisData("HVTN 049x", 3, 7, 0, 0));
        expectedCounts.replace("HVTN_096", new CDSHelper.TimeAxisData("HVTN 096", 4, 9, 0, 0));
        expectedCounts.replace("HVTN_203", new CDSHelper.TimeAxisData("HVTN 0203", 4, 6, 0, 0));

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyMonthsScales);

        log("Change x-axis Aligned by Last Vaccination, verify visit are as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        expectedCounts.replace("HVTN_041", new CDSHelper.TimeAxisData("HVTN 041", 3, 6, 0, 1));
        expectedCounts.replace("HVTN_049", new CDSHelper.TimeAxisData("HVTN 049", 6, 8, 0, 1));
        expectedCounts.replace("HVTN_049x", new CDSHelper.TimeAxisData("HVTN 049x", 3, 7, 0, 1));
        expectedCounts.replace("HVTN_096", new CDSHelper.TimeAxisData("HVTN 096", 4, 9, 0, 1));
        expectedCounts.replace("HVTN_203", new CDSHelper.TimeAxisData("HVTN 0203", 4, 6, 0, 1));

        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyMonthsScalesAlignedVaccination);

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

    }

    @Test
    public void verifyTimeAxisWithMultipleSchedules()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        String cssPath;
        List<String> expectedToolTipText;

        Map expectedCounts = new HashMap<String, CDSHelper.TimeAxisData>();
        expectedCounts.put("HVTN_060", new CDSHelper.TimeAxisData("HVTN 060", 5, 7, 0, 0));
        expectedCounts.put("HVTN_063", new CDSHelper.TimeAxisData("HVTN 063", 5, 8, 0, 0));
        expectedCounts.put("HVTN_069", new CDSHelper.TimeAxisData("HVTN 069", 4, 7, 0, 0));
        expectedCounts.put("HVTN_204", new CDSHelper.TimeAxisData("HVTN 204", 4, 12, 0, 0));

        final String yaxisScale = "\n0\n5000\n10000\n15000\n20000\n25000\n30000\n35000\n40000\n45000"; // TODO Test data dependent.
        final String studyDaysScales = "0\n200\n400\n600\n800\n1000" + yaxisScale; // TODO Test data dependent.

        log("Verify ELISPOT Magnitude - Background subtracted and Study Days with axis collapsed and expanded.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();

        assertTrue("For ELISPOT Magnitude - Background subtracted vs Time Visit Days a study axis was not present.", hasStudyAxis());
        List<WebElement> studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found" + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        // Get the element again to avoid the stale-element error.
        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        validateVisitCounts(studies, expectedCounts);
        assertSVG(studyDaysScales);

        log("Validate that the tool-tips are as expected.");

        // Going to leave the values for the tool-tips hard coded here. Unlikely they would ever be used anywhere else.
        // Alternative to hard coding the values would be to write a generator that would build the expected tool-tips,
        // but that is more effort that I have time for now.
        expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add("HVTN 060 - Day 379");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 1 Arm Ca Placebo: Follow-Up");
        expectedToolTipText.add("Group 2 Arm Ca Placebo: Follow-Up");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 3 Arm Ca Placebo: Follow-Up");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 4 Arm Ca Placebo: Follow-Up");
        expectedToolTipText.add("Group 4 Arm T4 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 5 Arm T5 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 5 Arm Cb Placebo: Follow-Up");
        expectedToolTipText.add("Group 6 Arm T6 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 6 Arm Cb Placebo: Follow-Up");
        expectedToolTipText.add("Group 7 Arm T7 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 7 Arm Cb Placebo: Follow-Up");
        cssPath = "#study-axis > svg > g:nth-child(2)  > image:nth-of-type(1)";
        timeAxisToolTipsTester(cssPath, expectedToolTipText);

        expectedToolTipText.clear();
        expectedToolTipText.add("HVTN 069 - Day 70");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Follow-Up");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Follow-Up");
        cssPath = "#study-axis > svg > g:nth-child(4)  > image:nth-of-type(1)";
        timeAxisToolTipsTester(cssPath, expectedToolTipText);

        log("Expand the time axis and verify the counts.");
        Locator.css("#study-axis > svg > g > image.img-expand").findElement(getDriver()).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        expectedCounts.clear();
        expectedCounts.put("HVTN_060", new CDSHelper.TimeAxisData("HVTN 060", 0, 0, 0, 0));
        expectedCounts.put("HVTN_060-Group_7_Cb_Placebo", new CDSHelper.TimeAxisData("Group 7 Arm Cb Placebo", 5, 7, 0, 0));
        expectedCounts.put("HVTN_063", new CDSHelper.TimeAxisData("HVTN 063", 0, 0, 0, 0));
        expectedCounts.put("HVTN_063-Group_2_T2_Vaccine", new CDSHelper.TimeAxisData("Group 2 Arm T2 Vaccine", 5, 8, 0, 0));
        expectedCounts.put("HVTN_069", new CDSHelper.TimeAxisData("HVTN 069", 0, 0, 0, 0));
        expectedCounts.put("HVTN_069-Group_1_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 4, 7, 0, 0));
        expectedCounts.put("HVTN_069-Group_2_T2_Vaccine", new CDSHelper.TimeAxisData("Group 2 Arm T2 Vaccine", 4, 7, 0, 0));
        expectedCounts.put("HVTN_069-Group_3_T3_Vaccine", new CDSHelper.TimeAxisData("Group 3 Arm T3 Vaccine", 4, 7, 0, 0));
        expectedCounts.put("HVTN_204", new CDSHelper.TimeAxisData("HVTN 204", 0, 0, 0, 0));
        expectedCounts.put("HVTN_204-Group_1_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 4, 12, 0, 0));
        expectedCounts.put("HVTN_204-Group_2_C1_Placebo", new CDSHelper.TimeAxisData("Group 3 Arm T3 Vaccine", 4, 12, 0, 0));

        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected 35 studies in the Time Axis, found" + studies.size() + ".", studies.size() == 35);
        validateVisitCounts(studies, expectedCounts);
        log("The counts are as expected.");

        log("Validate that the tool-tips are as expected when expanded.");

        expectedToolTipText.clear();
        expectedToolTipText.add("HVTN 063 - Day 546");
        expectedToolTipText.add("Group 1 Arm Ca Placebo: Follow-Up");
        cssPath = "#study-axis > svg > g:nth-child(18) > image:nth-of-type(10)";
        timeAxisToolTipsTester(cssPath, expectedToolTipText);

        expectedToolTipText.clear();
        expectedToolTipText.add("HVTN 069 - Day 0");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: derived");
        expectedToolTipText.add("Enrollment, Vaccination");
        cssPath = "#study-axis > svg > g:nth-child(31) > image:nth-of-type(8)";
        timeAxisToolTipsTester(cssPath, expectedToolTipText);

        log("Change time axis alignment and validate things remain the same.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        expectedCounts.replace("HVTN_069-Group_1_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 4, 7, 0, 1));
        expectedCounts.replace("HVTN_069-Group_2_T2_Vaccine", new CDSHelper.TimeAxisData("Group 2 Arm T2 Vaccine", 4, 7, 0, 1));
        expectedCounts.replace("HVTN_069-Group_3_T3_Vaccine", new CDSHelper.TimeAxisData("Group 3 Arm T3 Vaccine", 4, 7, 0, 1));
        expectedCounts.replace("HVTN_204-Group_1_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 4, 12, 0, 1));
        expectedCounts.replace("HVTN_204-Group_2_C1_Placebo", new CDSHelper.TimeAxisData("Group 3 Arm T3 Vaccine", 4, 12, 0, 1));

        studies = Locator.css("#study-axis > svg > g.study").findElements(getDriver());
        assertTrue("Expected 35 studies in the Time Axis, found" + studies.size() + ".", studies.size() == 35);
        validateVisitCounts(studies, expectedCounts);
        log("The counts are as expected.");

        log("Validate that the tool-tips are as expected when expanded.");

        expectedToolTipText.clear();
        expectedToolTipText.add("HVTN 063 - Day 182");
        expectedToolTipText.add("Group 2");
        expectedToolTipText.add("Follow-Up");
        cssPath = "#study-axis > svg > g.study:nth-child(21) > image.visit-tag[x^='3']";
        timeAxisToolTipsTester(cssPath, expectedToolTipText);

    }

    @Test
    public void verifyAntigenVariableSelector()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        log("Validate BAMA Antigen panel on yaxis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.BAMA);
        yaxis.pickVariable(CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE);
        yaxis.openAntigenPanel();

        for (int i = 0; i < CDSHelper.ANTIGENS_NAME.length; i++)
        {
            assertElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'content')]//label[contains(@class, 'x-form-cb-label')][text()='" + CDSHelper.ANTIGENS_NAME[i] + "']"));
        }

        yaxis.cancelSelection();

        log("Validate BAMA Antigen panel on xaxis.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.BAMA);
        xaxis.pickVariable(CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE);
        xaxis.openAntigenPanel();

        for (int i = 0; i < CDSHelper.ANTIGENS_NAME.length; i++)
        {
            assertElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'content')]//label[contains(@class, 'x-form-cb-label')][text()='" + CDSHelper.ANTIGENS_NAME[i] + "']"));
        }

        xaxis.cancelSelection();

        log("Validate Antigen panel does not show up on the color selector.");
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.BAMA);
        assertElementNotPresent("Detail seletor present in color selector, it should not be there.", Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'advanced')]//fieldset//div[contains(@class, 'field-label')][text()='Antigen name:']"));
        coloraxis.cancelSelection();

    }

    @Test
    public void verifyAntigenBoxPlot()
    {
        CDSHelper cds = new CDSHelper(this);
        String sharedVirus = CDSHelper.VIRUS_Q23;
        String uniqueVirus = CDSHelper.VIRUS_BAL26;
        String uniqueVirusId = cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_VIRUS_NAME, CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, uniqueVirus);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_LAB);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setVirusName(uniqueVirusId);
        yaxis.confirmSelection();

        waitForElement(plotTick.withText(CDSHelper.LABS[2]));
        assertElementPresent(plotBox, 1);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);

        DataRegionTable plotDataTable = new DataRegionTable("query", this);
        assertEquals(100, plotDataTable.getDataRowCount());
        assertEquals(100, getElementCount(Locator.tagContainingText("td", uniqueVirus)));
        assertTextNotPresent(sharedVirus, CDSHelper.LABS[1]);
        getDriver().close();
        switchToMainWindow();

        // Current sample data only has viruses that are matched to one lab.
        // Changing original logic of test to have x-axis look at virus type.

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_VIRUS_TYPE);
        xaxis.confirmSelection();

        waitForElement(plotTick.withText("Pseudovirus"));
        assertElementPresent(plotBox, 2);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(100, plotDataTable.getDataRowCount());
        assertEquals(100, getElementCount(Locator.tagContainingText("td", uniqueVirus)));
        getDriver().close();
        switchToMainWindow();

    }

    @Test
    public void verifyAntigenScatterPlot()
    {
        CDSHelper cds = new CDSHelper(this);
        String xVirus = CDSHelper.VIRUS_TV1;
        String yVirus = CDSHelper.VIRUS_SF162;
        String xVirusId = cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_VIRUS_NAME, CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_C, xVirus);
        String y1VirusId = cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_VIRUS_NAME, CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, yVirus);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setVirusName(xVirusId);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setVirusName(y1VirusId);
        yaxis.confirmSelection();

        waitForElement(plotTickLinear.withText("5000"));
        assertElementPresent(plotPoint, 1321);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        Ext4Helper.resetCssPrefix();
        DataRegionTable plotDataTable = new DataRegionTable("query", this);
        assertEquals(100, plotDataTable.getDataRowCount());
        getDriver().close();
        switchToMainWindow();
        Ext4Helper.setCssPrefix("x-");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setVirusName(cds.buildIdentifier(CDSHelper.COLUMN_ID_NEUTRAL_TIER, "all"));
        yaxis.confirmSelection();

        waitForElement(plotTickLinear.withText("40"));
        assertElementPresent(plotPoint, 60);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        Ext4Helper.resetCssPrefix();
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(60, plotDataTable.getDataRowCount());
        getDriver().close();
        switchToMainWindow();
    }

    @Test
    public void verifyBinnedPlot()
    {
        CDSHelper cds = new CDSHelper(this);

        // make choices that put us over the 'maxRows' parameter specified on the URL
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        // set the x-axis
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_DATA);
        xaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        xaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "all"));
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setCellType("All");
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // set the y-axis
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        yaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "All"));
        yaxis.confirmSelection();

        // Verify the binning message
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        waitForText("Heatmap on");

        cds.ensureNoFilter();
    }

    @Test
    public void verifyLogAndLinearScales()
    {
        String scaleValues, originalScale;
        int expectedCount, originalCount;
        CDSHelper cds = new CDSHelper(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Validate default scale is Log");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        scaleValues = "0.0001\n0.001\n0.01\n0.1\n1\n10";
        expectedCount = 1563;

        verifyLogAndLinearHelper(scaleValues, 0, expectedCount, true);

        log("Change scale to Linear and validate that values change.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14";
        expectedCount = 1690;

        verifyLogAndLinearHelper(scaleValues, 0, expectedCount, false);

        // Clear the plot.
        cds.clearFilters();

        log("Validate a plot with a values on both y and x axis.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();

        originalScale = "0.0001\n0.001\n0.01\n0.1\n1\n10\n0.0002\n0.002\n0.02\n0.2\n2";
        originalCount = 1563;
        verifyLogAndLinearHelper(originalScale, 1, originalCount, true);

        log("Change x-axis to be linear.");

        xaxis.openSelectorWindow();
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14\n0.0002\n0.002\n0.02\n0.2\n2";
        expectedCount = 1563;  // Is this right?
        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, true);

        log("Change y-axis to be linear.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5";
        expectedCount = 1690;
        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, false);

        log("Change x-axis back to log.");

        xaxis.openSelectorWindow();
        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
        xaxis.confirmSelection();

        scaleValues = "0.0001\n0.001\n0.01\n0.1\n1\n10\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5";
        expectedCount = 1690;
        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, true);

        log("Change y-axis back to log, all values should return to original.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();

        verifyLogAndLinearHelper(originalScale, 1, originalCount, true);

        // Clear the plot.
        cds.clearFilters();

        log("Validate log and linear with large scale values.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.confirmSelection();

        scaleValues = "1\n10\n100\n1000";
        expectedCount = 856;
        verifyLogAndLinearHelper(scaleValues, 0, expectedCount, true);

        log("Change y-axis to be linear.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        scaleValues = "0\n1000\n2000\n3000\n4000\n5000\n6000\n7000\n8000";
        expectedCount = 856;
        verifyLogAndLinearHelper(scaleValues, 0, expectedCount, false);

        // Clear the plot.
        cds.clearFilters();

        log("Validate with a categorical on x-axis.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_AGEGROUP);
        xaxis.confirmSelection();

        originalScale = "10-19\n20-29\n30-39\n40-49\n50-59\n1\n10\n100\n1000\n10000";
        originalCount = 428;
        verifyLogAndLinearHelper(originalScale, 0, originalCount, true);

        log("Add a filter and make sure that the log scale changes appropriately.");

        cds.openStatusInfoPane("Races");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        cds.selectInfoPaneItem(CDSHelper.RACE_ASIAN, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));

        originalScale = "20-29\n30-39\n40-49\n1\n10\n100";
        originalCount = 18;
        verifyLogAndLinearHelper(originalScale, 0, originalCount, true);

        // Clear the plot.
        cds.clearFilters();

    }

    private void verifyLogAndLinearHelper(String scaleValues, int svgIndex, int expectedCount, boolean msgVisable)
    {
        final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subjects')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";
        final String XPATH_PLOT_MOD_MSG = "//div[contains(@class, 'plotmodeon')][text()='Log Scale']";
        String tempStr, styleValue;
        int subjectCount;

        assertSVG(scaleValues, svgIndex);

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCount = Integer.parseInt(tempStr.replaceAll(",", ""));
        assertEquals("Subject count not as expected.", expectedCount, subjectCount);

        assertElementPresent("Could not find 'Log Scale' message control.", Locator.xpath(XPATH_PLOT_MOD_MSG), 1);

        styleValue = getAttribute(Locator.xpath(XPATH_PLOT_MOD_MSG), "style");

        if (msgVisable)
        {
            assertFalse("'Log Scale' message not visible at top of page.", styleValue.contains("display: none;"));
        }
        else
        {
            assertTrue("'Log Scale' message is visible at top of page, and it should not be.", styleValue.contains("display: none;"));
        }

    }

    @Test
    public void verifyDensePlotBrushing()
    {
        // This test will only validate that a "Filter" button shows up, but will not validate that the
        // range of the filter is as expected.

        int pointCount, pointToClick;
        CDSHelper cds = new CDSHelper(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        log("Brush a single axis plot.");
        // set the y-axis
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        yaxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(1) a.point"))/4;
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1) a.point:nth-of-type(" + pointToClick + ")", 50, -350, true);

        // Clear the filter.
        cds.clearFilter(1);

        log("Brush a scattered plot.");
        // set the x-axis
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(2) a.point"))/4;
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(2) a.point:nth-of-type(" + pointToClick + ")", 250, -250, true);

        // Clear the plot.
        cds.clearFilters();
        sleep(500);
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        log("Brush a binned plot.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_DATA);
        xaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        xaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "all"));
        xaxis.setCellType("All");
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // set the y-axis
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        yaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "All"));
        yaxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square"))/2;
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square:nth-of-type(" + pointToClick + ")", -50, -100, true);

        cds.clearFilters();
        sleep(500);
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        log("Brush binned plot single axis.");
        // set the y-axis
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square"))/2;
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square:nth-of-type(" + pointToClick + ")", 0, -50, true);

        // Clear the filter.
        cds.clearFilter(1);

        log("Brush binned with categorical.");

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_COUNTRY);
        xaxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square"))/3;
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square:nth-of-type(" + pointToClick + ")", 0, -50, true);

        // Clear the filter.
        cds.clearFilters();
        sleep(500);

        log("Brush categorical with color.");
        // set the y-axis
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_ARM);
        xaxis.confirmSelection();

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_RACE);
        coloraxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        int boxGroup;
        boxGroup = getElementCount(Locator.css("div:not(.thumbnail) > svg g.dataspace-box-group"))/2;
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg g.dataspace-box-group:nth-of-type(" + boxGroup + ") a.point"))/4;
        brushPlot("div:not(.thumbnail) > svg g.dataspace-box-group:nth-of-type(" + boxGroup + ") a.point:nth-of-type(" + pointToClick + ")", 0, -50, true);

        // Clear the filter.
        cds.clearFilters();

    }

    @Test
    public void verifyGutterPlotBrushing()
    {
        // This test will only validate that a "Filter" button shows up, but will not validate that the
        // range of the filter is as expected.

        int pointCount, pointToClick;
        CDSHelper cds = new CDSHelper(this);
        int subjectCountBefore;
        String tempStr, cssPathBrushWindow;

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        log("Test plot with both gutter plots and data in main plot as well.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();

        // Adding color just to make it more interesting.
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_COUNTRY);
        coloraxis.confirmSelection();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(true, true, true, subjectCountBefore);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

        log("Test plot with x gutter only and data in main plot as well.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_AGE);
        xaxis.confirmSelection();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(true, false, true, subjectCountBefore);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

        log("Test plot with y gutter only and data in main plot as well.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        yaxis.pickVariable(CDSHelper.DEMO_AGE);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(false, true, true, subjectCountBefore);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

        log("Test plot with x & y gutter only and no data in main plot as well.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.BAMA);
        xaxis.pickVariable(CDSHelper.BAMA_MAGNITUDE_DELTA);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();
        sleep(500);
        _ext4Helper.waitForMaskToDisappear();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(true, true, false, subjectCountBefore);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

    }

    private void gutterPlotBrushingTestHelper(boolean hasXGutter, boolean hasYGutter, boolean hasMainPlotDataPoints, int subjectCountBefore)
    {
        WebElement gutterBrushWindow;
        String dataPointType;
        int heightWidth, pointToClick;
        int yGutterIndex, xGutterIndex, mainPlotIndex;
        String tempStr, cssPathBrushWindow;

        if(hasYGutter)
        {
            yGutterIndex = 1;
            xGutterIndex = 3;
            mainPlotIndex = 2;

            manipulateGutterPlotBrushing(yGutterIndex, mainPlotIndex, subjectCountBefore, false);

        }
        else
        {
            yGutterIndex = 0;
            xGutterIndex = 2;
            mainPlotIndex = 1;
        }

        if (hasXGutter)
        {
            manipulateGutterPlotBrushing(xGutterIndex, mainPlotIndex, subjectCountBefore, true);
        }

        log("Brush in main plot area and verify that we don't get a brush window in the gutters.");

        if(hasMainPlotDataPoints)
        {

            // See what kind of data points we have in the main plot.
            if (getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") a.point")) != 0)
            {
                dataPointType = "a.point";
            }
            else
            {
                dataPointType = "a.vis-bin-square";
            }

            // Try to protect from getting an index out of range error. Add one just to make sure that if there is a
            // very small number of points we don't end up with 0 as pointToClick;
            pointToClick = (getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") " + dataPointType)) / 4) + 1;
            brushPlot("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") " + dataPointType + ":nth-of-type(" + pointToClick + ")", 250, -250, false);

        }
        else
        {
            brushPlot("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ")", 250, -250, false);
        }

        if (hasYGutter)
        {
            log("Verify no brush in 'undefined x value' gutter.");
            cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + yGutterIndex + ") > g.brush > rect.extent";
            gutterBrushWindow = getElement(Locator.css(cssPathBrushWindow));
            tempStr = gutterBrushWindow.getAttribute("height");
            heightWidth = Integer.parseInt(tempStr);
            assertTrue("'undefined x value' gutter has a brush window and it should not.", heightWidth == 0);
        }

        if(hasXGutter)
        {
            log("Verify no brush in 'undefined y value' gutter.");
            cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + xGutterIndex + ") > g.brush > rect.extent";
            gutterBrushWindow = getElement(Locator.css(cssPathBrushWindow));
            tempStr = gutterBrushWindow.getAttribute("width");
            heightWidth = Integer.parseInt(tempStr);
            assertTrue("'undefined y value' gutter has a brush window and it should not.", heightWidth == 0);
        }

    }

    private void manipulateGutterPlotBrushing(int gutterIndex, int mainPlotIndex, int subjectCountBefore, boolean isXGutter)
    {
        CDSHelper cds = new CDSHelper(this);
        String cssPathBrushWindow;

        if(isXGutter)
        {
            brushPlot("div:not(.thumbnail) > svg:nth-of-type(" + gutterIndex + ") > g:nth-child(4) > g.grid-line > path:nth-of-type(2)", -50, 0, false);
        }
        else
        {
            brushPlot("div:not(.thumbnail) > svg:nth-of-type(" + gutterIndex + ") > g:nth-child(5) > g.grid-line > path:nth-of-type(2)", 0, -50, false);
        }

        log("Move the brush window in the 'undefined y value' gutter.");

        cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + gutterIndex + ") > g.brush > rect.extent";
        if(isXGutter)
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), -100, 0);
        }
        else
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 0, -100);
        }


        sleep(500);

        log("Move the brush window in the main plot.");

        cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") > g.brush > rect.extent";
        if(isXGutter)
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 100, 0);
        }
        else
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 0, 100);
        }

        sleep(500);

        log("Change the brush window size using the 'handles'.");

        cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + gutterIndex + ") > g.brush > g:nth-of-type(1)";
        if(isXGutter)
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), -100, 0);
        }
        else
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 0, -100);
        }

        sleep(500);

        cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + gutterIndex + ") > g.brush > g:nth-of-type(2)";
        if(isXGutter)
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), -100, 0);
        }
        else
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 0, -100);
        }

        log("Move the brush window back to starting point.");

        cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + gutterIndex + ") > g.brush > rect.extent";
        if(isXGutter)
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 100, 0);
        }
        else
        {
            dragAndDrop(Locator.css(cssPathBrushWindow), 0, 100);
        }

        log("Apply the brushing as a filter.");
        applyBrushAsFilter(subjectCountBefore);

        // A filter created in one gutter should exclude all points in the other gutter (and make that gutter go away).
        if(isXGutter)
        {
            assertFalse("There is an y gutter and there should not be.", hasYGutter());
        }
        else
        {
            assertFalse("There is an x gutter and there should not be.", hasXGutter());
        }

        cds.clearFilter(1);
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

    }

    private void brushPlot(String cssPathToPoint, int xOffSet, int yOffSet, boolean applyFilter)
    {
        int subjectCountBefore;
        String tempStr;

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        dragAndDrop(Locator.css(cssPathToPoint), xOffSet, yOffSet);
        sleep(250);

        assertElementVisible(Locator.linkContainingText("Filter"));

        if(applyFilter)
        {
            applyBrushAsFilter(subjectCountBefore);
        }

    }

    private void applyBrushAsFilter(int subjectCountBefore)
    {
        int subjectCountAfter;
        String tempStr;

        assertElementVisible(Locator.linkContainingText("Filter"));

        click(Locator.linkContainingText("Filter"));
        sleep(1000); // Wait briefly for the mask to show up.
        _ext4Helper.waitForMaskToDisappear();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountAfter = Integer.parseInt(tempStr.replaceAll(",", ""));

        assertTrue("The subject count after applying filter was not less than or equal to before. Before: " + subjectCountBefore + " After: " + subjectCountAfter, subjectCountBefore >= subjectCountAfter);
        sleep(1000); // Wait briefly for the mask to show up.
        _ext4Helper.waitForMaskToDisappear();

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

    private void selectXAxes(boolean isShift, String... axes)
    {
            if (axes == null || axes.length == 0)
                throw new IllegalArgumentException("Please specify axes to select.");

            Keys multiSelectKey;
            if (isShift)
                multiSelectKey = Keys.SHIFT;
            else if (SystemUtils.IS_OS_MAC)
                multiSelectKey = Keys.COMMAND;
            else
                multiSelectKey = Keys.CONTROL;

            click(Locators.plotTick.withText(axes[0]));

            if (axes.length > 1)
            {
                Actions builder = new Actions(getDriver());
                builder.keyDown(multiSelectKey).build().perform();

                for (int i = 1; i < axes.length; i++)
                {
                    click(Locators.plotTick.withText(axes[i]));
                }
                builder.keyUp(multiSelectKey).build().perform();
            }
    }

    private int getPointCountByColor(String colorCode)
    {
        List<WebElement> points = Locator.css("svg g a.point path").findElements(getDriver());
        int ret = 0;
        for (WebElement point : points)
        {
            if (point.getAttribute("fill").equals(colorCode))
            {
                ret++;
            }
        }
        return ret;
    }

    private int getPointCount()
    {
        return Locator.css("svg g a.point path").findElements(getDriver()).size();
    }

    private void waitForPointCount(int count, int msTimeout)
    {
        final Integer pointCount = count;
        long secTimeout = msTimeout / 1000;
        secTimeout = secTimeout > 0 ? secTimeout : 1;
        WebDriverWait wait = new WebDriverWait(getDriver(), secTimeout);
        try
        {
            wait.until(new ExpectedCondition<Boolean>()
            {
                @Override
                public Boolean apply(WebDriver d)
                {
                    return pointCount.equals(getPointCount());
                }
            });
        }
        catch (TimeoutException ex)
        {
            fail("Timeout waiting for point count [" + secTimeout + "sec]: " + count);
        }
    }

    private boolean hasYGutter()
    {
        return hasGutter("svg g text.yGutter-label");
    }

    private boolean hasXGutter()
    {
        return hasGutter("svg g text.xGutter-label");
    }

    private boolean hasStudyAxis()
    {
        return hasGutter("#study-axis svg");
    }

    private boolean hasGutter(String cssPath){

        boolean hasElement;

        try
        {
            waitForElement(Locator.css(cssPath));
            if (Locator.css(cssPath).findElement(getDriver()).isDisplayed())
            {
                hasElement = true;
            }
            else
            {
                hasElement = false;
            }
        }
        catch(org.openqa.selenium.NoSuchElementException ex){
            hasElement = false;
        }

        return hasElement;

    }

    private void validateVisitCounts(List<WebElement> studies, Map<String, CDSHelper.TimeAxisData> expectedCounts)
    {

        for (WebElement study : studies)
        {
            CDSHelper.TimeAxisData tad = expectedCounts.get(study.findElement(Locator.css("text.study-label").toBy()).getAttribute("test-data-value"));

            // If tad is null it means we don't want to check the totals for the given study (or a locator is messed up).
            if (tad != null)
            {

                int nonvacCount = 0, vacCount = 0, chalCount = 0, preCount = 0;
                List<WebElement> visits;
                WebElement preEnrollment;

                log("Study Name: '" + study.getText() + "' ID: " + study.findElement(Locator.css("text.study-label").toBy()).getAttribute("test-data-value"));
                visits = study.findElements(Locator.css("image.visit-tag").toBy());
                log("Number of visits: " + visits.size());

                // Had hoped to get a collection directly, but had trouble getting css to see the href value.
                // So went with this approach for now. May revisit later.
                for (int i=0; i < visits.size(); i++)
                {
                    if (visits.get(i).getAttribute("href").contains("/nonvaccination_normal.svg"))
                    {
                        nonvacCount++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/vaccination_normal.svg"))
                    {
                        vacCount++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/challenge_normal.svg"))
                    {
                        chalCount++;
                    }
                }

                try
                {
                    preEnrollment = study.findElement(Locator.css("rect.preenrollment").toBy());
                    if (preEnrollment.getAttribute("width").equals("0"))
                    {
                        preCount = 0;
                    }
                    else
                    {
                        preCount = 1;
                    }
                }
                catch(org.openqa.selenium.NoSuchElementException nosee)
                {
                    // When expanded the study rows will not have a pre-enrollment element.
                    preCount = 0;
                }

                log("Non-Vaccination Count: " + nonvacCount);
                log("Vaccination Count: " + vacCount);
                log("Challenge Count: " + chalCount);
                log("Preenrollment Count: " + preCount);

                assertTrue("Vaccination count not as expected. Expected: " + tad.vaccinationCount + " found: " + vacCount, tad.vaccinationCount == vacCount);
                assertTrue("Nonvaccination count not as expected. Expected: " + tad.nonvaccinationCount + " found: " + nonvacCount, tad.nonvaccinationCount == nonvacCount);
                assertTrue("Challenge count not as expected. Expected: " + tad.challengeCount + " found: " + chalCount, tad.challengeCount == chalCount);
                assertTrue("Preenrollment count not as expected. Expected: " + tad.preenrollmentCount + " found: " + preCount, tad.preenrollmentCount == preCount);

                log("Visit counts as expected.");

            }
            else
            {
                log("Not validating counts for " + study.getText());
            }

        }
    }

    private void timeAxisToolTipsTester(String cssVisit, List<String> expectedToolTipText)
    {
        String actualToolTipText, condensedActual, condensedExpected;

        scrollIntoView(Locator.css(cssVisit));
        mouseOver(Locator.css(cssVisit));
        sleep(CDSHelper.CDS_WAIT_TOOLTIP);

        assertTrue("Tool-tip was not present.", isElementVisible(Locator.xpath("//div[contains(@class, 'hopscotch-bubble')]")));
        actualToolTipText = getText(Locator.xpath("//div[contains(@class, 'hopscotch-bubble')]"));

        // Modify the strings to make the comparisons less susceptible to spaces, tabs, /n, etc... and capitalization.
        condensedActual = actualToolTipText.toLowerCase().replaceAll("\\s+", "");

        // Order of text in tool-tip may change from deployment to deployment. So look only from specific text as oppose to looking for an exact match.
        for (String strTemp : expectedToolTipText)
        {
            condensedExpected = strTemp.toLowerCase().replaceAll("\\s+", "");
            assertTrue("Item not found in tool tip. Expected: '" + strTemp + "' (" + condensedExpected + "), actual: '" + actualToolTipText + "' (" + condensedActual + ").", condensedActual.contains(condensedExpected));
        }

    }

    private void subjectCountsHelper(Map<String, String> sourcesSubjectCounts, Map<String, String> antigenCounts,
                                     Map<String, String> peptidePoolCounts, Map<String, String> proteinCounts,
                                     Map<String, String> proteinPanelCounts, Map<String, String> virusCounts)
    {

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        log("Validating the x-axis sources.");

        xaxis.openSelectorWindow();


        if (sourcesSubjectCounts != null)
        {
//        Locator.XPathLocator source;
            for (Map.Entry<String, String> entry : sourcesSubjectCounts.entrySet())
            {
                // TODO Would rather test with the commented code (more complete test). However there is an issue if a text value has a &nbsp; the xpath below fails to work, although it works correct in chrome debugger.
//            source = xaxis.xpathWindow().append("//div[contains(@class, 'content-label')][translate(text(), '\\xA0', ' ')='" + entry.getKey() + "']");
//            assertTrue(isElementVisible(source));
//            assertTrue(isElementVisible(source.append("/./following-sibling::div[text()='" + entry.getValue() + "']")));
                assertTrue(isElementVisible(xaxis.window().append(" div.content-label").withText(entry.getKey())));
                assertTrue(isElementVisible(xaxis.window().append(" div.content-count").withText(entry.getValue()))); // TODO Bad test. It will pass if there is any tag wtih this count. Need to revisit.
            }
        }

        if (antigenCounts != null)
        {
            log("Validating subject counts in the x-axis BAMA - Antigen.");
            xaxis.pickSource(CDSHelper.BAMA);
            sleep(CDSHelper.CDS_WAIT_ANIMATION);
            xaxis.setIsotype("IgG");
            xaxis.validateAntigenSubjectCount(antigenCounts, false);
            xaxis.backToSource();
        }

        if (peptidePoolCounts != null)
        {
            log("Validating subject counts in the x-axis ELISPOT - Peptide Pool.");
            xaxis.pickSource(CDSHelper.ELISPOT);
            xaxis.validatePeptidePoolSubjectCount(peptidePoolCounts, false);
            xaxis.backToSource();
        }

        if (proteinPanelCounts != null)
        {
            log("Validating subject counts in the x-axis ICS - Protein Panel.");
            xaxis.pickSource(CDSHelper.ICS);
            xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
            xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
            xaxis.backToSource();
        }

        if (proteinCounts != null)
        {
            log("Validating subject counts in the x-axis ICS - Protein.");
            xaxis.pickSource(CDSHelper.ICS);
            xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
            xaxis.validateProteinSubjectCount(proteinCounts, false);
            xaxis.backToSource();
        }

        if (virusCounts != null)
        {
            log("Validating subject counts in the x-axis NAB - Virus.");
            xaxis.pickSource(CDSHelper.NAB);
            xaxis.validateVirusSubjectCount(virusCounts, true);
        }
        else
        {
            xaxis.cancelSelection();
        }

        log("Validating the y-axis source.");
        yaxis.openSelectorWindow();

        if (sourcesSubjectCounts != null)
        {
            for (Map.Entry<String, String> entry : sourcesSubjectCounts.entrySet())
            {
                if (entry.getKey().compareTo(CDSHelper.STUDY_TREATMENT_VARS) != 0 && entry.getKey().compareTo(CDSHelper.TIME_POINTS) != 0)
                {
//            source = xaxis.xpathWindow().append("//div[contains(@class, 'content-label')][translate(text(), '\\xA0', ' ')='" + entry.getKey() + "']");
//            assertTrue(isElementVisible(source));
//            assertTrue(isElementVisible(source.append("/./following-sibling::div[text()='" + entry.getValue() + "']")));
                    assertTrue(isElementVisible(yaxis.window().append(" div.content-label").withText(entry.getKey())));
                    assertTrue(isElementVisible(yaxis.window().append(" div.content-count").withText(entry.getValue())));
                }
            }
        }

        if (antigenCounts != null)
        {
            log("Validating subject counts in the y-axis BAMA - Antigen.");
            yaxis.pickSource(CDSHelper.BAMA);
            yaxis.setIsotype("IgG");
            yaxis.validateAntigenSubjectCount(antigenCounts, false);
            yaxis.backToSource();
        }

        if (peptidePoolCounts != null)
        {
            log("Validating subject counts in the y-axis ELISPOT - Peptide Pool.");
            yaxis.pickSource(CDSHelper.ELISPOT);
            yaxis.validatePeptidePoolSubjectCount(peptidePoolCounts, false);
            yaxis.backToSource();
        }

        if (proteinCounts != null)
        {
            log("Validating subject counts in the y-axis ICS - Protein.");
            yaxis.pickSource(CDSHelper.ICS);
            yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
            yaxis.validateProteinSubjectCount(proteinCounts, false);
            yaxis.backToSource();
        }

        if (proteinPanelCounts != null)
        {
            log("Validating subject counts in the y-axis ICS - Protein Panel.");
            yaxis.pickSource(CDSHelper.ICS);
            yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
            yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
            yaxis.backToSource();
        }

        if (virusCounts != null)
        {
            log("Validating subject counts in the y-axis NAB - Virus.");
            yaxis.pickSource(CDSHelper.NAB);
            yaxis.validateVirusSubjectCount(virusCounts, true);
        }
        else
        {
            yaxis.cancelSelection();
        }

        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        if (sourcesSubjectCounts != null)
        {

            log("Validating the color-axis source.");
            coloraxis.openSelectorWindow();

            for (Map.Entry<String, String> entry : sourcesSubjectCounts.entrySet())
            {
                if (entry.getKey().compareTo(CDSHelper.TIME_POINTS) != 0)
                {
//            source = xaxis.xpathWindow().append("//div[contains(@class, 'content-label')][translate(text(), '\\xA0', ' ')='" + entry.getKey() + "']");
//            assertTrue(isElementVisible(source));
//            assertTrue(isElementVisible(source.append("/./following-sibling::div[text()='" + entry.getValue() + "']")));
                    assertTrue(isElementVisible(coloraxis.window().append(" div.content-label").withText(entry.getKey())));
                    assertTrue(isElementVisible(coloraxis.window().append(" div.content-count").withText(entry.getValue())));
                }
            }

            coloraxis.cancelSelection();
        }

    }

    @LogMethod
    private void createParticipantGroups()
    {
        Ext4Helper.resetCssPrefix();
        beginAt("project/" + getProjectName() + "/begin.view?");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP1, "Subject", "039-016", "039-014");  // TODO Test data dependent.
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP2, "Subject", "039-044", "039-042");  // TODO Test data dependent.
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3, "Subject", "039-059", "039-060");  // TODO Test data dependent.
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3_COPY, "Subject", "039-059", "039-060");  // TODO Test data dependent.
    }

    @LogMethod
    private void deleteParticipantGroups()
    {
        beginAt("project/" + getProjectName() + "/begin.view?");
        _studyHelper.deleteCustomParticipantGroup(PGROUP1, "Subject");
        _studyHelper.deleteCustomParticipantGroup(PGROUP2, "Subject");
        _studyHelper.deleteCustomParticipantGroup(PGROUP3, "Subject");
        _studyHelper.deleteCustomParticipantGroup(PGROUP3_COPY, "Subject");
    }

    public static class Locators
    {
        public static Locator plotSelection = Locator.css(".selectionfilter .plot-selection");
        public static Locator plotSelectionFilter = Locator.css(".activefilter .plot-selection");
        public static Locator plotSelectionCloseBtn = Locator.css("div.plot-selection div.closeitem");
        public static Locator plotBox = Locator.css("svg a.dataspace-box-plot");
        public static Locator plotTickLinear = Locator.css("g.tick-text > g > text");
        public static Locator plotTick = Locator.css("g.tick-text > a > text");
        public static Locator plotPoint = Locator.css("svg a.point");
        public static Locator filterDataButton = Locator.xpath("//span[text()='Filter']");
        public static Locator removeButton = Locator.xpath("//span[text()='Remove']");
    }
}
