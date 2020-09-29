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

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
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
import static org.labkey.test.util.cds.CDSHelper.CDS_WAIT;
import static org.labkey.test.util.cds.CDSHelper.PLOT_TYPE_BOX;
import static org.labkey.test.util.cds.CDSHelper.PLOT_TYPE_BOX_AND_LINE;
import static org.labkey.test.util.cds.CDSHelper.PLOT_TYPE_LINE;
import static org.labkey.test.util.cds.CDSHelper.PLOT_TYPE_SCATTER;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 45)
public class CDSVisualizationTest extends CDSReadOnlyTest
{
    protected static final String MOUSEOVER_FILL = "#41C49F";
    protected static final String MOUSEOVER_STROKE = "#00EAFF";
    protected static final String BRUSHED_FILL = "#14C9CC";
    protected static final String BRUSHED_STROKE = "#00393A";
    protected static final String NORMAL_COLOR = "#000000";
    protected static final String FADED_FILL = "#E6E6E6";
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSPlot cdsPlot = new CDSPlot(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String PGROUP1 = "visgroup 1";
    private final String PGROUP2 = "visgroup 2";
    private final String PGROUP3 = "visgroup 3";
    private final String PGROUP3_COPY = "copy of visgroup 3";
    private final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subject')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";

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
    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
        getDriver().manage().window().setSize(CDSHelper.idealWindowSize);
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
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0);

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
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        xaxis.confirmSelection();

        assertTrue("For NAB IC80 vs ICS Magnitude x-axis gutter plot was not present.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);
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
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
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

        assertTrue("For ICS CD8+ vs ICS CD4+ x-axis gutter plot was not present.", cdsPlot.hasXGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);
        assertTrue("For ICS CD8+ vs ICS CD4+ y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0);

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
        expectedXYValues = "HVTN\nROGER\n0\n2\n4\n6\n8\n10\n12\n14";

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
        _asserts.assertFilterStatusCounts(829, 48, 1, 3, 155);

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

        assertEquals("Unexpected number of Vaccine or Placebos in the color axis.", 3, actualTickCount);

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
                        {CDSHelper.NAB, CDSHelper.NAB_TITERID50, CDSHelper.NAB_TITERID80},
                        {CDSHelper.PKMAB, CDSHelper.PKMAB_CONCENTRATION}
                };
        final String[][] X_AXIS_SOURCES =
                {
                        {CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_DATE_SUBJ_ENR, CDSHelper.DEMO_DATE_FUP_COMP, CDSHelper.DEMO_DATE_PUB, CDSHelper.DEMO_DATE_START, CDSHelper.DEMO_NETWORK, CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM, CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC},
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_AGE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_AGEGROUP, CDSHelper.DEMO_BMI, CDSHelper.DEMO_BMI_GROUP, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_GENDER_IDENTITY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_STUDY_COHORT, CDSHelper.DEMO_SUBSPECIES, CDSHelper.DEMO_SUBJECT_ID},
                        {CDSHelper.TIME_POINTS, CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_WEEKS, CDSHelper.TIME_POINTS_MONTHS},
                        {CDSHelper.BAMA, CDSHelper.BAMA_MAGNITUDE_DELTA, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_DILUTION, CDSHelper.BAMA_EXP_ASSAYD, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_MAGNITUDE_BLANK, CDSHelper.BAMA_MAGNITUDE_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW, CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW_BASELINE, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_EXP_ASSAY, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND, CDSHelper.ELISPOT_MAGNITUDE_RAW, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_EXP_ASSAY, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_MAGNITUDE_BACKGROUND, CDSHelper.ICS_MAGNITUDE_RAW, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_RESPONSE_CALL_ID50, CDSHelper.NAB_TITERID50, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_EXP_ASSAY, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_LAB, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL, CDSHelper.NAB_TITERID80},
                        {CDSHelper.PKMAB, CDSHelper.PKMAB_CONCENTRATION, CDSHelper.PKMAB_STD_NAME, CDSHelper.PKMAB_LAB_ID, CDSHelper.PKMAB_MAB_LABEL, CDSHelper.PKMAB_SOURCE_ASSAY, CDSHelper.PKMAB_SPECIMEN_TYPE}
                };
        final String[][] COLOR_AXIS_SOURCES =
                {
                        {CDSHelper.STUDY_TREATMENT_VARS, CDSHelper.DEMO_STUDY_NAME, CDSHelper.DEMO_TREAT_SUMM, CDSHelper.DEMO_NETWORK, CDSHelper.DEMO_PROD_CLASS, CDSHelper.DEMO_PROD_COMB, CDSHelper.DEMO_STUDY_TYPE, CDSHelper.DEMO_TREAT_ARM, CDSHelper.DEMO_TREAT_CODED, CDSHelper.DEMO_VACC_PLAC},
                        {CDSHelper.SUBJECT_CHARS, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_SUBSPECIES, CDSHelper.DEMO_SUBJECT_ID},
                        {CDSHelper.BAMA, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_CLADE, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL},
                        {CDSHelper.PKMAB, CDSHelper.PKMAB_STD_NAME, CDSHelper.PKMAB_LAB_ID, CDSHelper.PKMAB_MAB_LABEL, CDSHelper.PKMAB_SOURCE_ASSAY, CDSHelper.PKMAB_SPECIMEN_TYPE}
                };

