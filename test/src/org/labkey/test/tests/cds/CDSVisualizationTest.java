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

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.SortDirection;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 90)
public class CDSVisualizationTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSPlot cdsPlot = new CDSPlot(this);
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
        getDriver().manage().window().setSize(CDSHelper.idealWindowSize);
    }

    @BeforeClass
    public static void initTest() throws Exception
    {
        //TODO add back (and improve already exists test) when verifySavedGroupPlot is implemented.
//        CDSVisualizationTest cvt = (CDSVisualizationTest)getCurrentTest();
//        cvt.createParticipantGroups();
    }

    @AfterClass
    public static void afterClassCleanUp()
    {
        //TODO add back (and improve already exists test) when verifySavedGroupPlot is implemented.
//        CDSVisualizationTest cvt = (CDSVisualizationTest)getCurrentTest();
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

    @Override
    public Timeout testTimeout()
    {
        return new Timeout(60, TimeUnit.MINUTES);
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
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ELISPOT);
        xaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_RAW);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        assertFalse("For BAMA Magnitude vs NAB Lab x-axis gutter plot was present it should not have been.", cdsPlot.hasXGutter());
        assertTrue("For BAMA Magnitude vs NAB Lab y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0 );

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

        assertTrue("For NAB IC80 vs ICS Magnitude x-axis gutter plot was not present.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );
        assertFalse("For NAB IC80 vs ICS Magnitude y-axis gutter plot was present and it should not have been.", cdsPlot.hasYGutter());

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

        // Put this in here to work around issue with FireFox scrollIntoView behaving differently than Chrome.
        refresh();
        _ext4Helper.waitForMaskToDisappear();

        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();

        assertTrue("For ELISPOT Background vs ICS Visit x-axis gutter plot was not present.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );
        assertTrue("For ELISPOT Background vs ICS Visit y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0 );

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

        assertTrue("For ELISPOT Background vs Time Visit Days a study axis was not present.", cdsPlot.hasStudyAxis());
        assertFalse("For ELISPOT Background vs Time Visit Days x-axis gutter plot was present, it should not be.", cdsPlot.hasXGutter());
        assertFalse("For ELISPOT Background vs Time Visit Days y-axis gutter plot was present, it should not be.", cdsPlot.hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));
    }

    @Test
    public void verifyLogGutterPlot()
    {

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        CDSHelper cds = new CDSHelper(this);
        String tempStr, expectedTickText;
        int subjectCountBefore, subjectCountAfter;

        log("Generate a plot that has all the gutters.");
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

        log("Validate that the Log Gutters are there.");
        assertTrue("Did not find the Log Gutter on the bottom of the plot.", cdsPlot.hasXLogGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );
        assertTrue("Did not find the Log Gutter on the left hand side of the plot.", cdsPlot.hasYLogGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0 );

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        log("Brush only in the log gutter on the x-axis.");
        cds.dragAndDropFromElement(Locator.css("div:not(.thumbnail) > svg:nth-of-type(2) > g:nth-of-type(3) > g:nth-of-type(1)"), 100, 100);
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));
        sleep(1000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        log("Validate that the filter has been applied and there are only x gutters.");
        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountAfter = Integer.parseInt(tempStr.replaceAll(",", ""));

        assertTrue("After brushing subject count was not less than before. Count before brushing: " + subjectCountBefore + " Count after brush: " + subjectCountAfter, subjectCountBefore > subjectCountAfter);
        assertTrue("The y-axis gutter plot did not go away, it should have.", !cdsPlot.hasYGutter());
        assertTrue("The y-axis log gutter did not go away, it should have.", !cdsPlot.hasYLogGutter());
        assertTrue("There is no x-axis gutter, there should be.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );
        assertTrue("There is no x-axis log gutter, there should be.", cdsPlot.hasXLogGutter());
        // Removed the check of the plot tick text. Because these test do brushing there is too much randomness to guarantee that the text will alwyas be the same.

        cds.clearFilter(1);
        sleep(1000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        log("Now brush only in the log gutter on the y-axis.");
        cds.dragAndDropFromElement(Locator.css("div:not(.thumbnail) > svg:nth-of-type(2) > g:nth-of-type(4) > g:nth-of-type(1)"), -100, 100);
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));
        sleep(1000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        log("Validate that the filter has been applied and there are only y gutters.");
        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountAfter = Integer.parseInt(tempStr.replaceAll(",", ""));

        assertTrue("After brushing subject count was not less than before. Count before brushing: " + subjectCountBefore + " Count after brush: " + subjectCountAfter, subjectCountBefore > subjectCountAfter);
        assertTrue("The x-axis gutter plot did not go away, it should have.", !cdsPlot.hasXGutter());
        assertTrue("The x-axis log gutter did not go away, it should have.", !cdsPlot.hasXLogGutter());
        assertTrue("There is no y-axis gutter, there should be.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0 );
        assertTrue("There is no y-axis log gutter, there should be.", cdsPlot.hasYLogGutter());

        cds.clearFilter(1);
        sleep(1000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        log("Set a color filter and make sure that there are no errors.");
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_COUNTRY);
        coloraxis.confirmSelection();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

        log("Brush just the main plot and validate that all of the gutters disappear.");
        cds.dragAndDropFromElement(Locator.css("div:not(.thumbnail) > svg:nth-of-type(2)"), 100, 100);
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));
        sleep(1000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        log("Validate that the filter has been applied and there are no gutter elements.");
        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountAfter = Integer.parseInt(tempStr.replaceAll(",", ""));

        assertTrue("After brushing subject count was not less than before. Count before brushing: " + subjectCountBefore + " Count after brush: " + subjectCountAfter, subjectCountBefore > subjectCountAfter);
        assertTrue("The y-axis gutter plot did not go away, it should have.", !cdsPlot.hasYGutter());
        assertTrue("The y-axis log gutter did not go away, it should have.", !cdsPlot.hasYLogGutter());
        assertTrue("The x-axis gutter plot did not go away, it should have.", !cdsPlot.hasXGutter());
        assertTrue("The x-axis log gutter did not go away, it should have.", !cdsPlot.hasXLogGutter());

        cds.clearFilter(1);
        sleep(1000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

    }

    @Test
    public void verifyScatterPlot()
    {
        //getText(Locator.css("svg")) on Chrome

        final String ELISPOT_DATA_PROV = "0\n500\n1000\n1500\n2000\n2500\n3000\n3500\n0\n5000\n10000\n15000\n20000\n25000\n30000\n35000\n40000\n45000";
        final String ICS_MAGNITUDE = "0\n1\n2\n3\n4\n5\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5";
        final String NAB_ID50 = "1\n10\n1\n10\n100\n1000";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ELISPOT);
        xaxis.pickVariable(CDSHelper.ELISPOT_DATA_PROV);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        if (CDSHelper.validateCounts)
        {
            cds.assertPlotTickText(ELISPOT_DATA_PROV);
        }

        yaxis.openSelectorWindow();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_TITERID50);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        assertTrue("For ELISPOT vs ICS x-axis gutter plot was not present.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );
        assertTrue("For ELISPOT vs ICS y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0 );

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        if (CDSHelper.validateCounts)
        {
            cds.assertPlotTickText(ICS_MAGNITUDE);
        }

        // Test log scales
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();

        assertTrue("For NAB vs ICS x-axis gutter plot was not present.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );
        assertTrue("For NAB vs ICS y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0 );

        // Test disabled for now as a result of side effect of log transformation story. will re-enable when
        // filter refinement is done and compound filter is used to drop <=0 data but retain null.
//        xaxis.openSelectorWindow();
//        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
//        xaxis.pickVariable(CDSHelper.DEMO_AGE);
//        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
//        xaxis.confirmSelection();
//
//        assertTrue("For NAB vs Demographics x-axis gutter plot was not present.", cdsPlot.hasXGutter());
//        assertFalse("For NAB vs Demographics y-axis gutter plot was present and it should not be.", cdsPlot.hasYGutter());
//
//        if (CDSHelper.validateCounts)
//        {
//            cds.assertPlotTickText(NAB_IC50);
//        }
    }

    @Test
    public void verifyStudyAndTreatmentVars()
    {
        String expectedXYValues;
        int actualTickCount;
        Pattern pattern;
        final String cssXaxisTickText = "div.plot > svg > g.axis > g.tick-text > a > rect.xaxis-tick-rect";

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
        expectedXYValues = "RED 4\nRED 5\nRED 6\nZAP 102\nZAP 105\nZAP 106\nZAP 113\nZAP 115\nZAP 116\nZAP 117\nZAP 118\nZAP 124\nZAP 134\nZAP 136\n0\n2\n4\n6\n8\n10\n12\n14";

        log("Validating Study Name");
        cds.assertPlotTickText(expectedXYValues);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_SUMM);
        xaxis.confirmSelection();
        actualTickCount = Locator.css(cssXaxisTickText).findElements(getDriver()).size();

        log("Validating Treatment Summary");
        assertEquals("Unexpected number of tick marks on the x-axis.", 91, actualTickCount);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_SUBJ_ENR);
        xaxis.confirmSelection();
        pattern = Pattern.compile(".*02468101214{1}");

        log("Validating Date Subject Enrolled");
        cds.assertPlotTickText(pattern);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_FUP_COMP);
        xaxis.confirmSelection();

        // Special casing this test. for what ever reason sometimes it will have 3/13/2011 other times it will be 3/12/2011.
        // Because this value appears to be calculated I will use regular expression to validate.
        log("Validating Followup Complete");
        pattern = Pattern.compile("4/2[0-9]/20156/2[0-9]/20158/1[0-9]/201510/1[0-9]/201512/1[0-9]/201502468101214");
        cds.assertPlotTickText(pattern);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_PUB);
        xaxis.confirmSelection();

        // Another special case scenario.
        log("Validating Date Made Public");
        pattern = Pattern.compile("3/1[0-9]/20117/[1-9]/201110/3[0-1]/20112/2[0-9]/20126/1[0-9]/201210/1[0-9]/20122/[1-9]/20135/3[0-1]/201302468101214");
        cds.assertPlotTickText(pattern);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_DATE_START);
        xaxis.confirmSelection();

        // Another special case scenario.
        log("Validating Start Date");
        pattern = Pattern.compile("11/[1-9]/20046/1[0-9]/20061/1[0-9]/20088/1[0-9]/20093/1[0-9]/201102468101214");
        cds.assertPlotTickText(pattern);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_NETWORK);
        xaxis.confirmSelection();
        expectedXYValues = "ROGER\nZED\n0\n2\n4\n6\n8\n10\n12\n14";

        log("Validating Network");
        cds.assertPlotTickText(expectedXYValues);

        expectedXYValues = "s1\ns2\ns3\ns4\ns5\nundefined\n0\n2\n4\n6\n8\n10\n12\n14";
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_STRATEGY);
        xaxis.confirmSelection();
        log("Validating Strategy");
        cds.assertPlotTickText(expectedXYValues);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_PROD_CLASS);
        xaxis.confirmSelection();

        // There are too many labels on the xaxis to validate all, so we will just validate the count.
        log("Validating Product Class");
        actualTickCount = Locator.css(cssXaxisTickText).findElements(getDriver()).size();
        assertEquals("Unexpected number of tick marks on the x-axis.", 85, actualTickCount);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_PROD_COMB);
        xaxis.confirmSelection();

        // There are too many labels on the xaxis to validate all, so we will just validate the count.
        log("Validating Product Class Combination");
        actualTickCount = Locator.css(cssXaxisTickText).findElements(getDriver()).size();
        assertEquals("Unexpected number of tick marks on the x-axis.", 83, actualTickCount);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_STUDY_TYPE);
        xaxis.confirmSelection();
        expectedXYValues = "Phase I\nPhase II\nPhase IIB\nundefined\n0\n2\n4\n6\n8\n10\n12\n14";

        log("Validating Study Type");
        cds.assertPlotTickText(expectedXYValues);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_ARM);
        xaxis.confirmSelection();

        // There are too many labels on the xaxis to validate all, so we will just validate the count.
        log("Validating Treatment Arm");
        actualTickCount = Locator.css(cssXaxisTickText).findElements(getDriver()).size();
        assertEquals("Unexpected number of tick marks on the x-axis." + actualTickCount, 30, actualTickCount);


        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_TREAT_CODED);
        xaxis.confirmSelection();

        log("Validating Treatment Arm Coded Label");
        actualTickCount = Locator.css(cssXaxisTickText).findElements(getDriver()).size();
        assertEquals("Unexpected number of tick marks on the x-axis." + actualTickCount, 89, actualTickCount);

        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.DEMO_VACC_PLAC);
        xaxis.confirmSelection();
        expectedXYValues = "Placebo\nVaccine\nundefined\n0\n2\n4\n6\n8\n10\n12\n14";

        log("Validating Vaccine or Placebo");
        cds.assertPlotTickText(expectedXYValues);

    }

    @Test
    public void verifyColorStudyAndTreatmentVars()
    {
        int actualTickCount;
        String cssColorLegend = "#colorvarselector-innerCt  svg > path.legend-point";

        sleep(1500);
        _ext4Helper.waitForMaskToDisappear(60000);

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_BLACK);
        _asserts.assertFilterStatusCounts(829, 48, 1, 1, 155);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        coloraxis.pickVariable(CDSHelper.DEMO_STUDY_NAME);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Study Names in the color axis.", 12, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_TREAT_SUMM);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Treatment Summaries in the color axis.", 44, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_NETWORK);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Networks in the color axis.", 2, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_PROD_COMB);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Product Class Combinations in the color axis.", 41, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_PROD_CLASS);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Product Classes in the color axis.", 42, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_STUDY_TYPE);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Study Types in the color axis.", 3, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_TREAT_ARM);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Treatment Arms in the color axis.", 18, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_TREAT_CODED);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Treatment Arm Coded Labels in the color axis.", 44, actualTickCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickVariable(CDSHelper.DEMO_VACC_PLAC);
        coloraxis.confirmSelection();

        actualTickCount = Locator.css(cssColorLegend).findElements(getDriver()).size();

        assertEquals("Unexpected number of Vaccinne or Placebos in the color axis.", 3, actualTickCount);

    }

    @Test
    public void verifyBoxPlots()
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Choose the y-axis and verify that only 1 box plot shows if there is no x-axis chosen.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        waitForElement(CDSPlot.Locators.plotBox);

        assertElementPresent(CDSPlot.Locators.plotBox, 1);
        assertElementPresent(CDSPlot.Locators.plotPoint, 3627);

        log("Choose a categorical axis to verify that multiple box plots will appear.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_SEX);
        xaxis.confirmSelection();

        waitForElement(CDSPlot.Locators.plotTick.withText("Female"), 20000);

        waitForElement(CDSPlot.Locators.plotBox);

        assertElementPresent(CDSPlot.Locators.plotBox, 2);
        assertElementPresent(CDSPlot.Locators.plotPoint, 3627);

        log("Choose a continuous axis and verify that the chart goes back to being a scatter plot.");
        xaxis.openSelectorWindow();
        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        waitForElementToDisappear(CDSPlot.Locators.plotBox);

        log("Verify that we can go back to boxes after being in scatter mode.");
        xaxis.openSelectorWindow();
        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_RACE);
        xaxis.confirmSelection();

        waitForElement(CDSPlot.Locators.plotBox);
        waitForElement(CDSPlot.Locators.plotTick.withText("Asian"), 20000);

        assertElementPresent(CDSPlot.Locators.plotBox, 10);
        assertElementPresent(CDSPlot.Locators.plotPoint, 3627);

        log("Verify x axis categories are selectable as filters");
        mouseOver(CDSPlot.Locators.plotTick.withText("Asian"));
        waitForElement(Locator.css("svg g.axis g.tick-text a rect.highlight[fill='" + MOUSEOVER_FILL + "']"));
        assertEquals("Incorrect number of points highlighted after mousing over x axis category", 316, cdsPlot.getPointCountByColor(MOUSEOVER_FILL));

        click(CDSPlot.Locators.plotTick.withText("Asian"));
        waitForElement(CDSPlot.Locators.filterDataButton);
        assertElementPresent(CDSPlot.Locators.removeButton);

        log("Ensure correct number of points are highlighted");
        assertEquals("Incorrect number of points highlighted after clicking x axis category", 316, cdsPlot.getPointCountByColor(MOUSEOVER_FILL));
        log("Ensure correct total number of points.");
        assertEquals("Incorrect total number of points after clicking x axis category", 3627, cdsPlot.getPointCount());
        log("Apply category selection as a filter.");

        // Need to do this because there is more than one "Filter" buton in the OM, but only want the visible one.
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));
        sleep(3000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        assertEquals("Point counts not as expected.", 316, cdsPlot.getPointCount());

        log("Clear filter.");
        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_RACE);
        xaxis.confirmSelection();

        assertEquals("Point counts not as expected", 3627, cdsPlot.getPointCount());

        log("Verify multi-select of categories.");
        cdsPlot.selectXAxes(false, "White", "Multiracial", "Native Hawaiian/Paci", "Native American/Alas. Other");
        sleep(3000); // Let the animation end.

        log("Ensure correct number of points are highlighted.");
        assertEquals("Incorrect number of points highlighted after clicking x axis categories",1443, cdsPlot.getPointCountByColor(MOUSEOVER_FILL));
        assertEquals("Incorrect total number of points after clicking x axis categories",3627, cdsPlot.getPointCount());
        log("Apply selection as exclusive filter.");
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Remove"));
        sleep(3000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();
        assertEquals("Point counts not as expected", (3627 - 1443), cdsPlot.getPointCount());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        log("Validate bug 24806, that null values in a box plot should not generate a gutter plot.");
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_INIT_DILUTION);
        xaxis.confirmSelection();

        String expectedXYValues = "10\nnull\n3\n30\n300\n3000";
        cds.assertPlotTickText(expectedXYValues);
        assertFalse("There is an x-gutter, and there should not be.", cdsPlot.hasXGutter());

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

        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP1));
        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP2));
        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP3));
        assertElementPresent(CDSPlot.Locators.plotBox, 3);
        waitForElement(CDSPlot.Locators.plotTick.withText("115"));
        waitForElement(CDSPlot.Locators.plotTick.withText("70"));

        xaxis.openSelectorWindow();
        xaxis.setVariableOptions(PGROUP1, PGROUP2);
        xaxis.confirmSelection();

        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP1));
        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP2));
        waitForElementToDisappear(CDSPlot.Locators.plotTick.withText(PGROUP3));
        assertElementPresent(CDSPlot.Locators.plotBox, 2);
        waitForElementToDisappear(CDSPlot.Locators.plotTick.withText("115"));
        waitForElementToDisappear(CDSPlot.Locators.plotTick.withText("70"));

        xaxis.openSelectorWindow();
        xaxis.setVariableOptions(PGROUP3, PGROUP3_COPY);
        xaxis.confirmSelection();

        waitForElementToDisappear(CDSPlot.Locators.plotTick.withText(PGROUP1));
        waitForElementToDisappear(CDSPlot.Locators.plotTick.withText(PGROUP2));
        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP3));
        waitForElement(CDSPlot.Locators.plotTick.withText(PGROUP3_COPY));
        assertElementPresent(CDSPlot.Locators.plotBox, 2);
        waitForElement(CDSPlot.Locators.plotTick.withText("115"));
        waitForElement(CDSPlot.Locators.plotTick.withText("70"));
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
                        {CDSHelper.NAB, CDSHelper.NAB_TITERID50, CDSHelper.NAB_TITERID80}
                };
        final String[][] X_AXIS_SOURCES =
                {
                        {CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_DATE_SUBJ_ENR, CDSHelper.DEMO_DATE_FUP_COMP, CDSHelper.DEMO_DATE_PUB, CDSHelper.DEMO_DATE_START, CDSHelper.DEMO_NETWORK, CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM, CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC},
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_AGE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_AGEGROUP, CDSHelper.DEMO_BMI, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SUBSPECIES},
                        {CDSHelper.TIME_POINTS, CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_WEEKS, CDSHelper.TIME_POINTS_MONTHS},
                        {CDSHelper.BAMA, CDSHelper.BAMA_MAGNITUDE_DELTA, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_DILUTION, CDSHelper.BAMA_EXP_ASSAYD, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_MAGNITUDE_BLANK, CDSHelper.BAMA_MAGNITUDE_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW, CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW_BASELINE, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_EXP_ASSAY, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND, CDSHelper.ELISPOT_MAGNITUDE_RAW, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_EXP_ASSAY, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_MAGNITUDE_BACKGROUND, CDSHelper.ICS_MAGNITUDE_RAW, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_RESPONSE_CALL_ID50, CDSHelper.NAB_TITERID50, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_EXP_ASSAY, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_LAB, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL, CDSHelper.NAB_TITERID80}
                };
        final String[][] COLOR_AXIS_SOURCES =
                {
                        {CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_NETWORK, CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM, CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC},
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_SUBSPECIES},
                        {CDSHelper.BAMA, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_CLADE, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.NAB_RESPONSE_CALL_ID50, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL}
                };

        final Map<String, String> SubjectCounts = new HashMap<>();
        SubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "8,277");
        SubjectCounts.put(CDSHelper.SUBJECT_CHARS, "8,277");
        SubjectCounts.put(CDSHelper.TIME_POINTS, "8,277");
        SubjectCounts.put(CDSHelper.BAMA, "75");
        SubjectCounts.put(CDSHelper.ELISPOT, "477");
        SubjectCounts.put(CDSHelper.ICS, "1,604");
        SubjectCounts.put(CDSHelper.NAB, "839");

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

        for (int i = 0; i < CDSHelper.BAMA_ANTIGENS_NAME.length; i++)
        {
            assertElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'content')]//label[contains(@class, 'x-form-cb-label')][text()='" + CDSHelper.BAMA_ANTIGENS_NAME[i] + "']"));
        }

        yaxis.cancelSelection();

        log("Validate BAMA Antigen panel on xaxis.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.BAMA);
        xaxis.pickVariable(CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE);
        xaxis.openAntigenPanel();

        for (int i = 0; i < CDSHelper.BAMA_ANTIGENS_NAME.length; i++)
        {
            assertElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'content')]//label[contains(@class, 'x-form-cb-label')][text()='" + CDSHelper.BAMA_ANTIGENS_NAME[i] + "']"));
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
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setVirusName(uniqueVirusId);
        yaxis.confirmSelection();

        waitForElement(CDSPlot.Locators.plotTick.withText(CDSHelper.LABS[2]));
        assertElementPresent(CDSPlot.Locators.plotBox, 1);

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

        waitForElement(CDSPlot.Locators.plotTick.withText("Pseudovirus"));
        assertElementPresent(CDSPlot.Locators.plotBox, 1);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(100, plotDataTable.getDataRowCount());

        // Sort the grid to try and get some predictability to number of specific values in a given column.
        _ext4Helper.resetCssPrefix();
        plotDataTable.setSort("cds_GridBase_SubjectId", SortDirection.ASC);
        plotDataTable.setSort("cds_GridBase_ParticipantSequenceNum", SortDirection.ASC);
        _ext4Helper.setCssPrefix("x-");

        int actualCount = getElementCount(Locator.tagContainingText("td", uniqueVirus));
        assertEquals(100, actualCount);
        getDriver().close();
        switchToMainWindow();

    }

    @Test
    public void verifyAntigenScatterPlot()
    {
        CDSHelper cds = new CDSHelper(this);
        String xVirus = CDSHelper.VIRUS_BAL26;
        String yVirus = CDSHelper.VIRUS_SF162;
        String xVirusId = cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_VIRUS_NAME, CDSHelper.NEUTRAL_TIER_NA, CDSHelper.ANTIGEN_CLADE_NOT_RECORDED, xVirus);
        String y1VirusId = cds.buildIdentifier(CDSHelper.TITLE_NAB, CDSHelper.COLUMN_ID_VIRUS_NAME, CDSHelper.NEUTRAL_TIER_1, CDSHelper.ANTIGEN_CLADE_B, yVirus);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_TITERID50);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setVirusName(xVirusId);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setVirusName(y1VirusId);
        yaxis.confirmSelection();

        waitForElement(CDSPlot.Locators.plotTickLinear.withText("1000"));
        assertElementPresent(CDSPlot.Locators.plotPoint, 1209);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        Ext4Helper.resetCssPrefix();
        DataRegionTable plotDataTable = new DataRegionTable("query", this);
        assertEquals(100, plotDataTable.getDataRowCount());
        assertElementPresent(Locator.paginationText(1, 100, 2279));
        getDriver().close();
        switchToMainWindow();
        Ext4Helper.setCssPrefix("x-");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType("All");
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        waitForElement(CDSPlot.Locators.plotTickLinear.withText("200"));
        assertElementPresent(CDSPlot.Locators.plotPoint, 290);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        Ext4Helper.resetCssPrefix();
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(100, plotDataTable.getDataRowCount());
        assertElementPresent(Locator.paginationText(1, 100, 2929));
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
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        xaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        xaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "all"));
        xaxis.setCellType("All");
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // set the y-axis
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.setCellType("All");
        yaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        yaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "All"));
        yaxis.confirmSelection();

        // Verify the binning message
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        waitForText("Heatmap on");

        log("Validate that there are bin squares in the plot.");
        int squareCount = getElementCount(Locator.css("svg g.layer a.vis-bin-square"));
        assertTrue("Expected over 2000 bin squares found: " + squareCount, squareCount > 2000);

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

        log("Browser window height: " + getDriver().manage().window().getSize().getHeight() + " width: " + getDriver().manage().window().getSize().getWidth());

        log("Validate default scale is Log");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        scaleValues = "≤0\n0.0005\n0.005\n0.05\n0.5\n5";
        expectedCount = 1604;

        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, true);
        assertTrue("There was no x-axis log gutter there should be.", cdsPlot.hasXLogGutter());
        assertTrue("There was a y-axis log gutter there should not be.", !cdsPlot.hasYLogGutter());

        log("Change scale to Linear and validate that values change.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14";
        expectedCount = 1604;

        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, false);
        assertTrue("There  x-axis log gutter was present, it should not be there.", !cdsPlot.hasXLogGutter());
        assertTrue("There was a y-axis log gutter there should not be.", !cdsPlot.hasYLogGutter());

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

        originalScale = "≤0\n0.0005\n0.005\n0.05\n0.5\n5\n≤0\n0.001\n0.01\n0.1\n1";
        originalCount = 1453;
        verifyLogAndLinearHelper(originalScale, 2, originalCount, true);
        assertTrue("There was no x-axis log gutter there should be.", cdsPlot.hasXLogGutter());
        assertTrue("There was no y-axis log gutter there should be.", cdsPlot.hasYLogGutter());


        log("Change x-axis to be linear.");

        xaxis.openSelectorWindow();
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14\n≤0\n0.001\n0.01\n0.1\n1";
        expectedCount = 1453;  // Is this right?
        verifyLogAndLinearHelper(scaleValues, 2, expectedCount, true);
        assertTrue("There was no x-axis log gutter there should be.", cdsPlot.hasXLogGutter());
        assertTrue("There was a y-axis log gutter there should not be.", !cdsPlot.hasYLogGutter());

        log("Change y-axis to be linear.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5";
        expectedCount = 1453;
        verifyLogAndLinearHelper(scaleValues, 2, expectedCount, false);
        assertTrue("There  x-axis log gutter was present, it should not be there.", !cdsPlot.hasXLogGutter());
        assertTrue("There was a y-axis log gutter there should not be.", !cdsPlot.hasYLogGutter());

        log("Change x-axis back to log.");

        xaxis.openSelectorWindow();
        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
        xaxis.confirmSelection();

        scaleValues = "≤0\n0.0005\n0.005\n0.05\n0.5\n5\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5";
        expectedCount = 1453;
        verifyLogAndLinearHelper(scaleValues, 2, expectedCount, true);
        assertTrue("There  x-axis log gutter was present, it should not be there.", !cdsPlot.hasXLogGutter());
        assertTrue("There was no y-axis log gutter there should be.", cdsPlot.hasYLogGutter());

        log("Change y-axis back to log, all values should return to original.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();

        verifyLogAndLinearHelper(originalScale, 2, originalCount, true);
        assertTrue("There was no x-axis log gutter there should be.", cdsPlot.hasXLogGutter());
        assertTrue("There was no y-axis log gutter there should be.", cdsPlot.hasYLogGutter());

        // Clear the plot.
        cds.clearFilters();

        log("Validate log and linear with large scale values.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.confirmSelection();

        scaleValues = "3\n30\n300\n3000";
        expectedCount = 796;
        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, false);
        assertTrue("There  x-axis log gutter was present, it should not be there. (there are no negative values with this plot)", !cdsPlot.hasXLogGutter());

        log("Change y-axis to be linear.");

        yaxis.openSelectorWindow();
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();

        scaleValues = "0\n1000\n2000\n3000\n4000\n5000\n6000\n7000\n8000";
        expectedCount = 796;
        verifyLogAndLinearHelper(scaleValues, 1, expectedCount, false);

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

        originalScale = "10-19\n20-29\n30-39\n40-49\n50-59\n60-69\n≤0\n30\n300\n3000\n30000";
        originalCount = 477;
        verifyLogAndLinearHelper(originalScale, 1, originalCount, true);

        log("Add a filter and make sure that the log scale changes appropriately.");
        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_ASIAN);
        _asserts.assertFilterStatusCounts(55, 4, 1, 1, 18);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        originalScale = "10-19\n20-29\n30-39\n40-49\n50-59\n60-69\n≤0\n30\n300";
        originalCount = 55;
        verifyLogAndLinearHelper(originalScale, 1, originalCount, true);

        // Clear the plot.
        cds.clearFilters();

    }

    private void verifyLogAndLinearHelper(String scaleValues, int svgIndex, int expectedCount, boolean msgVisable)
    {
        final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subjects')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";
        String tempStr, styleValue;
        int subjectCount;

        cds.assertPlotTickText(svgIndex, scaleValues);

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCount = Integer.parseInt(tempStr.replaceAll(",", ""));
        assertEquals("Subject count not as expected.", expectedCount, subjectCount);

    }

    @Test
    public void verifyPlotToolTips()
    {
        String cssPathToSvg;
        int pointToClick;
        CDSHelper cds = new CDSHelper(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Create a simple data point plot.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.confirmSelection();

        log("Click on a point in the plot and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point"))/4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(1)";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        assertElementVisible(Locator.css("div.hopscotch-bubble-container"));

        log("Click someplace else to make the tool tip go away.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Now filter the plot to make it easier to validate the data in teh tool tip.");

        cds.goToSummary();
        cds.clickBy("Studies");
        cds.applySelection("RED 4");
        sleep(500);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        sleep(500);

        log("Click on a point in the plot and make sure the tool tip has the expected text.");

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point"))/4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(1)";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        assertElementVisible(Locator.css("div.hopscotch-bubble-container"));

        cdsPlot.validateToolTipText("RED 4", "elit ac nulla sed vel enim sit", "Cell type: CD4+", "Functional marker name:", "Data summary level:", "Protein panel:");

        log("Click someplace else to make the tool tip go away.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Clear the filter and create a plot that has values in the gutter.");
        cds.clearFilter(1);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();

        log("Click on a point in the 'Undefined X value' gutter and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point"))/4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(1)";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Data summary level: Protein Panel", "Protein panel: Any HIV PTEg", "Functional marker name: IL2/ifngamma", "Data summary level: Protein Panel");

        log("Remove the tool tip.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Click on a point in the 'Undefined Y value' gutter and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point"))/4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.bottomplot > svg";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Data summary level: Protein Panel", "Protein panel: Any HIV PTEg", "Functional marker name: IL2/ifngamma", "Data summary level: Protein Panel");

        log("Remove the tool tip.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Click on a point in the main plot and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(2) a.point"))/4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(2)";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Data summary level: Protein Panel", "Protein panel: Any HIV PTEg", "Functional marker name: IL2/ifngamma", "Data summary level: Protein Panel");

        log("Change the plot to a heat map.");
        xaxis.openSelectorWindow();
        xaxis.removeVariable();

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.setCellType("All");
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_AGE);
        xaxis.confirmSelection();

        log("Click on one of the heat map points and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square"))/4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(1)";

        cds.clickHeatPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Age at Enrollment", "Functional marker name: IL2", "Data summary level: Protein Panel", "Data summary level: Protein Panel");

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
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1)", pointToClick, CDSHelper.PlotPoints.POINT, 25, -100, true);

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
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(2)", pointToClick, CDSHelper.PlotPoints.POINT, 250, -250, true);

        // Clear the plot.
        cds.clearFilters();
        sleep(500);
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));

        // A hacky work around for the scrollIntoView issues I am seeing on Firefox.
        refresh();

        log("Brush a binned plot.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
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
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1)", pointToClick, CDSHelper.PlotPoints.BIN, -50, -100, true);

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
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1)", pointToClick, CDSHelper.PlotPoints.BIN, 0, -50, true);

        // Clear the filter.
        cds.clearFilter(1);

        log("Brush binned with categorical.");

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_COUNTRY);
        xaxis.confirmSelection();

        // Try to protect from getting an index out of range error.
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square"))/3;
        brushPlot("div:not(.thumbnail) > svg:nth-of-type(1)", pointToClick, CDSHelper.PlotPoints.BIN, 0, -50, true);

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
        pointToClick = getElementCount(Locator.css("div:not(.thumbnail) > svg " + CDSHelper.PlotPoints.GLYPH.getTag()))/4;
        brushPlot("div:not(.thumbnail) > svg", pointToClick, CDSHelper.PlotPoints.GLYPH, 0, -50, true);

        // Clear the filter.
        cds.clearFilters();

    }

    @Test
    public void verifyGutterPlotBrushing()
    {
        // This test will only validate that a "Filter" button shows up, but will not validate that the
        // range of the filter is as expected.

        CDSHelper cds = new CDSHelper(this);
        int subjectCountBefore;
        String tempStr;

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

        gutterPlotBrushingTestHelper(true, true, true, subjectCountBefore, 0);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

        log("Test plot with x gutter only and data in main plot as well.");

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_BLACK);
        _asserts.assertFilterStatusCounts(829, 48, 1, 1, 155);
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        xaxis.confirmSelection();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(true, false, true, subjectCountBefore, 1);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

        log("Test plot with y gutter only and data in main plot as well.");

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_BLACK);
        _asserts.assertFilterStatusCounts(829, 48, 1, 1, 155);
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.confirmSelection();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(false, true, true, subjectCountBefore, 1);

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
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_TITERID50);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();
        sleep(500);
        _ext4Helper.waitForMaskToDisappear();

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        gutterPlotBrushingTestHelper(true, true, false, subjectCountBefore, 0);

        // Clean up.
        cds.clearFilters();
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

    }

    @Test
    public void verifyColorLegend()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        CDSHelper cds = new CDSHelper(this);

        log("Create a aggregated plot that will have multiple values.");

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_ALL);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_ANTIGEN);
        xaxis.confirmSelection();

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.ICS);
        coloraxis.pickVariable(CDSHelper.ICS_CELL_NAME);
        coloraxis.confirmSelection();

        log("Get the legend text.");
        ArrayList<String> legends = coloraxis.getLegendText();
        boolean hasMultiValue = false;
        boolean hasCD8Plus = false;
        for(String legendText : legends)
        {
            log(legendText);
            if(legendText.toLowerCase().equals("multiple values"))
                hasMultiValue = true;
            if(legendText.toLowerCase().equals("cd8+"))
                hasCD8Plus = true;
        }

        assertTrue("Did not find 'Multiple values' in the legend.", hasMultiValue);
        assertTrue("Did not find 'CD8+' in the legend.", hasCD8Plus);

        int multiValuePointCount = cdsPlot.getPointCountByGlyph(CDSPlot.PlotGlyphs.circle);
        log("It looks like there are " + multiValuePointCount + " points on the plot that are 'Multiple values'");
        assertTrue("There were no points in the plot for 'Multi value'", multiValuePointCount > 0);

        log("Create a plot with X, Y and Color choosing from the same source");

        String cssPathToSvg;
        int pointToClick;

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ELISPOT);
        xaxis.pickVariable(CDSHelper.ELISPOT_ANTIGEN_TYPE);
        xaxis.confirmSelection();

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.ELISPOT);
        coloraxis.pickVariable(CDSHelper.ELISPOT_CELL_TYPE);
        coloraxis.confirmSelection();

        log("Get the legend text.");
        legends = coloraxis.getLegendText();
        hasCD8Plus = false;
        for(String legendText : legends)
        {
            log(legendText);
            if(legendText.toLowerCase().equals("cd8+"))
                hasCD8Plus = true;
        }

        assertTrue("Did not find 'CD8+' in the legend.", hasCD8Plus);

        cds.goToAppHome();
    }

    // hasXGutter: Does the plot have an x-gutter (i.e. gutter along the bottom).
    // hasYGutter: Does the plot have a y-gutter (i.e. gutter on the left hand side).
    // hasMainPlotDataPoints: Should we expect to find data points in the main plot area
    // subjectCountBefore: What is the subject count before we start brushing.
    // numOfOtherFilters: Have any other filters been applied.
    private void gutterPlotBrushingTestHelper(boolean hasXGutter, boolean hasYGutter, boolean hasMainPlotDataPoints, int subjectCountBefore, int numOfOtherFilters)
    {
        WebElement gutterBrushWindow;
        String dataPointType;
        int heightWidth, pointToClick;
        int mainPlotIndex;
        String tempStr, cssPathBrushWindow;
        CDSHelper.PlotPoints plotPointType;

        refresh();
        sleep(2000);

        if(hasYGutter)
        {
            mainPlotIndex = 2;
            manipulateGutterPlotBrushing(false, mainPlotIndex, subjectCountBefore, numOfOtherFilters);
        }
        else
        {
            mainPlotIndex = 1;
        }

        if (hasXGutter)
        {
            manipulateGutterPlotBrushing(true, mainPlotIndex, subjectCountBefore, numOfOtherFilters);
        }

        log("Brush in main plot area and verify that we don't get a brush window in the gutters.");

        if(hasMainPlotDataPoints)
        {

            // See what kind of data points we have in the main plot.
            if (getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") " + CDSHelper.PlotPoints.POINT.getTag())) != 0)
            {
                plotPointType = CDSHelper.PlotPoints.POINT;
            }
            else
            {
                plotPointType = CDSHelper.PlotPoints.BIN;
            }

            dataPointType = plotPointType.getTag();

            // Try to protect from getting an index out of range error. Add one just to make sure that if there is a
            // very small number of points we don't end up with 0 as pointToClick;
            pointToClick = (getElementCount(Locator.css("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") " + dataPointType)) / 4) + 1;
            log("Brushing in the main plot area. Going to click at point: div.plot:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") " + dataPointType + ":nth-of-type(" + pointToClick + ")");
            brushPlot("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ")", pointToClick, plotPointType, 50, -50, false);

        }
        else
        {
            brushEmptyPlot("div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ")", 100, -100, false);
        }

        if (hasYGutter)
        {
            log("Verify no brush in 'undefined x value' gutter.");
            cssPathBrushWindow = "div.plot:not(.thumbnail) > svg:nth-of-type(1) > g.brush > rect.extent";
            gutterBrushWindow = Locator.css(cssPathBrushWindow).findElement(getDriver());
            tempStr = gutterBrushWindow.getAttribute("height");
            heightWidth = Integer.parseInt(tempStr);
            assertTrue("'undefined x value' gutter has a brush window and it should not.", heightWidth == 0);
        }

        if(hasXGutter)
        {
            log("Verify no brush in 'undefined y value' gutter.");
            cssPathBrushWindow = "div.bottomplot > svg > g.brush > rect.extent";
            gutterBrushWindow = Locator.css(cssPathBrushWindow).findElement(getDriver());
            tempStr = gutterBrushWindow.getAttribute("width");
            heightWidth = Integer.parseInt(tempStr);
            assertTrue("'undefined y value' gutter has a brush window and it should not.", heightWidth == 0);
        }

    }

    // isXGutter: Need to know this so we can find the appropriate svg. If it is an x-gutter (i.e. along the bottom) then use "div.bottomplot > svg" to find it.
    //            Otherwise use "div:not(.thumbnail) > svg:nth-of-type" to find the y-gutter.
    // mainPlotIndex: If there is a y-gutter the main plot will be the second svg in the collection. If there is no y-gutter the main plot will be the first svg.
    // subjectCountBefore: Used only to validate that when a brushing is done, the subject count should go down.
    // numOfOtherFilters: Need to know this when we remove the filter applied by the brushing. An example would be if the test
    //                    filtered on a race before doing the brushing. This will help identify where the brushing filter is in the list.
    private void manipulateGutterPlotBrushing(boolean isXGutter, int mainPlotIndex, int subjectCountBefore, int numOfOtherFilters)
    {
        CDSHelper cds = new CDSHelper(this);
        String cssPathBrushWindow;

        if(isXGutter)
        {
            brushPlot("div.bottomplot > svg > g:nth-child(4) > g.grid-line > path:nth-of-type(2)", -50, 0, false);
        }
        else
        {
            brushPlot("div:not(.thumbnail) > svg:nth-of-type(1) > g:nth-child(5) > g.grid-line > path:nth-of-type(2)", 0, -50, false);
        }

        log("Move the brush window in the 'undefined y value' gutter.");

        if(isXGutter)
        {
            cssPathBrushWindow = "div.bottomplot > svg > g.brush > rect.extent";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), -100, 0);
        }
        else
        {
            cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(1) > g.brush > rect.extent";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 0, -100);
        }


        sleep(500);

        log("Move the brush window in the main plot.");

        cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") > g.brush > rect.extent";
        if(isXGutter)
        {
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 100, 0);
        }
        else
        {
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 0, 100);
        }

        sleep(500);

        log("Change the brush window size using the 'handles'.");

        if(isXGutter)
        {
            cssPathBrushWindow = "div.bottomplot > svg > g.brush > g:nth-of-type(1)";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), -100, 0);
        }
        else
        {
            cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(1) > g.brush > g:nth-of-type(1)";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 0, -100);
        }

        sleep(500);

        if(isXGutter)
        {
            cssPathBrushWindow = "div.bottomplot > svg > g.brush > g:nth-of-type(2)";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), -100, 0);
        }
        else
        {
            cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(1) > g.brush > g:nth-of-type(2)";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 0, -100);
        }

        log("Move the brush window back to starting point.");

        if(isXGutter)
        {
            cssPathBrushWindow = "div.bottomplot > svg > g.brush > rect.extent";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 100, 0);
        }
        else
        {
            cssPathBrushWindow = "div:not(.thumbnail) > svg:nth-of-type(1) > g.brush > rect.extent";
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 0, 100);
        }

        log("Apply the brushing as a filter.");
        applyBrushAsFilter(subjectCountBefore);

        cds.clearFilter(numOfOtherFilters + 1);
        sleep(1000);
        _ext4Helper.waitForMaskToDisappear();

    }

    private void brushPlot(String cssPathToSvg, int pointIndex, CDSHelper.PlotPoints pointType, int xOffSet, int yOffSet, boolean applyFilter)
    {
        String pointCss;
        pointCss = cssPathToSvg + " " + pointType.getTag() + ":nth-of-type(" + pointIndex + ")";
        brushPlot(pointCss, xOffSet, yOffSet, applyFilter);
    }

    private void brushPlot(String cssPointOfOrigin, int xOffSet, int yOffSet, boolean applyFilter)
    {
        int subjectCountBefore;
        String tempStr;
        Locator plotElement;

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        // Mouse over the given point.
        plotElement = Locator.css(cssPointOfOrigin);

        sleep(1000);
        cds.dragAndDropFromElement(plotElement, xOffSet, yOffSet);
        sleep(CDSHelper.CDS_WAIT);

        if(applyFilter)
        {
            assertElementVisible(Locator.linkContainingText("Filter"));
            applyBrushAsFilter(subjectCountBefore);
        }

    }

    // Need to special case if trying to brush in an empty plot.
    private void brushEmptyPlot(String cssPathToPlot, int xOffset, int yOffset, boolean applyFilter)
    {
        int subjectCountBefore;
        String tempStr;

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        // Going to move the mouse over the area where it is about to start dragging.
        clickAt(Locator.css(cssPathToPlot), 1, 1, 0);

        sleep(1000);
        cds.dragAndDropFromElement(Locator.css(cssPathToPlot), xOffset, yOffset);
        sleep(CDSHelper.CDS_WAIT);

        if(applyFilter)
        {
            assertElementVisible(Locator.linkContainingText("Filter"));
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

    @LogMethod
    private void createParticipantGroups()
    {
        Ext4Helper.resetCssPrefix();
        beginAt("project/" + getProjectName() + "/begin.view?");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP1, "Subject", "039-016", "039-014");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP2, "Subject", "039-044", "039-042");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3, "Subject", "039-059", "039-060");
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3_COPY, "Subject", "039-059", "039-060");
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

}
