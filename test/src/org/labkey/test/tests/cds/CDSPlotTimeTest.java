/*
 * Copyright (c) 2014-2016 LabKey Corporation
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

import com.gargoylesoftware.htmlunit.BrowserVersion;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.CDS;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.InfoPane;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.Color;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@Category({CDS.class})
public class CDSPlotTimeTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSPlot cdsPlot = new CDSPlot(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
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
    public void verifyTimeAxisBasic()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        Map expectedCounts = new HashMap<String, CDSHelper.TimeAxisData>();
        expectedCounts.put("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.put("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.put("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 3, 19, 0, 0));
        expectedCounts.put("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));
        expectedCounts.put("ZAP_135", new CDSHelper.TimeAxisData("ZAP 135", 0, 0, 0, 0, 0, 0));

        final String yaxisScale = "\n0\n100\n200\n300\n400\n500\n600\n700";
        final String studyDaysScales = "0\n100\n200\n300\n400\n500\n600" + yaxisScale;
        final String studyDaysScaleAligedVaccination = "-300\n-200\n-100\n0\n100\n200\n300" + yaxisScale;
        final String studyWeeksScales = "0\n20\n40\n60\n80" + yaxisScale;
        final String studyWeeksScalesAlignedVaccination = "-40\n-20\n0\n20\n40" + yaxisScale;
        final String studyMonthsScales = "0\n5\n10\n15\n20" + yaxisScale;
        final String studyMonthsScalesAlignedVaccination = "-10\n-5\n0\n5\n10" + yaxisScale;

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

        assertTrue("For NAb Titer 50, A3R5 vs Time Visit Days a study axis was not present.", cdsPlot.hasStudyAxis());
        List<WebElement> studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyDaysScales);

        log("Change x-axis to Study weeks, verify visit counts change as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        // Modify expected number of icons to be visible (we should not have overlapping vacc. and follow-up icons).
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 3, 14, 0, 0));

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyWeeksScales);

        log("Change x-axis to Study months, verify visit counts change as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.confirmSelection();

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected 7 studies in the Time Axis, found " + studies.size() + ".", studies.size() == 5);
        log("Study count was as expected.");

        // Again account for behavior of not having overlapping icons.
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 1, 2, 3, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 2, 1, 0, 4, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 3, 3, 1, 9, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 1, 2, 0, 5, 0, 0));

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyMonthsScales);

        log("Change x-axis to Study days, change alignment to Enrollment, verify visit counts are as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();

        // When changing the alignment to anything other than Day 0 study HVTN 205 will not appear because it has no visit information.
        expectedCounts.remove("ZAP_135");

        // Icon counts should go back to what they were before.
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 3, 19, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyDaysScales);

        log("Change x-axis alignment to Last Vaccination, verify visit counts are as expected.");
        // pre-enrollment has been removed temporarily. Previously QED, YOYO and ZAP 133 had pre-enrollment.
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 2, 20, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.setAlignedBy("Last Vaccination");
        xaxis.confirmSelection();

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyDaysScaleAligedVaccination);

        log("Change x-axis to Study weeks, and go back to aligned by Enrollment, verify visit are as expected.");
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 3, 14, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyWeeksScales);

        log("Change x-axis Aligned by Last Vaccination, verify visit are as expected.");
        // pre-enrollment has been removed temporarily. Previously QED, YOYO and ZAP 133 had pre-enrollment.
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 0, 6, 2, 15, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyWeeksScalesAlignedVaccination);

        log("Change x-axis to Study months, and go back to aligned by Enrollment, verify visit are as expected.");
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 1, 2, 3, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 2, 1, 0, 4, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 3, 3, 1, 9, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 1, 2, 0, 5, 0, 0));
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyMonthsScales);

        log("Change x-axis Aligned by Last Vaccination, verify visit are as expected.");
        // pre-enrollment has been removed temporarily. Previously QED, YOYO and ZAP 133 had pre-enrollment.
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 2, 1, 0, 3, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 3, 1, 0, 2, 0, 2));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 3, 3, 0, 11, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 1, 3, 0, 3, 0, 0));
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        cdsPlot.validateVisitCounts(studies, expectedCounts);
        cds.assertPlotTickText(studyMonthsScalesAlignedVaccination);

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
        Actions builder; // Used to hover the WebElement over a tag.

        Map expectedCounts = new HashMap<String, CDSHelper.TimeAxisData>();
        expectedCounts.put("RED_4", new CDSHelper.TimeAxisData("RED 4", 1, 3, 1, 5, 1, 0));
        expectedCounts.put("ZAP_110", new CDSHelper.TimeAxisData("ZAP 110", 1, 4, 3, 4, 0, 0));
        expectedCounts.put("ZAP_111", new CDSHelper.TimeAxisData("ZAP 111", 1, 4, 2, 6, 0, 0));
        expectedCounts.put("ZAP_134", new CDSHelper.TimeAxisData("ZAP 134", 0, 4, 2, 10, 0, 0));

        final String yaxisScale = "\n0\n5000\n10000\n15000\n20000\n25000\n30000\n35000\n40000\n45000";
        final String studyDaysScales = "0\n200\n400\n600\n800\n1000" + yaxisScale;

        log("Verify ELISPOT Magnitude - Background subtracted and Study Days with axis collapsed and expanded.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertTrue("For ELISPOT Magnitude - Background subtracted vs Time Visit Days a study axis was not present.", cdsPlot.hasStudyAxis());
        List<WebElement> studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found" + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        // Get the element again to avoid the stale-element error.
        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        cdsPlot.validateVisitCounts(studies, expectedCounts);

        log("Validate that the tool-tips are as expected.");

        // Going to leave the values for the tool-tips hard coded here. Unlikely they would ever be used anywhere else.
        // Alternative to hard coding the values would be to write a generator that would build the expected tool-tips,
        // but that is more effort that I have time for now.
        expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add("RED 4");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Enrollment, Vaccination");
        cssPath = "div.bottomplot > svg > g:nth-child(2) > image:nth-of-type(1)";
        cdsPlot.timeAxisToolTipsTester(cssPath, expectedToolTipText);

        log("Move the mouse off of the current time axis point to clear any existing tool tips");
        mouseOver(Locator.xpath("//img[contains(@src, 'images/logo.png')]"));

        expectedToolTipText.clear();
        expectedToolTipText.add("RED 4");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Last Vaccination");
        cssPath = "div.bottomplot > svg > g:nth-child(2) > image:nth-of-type(6)";
        cdsPlot.timeAxisToolTipsTester(cssPath, expectedToolTipText);

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 111");
        expectedToolTipText.add("Group 1 Arm Ca Placebo: Enrollment, Vaccination");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 2 Arm Ca Placebo: Enrollment, Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 3 Arm Ca Placebo: Enrollment, Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 4 Arm Ca Placebo: Enrollment, Vaccination");
        expectedToolTipText.add("Group 4 Arm T4 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 5 Arm Cb Placebo: Enrollment, Vaccination");
        expectedToolTipText.add("Group 5 Arm T5 Vaccine: Enrollment, Vaccination");
        expectedToolTipText.add("Group 7 Arm Cb Placebo: Enrollment, Vaccination");
        expectedToolTipText.add("Group 7 Arm T7 Vaccine: Enrollment, Vaccination");
        cssPath = "div.bottomplot > svg > g:nth-child(4) > image:nth-of-type(1)";
        cdsPlot.timeAxisToolTipsTester(cssPath, expectedToolTipText);

        log("Verify that points in the main plot get highlighted when mousing over items on the Study Axis.");

        // Move the mouse out of the way so it doesn't interfer with the highlight count.
        mouseOver(Locator.css("div.logo > img[src$='logo.png']"));

        cssPath = "div.bottomplot > svg > g:nth-child(5) > image"; //[xlink:href$='nonvaccination_normal.svg']";
        scrollIntoView(Locator.css(cssPath));

        List<WebElement> weList = cdsPlot.findTimeAxisPointsWithData(cssPath, "nonvaccination_normal.svg");

        assertTrue("No glyphs in the time axis had a value indicating they had data.", weList.size() > 0);
        int totalCount = 0, highlightCount;

        for(WebElement we : weList)
        {
            // Hover over the element.
            builder = new Actions(getDriver());
            builder.moveToElement(we).perform();
            sleep(500);

            // Count the number of points that are highlighted in the main plot.
            highlightCount = cdsPlot.getPointCountByColor(cdsPlot.MOUSEOVER_FILL);
            log("Highlighted point count: " + highlightCount);
            totalCount = totalCount + highlightCount;
        }

        assertTrue("No points in the plot were highlighted when hovering over a time axis point.", totalCount > 0);

        log("Verify that points get highlighted when hovering over a time axis label.");
        cssPath = "div.bottomplot > svg > g:nth-child(5) > text.study-label";
        mouseOver(Locator.css(cssPath));

        sleep(500);
        highlightCount = cdsPlot.getPointCountByColor(cdsPlot.MOUSEOVER_FILL);
        assertTrue("No points in the plot were highlighted when hovering over a time axis study label.", highlightCount > 0);

        highlightCount = cdsPlot.getTimeAxisPointCountByImage("_hover.svg");
        assertTrue("No points in the time axis were highlighted when hovering over a time axis study label.", highlightCount > 0);

        log("Expand the time axis and verify the counts.");
        Locator.css("div.bottomplot > svg > g > image.img-expand").findElement(getDriver()).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        expectedCounts.clear();
        expectedCounts.put("RED_4", new CDSHelper.TimeAxisData("RED 4", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("RED_4-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 1, 3, 2, 5, 0, 0));
        expectedCounts.put("RED_4-Group_2_Arm_T2_Vaccine", new CDSHelper.TimeAxisData("Group 2 Arm T2 Vaccine", 1, 3, 1, 5, 1, 0));
        expectedCounts.put("ZAP_110", new CDSHelper.TimeAxisData("ZAP 110", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("ZAP_110-Group_1_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 1 Arm Ca Placebo", 1, 4, 1, 6, 0, 0));
        expectedCounts.put("ZAP_110-Group_2_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 2 Arm Ca Placebo", 1, 4, 1, 6, 0, 0));
        expectedCounts.put("ZAP_110-Group_7_Arm_T7_Vaccine", new CDSHelper.TimeAxisData("Group 7 Arm T7 Vaccine", 1, 4, 3, 4, 0, 0));
        expectedCounts.put("ZAP_111", new CDSHelper.TimeAxisData("ZAP 111", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("ZAP_111-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 1, 4, 2, 6, 0, 0));
        expectedCounts.put("ZAP_111-Group_3_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 3 Arm Ca Placebo", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_111-Group_4_Arm_T4_Vaccine", new CDSHelper.TimeAxisData("Group 4 Arm T4 Vaccine", 1, 4, 2, 6, 0, 0));
        expectedCounts.put("ZAP_134", new CDSHelper.TimeAxisData("ZAP 134", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("ZAP_134-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 0, 4, 2, 10, 0, 0));
        expectedCounts.put("ZAP_134-Group_2_Arm_C1_Placebo", new CDSHelper.TimeAxisData("Group 2 Arm C1 Placebo", 0, 4, 1, 11, 0, 0));

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected 35 studies in the Time Axis, found" + studies.size() + ".", studies.size() == 35);
        cdsPlot.validateVisitCounts(studies, expectedCounts);
        log("The counts are as expected.");

        log("Validate that the tool-tips are as expected when expanded.");

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 110 - Day 455");
        expectedToolTipText.add("Group 6 Arm T6 Vaccine: Follow-Up");
        cssPath = "div.bottomplot > svg > g:nth-child(18) > image:nth-of-type(10)";
        cdsPlot.timeAxisToolTipsTester(cssPath, expectedToolTipText);

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 111 - Day 364");
        expectedToolTipText.add("Group 5 Arm T5 Vaccine: Follow-Up");
        cssPath = "div.bottomplot > svg > g:nth-child(31) > image:nth-of-type(8)";
        cdsPlot.timeAxisToolTipsTester(cssPath, expectedToolTipText);

        log("Change time axis alignment and validate things remain the same.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        expectedCounts.put("ZAP_111-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 1, 4, 2, 6, 0, 0));
        expectedCounts.put("ZAP_111-Group_3_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 3 Arm Ca Placebo", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_111-Group_4_Arm_T4_Vaccine", new CDSHelper.TimeAxisData("Group 4 Arm T4 Vaccine", 1, 4, 2, 6, 0, 0));
        expectedCounts.put("ZAP_134-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 0, 4, 2, 10, 0, 0));
        expectedCounts.put("ZAP_134-Group_2_Arm_C1_Placebo", new CDSHelper.TimeAxisData("Group 2 Arm C1 Placebo", 0, 4, 1, 11, 0, 0));

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected 35 studies in the Time Axis, found" + studies.size() + ".", studies.size() == 35);
        cdsPlot.validateVisitCounts(studies, expectedCounts);
        log("The counts are as expected.");

        log("Validate that the tool-tips are as expected when expanded.");

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 111 - Day 182");
        expectedToolTipText.add("Group 1 Arm Ca Placebo: Follow-Up");
        cssPath = "div.bottomplot > svg > g.study:nth-child(22) > image.visit-tag[x^='3']";
        cdsPlot.timeAxisToolTipsTester(cssPath, expectedToolTipText);

    }

    @Test
    public void verifyTimeAxisFilter()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        String cssPath;
        Actions builder; // Used to manuver the WebElement.

        final String yaxisScale = "\n0\n5000\n10000\n15000\n20000\n25000\n30000\n35000\n40000\n45000";
        final String studyDaysScales = "0\n200\n400\n600\n800\n1000" + yaxisScale;

        log("Plot ELISPOT Magnitude - Background subtracted vs Study Days.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        assertTrue("For ELISPOT Magnitude - Background subtracted vs Time Visit Days a study axis was not present.", cdsPlot.hasStudyAxis());

        cssPath = "div.bottomplot > svg > g:nth-child(2) > text.study-label";
        click(Locator.css(cssPath));
        assertTextPresent("Study = RED 4", 1);

        clickButton("Filter", 0);

        InfoPane ip = new InfoPane(this);
        ip.waitForSpinners();
        sleep(500);

        assertEquals("Subjects count not as expected.", 60, ip.getSubjectCount());
        assertEquals("Species count not as expected.", 1, ip.getSpeciesCount());
        assertEquals("Studies count not as expected.", 1, ip.getStudiesCount());
        assertEquals("Product count not as expected.", 1, ip.getProductCount());
        assertEquals("Treatments count not as expected.", 3, ip.getTreatmentsCount());
        assertEquals("Time Points count not as expected.", 3, ip.getTimePointsCount());
        assertEquals("Antigens In Y count not as expected.", 9, ip.getAntigensInYCount());

        cssPath = "div.bottomplot > svg > g:nth-child(2) > image";
        List<WebElement> weList = cdsPlot.findTimeAxisPointsWithData(cssPath, "challenge_normal.svg");

        assertTrue("No glyphs in the time axis had a value indicating they had data.", weList.size() > 0);

        log("Mouse over the challenge glyph in the time axis.");
        builder = new Actions(getDriver());
        builder.moveToElement(weList.get(0), 0, 4).perform();
        sleep(1000);

        assertTextPresent("Group 1 Arm T1");

        log("Dismiss the tool tip");
        mouseOver(Locator.xpath("//img[contains(@src, 'images/logo.png')]"));

        log("Click the challenge glyph in the time axis to apply it as a filter.");
        builder = new Actions(getDriver());
        builder.moveToElement(weList.get(0)).click().build().perform();
        clickButton("Filter", 0);

        ip.waitForSpinners();
        sleep(500);

        assertEquals("Subjects count not as expected.", 58, ip.getSubjectCount());
        assertEquals("Species count not as expected.", 1, ip.getSpeciesCount());
        assertEquals("Studies count not as expected.", 1, ip.getStudiesCount());
        assertEquals("Product count not as expected.", 1, ip.getProductCount());
        assertEquals("Treatments count not as expected.", 3, ip.getTreatmentsCount());
        assertEquals("Time Points count not as expected.", 1, ip.getTimePointsCount());
        assertEquals("Antigens In Y count not as expected.", 9, ip.getAntigensInYCount());

    }

    @Test
    public void verifyDiscreteTimeVariables()
    {
        String scaleValues;

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Choose the y-axis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERIC50);
        yaxis.confirmSelection();

        log("Choose 'Study days (discrete)'.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DISCRETE_DAYS);
        xaxis.confirmSelection();

        scaleValues = "0\n28\n42\n98\n112\n168\n182\n196\n210\n238\n273\n317\n364\n546\n3\n30\n300\n3000";

        cds.assertPlotTickText(1, scaleValues);

        log("Choose 'Study weeks (discrete)'.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DISCRETE_WEEKS);
        xaxis.confirmSelection();

        scaleValues = "0\n4\n6\n14\n16\n24\n26\n28\n30\n34\n39\n45\n52\n78\n3\n30\n300\n3000";

        cds.assertPlotTickText(1, scaleValues);

        log("Choose 'Study months (discrete)'.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DISCRETE_MONTHS);
        xaxis.confirmSelection();

        scaleValues = "0\n1\n3\n5\n6\n7\n8\n10\n11\n17\n3\n30\n300\n3000";

        cds.assertPlotTickText(1, scaleValues);

        log("Apply the time axis as a filter.");
        cdsPlot.selectXAxes(false, "5", "8", "6", "11");
        waitForElement(CDSPlot.Locators.filterDataButton);
        assertElementPresent(CDSPlot.Locators.removeButton);
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));
        sleep(3000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        scaleValues = "5\n6\n8\n11\n3\n30\n300\n3000";

        cds.assertPlotTickText(1, scaleValues);

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.TIME_POINTS);
        coloraxis.pickVariable(CDSHelper.TIME_POINTS_DISCRETE_DAYS);
        coloraxis.confirmSelection();

        int glyphCount = cdsPlot.getPointCountByGlyph(CDSPlot.PlotGlyphs.asterisk);
        assertEquals("Did not find the number of expected asterisk glyphs.", 74, glyphCount);

    }

}