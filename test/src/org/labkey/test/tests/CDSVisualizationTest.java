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
import org.labkey.test.util.UIContainerHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotBox;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotPoint;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.plotTick;

@Category({CDS.class})
public class CDSVisualizationTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private static final String PROJECT_NAME = "CDSTest Project";
    private final int WAIT_FOR_DELETE = 5 * 60 * 1000;

    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String PGROUP1 = "visgroup 1";
    private final String PGROUP2 = "visgroup 2";
    private final String PGROUP3 = "visgroup 3";
    private final String PGROUP3_COPY = "copy of visgroup 3";

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        CDSVisualizationTest initTest = (CDSVisualizationTest)getCurrentTest();

        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setupDataspace();

        if(!CDSHelper.debugTest)
        {
            initTest.createParticipantGroups();
        }

  }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {

        if(!CDSHelper.debugTest)
        {
            // TODO Seeing errors when trying to delete via API, UI was more reliable. Need to investigate.
            _containerHelper = new UIContainerHelper(this);
            _containerHelper.deleteProject(PROJECT_NAME, afterTest, WAIT_FOR_DELETE);
        }

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
    public void verifyGutterPlotBasic()
    {

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        log("Validate that a y-axis gutter plot is generated.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.BAMA);
        yaxis.pickVariable(CDSHelper.BAMA_MAGNITUDE_DELTA);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.NAB);
        xaxis.pickVariable(CDSHelper.NAB_LAB);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertFalse("For BAMA Magnitude vs NAB Lab x-axis gutter plot was present it should not have been.", hasXGutter());
        assertTrue("For BAMA Magnitude vs NAB Lab y-axis gutter plot was not present.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        log("Validate that a x-axis gutter plot is generated.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC80);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_RAW);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertTrue("For NAB IC80 vs ICS Magnitude x-axis gutter plot was not present.", hasXGutter());
        assertFalse("For NAB IC80 vs ICS Magnitude y-axis gutter plot was present and it should not have been.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        log("Validate that a gutter plot is generated for both the x and y axis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_VISIT_DAY);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertTrue("For ELISPOT Background vs ICS Visit x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For ELISPOT Background vs ICS Visit y-axis gutter plot was not present.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        log("Validate that a study axis (gutter plot with syringe glyph) is generated for the x axis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertTrue("For ELISPOT Background vs Time Visit Days a study axis was not present.", hasStudyAxis());
        assertFalse("For ELISPOT Background vs Time Visit Days x-axis gutter plot was present, it should not be.", hasXGutter());
        assertFalse("For ELISPOT Background vs Time Visit Days y-axis gutter plot was present, it should not be.", hasYGutter());

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

    }

    @Test
    public void verifyScatterPlot()
    {
        //getText(Locator.css("svg")) on Chrome

        final String ELISPOT_VISIT = "900\n950\n1000\n1050\n1100\n1150\n1200\n1250\n0e+0\n5e+3\n1e+4\n1.5e+4\n2e+4\n2.5e+4\n3e+4\n3.5e+4\n4e+4\n4.5e+4"; // TODO Test data dependent.
        final String ICS_MAGNITUDE = "0\n1\n2\n3\n4\n5\n0\n0.5\n1\n1.5\n2\n2.5\n3\n3.5\n4\n4.5\n5"; // TODO Test data dependent.
        final String NAB_IC50 = "20\n30\n40\n50\n60\n5\n50\n500\n5000"; // TODO Test data dependent.

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ELISPOT);
        xaxis.pickVariable(CDSHelper.ELISPOT_VISIT);
        xaxis.confirmSelection();
        sleep(500);
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        if(CDSHelper.validateCounts)
        {
            assertSVG(ELISPOT_VISIT);
        }

        yaxis.openSelectorWindow();
//        yaxis.backToSource();
        sleep(500);
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertTrue("For ELISPOT vs ICS x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For ELISPOT vs ICS y-axis gutter plot was not present.", hasYGutter());

        xaxis.openSelectorWindow();
//        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.confirmSelection();

        _ext4Helper.waitForMaskToDisappear();

        if(CDSHelper.validateCounts)
        {
            assertSVG(ICS_MAGNITUDE);
        }

        // Test log scales
        yaxis.openSelectorWindow();
//        yaxis.backToSource();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Log);
        yaxis.confirmSelection();

        assertTrue("For NAB vs ICS x-axis gutter plot was not present.", hasXGutter());
        assertTrue("For NAB vs ICS y-axis gutter plot was not present.", hasYGutter());

        xaxis.openSelectorWindow();
//        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.DEMOGRAPHICS);
        xaxis.pickVariable(CDSHelper.DEMO_AGE);
        xaxis.setScale(DataspaceVariableSelector.Scale.Log);
        xaxis.confirmSelection();

        assertTrue("For NAB vs Demographics x-axis gutter plot was not present.", hasXGutter());
        assertFalse("For NAB vs Demographics y-axis gutter plot was present and it should not be.", hasYGutter());

        if(CDSHelper.validateCounts)
        {
            assertSVG(NAB_IC50);
        }

        //comment starts here

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
//        waitForElement(Locators.plotSelection);
//
//        assertEquals("An unexpected number of plot selections were visible.", 2, Locators.plotSelection.findElements(getDriver()).size());
//        _asserts.assertSelectionStatusCounts(8, 1, 2);
//
//        Locators.plotSelectionCloseBtn.findElement(getDriver()).click(); // remove the x variable from the selection.
//        waitForElementToDisappear(Locators.plotSelectionCloseBtn.index(1));
//        _asserts.assertSelectionStatusCounts(13, 1, 2);
//        Locators.plotSelectionCloseBtn.findElement(getDriver()).click(); // remove the y variable from the selection.
//        assertElementNotPresent(Locators.plotSelection);
//
//        // Select them again and apply them as a filter.
//        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();
//       waitForElement(Locators.plotSelection);
//
//        assertEquals("An unexpected number of plot selections were visible.", 2, Locators.plotSelection.findElements(getDriver()).size());
//        _asserts.assertSelectionStatusCounts(3, 1, 2);
//
//        cds.useSelectionAsDataFilter();
//        assertEquals("An unexpected number of plot selection filters were visible", 2, Locators.plotSelectionFilter.findElements(getDriver()).size());
//        _asserts.assertFilterStatusCounts(3, 1, 2);
//
//        // Test that variable selectors are reset when filters are cleared (Issue 20138).
//        cds.clearFilter();
//        waitForElement(Locator.css(".yaxisbtn span.x-btn-button").withText("choose variable"));
//        waitForElement(Locator.css(".xaxisbtn span.x-btn-button").withText("choose variable"));

        //commented out section end
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
        yaxis.confirmSelection();

        waitForElement(plotBox);

        if(CDSHelper.validateCounts)
        {
            assertElementPresent(plotBox, 1);
            assertElementPresent(plotPoint, 3713); // TODO Test data dependent.
        }

        // Choose a categorical axis to verify that multiple box plots will appear.
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.DEMOGRAPHICS);
        xaxis.pickVariable(CDSHelper.DEMO_SEX);
        xaxis.confirmSelection();

        waitForElement(Locators.plotTick.withText("Female"), 20000);

        waitForElement(Locators.plotBox);

        if(CDSHelper.validateCounts)
        {
            assertElementPresent(plotBox, 2);
            assertElementPresent(plotPoint, 3713); // TODO Test data dependent.
        }

        // Choose a continuous axis and verify that the chart goes back to being a scatter plot.
        xaxis.openSelectorWindow();
        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        xaxis.confirmSelection();

        waitForElementToDisappear(plotBox);

        // Verify that we can go back to boxes after being in scatter mode.
        xaxis.openSelectorWindow();
        xaxis.backToSource();
        xaxis.pickSource(CDSHelper.DEMOGRAPHICS);
        xaxis.pickVariable(CDSHelper.DEMO_RACE);
        xaxis.confirmSelection();

        waitForElement(Locators.plotBox);
        waitForElement(Locators.plotTick.withText("Asian"), 20000); // TODO Test data dependent.

        if(CDSHelper.validateCounts)
        {
            assertElementPresent(plotBox, 7); // TODO Test data dependent.
            assertElementPresent(plotPoint, 3713); // TODO Test data dependent.
        }

        //Verify x axis categories are selectable as filters
        mouseOver(Locators.plotTick.withText("Asian")); // TODO Test data dependent.

        if(CDSHelper.validateCounts)
        {
            assertEquals("incorrect number of points highlighted after mousing over x axis category", 76, getPointCountByColor(MOUSEOVER_FILL)); // TODO Test data dependent.
        }

        click(Locators.plotTick.withText("Asian")); // TODO Test data dependent.
        //ensure filter buttons are present
        waitForElement(Locators.filterDataButton);
        assertElementPresent(Locators.removeButton);

        if(CDSHelper.validateCounts)
        {
            //ensure correct number of points are highlighted
            assertEquals("incorrect number of points highlighted after clicking x axis category", 76, getPointCountByColor(MOUSEOVER_FILL)); // TODO Test data dependent.
            //ensure correct total number of points
            assertEquals("incorrect total number of points after clicking x axis category", 3713, getPointCount()); // TODO Test data dependent.
            //apply category selection as a filter
        }

        waitAndClick(CDSHelper.Locators.cdsButtonLocator("filter data"));

        if(CDSHelper.validateCounts)
        {
            waitForPointCount(76, 20000); // TODO Test data dependent.
        }

        //clear filter
        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ICS);
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_RAW); // Work around for issue 23845.
        yaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND);
        yaxis.confirmSelection();
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.DEMOGRAPHICS);
        xaxis.pickVariable(CDSHelper.DEMO_RACE);
        xaxis.confirmSelection();

        if(CDSHelper.validateCounts)
        {
            waitForPointCount(3713, 20000); // TODO Test data dependent.
        }

        //verify multi-select of categories
        selectXAxes(false, "White", "Other", "Native Hawaiian/Paci", "Native American/Alas"); // TODO Test data dependent.
        sleep(3000); // Let the animation end.

        if(CDSHelper.validateCounts)
        {
            //ensure correct number of points are highlighted
            assertEquals("incorrect number of points highlighted after clicking x axis categories",2707, getPointCountByColor(MOUSEOVER_FILL)); // TODO Test data dependent.
            assertEquals("incorrect total number of points after clicking x axis categories",3713, getPointCount()); // TODO Test data dependent.
            //apply selection as exlusive filter
            waitAndClick(CDSHelper.Locators.cdsButtonLocator("remove"));
            waitForPointCount(3713 - 2707, 10000); // TODO Test data dependent.
        }

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

    }