        final Map<String, String> SubjectCounts = new HashMap<>();
        SubjectCounts.put(CDSHelper.STUDY_TREATMENT_VARS, "8,277");
        SubjectCounts.put(CDSHelper.SUBJECT_CHARS, "8,277");
        SubjectCounts.put(CDSHelper.TIME_POINTS, "8,277");
        SubjectCounts.put(CDSHelper.BAMA, "75");
        SubjectCounts.put(CDSHelper.ELISPOT, "477");
        SubjectCounts.put(CDSHelper.ICS, "1,604");
        SubjectCounts.put(CDSHelper.NAB, "839");
        SubjectCounts.put(CDSHelper.PKMAB, "30");

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
            assertTrue(isElementVisible(xaxis.window().append(" div.content-count").withText(SubjectCounts.get(src[0])))); // TODO Bad test. It will pass if there is any tag with this count. Need to revisit.
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
            assertTrue(isElementVisible(yaxis.window().append(" div.content-count").withText(SubjectCounts.get(src[0])))); // TODO Bad test. It will pass if there is any tag with this count. Need to revisit.
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
            assertTrue(isElementVisible(coloraxis.window().append(" div.content-count").withText(SubjectCounts.get(src[0])))); // TODO Bad test. It will pass if there is any tag with this count. Need to revisit.
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
        assertElementNotPresent("Detail selector present in color selector, it should not be there.", Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'advanced')]//fieldset//div[contains(@class, 'field-label')][text()='Antigen name:']"));
        coloraxis.cancelSelection();

    }

    @Test
    public void verifyLogAndLinearScales()
    {
        final char le = '\u2264';
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

        scaleValues = le + "0\n0.0005\n0.005\n0.05\n0.5\n5";
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

        originalScale = le + "0\n0.0005\n0.005\n0.05\n0.5\n5\n" + le + "0\n0.001\n0.01\n0.1\n1";
        originalCount = 1453;
        verifyLogAndLinearHelper(originalScale, 2, originalCount, true);
        assertTrue("There was no x-axis log gutter there should be.", cdsPlot.hasXLogGutter());
        assertTrue("There was no y-axis log gutter there should be.", cdsPlot.hasYLogGutter());


        log("Change x-axis to be linear.");

        xaxis.openSelectorWindow();
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.confirmSelection();

        scaleValues = "0\n2\n4\n6\n8\n10\n12\n14\n" + le + "0\n0.001\n0.01\n0.1\n1";
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

        scaleValues = le + "0\n0.0005\n0.005\n0.05\n0.5\n5\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5";
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

        originalScale = "10-19\n20-29\n30-39\n40-49\n50-59\n60-69\n" + le + "0\n30\n300\n3000\n30000";
        originalCount = 477;
        verifyLogAndLinearHelper(originalScale, 1, originalCount, true);

        log("Add a filter and make sure that the log scale changes appropriately.");
        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_ASIAN);
        _asserts.assertFilterStatusCounts(55, 4, 1, 3, 18);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        originalScale = "10-19\n20-29\n30-39\n40-49\n50-59\n60-69\n" + le + "0\n30\n300";
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
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        log("Click on a point in the plot and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point").findElements(getDriver()).size() / 4;
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
        pointToClick = Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point").findElements(getDriver()).size() / 4;
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
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        xaxis.confirmSelection();

        log("Click on a point in the 'Undefined X value' gutter and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point").findElements(getDriver()).size() / 4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(1)";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Data summary level: Protein Panel", "Protein panel: Any ", "Functional marker name: IL2/ifngamma", "Data summary level: Protein Panel");

        log("Remove the tool tip.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Click on a point in the 'Undefined Y value' gutter and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.point").findElements(getDriver()).size() / 4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.bottomplot > svg";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Data summary level: Protein Panel", "Protein panel: Any ", "Functional marker name: IL2/ifngamma", "Data summary level: Protein Panel");

        log("Remove the tool tip.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Click on a point in the main plot and make sure the tool tip is as expected.");
        // Try to protect from getting an index out of range error.
        pointToClick = Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(2) a.point").findElements(getDriver()).size() / 4;
        log("Going to click on the " + pointToClick + " element from \"div:not(.thumbnail) > svg:nth-of-type(1) a.point\".");
        cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(2)";

        cds.clickPointInPlot(cssPathToSvg, pointToClick);

        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);

        cdsPlot.validateToolTipText("Magnitude (% cells) - Background subtracted", "Data summary level: Protein Panel", "Protein panel: Any ", "Functional marker name: IL2/ifngamma", "Data summary level: Protein Panel");

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
        pointToClick = Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(1) a.vis-bin-square").findElements(getDriver()).size() / 4;
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
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        brushPlot(0, 0.25, CDSHelper.PlotPoints.POINT, 25, -100, true);

        // Clear the filter.
        cds.clearFilter(1);

        log("Brush a scattered plot.");
        // set the x-axis
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        xaxis.confirmSelection();

        brushPlot(1, 0.25, CDSHelper.PlotPoints.POINT, 250, -250, true);

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
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        // set the y-axis
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setCellType("All");
        yaxis.setDataSummaryLevel(CDSHelper.DATA_SUMMARY_PROTEIN);
        yaxis.setProtein(cds.buildIdentifier(CDSHelper.DATA_SUMMARY_PROTEIN_PANEL, "All"));
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        brushPlot(0, 0.5, CDSHelper.PlotPoints.BIN, -50, -100, true);

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

        brushPlot(0, 0.5, CDSHelper.PlotPoints.BIN, 0, -50, true);

        // Clear the filter.
        cds.clearFilter(1);

        log("Brush binned with categorical.");

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.SUBJECT_CHARS);
        xaxis.pickVariable(CDSHelper.DEMO_COUNTRY);
        xaxis.confirmSelection();

        brushPlot(0, 0.333, CDSHelper.PlotPoints.BIN, 0, -50, true);

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

        brushPlot(0, 0.25, CDSHelper.PlotPoints.GLYPH, 0, -50, true);

        // Clear the filter.
        cds.clearFilters();

    }

    @Test
    public void verifyGutterPlotBrushing()
    {
        // This test will only validate that a "Filter" button shows up, but will not validate that the
        // range of the filter is as expected.

        // I think that the JS errors we are seeing in TC runs are caused by test code and not product code.
        // Going to pause the JS Error Checker for this test.
        pauseJsErrorChecker();

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
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
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
        _asserts.assertFilterStatusCounts(829, 48, 1, 3, 155);
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
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
        _asserts.assertFilterStatusCounts(829, 48, 1, 3, 155);
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_RAW);
        yaxis.setCellType(CDSHelper.CELL_TYPE_CD4, CDSHelper.CELL_TYPE_CD8);
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD4);
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
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

        // Resume JS Error Checker.
        resumeJsErrorChecker();

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
        for (String legendText : legends)
        {
            log(legendText);
            if (legendText.toLowerCase().equals("multiple values"))
                hasMultiValue = true;
            if (legendText.toLowerCase().equals("cd8+"))
                hasCD8Plus = true;
        }

        assertTrue("Did not find 'Multiple values' in the legend.", hasMultiValue);
        assertTrue("Did not find 'CD8+' in the legend.", hasCD8Plus);

        int multiValuePointCount = cdsPlot.getPointCountByGlyph(CDSPlot.PlotGlyphs.circle);
        log("It looks like there are " + multiValuePointCount + " points on the plot that are 'Multiple values'");
        assertTrue("There were no points in the plot for 'Multi value'", multiValuePointCount > 0);

        log("Create a plot with X, Y and Color choosing from the same source");

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
        for (String legendText : legends)
        {
            log(legendText);
            if (legendText.toLowerCase().equals("cd8+"))
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
        int heightWidth;
        int mainPlotIndex;
        String tempStr, cssPathBrushWindow;
        CDSHelper.PlotPoints plotPointType;

        refresh();
        sleep(2000);

        if (hasYGutter)
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

        if (hasMainPlotDataPoints)
        {

            // See what kind of data points we have in the main plot.
            if (getElementCount(Locator.css("div.plot:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") ").append(CDSHelper.PlotPoints.POINT.getLocator())) != 0)
            {
                plotPointType = CDSHelper.PlotPoints.POINT;
            }
            else
            {
                plotPointType = CDSHelper.PlotPoints.BIN;
            }

            brushPlot(mainPlotIndex - 1, 0.25, plotPointType, 50, -50, false);

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

        if (hasXGutter)
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

        if (isXGutter)
        {
            WebElement element = Locator.css("div.bottomplot > svg > g:nth-child(4) > g.grid-line > path:nth-of-type(2)").findElement(getDriver());
            brushPlot(element, -50, 0, false);
        }
        else
        {
            WebElement element = Locator.css("div:not(.thumbnail) > svg:nth-of-type(1) > g:nth-child(5) > g.grid-line > path:nth-of-type(2)").findElement(getDriver());
            brushPlot(element, 0, -50, false);
        }

        log("Move the brush window in the 'undefined y value' gutter.");

        if (isXGutter)
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
        if (isXGutter)
        {
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 100, 0);
        }
        else
        {
            cds.dragAndDropFromElement(Locator.css(cssPathBrushWindow), 0, 100);
        }

        sleep(500);

        log("Change the brush window size using the 'handles'.");

        if (isXGutter)
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

        if (isXGutter)
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

        if (isXGutter)
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

    private void brushPlot(int svgIndex, double pointPosition, CDSHelper.PlotPoints pointType, int xOffSet, int yOffSet, boolean applyFilter)
    {
        if (pointPosition < 0 || pointPosition > 1)
            throw new IllegalArgumentException("Point posistion must be between zero and one, inclusive");
        WebElement svg = Locator.css("div:not(.thumbnail) > svg").index(svgIndex).findElement(getDriver());
        List<WebElement> points = pointType.getLocator().waitForElements(svg, CDS_WAIT);
        int pointIndex = Double.valueOf(points.size() * pointPosition).intValue();
        brushPlot(points.get(pointIndex), xOffSet, yOffSet, applyFilter);
    }

    private void brushPlot(WebElement pointOfOrigin, int xOffSet, int yOffSet, boolean applyFilter)
    {
        String tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        int subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        sleep(1000);
        cds.dragAndDropFromElement(pointOfOrigin, xOffSet, yOffSet);
        sleep(CDS_WAIT);

        if (applyFilter)
        {
            assertElementVisible(Locator.linkContainingText("Filter"));
            applyBrushAsFilter(subjectCountBefore);
        }

    }

    // Need to special case if trying to brush in an empty plot.
    private void brushEmptyPlot(String cssPathToPlot, int xOffset, int yOffset, boolean applyFilter)
    {
        String tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        int subjectCountBefore = Integer.parseInt(tempStr.replaceAll(",", ""));

        // Going to move the mouse over the area where it is about to start dragging.
        clickAt(Locator.css(cssPathToPlot), 1, 1, 0);

        sleep(1000);
        cds.dragAndDropFromElement(Locator.css(cssPathToPlot), xOffset, yOffset);
        sleep(CDS_WAIT);

        if (applyFilter)
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

    @Test
    public void verifyTimePointPlotTypeOptions()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Verify 'Study Hours' time point option is not available when no Y axis is selected");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        List<String> availableTimeOptions = xaxis.getAvailableVariables();
        assertFalse(CDSHelper.TIME_POINTS_HOURS + " time point option shouldn't be available unless PK MAb is selected", availableTimeOptions.contains(CDSHelper.TIME_POINTS_HOURS));

        log("Verify 'Plot Type' options for non Hours time point for non PK MAb plot");
        final List<String> allPlotTypes = Arrays.asList(PLOT_TYPE_SCATTER, PLOT_TYPE_BOX, PLOT_TYPE_LINE, PLOT_TYPE_BOX_AND_LINE);
        assertEquals("Plot type options for non Hours time point is not as expected", allPlotTypes, xaxis.getTimePointPlotTypeOptions());

        log("Verify Align by options");
        assertFalse("Align by options should be disabled", xaxis.isTimeOptionAlignedByDisabled());

        xaxis.cancelSelection();

        log("Verify time point options when PK MAb measure is selected as Y axis field");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.PKMAB);
        yaxis.pickVariable(CDSHelper.PKMAB_CONCENTRATION);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        log("Verify 'Study Hours' time point option is available for PK MAb plot");
        availableTimeOptions = xaxis.getAvailableVariables();
        assertTrue(CDSHelper.TIME_POINTS_HOURS + " time point option should be available for PK MAb plot", availableTimeOptions.contains(CDSHelper.TIME_POINTS_HOURS));

        log("Verify 'Line' is the default plot type for PK MAb plot");
        assertEquals("Default plot type for PK MAb is not as expected", PLOT_TYPE_LINE, xaxis.getTimePointAdvancedOptionSelectedValue("Plot type"));

        log("Verify 'Align by' dropdown is disabled for PK MAb plot for non Hours time point");
        assertTrue("Align by options should be disabled", xaxis.isTimeOptionAlignedByDisabled());

        log("Verify 'Plot Type' options for Hours time point for non PK MAb plot");
        xaxis.pickVariable(CDSHelper.TIME_POINTS_HOURS);
        final List<String> hoursPlotTypes = Arrays.asList(PLOT_TYPE_SCATTER, PLOT_TYPE_LINE);
        assertEquals("Plot type options for Hours time point is not as expected", hoursPlotTypes, xaxis.getTimePointPlotTypeOptions());

        log("Verify 'Align by' dropdown is hidden for Hours time point");
        assertFalse("Align by options should not be present", xaxis.isTimeOptionAlignByPresent());
        Locator selectedVariable = Locator.tagWithClass("div", "content-selected");
        assertTrue(isElementVisible(selectedVariable));
        xaxis.confirmSelection();

        log("Verify changing Y axis to non PK after selecting Hours time type");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        sleep(1000);

        xaxis.openSelectorWindow();
        availableTimeOptions = xaxis.getAvailableVariables();
        assertFalse(CDSHelper.TIME_POINTS_HOURS + " time point option shouldn't be available unless PK MAb is selected", availableTimeOptions.contains(CDSHelper.TIME_POINTS_HOURS));
        assertFalse("No time option is selected since Hours is no longer valid option", isElementVisible(selectedVariable));
    }

}
