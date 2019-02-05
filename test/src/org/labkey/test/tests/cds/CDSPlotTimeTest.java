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

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.InfoPane;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@Category({Git.class})
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

    @Test
    public void verifyTimeAxisBasic()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        Map<String, CDSHelper.TimeAxisData> expectedCounts = new HashMap<>();
        expectedCounts.put("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.put("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.put("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 2, 20, 0, 0));
        expectedCounts.put("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));
        expectedCounts.put("ZAP_135", new CDSHelper.TimeAxisData("ZAP 135", 0, 0, 0, 0, 0, 0));

        final String yaxisScale = "\n0\n100\n200\n300\n400\n500\n600\n700";
        final String studyDaysScales = "0\n100\n200\n300\n400\n500\n600" + yaxisScale;
        final String studyDaysScaleAligedVaccination = "-300\n-200\n-100\n0\n100\n200\n300" + yaxisScale;
        final String studyWeeksScales = "0\n20\n40\n60\n80" + yaxisScale;
        final String studyWeeksScalesAlignedVaccination = "-40\n-20\n0\n20\n40" + yaxisScale;
        final String studyMonthsScales = "0\n5\n10\n15\n20" + yaxisScale;
        final String studyMonthsScalesAlignedVaccination = "-10\n-5\n0\n5\n10" + yaxisScale;

        log("Verify NAb Titer ID50, A3R5 and Study Days.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.setTargetCell(CDSHelper.TARGET_CELL_A3R5);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();

        assertTrue("For NAb Titer 50, A3R5 vs Time Visit Days a study axis was not present.", cdsPlot.hasStudyAxis());
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyDaysScales);

        log("Change x-axis to Study weeks, verify visit counts change as expected.");
        xaxis.openSelectorWindow();
        // Should go to the variable selector window by default.
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.confirmSelection();

        // Need to get studies again, otherwise get a stale element error.
        List<WebElement> studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());
        log("Study count was as expected.");

        // Modify expected number of icons to be visible (we should not have overlapping vacc. and follow-up icons).
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 2, 15, 0, 0));

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
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 1, 1, 4, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 2, 1, 0, 4, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 2, 4, 1, 9, 0, 0));
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
        // pre-enrollment has been removed temporarily. Previously QED, YOYO and ZAP 133 had pre-enrollment.
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 2, 1, 5, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 3, 1, 5, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 2, 20, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 0, 4, 1, 5, 0, 0));

        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyDaysScales);

        log("Change x-axis alignment to First Vaccination, verify visit counts are as expected.");
        xaxis.openSelectorWindow();
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyDaysScales);

        log("Change x-axis alignment to Last Vaccination, verify visit counts are as expected.");
        xaxis.openSelectorWindow();
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyDaysScaleAligedVaccination);

        log("Change x-axis to Study weeks, and go back to aligned by Enrollment, verify visit are as expected.");
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 2, 15, 0, 0));
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyWeeksScales);

        log("Change x-axis Aligned by First Vaccination, verify visit are as expected.");
        xaxis.openSelectorWindow();
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyWeeksScales);

        log("Change x-axis Aligned by Last Vaccination, verify visit are as expected.");
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 0, 6, 2, 15, 0, 0));
        xaxis.openSelectorWindow();
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyWeeksScalesAlignedVaccination);

        log("Change x-axis to Study months, and go back to aligned by Enrollment, verify visit are as expected.");
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 1, 1, 1, 4, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 2, 1, 0, 4, 0, 3));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 2, 4, 1, 9, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 1, 2, 0, 5, 0, 0));
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyMonthsScales);

        log("Change x-axis Aligned by First Vaccination, verify visit are as expected.");
        xaxis.openSelectorWindow();
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyMonthsScales);

        log("Change x-axis Aligned by Last Vaccination, verify visit are as expected.");
        expectedCounts.replace("QED_2", new CDSHelper.TimeAxisData("QED 2", 2, 1, 0, 3, 0, 0));
        expectedCounts.replace("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 2, 2, 0, 2, 0, 2));
        expectedCounts.replace("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 3, 3, 0, 11, 0, 0));
        expectedCounts.replace("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 1, 3, 0, 3, 0, 0));
        xaxis.openSelectorWindow();
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();
        verifyStudyAxisPlot(expectedCounts, true);
        cds.assertPlotTickText(studyMonthsScalesAlignedVaccination);

        click(CDSHelper.Locators.cdsButtonLocator("clear"));

        // Makes the test a little more reliable.
        waitForElement(Locator.xpath("//div[contains(@class, 'noplotmsg')][not(contains(@style, 'display: none'))]"));
    }

    private void verifyStudyAxisPlot(Map<String, CDSHelper.TimeAxisData> expectedCounts, boolean checkRowCount)
    {
        List<WebElement> studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());

        if (checkRowCount)
            assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());

        cdsPlot.validateVisitCounts(studies, expectedCounts);
    }

    @Test
    public void verifyTimeAxisWithMultipleSchedules()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        List<String> expectedToolTipText;
        Actions builder; // Used to hover the WebElement over a tag.

        Map expectedCounts = new HashMap<String, CDSHelper.TimeAxisData>();
        expectedCounts.put("RED_4", new CDSHelper.TimeAxisData("RED 4", 1, 3, 1, 5, 1, 0));
        expectedCounts.put("ZAP_110", new CDSHelper.TimeAxisData("ZAP 110", 1, 4, 3, 4, 0, 0));
        expectedCounts.put("ZAP_111", new CDSHelper.TimeAxisData("ZAP 111", 1, 4, 2, 6, 0, 0));
        expectedCounts.put("ZAP_134", new CDSHelper.TimeAxisData("ZAP 134", 0, 4, 1, 11, 0, 0));

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
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Enrollment & First Vaccination");
        cdsPlot.timeAxisToolTipsTester(1,9, expectedToolTipText);

        log("Move the mouse off of the current time axis point to clear any existing tool tips");
        mouseOver(Locator.xpath("//img[contains(@src, 'images/logo.png')]"));

        expectedToolTipText.clear();
        expectedToolTipText.add("RED 4");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Last Vaccination");
        cdsPlot.timeAxisToolTipsTester(1, 5, expectedToolTipText);

        log("Move the mouse off of the current time axis point to clear any existing tool tips");
        mouseOver(Locator.xpath("//img[contains(@src, 'images/logo.png')]"));

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 111");
        expectedToolTipText.add("Group 1 Arm Ca Placebo: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 2 Arm Ca Placebo: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 3 Arm Ca Placebo: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 4 Arm Ca Placebo: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 4 Arm T4 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 5 Arm Cb Placebo: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 5 Arm T5 Vaccine: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 7 Arm Cb Placebo: Enrollment & First Vaccination");
        expectedToolTipText.add("Group 7 Arm T7 Vaccine: Enrollment & First Vaccination");
        cdsPlot.timeAxisToolTipsTester(3, 11, expectedToolTipText);

        log("Verify that points in the main plot get highlighted when mousing over items on the Study Axis.");

        // Move the mouse out of the way so it doesn't interfer with the highlight count.
        mouseOver(Locator.css("div.logo > img[src$='logo.png']"));

        String cssPath = "div.bottomplot > svg > g:nth-child(5) > image"; //[xlink:href$='nonvaccination_normal.svg']";
        scrollIntoView(Locator.css(cssPath));

        List<WebElement> weList = cdsPlot.findTimeAxisPointsWithData(cssPath, "nonvaccination_normal.svg");

        assertTrue("No glyphs in the time axis had a value indicating they had data.", weList.size() > 0);
        int totalCount = 0, highlightCount;

        for (WebElement we : weList)
        {
            // Hover over the element.
            builder = new Actions(getDriver());
            builder.moveToElement(we).perform();
            sleep(1000);

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
        cdsPlot.toggleTimeAxisExpandCollapseState();

        expectedCounts.clear();
        expectedCounts.put("RED_4", new CDSHelper.TimeAxisData("RED 4", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("RED_4-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 1, 3, 2, 5, 0, 0));
        expectedCounts.put("RED_4-Group_2_Arm_T2_Vaccine", new CDSHelper.TimeAxisData("Group 2 Arm T2 Vaccine", 1, 3, 1, 5, 1, 0));
        expectedCounts.put("ZAP_110", new CDSHelper.TimeAxisData("ZAP 110", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("ZAP_110-Group_1_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 1 Arm Ca Placebo", 1, 4, 1, 6, 0, 0));
        expectedCounts.put("ZAP_110-Group_2_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 2 Arm Ca Placebo", 1, 4, 0, 7, 0, 0));
        expectedCounts.put("ZAP_110-Group_7_Arm_T7_Vaccine", new CDSHelper.TimeAxisData("Group 7 Arm T7 Vaccine", 1, 4, 2, 5, 0, 0));
        expectedCounts.put("ZAP_111", new CDSHelper.TimeAxisData("ZAP 111", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("ZAP_111-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_111-Group_3_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 3 Arm Ca Placebo", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_111-Group_4_Arm_T4_Vaccine", new CDSHelper.TimeAxisData("Group 4 Arm T4 Vaccine", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_134", new CDSHelper.TimeAxisData("ZAP 134", 0, 0, 0, 0, 0, 0));
        expectedCounts.put("ZAP_134-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 0, 4, 1, 11, 0, 0));
        expectedCounts.put("ZAP_134-Group_2_Arm_C1_Placebo", new CDSHelper.TimeAxisData("Group 2 Arm C1 Placebo", 0, 4, 1, 11, 0, 0));

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected 35 studies in the Time Axis, found" + studies.size() + ".", studies.size() == 35);
        cdsPlot.validateVisitCounts(studies, expectedCounts);
        log("The counts are as expected.");

        log("Validate that the tool-tips are as expected when expanded.");

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 110: +455 Days");
        expectedToolTipText.add("Group 6 Arm T6 Vaccine: Follow-Up");
        cdsPlot.timeAxisToolTipsTester(17, 8, expectedToolTipText);

        log("Move the mouse off of the current time axis point to clear any existing tool tips");
        mouseOver(Locator.xpath("//img[contains(@src, 'images/logo.png')]"));

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 111: +364 Days");
        expectedToolTipText.add("Group 5 Arm T5 Vaccine: Follow-Up");
        cdsPlot.timeAxisToolTipsTester(30, 10, expectedToolTipText);

        log("Change time axis alignment and validate things remain the same.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        expectedCounts.put("ZAP_111-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_111-Group_3_Arm_Ca_Placebo", new CDSHelper.TimeAxisData("Group 3 Arm Ca Placebo", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_111-Group_4_Arm_T4_Vaccine", new CDSHelper.TimeAxisData("Group 4 Arm T4 Vaccine", 1, 4, 1, 7, 0, 0));
        expectedCounts.put("ZAP_134-Group_1_Arm_T1_Vaccine", new CDSHelper.TimeAxisData("Group 1 Arm T1 Vaccine", 0, 4, 1, 11, 0, 0));
        expectedCounts.put("ZAP_134-Group_2_Arm_C1_Placebo", new CDSHelper.TimeAxisData("Group 2 Arm C1 Placebo", 0, 4, 1, 11, 0, 0));

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected 35 studies in the Time Axis, found" + studies.size() + ".", studies.size() == 35);
        cdsPlot.validateVisitCounts(studies, expectedCounts);
        log("The counts are as expected.");

        log("Validate that the tool-tips are as expected when expanded.");

        expectedToolTipText.clear();
        expectedToolTipText.add("ZAP 111: -13 Weeks");
        expectedToolTipText.add("Group 1 Arm Ca Placebo: Follow-Up");
        cdsPlot.timeAxisToolTipsTester(21, 7, expectedToolTipText);

        log("Move the mouse off of the current time axis point to clear any existing tool tips");
        mouseOver(Locator.xpath("//img[contains(@src, 'images/logo.png')]"));
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
        builder.moveToElement(weList.get(0), 1, 4).perform();
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
    public void verifyInfoPaneTimepointAlignment()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.setPlotType(CDSHelper.PLOT_TYPE_BOX);
        xaxis.setAlignedBy(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        xaxis.confirmSelection();

        sleep(CDSHelper.CDS_WAIT);

        yaxis.pickSource(CDSHelper.ELISPOT);
        yaxis.pickVariable(CDSHelper.ELISPOT_MAGNITUDE_BACKGROUND_SUB);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();

        InfoPane infoPane = new InfoPane(this);
        infoPane.clickActiveFilter("In the plot");
        String ipText = getText(Locator.css("div.infopane"));
        assertTrue(ipText.contains(CDSHelper.PLOT_TYPE_BOX));
        assertTrue(ipText.contains(CDSHelper.TIME_POINTS_ALIGN_LAST_VAC));
        click(CDSHelper.Locators.cdsButtonLocator("Close", "infoplotcancel"));

        infoPane.clickTimePointsCount();
        assertEquals(3, cds.getInfoPaneSortOptions("Study days"));
    }

    @Test
    public void verifyTimepointAlignmentScenario1()
    {
        // Scenario #1: Only one vaccination for a given group, in which case the first vaccination and the last vaccination are the same visit
        // Test Data Study ZAP 105 (Group 2 Arm BB has one vaccination marked as both first and last vaccination)
        initTimePointPlotSelection(CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, null);
        String studyName = "ZAP 105";
        filterForSingleStudy(studyName);
        _asserts.assertFilterStatusCounts(48, 1, 1, 1, 4);
        CDSHelper.TimeAxisData timeAxisData = new CDSHelper.TimeAxisData(studyName, 3, 0, 2, 7, 0, 3);
        String expectedPlotTickText = "0\n20\n40\n60\n80\n100\n120\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7\n0.8\n0.9\n1\n1.1\n1.2";
        validateStudyScenarioPlot("ZAP_105", 94, timeAxisData, true, expectedPlotTickText);

        // verify the expected study axis hover text is shown for this study
        List<String> expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add(studyName + ": +114 Days");
        expectedToolTipText.add("Group 1 Arm AA Vaccine: Follow-up");
        expectedToolTipText.add("Group 1 Arm BB Placebo: First Vaccination & Last Vaccination");
        cdsPlot.timeAxisToolTipsTester(1, 15, expectedToolTipText);

        // expand the study axis and check Group 2 Arm BB treatment group for each plot alignment option
        cdsPlot.toggleTimeAxisExpandCollapseState();
        timeAxisData = new CDSHelper.TimeAxisData("Group 2 Arm BB Vaccine", 1, 0, 1, 5, 0, 1);
        validateStudyScenarioPlot("ZAP_105-Group_2_Arm_BB_Placebo", 94, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        validateStudyScenarioPlot("ZAP_105-Group_2_Arm_BB_Placebo", 94, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        expectedPlotTickText = "-100\n-80\n-60\n-40\n-20\n0\n20\n40\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7\n0.8\n0.9\n1\n1.1\n1.2";
        validateStudyScenarioPlot("ZAP_105-Group_2_Arm_BB_Placebo", 94, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        validateStudyScenarioPlot("ZAP_105-Group_2_Arm_BB_Placebo", 94, timeAxisData, false, expectedPlotTickText);
    }

    @Test
    public void verifyTimepointAlignmentScenario2()
    {
        // Scenario #2: No vaccinations given to any groups
        // Test Data Study ZAP 136 (No visit tags for this study, but set enrollment/firstvacc/lastvacc to day 0 for group 1 and day 208 for group 2)
        initTimePointPlotSelection(CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, null);
        String studyName = "ZAP 136";
        filterForSingleStudy(studyName);
        // includes "unknown" treatment group because only 34 of the 219 subjects have a treatment arm mapping in the test data
        _asserts.assertFilterStatusCounts(219, 1, 1, 1, 3);
        CDSHelper.TimeAxisData timeAxisData = new CDSHelper.TimeAxisData(studyName, 0, 0, 1, 21, 0, 0);
        String expectedPlotTickText = "0\n200\n400\n600\n800\n1000\n1200\n1400\n-0.1\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6";
        validateStudyScenarioPlot("ZAP_136", 219, timeAxisData, true, expectedPlotTickText);

        // verify the expected study axis hover text is shown for this study
        List<String> expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add(studyName + ": 0 Days");
        expectedToolTipText.add("Group All Arm 1 Vaccine: Follow-up");
        expectedToolTipText.add("Group All Arm 2 Placebo: Follow-up");
        cdsPlot.timeAxisToolTipsTester(1, 1, expectedToolTipText);

        // expand the study axis and check Group All Arm 2 treatment group for each plot alignment option
        cdsPlot.toggleTimeAxisExpandCollapseState();
        validateStudyScenarioPlot("ZAP_136-Group_All_Arm_2_Placebo", 219, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        expectedPlotTickText = "-1000\n-500\n0\n500\n1000\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6";
        validateStudyScenarioPlot("ZAP_136-Group_All_Arm_2_Placebo", 27, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        validateStudyScenarioPlot("ZAP_136-Group_All_Arm_2_Placebo", 27, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        validateStudyScenarioPlot("ZAP_136-Group_All_Arm_2_Placebo", 27, timeAxisData, false, expectedPlotTickText);
    }

    @Test
    public void verifyTimepointAlignmentScenario3()
    {
        // Scenario #3: Vaccinations given prior to Day 0
        // Test Data Study RED 6 (Three visits before day 0, one of which is the firstvacc and another is enrollment)
        initTimePointPlotSelection(CDSHelper.ICS, CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB, null);
        String studyName = "RED 6";
        filterForSingleStudy(studyName);
        _asserts.assertFilterStatusCounts(35, 1, 1, 1, 1);
        CDSHelper.TimeAxisData timeAxisData = new CDSHelper.TimeAxisData(studyName, 2, 2, 1, 13, 0, 0);
        String expectedPlotTickText = "-100\n-50\n0\n50\n100\n150\n200\n250\n300\n350\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7";
        validateStudyScenarioPlot("RED_6", 96, timeAxisData, true, expectedPlotTickText);

        // verify the expected study axis hover text is shown for this study
        List<String> expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add(studyName + ": -50 Days");
        expectedToolTipText.add("Group T1 Arm T1 Vaccine: Enrollment");
        cdsPlot.timeAxisToolTipsTester(1, 2, expectedToolTipText);

        // expand the study axis and check Group T1 treatment group for each plot alignment option
        cdsPlot.toggleTimeAxisExpandCollapseState();
        validateStudyScenarioPlot("RED_6-Group_T1_Arm_T1_Vaccine", 96, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        expectedPlotTickText = "-50\n0\n50\n100\n150\n200\n250\n300\n350\n400\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7";
        validateStudyScenarioPlot("RED_6-Group_T1_Arm_T1_Vaccine", 96, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        expectedPlotTickText = "0\n50\n100\n150\n200\n250\n300\n350\n400\n450\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7";
        validateStudyScenarioPlot("RED_6-Group_T1_Arm_T1_Vaccine", 96, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        expectedPlotTickText = "-250\n-200\n-150\n-100\n-50\n0\n50\n100\n150\n0\n0.1\n0.2\n0.3\n0.4\n0.5\n0.6\n0.7";
        validateStudyScenarioPlot("RED_6-Group_T1_Arm_T1_Vaccine", 96, timeAxisData, false, expectedPlotTickText);
    }

    @Test
    public void verifyTimepointAlignmentScenario4()
    {
        // Scenario #4: One or more treatment groups are control groups that do not receive any vaccinations
        // Test Data Study QED 2 (Group V given no vaccines but has enrollment/firstvacc/lastvacc set, also has placeholder visit for setting lastvacc)
        initTimePointPlotSelection(CDSHelper.NAB, CDSHelper.NAB_TITERID50, CDSHelper.TARGET_CELL_A3R5);
        String studyName = "QED 2";
        filterForSingleStudy(studyName);
        _asserts.assertFilterStatusCounts(43, 1, 1, 1, 4);
        CDSHelper.TimeAxisData timeAxisData = new CDSHelper.TimeAxisData(studyName, 1, 2, 1, 5, 0, 0);
        String expectedPlotTickText = "0\n50\n100\n150\n200\n250\n300\n350\n0\n50\n100\n150\n200\n250\n300\n350\n400";
        validateStudyScenarioPlot("QED_2", 1075, timeAxisData, true, expectedPlotTickText);

        // verify the expected study axis hover text is shown for this study
        List<String> expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add(studyName + ": +84 Days");
        expectedToolTipText.add("Group I Arm T1 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group II Arm T2 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group III Arm T3 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group IV Arm T4 Vaccine: Last Vaccination");
        cdsPlot.timeAxisToolTipsTester(1, 4, expectedToolTipText);

        // expand the study axis and check Group V treatment group for each plot alignment option
        cdsPlot.toggleTimeAxisExpandCollapseState();
        timeAxisData = new CDSHelper.TimeAxisData(studyName, 0, 0, 2, 7, 0, 0);
        validateStudyScenarioPlot("QED_2-Group_V_Arm_C_Placebo", 1075, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        validateStudyScenarioPlot("QED_2-Group_V_Arm_C_Placebo", 1075, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        validateStudyScenarioPlot("QED_2-Group_V_Arm_C_Placebo", 1075, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        expectedPlotTickText = "-50\n0\n50\n100\n150\n200\n250\n0\n50\n100\n150\n200\n250\n300\n350\n400";
        validateStudyScenarioPlot("QED_2-Group_V_Arm_C_Placebo", 1075, timeAxisData, false, expectedPlotTickText);
    }

    @Test
    public void verifyTimepointAlignmentScenario5()
    {
        // Scenario #5: Vaccination and challenge are on the same day
        // Test Data Study YOYO 55 (Group 3 Arm T3 has day 168 as both Last Vaccination and Challenge, vaccination icon should be shown)
        initTimePointPlotSelection(CDSHelper.NAB, CDSHelper.NAB_TITERID50, CDSHelper.TARGET_CELL_A3R5);
        String studyName = "YOYO 55";
        filterForSingleStudy(studyName);
        _asserts.assertFilterStatusCounts(88, 1, 1, 1, 8);
        CDSHelper.TimeAxisData timeAxisData = new CDSHelper.TimeAxisData(studyName, 1, 3, 1, 5, 0, 3);
        String expectedPlotTickText = "0\n100\n200\n300\n400\n500\n0\n100\n200\n300\n400\n500\n600\n700";
        validateStudyScenarioPlot("YOYO_55", 1408, timeAxisData, true, expectedPlotTickText);

        // verify the expected study axis hover text is shown for this study
        List<String> expectedToolTipText = new ArrayList<>();
        expectedToolTipText.add(studyName + ": +168 Days");
        expectedToolTipText.add("Group 1 Arm C1 Placebo: Last Vaccination");
        expectedToolTipText.add("Group 1 Arm T1 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group 2 Arm C2 Placebo: Last Vaccination");
        expectedToolTipText.add("Group 2 Arm T2 Vaccine: Last Vaccination");
        expectedToolTipText.add("Group 3 Arm C3 Placebo: Last Vaccination");
        expectedToolTipText.add("Group 3 Arm T3 Vaccine: Last Vaccination & Challenge");
        expectedToolTipText.add("Group 4 Arm C4 Placebo: Last Vaccination");
        expectedToolTipText.add("Group 4 Arm T4 Vaccine: Last Vaccination");
        cdsPlot.timeAxisToolTipsTester(1, 6, expectedToolTipText);

        // expand the study axis and check Group V treatment group for each plot alignment option
        cdsPlot.toggleTimeAxisExpandCollapseState();
        timeAxisData = new CDSHelper.TimeAxisData(studyName, 1, 3, 1, 7, 0, 1);
        validateStudyScenarioPlot("YOYO_55-Group_3_Arm_T3_Vaccine", 1408, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_ENROLL);
        validateStudyScenarioPlot("YOYO_55-Group_3_Arm_T3_Vaccine", 1408, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_FIRST_VAC);
        validateStudyScenarioPlot("YOYO_55-Group_3_Arm_T3_Vaccine", 1408, timeAxisData, false, expectedPlotTickText);
        changeTimePointAlignment(CDSHelper.TIME_POINTS_DAYS, CDSHelper.TIME_POINTS_ALIGN_LAST_VAC);
        expectedPlotTickText = "-100\n0\n100\n200\n300\n0\n100\n200\n300\n400\n500\n600\n700";
        validateStudyScenarioPlot("YOYO_55-Group_3_Arm_T3_Vaccine", 1408, timeAxisData, false, expectedPlotTickText);
    }

    private void initTimePointPlotSelection(String yAxisSource, String yAxisVariable, @Nullable String targetCell)
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT);
        
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        yaxis.pickSource(yAxisSource);
        yaxis.pickVariable(yAxisVariable);
        if (targetCell != null)
            yaxis.setTargetCell(targetCell);
        yaxis.setScale(DataspaceVariableSelector.Scale.Linear);
        yaxis.confirmSelection();
        _ext4Helper.waitForMaskToDisappear();
    }

    private void changeTimePointAlignment(String variable, String alignment)
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();
        xaxis.pickVariable(variable);
        xaxis.setAlignedBy(alignment);
        xaxis.confirmSelection();
    }

    private void filterForSingleStudy(String studyName)
    {
        cds.openStatusInfoPane("Studies");
        cds.selectInfoPaneItem(studyName, true);
        click(CDSHelper.Locators.cdsButtonLocator("Filter", "filterinfoaction"));
        sleep(CDSHelper.CDS_WAIT);
    }

    private void validateStudyScenarioPlot(String studyAxisRowId, int pointCount, CDSHelper.TimeAxisData timeAxisData, boolean checkRowCount, String plotTickText)
    {
        assertEquals("Plot point count not as expected", pointCount, cdsPlot.getPointCount());

        Map<String, CDSHelper.TimeAxisData> studyAxisIconCounts = new HashMap<>();
        studyAxisIconCounts.put(studyAxisRowId, timeAxisData);
        verifyStudyAxisPlot(studyAxisIconCounts, checkRowCount);

        cds.assertPlotTickText(plotTickText);
    }

    @Test
    public void verifyDiscreteTimeVariables()
    {
        Pattern pattern;

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Choose the y-axis.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.confirmSelection();

        log("Choose 'Study days with axis type Categorical'.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.setPlotType(CDSHelper.PLOT_TYPE_BOX);
        xaxis.confirmSelection();

        pattern = Pattern.compile("^0137.*3303003000");
        cds.assertPlotTickText(1, pattern);

        log("Choose 'Study weeks with axis type Categorical'.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_WEEKS);
        xaxis.setPlotType(CDSHelper.PLOT_TYPE_BOX);
        xaxis.confirmSelection();

        pattern = Pattern.compile("^0124.*3303003000");
        cds.assertPlotTickText(1, pattern);

        log("Choose 'Study months with axis type Categorical'.");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_MONTHS);
        xaxis.setPlotType(CDSHelper.PLOT_TYPE_BOX);
        xaxis.confirmSelection();

        pattern = Pattern.compile("^0123.*3303003000");
        cds.assertPlotTickText(1, pattern);

        log("Apply the time axis as a filter.");
        cdsPlot.selectXAxes(false, "5", "8", "6", "11", "17");
        waitForElement(CDSPlot.Locators.filterDataButton);
        assertElementPresent(CDSPlot.Locators.removeButton);
        waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter"));
        sleep(3000); // Let the plot redraw.
        _ext4Helper.waitForMaskToDisappear();

        pattern = Pattern.compile("^0123.*3303003000");
        cds.assertPlotTickText(1, pattern);

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.TIME_POINTS);
        coloraxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        coloraxis.confirmSelection();

        int glyphCount = cdsPlot.getPointCountByGlyph(CDSPlot.PlotGlyphs.asterisk);
        assertEquals("Did not find the number of expected asterisk glyphs.", 74, glyphCount);

        log("Validate that various counts in the time axis are as expected.");
        Map expectedCounts = new HashMap<String, CDSHelper.TimeAxisData>();
        expectedCounts.put("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 2, 0, 4, 1, 2));
        expectedCounts.put("ZAP_128", new CDSHelper.TimeAxisData("ZAP 128", 1, 5, 0, 10, 0, 0));
        expectedCounts.put("ZAP_133", new CDSHelper.TimeAxisData("ZAP 133", 1, 2, 0, 5, 0, 0));
        expectedCounts.put("ZAP_135", new CDSHelper.TimeAxisData("ZAP 135", 0, 0, 0, 0, 0, 0));

        List<WebElement> studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        cdsPlot.validateVisitCounts(studies, expectedCounts);

        log("Filter on one study in the Study Axis.");
        String cssPath = "div.bottomplot > svg > g:nth-child(2) > text.study-label";
        click(Locator.css(cssPath));
        assertTextPresent("Study = YOYO 55", 1);

        clickButton("Filter", 0);
        log("Wait for one of the other studies to disappear before moving on.");
        waitForTextToDisappear("ZAP 117", 5000);

        pattern = Pattern.compile("^0123.*330300.*");
        cds.assertPlotTickText(1, pattern);

        expectedCounts.clear();
        expectedCounts.put("YOYO_55", new CDSHelper.TimeAxisData("YOYO 55", 1, 2, 0, 4, 1, 2));

        studies = CDSPlot.Locators.timeAxisStudies.findElements(getDriver());
        assertTrue("Expected " + expectedCounts.size() + " studies in the Time Axis, found " + studies.size() + ".", studies.size() == expectedCounts.size());

        cdsPlot.validateVisitCounts(studies, expectedCounts);

        log("Mouse over the challenge glyph and verify that the number of points that are highlighted on the plot are as expected.");
        int hCount = 0;
        cssPath = "div.bottomplot > svg > g:nth-child(2) > image";
        List<WebElement> wes = Locator.css(cssPath).findElements(getDriver());
        for (WebElement we : wes)
        {
            if (we.getAttribute("href").toLowerCase().contains("challenge_normal.svg"))
            {
                we.click();
                hCount = cdsPlot.getPointCountByColor(CDSHelper.PLOT_POINT_HIGHLIGHT_COLOR);
                break;
            }
        }

        assertEquals("Number of highlighted points not as expected.", 546, hCount);
    }

    @Test
    public void verifyGutterPlotAfterTimeFilter()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);
        int pointCount;

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        log("Set the y-axis to Elispot, Magnitude Background Subtracted.");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.NAB);
        yaxis.pickVariable(CDSHelper.NAB_TITERID50);
        yaxis.confirmSelection();

        log("Set the x-axis to ICS Magnitude Background Subtracted.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.confirmSelection();

        log("Set the color variable.");
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.STUDY_TREATMENT_VARS);
        coloraxis.pickVariable(CDSHelper.DEMO_STUDY_NAME);
        coloraxis.confirmSelection();

        log("Validate that there is a gutter plot on the x and y axes.");
        Assert.assertTrue("There was no gutter plot on the x-axis. This plot cannot be used to validate this fix.", cdsPlot.hasXGutter());
        assertTrue("There is a gutter plot on the x-axis, but there are no data points in it. This plot cannot be used to validate this fix.", cdsPlot.getXGutterPlotPointCount() > 0 );
        Assert.assertTrue("There was no gutter plot on the y-axis. This plot cannot be used to validate this fix.", cdsPlot.hasYGutter());
        assertTrue("There is a gutter plot on the y-axis, but there are no data points in it. This plot cannot be used to validate this fix.", cdsPlot.getYGutterPlotPointCount() > 0 );

        log("Validate the point count in the x-gutter plot.");
        pointCount = cdsPlot.getXGutterPlotPointCount();
        Assert.assertEquals("Point count in the x-gutter plot not as expected. Expected 104, found: " + pointCount, pointCount, 104);

        log("Validate the point count in the y-gutter plot.");
        pointCount = cdsPlot.getYGutterPlotPointCount();
        Assert.assertEquals("Point count in the y-gutter plot not as expected. Expected 318, found: " + pointCount, pointCount, 318);

        log("Now change the x-axis to a Time Points.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.confirmSelection();

        log("Create a filter from this plot.");
        // Going to move the mouse over the area where it is about to start dragging.
        clickAt(Locator.css("div:not(.thumbnail) > svg g.axis g.tick-text g:nth-of-type(1)"), 1, 1, 0);

        sleep(1000);
        cds.dragAndDropFromElement(Locator.css("div:not(.thumbnail) > svg g.axis g.tick-text g:nth-of-type(1)"), 500, 0);
        sleep(CDSHelper.CDS_WAIT);

        assertElementVisible(Locator.linkContainingText("Filter"));

        click(Locator.linkContainingText("Filter"));
        sleep(1000); // Wait briefly for the mask to show up.
        _ext4Helper.waitForMaskToDisappear();

        log("Change x-axis back to ICS Magnitude Background Subtracted.");
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.confirmSelection();

        log("Validate that the gutter plots are again on the x and y axes and that there counts are as expected.");
        Assert.assertTrue("There was no gutter plot on the x-axis. This is need to validate.", cdsPlot.hasXGutter());
        Assert.assertTrue("There was no gutter plot on the y-axis. This is need to validate.", cdsPlot.hasYGutter());

        log("Validate the point count in the x-gutter plot.");
        pointCount = cdsPlot.getXGutterPlotPointCount();
        Assert.assertEquals("Point count in the x-gutter plot not as expected. Expected 104, found: " + pointCount, pointCount, 104);

        log("Validate the point count in the y-gutter plot.");
        pointCount = cdsPlot.getYGutterPlotPointCount();
        Assert.assertEquals("Point count in the y-gutter plot not as expected. Expected 318, found: " + pointCount, pointCount, 318);

        log("Looks good, go home.");
        goToProjectHome();
    }

}