// TODO Removing test attribute until I get a chance to fix it.
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
                {{CDSHelper.DEMOGRAPHICS, CDSHelper.DEMO_AGEGROUP, CDSHelper.DEMO_AGE, CDSHelper.DEMO_BMI},
                        {CDSHelper.BAMA, CDSHelper.BAMA_MAGNITUDE_BLANK, CDSHelper.BAMA_MAGNITUDE_BASELINE, CDSHelper.BAMA_MAGNITUDE_DELTA, CDSHelper.BAMA_MAGNITUDE_RAW, CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW_BASELINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ELISPOT_MAGNITUDE_RAW},
                        {CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ICS_MAGNITUDE_BACKGROUND_RAW},
                        {CDSHelper.NAB, CDSHelper.NAB_TITERIC50, CDSHelper.NAB_TITERIC80}};
        final String[][] X_AXIS_SOURCES =
                {{CDSHelper.DEMOGRAPHICS, CDSHelper.DEMO_AGEGROUP, CDSHelper.DEMO_AGE, CDSHelper.DEMO_BMI, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_SUBSPECIES, CDSHelper.DEMO_VISIT},
                        {CDSHelper.TIME_POINTS, CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_WEEKS, CDSHelper.TIME_POINTS_MONTHS},
                        {CDSHelper.BAMA, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_DILUTION, CDSHelper.BAMA_EXP_ASSAYD, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_MAGNITUDE_BLANK, CDSHelper.BAMA_MAGNITUDE_BASELINE, CDSHelper.BAMA_MAGNITUDE_DELTA, CDSHelper.BAMA_MAGNITUDE_RAW, CDSHelper.BAMA_MAGNITUDE_DELTA_BASELINE, CDSHelper.BAMA_MAGNITUDE_RAW_BASELINE, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE, CDSHelper.BAMA_VISIT, CDSHelper.BAMA_VISIT_DAY},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_EXP_ASSAY, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND, CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ELISPOT_MAGNITUDE_RAW, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE, CDSHelper.ELISPOT_VISIT, CDSHelper.ELISPOT_VISIT_DAY},
                        {CDSHelper.ICS, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_EXP_ASSAY, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_MAGNITUDE_BACKGROUND, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, CDSHelper.ICS_MAGNITUDE_BACKGROUND_RAW, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_PROTEIN_PANEL, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_SPECIMEN, CDSHelper.ICS_VISIT},
                        {CDSHelper.NAB, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_EXP_ASSAY, CDSHelper.NAB_INIT_DILUTION, CDSHelper.NAB_LAB, CDSHelper.NAB_RESPONSE, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL, CDSHelper.NAB_TITERIC50, CDSHelper.NAB_TITERIC80, CDSHelper.NAB_VISIT, CDSHelper.NAB_VISIT_DAY}};
        final String[][] COLOR_AXIS_SOURCES =
                {{CDSHelper.DEMOGRAPHICS, CDSHelper.DEMO_CIRCUMCISED, CDSHelper.DEMO_COUNTRY, CDSHelper.DEMO_HISPANIC, CDSHelper.DEMO_RACE, CDSHelper.DEMO_SEX, CDSHelper.DEMO_SPECIES, CDSHelper.DEMO_SUBSPECIES},
                        {CDSHelper.BAMA, CDSHelper.BAMA_ANTIGEN_CLADE, CDSHelper.BAMA_ANTIGEN_NAME, CDSHelper.BAMA_ANTIGEN_TYPE, CDSHelper.BAMA_ASSAY, CDSHelper.BAMA_DETECTION, CDSHelper.BAMA_INSTRUMENT_CODE, CDSHelper.BAMA_ISOTYPE, CDSHelper.BAMA_LAB, CDSHelper.BAMA_PROTEIN, CDSHelper.BAMA_PROTEIN_PANEL, CDSHelper.BAMA_RESPONSE_CALL, CDSHelper.BAMA_SPECIMEN, CDSHelper.BAMA_VACCINE},
                        {CDSHelper.ELISPOT, CDSHelper.ELISPOT_ANTIGEN, CDSHelper.ELISPOT_ASSAY, CDSHelper.ELISPOT_CELL_NAME, CDSHelper.ELISPOT_CELL_TYPE, CDSHelper.ELISPOT_CLADE, CDSHelper.ELISPOT_MARKER_NAME, CDSHelper.ELISPOT_MARKER_TYPE, CDSHelper.ELISPOT_LAB, CDSHelper.ELISPOT_PROTEIN, CDSHelper.ELISPOT_PROTEIN_PANEL, CDSHelper.ELISPOT_RESPONSE, CDSHelper.ELISPOT_SPECIMEN, CDSHelper.ELISPOT_VACCINE},
                        {CDSHelper.ICS, CDSHelper.ICS_ANTIGEN, CDSHelper.ICS_ASSAY, CDSHelper.ICS_CELL_NAME, CDSHelper.ICS_CELL_TYPE, CDSHelper.ICS_MARKER_NAME, CDSHelper.ICS_MARKER_TYPE, CDSHelper.ICS_LAB, CDSHelper.ICS_PROTEIN, CDSHelper.ICS_PROTEIN_PANEL, CDSHelper.ICS_RESPONSE, CDSHelper.ICS_SPECIMEN},
                        {CDSHelper.NAB, CDSHelper.NAB_ANTIGEN, CDSHelper.NAB_ANTIGEN_CLADE, CDSHelper.NAB_ASSAY, CDSHelper.NAB_LAB, CDSHelper.NAB_RESPONSE, CDSHelper.NAB_SPECIMEN, CDSHelper.NAB_TARGET_CELL}};

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        this.log("Validating the x-axis selector.");
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();

        this.log("Validating the x-axis header text.");
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'main-title')][text()='x-axis']")));
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")));
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'subject-count')][text()='Subject count']")));

        this.log("Validating the x-axis sources.");
        for (String[] src : X_AXIS_SOURCES)
        {
            assertTrue(this.isElementVisible(xaxis.window().append(" div.content-label").withText(src[0])));
            this.log("Validating variables for " + src[0]);
            click(xaxis.window().append(" div.content-label").withText(src[0]));
            this.waitForElement(Locator.xpath("//div[contains(@class, 'x-axis-selector')]//span[contains(@class, 'section-title')][text()='" + src[0] + "']"));
            for (int i = 1; i < src.length; i++)
            {
                assertTrue(this.isElementVisible(xaxis.window().append(" div.content-label").withText(src[i])));
                click(xaxis.window().append(" div.content-label").withText(src[i]));
            }
            xaxis.backToSource();
        }

        this.log("Validating the x-axis cancel button.");
        xaxis.cancelSelection();

        this.log("Validating the y-axis selector.");
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        yaxis.openSelectorWindow();

        this.log("Validating the y-axis header text.");
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'main-title')][text()='y-axis']")));
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")));
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'subject-count')][text()='Subject count']")));

        this.log("Validating the y-axis sources.");
        for (String[] src : Y_AXIS_SOURCES)
        {
            assertTrue(this.isElementVisible(yaxis.window().append(" div.content-label").withText(src[0])));
            this.log("Validating variables for " + src[0]);
            click(yaxis.window().append(" div.content-label").withText(src[0]));
            this.waitForElement(Locator.xpath("//div[contains(@class, 'y-axis-selector')]//span[contains(@class, 'section-title')][text()='" + src[0] + "']"));
            for (int i = 1; i < src.length; i++)
            {
                assertTrue(this.isElementVisible(yaxis.window().append(" div.content-label").withText(src[i])));
                click(yaxis.window().append(" div.content-label").withText(src[i]));
            }
            yaxis.backToSource();
        }

        this.log("Validating the y-axis cancel button.");
        yaxis.cancelSelection();

        this.log("Validating the color-axis selector.");
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);
        coloraxis.openSelectorWindow();

        this.log("Validating the color-axis header text.");
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'main-title')][text()='color']")));
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'nav-text')][text()='Sources']")));
        assertTrue(this.isElementVisible(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//div[contains(@class, 'sub-title')]//span[contains(@class, 'subject-count')][text()='Subject count']")));

        this.log("Validating the color-axis sources.");
        for (String[] src : COLOR_AXIS_SOURCES)
        {
            assertTrue(this.isElementVisible(coloraxis.window().append(" div.content-label").withText(src[0])));
            this.log("Validating variables for " + src[0]);
            click(coloraxis.window().append(" div.content-label").withText(src[0]));
            this.waitForElement(Locator.xpath("//div[contains(@class, 'color-axis-selector')]//span[contains(@class, 'section-title')][text()='" + src[0] + "']"));
            for (int i = 1; i < src.length; i++)
            {
                assertTrue(this.isElementVisible(coloraxis.window().append(" div.content-label").withText(src[i])));
                click(coloraxis.window().append(" div.content-label").withText(src[i]));
            }
            coloraxis.backToSource();
        }

        this.log("Validating the color-axis cancel button.");
        coloraxis.cancelSelection();

    }

    // TODO Removing test attribute until I get a chance to fix it.
//    @Test
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

    // TODO Removing test attribute until I get a chance to fix it.
//    @Test
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
        xaxis.setVariableRadio("Aligned by Day 0");
        xaxis.confirmSelection();
        waitForText("Study weeks, CCL5");

        // Assert that we have the same amount of visits even with study weeks.
        assertEquals("Unexpected number of visits on the study axis.", 37, studyVisits.findElements(getDriver()).size());
        assertEquals("Unexpected number of visit tags on the study axis.", 25, visitTags.findElements(getDriver()).size());
    }

    // TODO Removing test attribute until I get a chance to fix it.
//    @Test
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

    // TODO Removing test attribute until I get a chance to fix it.
//    @Test
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

    // TODO Removing test attribute until I get a chance to fix it.
    //@Test
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

    // TODO Removing test attribute until I get a chance to fix it.
//    @Test
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
        for(WebElement point : points)
        {
            if(point.getAttribute("fill").equals(colorCode))
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

    @LogMethod
    private void createParticipantGroups()
    {
        Ext4Helper.resetCssPrefix();
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP1, "Subject", "039-016", "039-014");  // TODO Test data dependent.
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP2, "Subject", "039-044", "039-042");  // TODO Test data dependent.
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3, "Subject", "039-059", "039-060");  // TODO Test data dependent.
        _studyHelper.createCustomParticipantGroup(getProjectName(), getProjectName(), PGROUP3_COPY, "Subject", "039-059", "039-060");  // TODO Test data dependent.
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
        public static Locator filterDataButton = Locator.xpath("//span[text()='filter data']");
        public static Locator removeButton = Locator.xpath("//span[text()='remove']");
    }
}
