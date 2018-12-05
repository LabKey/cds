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
package org.labkey.test.pages.cds;

import org.apache.commons.lang3.SystemUtils;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

public class CDSPlot
{
    public static final String MOUSEOVER_FILL = "#41C49F";
    public static final String MOUSEOVER_STROKE = "#00EAFF";
    public static final String BRUSHED_FILL = "#14C9CC";
    public static final String BRUSHED_STROKE = "#00393A";
    public static final String NORMAL_COLOR = "#000000";

    protected BaseWebDriverTest _test;

    public CDSPlot(BaseWebDriverTest test)
    {
        _test = test;
    }

    private void scrollElement(String tickText, int maxScroll)
    {
        if (maxScroll == 0)
            return;

        // If the x position is larger than the maxScroll value scroll the difference.
        // I'm sure this math is flawed, but it should be good enough to get the element visible.

        String strX = Locators.plotTick.withText(tickText).findElement(_test.getWrappedDriver()).getAttribute("x");
        if(strX.contains("."))
            strX = strX.substring(0, strX.indexOf("."));
        int x = Integer.parseInt(strX);

        if(x > maxScroll)
        {
            JavascriptExecutor jse = (JavascriptExecutor) _test.getWrappedDriver();
            jse.executeScript("document.querySelector('div.plot-scroll').scrollLeft = " + (x - maxScroll) + ";");
        }

    }

    private int getMaxXScrollValue()
    {
        int maxScroll;
        // Some of the x axes may be under the right hand pane. If they are they need to be scrolled into view.
        // We will need to get the maxScroll value to see if elements will need to be scrolled into view.

        // If there is no scroll bar nothing to worry about.
        if(!_test.isElementPresent(Locators.plotScrollContainer))
        {
            maxScroll = 0;
        }
        else if (!_test.isElementVisible(Locators.plotScrollContainer))
            maxScroll = 0;
        else
        {
            // First find the width of the client area.
            String strWidth = Locators.plotScrollContainer.findElement(_test.getWrappedDriver()).getAttribute("clientWidth");
            int width = Integer.parseInt(strWidth);

            // Now scroll to that width, this should be larger than the scroll bar can go.
            JavascriptExecutor jse = (JavascriptExecutor) _test.getWrappedDriver();
            jse.executeScript("document.querySelector('div.plot-scroll').scrollLeft = " + width + ";");

            // The scrollLeft attribute will now have it's maximum scroll value.
            String strMaxScroll = Locators.plotScrollContainer.findElement(_test.getWrappedDriver()).getAttribute("scrollLeft");
            maxScroll = Integer.parseInt(strMaxScroll);

            // Scroll back to the left so everything looks ok.
            jse.executeScript("document.querySelector('div.plot-scroll').scrollLeft = 0;");

        }

        return maxScroll;
    }

    public void selectXAxes(String... axes)
    {
        if (axes == null || axes.length == 0)
            throw new IllegalArgumentException("Please specify axes to select.");

        Keys multiSelectKey;
        if(SystemUtils.IS_OS_WINDOWS)
            multiSelectKey = Keys.CONTROL;
        else if (SystemUtils.IS_OS_MAC)
            multiSelectKey = Keys.COMMAND;
        else
            multiSelectKey = Keys.SHIFT;

        int maxScroll = getMaxXScrollValue();

        scrollElement(axes[0], maxScroll);

        _test.click(Locators.plotTick.withText(axes[0]));
        _test.waitForElement(Locator.xpath("//div[contains(@class, 'selectionpanel')]//div[contains(@class, 'activefilter')]//div[contains(@class, 'selitem')]//div[contains(text(), '" + axes[0] + "')]"));

        if (axes.length > 1)
        {
            Actions builder = new Actions(_test.getDriver());

            for (int i = 1; i < axes.length; i++)
            {
                scrollElement(axes[i], maxScroll);
                builder.keyDown(multiSelectKey).click(Locators.plotTick.withText(axes[i]).findElement(_test.getWrappedDriver())).keyUp(multiSelectKey).build().perform();
                _test.waitForElement(Locator.xpath("//div[contains(@class, 'selectionpanel')]//div[contains(@class, 'activefilter')]//div[contains(@class, 'selitem')]//div[contains(text(), '" + axes[i] + "')]"));
            }
        }
    }

    public int getPointCountByColor(String colorCode)
    {
        try
        {
            _test.waitForElement(Locator.css("svg g a.point path[fill='" + colorCode + "']"), 15000, true);
        }
        catch(NoSuchElementException nse)
        {
            return 0;
        }

        return Locator.css("svg g a.point path[fill='" + colorCode + "']").findElements(_test.getWrappedDriver()).size();
    }

    public int getPointCountByGlyph(String glyphyCode)
    {
        return _test.getElementCount(Locator.css("svg g a.point path[d='" + glyphyCode + "']"));
    }

    public int getPointCount()
    {
        return Locator.css("svg g a.point path").findElements(_test.getDriver()).size();
    }

    public void waitForPointCount(int count, int msTimeout)
    {
        final Integer pointCount = count;
        long secTimeout = msTimeout / 1000;
        secTimeout = secTimeout > 0 ? secTimeout : 1;
        WebDriverWait wait = new WebDriverWait(_test.getDriver(), secTimeout);
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

    public int getGutterPlotPointCount()
    {
        return getXGutterPlotPointCount() + getYGutterPlotPointCount();
    }

    public int getXGutterPlotPointCount()
    {
        int points = 0;

        if (hasXGutter())
        {
            points = _test.getElementCount(Locator.css("div.bottomplot svg g a.point"));
        }

        return points;
    }

    public int getYGutterPlotPointCount()
    {
        int points = 0;

        if (hasYGutter())
        {
            points = _test.getElementCount(Locator.css("div.plot svg g a.point"));
        }

        return points;
    }

    public boolean hasYGutter()
    {
        return hasGutter("svg g text.yGutter-label");
    }

    public boolean hasXGutter()
    {
        return hasGutter("svg g text.xGutter-label");
    }

    public boolean hasStudyAxis()
    {
        return hasGutter("div.bottomplot svg");
    }

    public boolean hasGutter(String cssPath)
    {
        boolean hasElement;

        try
        {
            _test.waitForElement(Locator.css(cssPath), 3000);
            hasElement = Locator.css(cssPath).findElement(_test.getDriver()).isDisplayed();
        }
        catch (org.openqa.selenium.NoSuchElementException ex)
        {
            hasElement = false;
        }

        return hasElement;

    }

    public boolean hasXLogGutter()
    {
        return hasLogGutter(0);
    }

    public boolean hasYLogGutter()
    {
        return hasLogGutter(1);
    }

    public boolean hasLogGutter(int axisIndex)
    {
        int mainPlotIndex;
        String cssMainPlotWindow;
        List<WebElement> axisElements;
        boolean isPresent;

        if (hasYGutter())
        {
            mainPlotIndex = 2;
        }
        else {
            mainPlotIndex = 1;
        }

        // There will always be two g.axis elements. One horizontal the other vertical.
        cssMainPlotWindow = "div:not(.thumbnail) > svg:nth-of-type(" + mainPlotIndex + ") > g.axis";
        axisElements = Locator.css(cssMainPlotWindow).findElements(_test.getDriver());
        try
        {
            Locator.css("g.log-gutter").findElement(axisElements.get(axisIndex));
            isPresent = true;
        }
        catch(org.openqa.selenium.NoSuchElementException ex)
        {
            isPresent = false;
        }

        return isPresent;
    }

    public void validateVisitCounts(List<WebElement> studies, Map<String, CDSHelper.TimeAxisData> expectedCounts)
    {
        Set<String> validatedTimeAxisRows = new HashSet<>();

        for (WebElement study : studies)
        {
            String studyId = study.findElement(By.className("study-label")).getAttribute("test-data-value");
            CDSHelper.TimeAxisData tad = expectedCounts.get(studyId);

            // If tad is null it means we don't want to check the totals for the given study (or a locator is messed up).
            if (tad != null)
            {
                validatedTimeAxisRows.add(studyId);

                int nonvacCount = 0, nonvacCountNoData = 0, vacCount = 0, vacCountNoData = 0, chalCount = 0, chalCountNoData = 0;
                List<WebElement> visits;

                _test.log("Study Name: '" + study.getText() + "' ID: " + studyId);
                visits = Locator.css("image.visit-tag").findElements(study);
                _test.log("Number of visits: " + visits.size());

                // Had hoped to get a collection directly, but had trouble getting css to see the href value.
                // So went with this approach for now. May revisit later.
                for (int i=0; i < visits.size(); i++)
                {
                    if (visits.get(i).getAttribute("href").contains("/nonvaccination_normal.svg"))
                    {
                        nonvacCount++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/nonvaccination_disabled.svg"))
                    {
                        nonvacCountNoData++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/vaccination_normal.svg"))
                    {
                        vacCount++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/vaccination_disabled.svg"))
                    {
                        vacCountNoData++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/challenge_normal.svg"))
                    {
                        chalCount++;
                    }
                    if (visits.get(i).getAttribute("href").contains("/challenge_disabled.svg"))
                    {
                        chalCountNoData++;
                    }
                }

                _test.log("Vaccination Count: " + vacCount);
                _test.log("Vaccination NoData Count: " + vacCountNoData);
                _test.log("Non-Vaccination Count: " + nonvacCount);
                _test.log("Non-Vaccination NoData Count: " + nonvacCountNoData);
                _test.log("Challenge Count: " + chalCount);
                _test.log("Challenge NoData Count: " + chalCountNoData);

                assertTrue("Vaccination count not as expected. Expected: " + tad.vaccinationCount + " found: " + vacCount, tad.vaccinationCount == vacCount);
                assertTrue("Vaccination NoData count not as expected. Expected: " + tad.vaccinationCountNoData + " found: " + vacCountNoData, tad.vaccinationCountNoData == vacCountNoData);
                assertTrue("Nonvaccination count not as expected. Expected: " + tad.nonvaccinationCount + " found: " + nonvacCount, tad.nonvaccinationCount == nonvacCount);
                assertTrue("Nonvaccination NoData count not as expected. Expected: " + tad.nonvaccinationCountNoData + " found: " + nonvacCountNoData, tad.nonvaccinationCountNoData == nonvacCountNoData);
                assertTrue("Challenge count not as expected. Expected: " + tad.challengeCount + " found: " + chalCount, tad.challengeCount == chalCount);
                assertTrue("Challenge NoData count not as expected. Expected: " + tad.challengeCountNoData + " found: " + chalCountNoData, tad.challengeCountNoData == chalCountNoData);

                _test.log("Visit counts as expected.");

            }
            else
            {
                _test.log("Not validating counts for " + study.getText() + " (" + studyId + ")");
            }

        }

        assertEquals("Not all study axis rows were validated", expectedCounts.keySet().size(), validatedTimeAxisRows.size());
    }

    public void timeAxisToolTipsTester(int studyRowIndex, int visitIconIndex, List<String> expectedToolTipText)
    {
        String actualToolTipText, condensedActual, condensedExpected;

        _test.scrollIntoView(CDSPlot.Locators.getTimeAxisIconLoc(studyRowIndex, visitIconIndex));
        _test.sleep(500);

        _test.mouseOver(CDSPlot.Locators.getTimeAxisIconLoc(studyRowIndex, visitIconIndex));
        _test.sleep(500);

        try
        {
            assertTrue("Tool-tip was not present.", _test.waitForElement(Locator.xpath("//div[contains(@class, 'hopscotch-bubble')]"), CDSHelper.CDS_WAIT_TOOLTIP, true));

            actualToolTipText = _test.getText(Locator.xpath("//div[contains(@class, 'hopscotch-bubble')]"));

            // Modify the strings to make the comparisons less susceptible to spaces, tabs, /n, etc... and capitalization.
            condensedActual = actualToolTipText.toLowerCase().replaceAll("\\s+", "");

            // Order of text in tool-tip may change from deployment to deployment. So look only from specific text as oppose to looking for an exact match.
            for (String strTemp : expectedToolTipText)
            {
                condensedExpected = strTemp.toLowerCase().replaceAll("\\s+", "");
                assertTrue("Item not found in tool tip. Expected: '" + strTemp + "' (" + condensedExpected + "), actual: '" + actualToolTipText + "' (" + condensedActual + ").", condensedActual.contains(condensedExpected));
            }

            // Move the mouse so the tool tip goes away.
            Actions builder = new Actions(_test.getDriver());
            builder.moveToElement(Locator.xpath("//div[contains(@class, 'hopscotch-bubble')]").findElement(_test.getWrappedDriver()), 50, -250).build().perform();


        }
        catch (NoSuchElementException nse)
        {
            Capabilities cap = ((RemoteWebDriver) _test.getWrappedDriver()).getCapabilities();
            if (cap.getBrowserName().toLowerCase().equals("firefox"))
            {
                _test.log("!!!!Popups (hopscotch) are very unreliable for test automation on Firefox. Ignoring the 'NoSuchElementException'!!!!");
            }
            else
            {
                throw nse;
            }
        }
    }

    // TODO this can be merged with timeAxisToolTipsTester. Will do that at some time in the future.
    public void validateToolTipText(String...searchText)
    {
        String toolTipText;
        WebElement weToolTip;
        boolean pass = true;

        try
        {
            weToolTip = Locator.xpath("//div[contains(@class, 'hopscotch-bubble')]//div[contains(@class, 'hopscotch-content')]").findElement(_test.getDriver());
            toolTipText = weToolTip.getText();

            for (String text : searchText)
            {
                if (!toolTipText.contains(text))
                {
                    pass = false;
                    _test.log("Could not find text: '" + text + "' in the tool tip");
                }
            }

            if (!pass)
            {
                _test.log("Tool tip text: " + toolTipText);
                assertTrue("Tool tip not as expected. See log for missing text.", pass);
            }
        }
        catch(NoSuchElementException nse)
        {
            Capabilities cap = ((RemoteWebDriver) _test.getWrappedDriver()).getCapabilities();
            if (cap.getBrowserName().toLowerCase().equals("firefox"))
            {
                _test.log("!!!!Popups (hopscotch) are very unreliable for test automation on Firefox. Ignoring the 'NoSuchElementException'!!!!");
            }
            else
            {
                throw nse;
            }
        }

    }

    // Return all images from the Time Axis.
    private List<WebElement> findTimeAxisPointsWithData()
    {
        return findTimeAxisPointsWithData("div.bottomplot > svg > g > image");
    }

    // Return all images from a specific part of the Time Axis.
    private List<WebElement> findTimeAxisPointsWithData(String cssPath)
    {
        List<WebElement> list;
        cssPath = "div.bottomplot > svg > g > image"; //[xlink:href$='nonvaccination_normal.svg']";
        list = findTimeAxisPointsWithData(cssPath, "nonvaccination_normal.svg");
        list.addAll(findTimeAxisPointsWithData(cssPath, "vaccination_normal.svg"));
        list.addAll(findTimeAxisPointsWithData(cssPath, "challenge_normal.svg"));

        return list;

    }

    public List<WebElement> findTimeAxisPointsWithData(String cssPath, String imageValue)
    {
        List<WebElement> allImages = Locator.css(cssPath).findElements(_test.getDriver());
        List<WebElement> imgWithData = new ArrayList<>();
        String href;
        for (WebElement img : allImages)
        {
            href = img.getAttribute("href");
            if (href.contains(imageValue))
            {
                imgWithData.add(img);
            }
        }

        return imgWithData;
    }

    public int getTimeAxisPointCountByImage(String image)
    {
        return findTimeAxisPointsWithData("div.bottomplot > svg > g > image", image).size();
    }

    public void toggleTimeAxisExpandCollapseState()
    {
        Locator.css("div.bottomplot > svg > g > image.img-expand").findElement(_test.getDriver()).click();
        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
    }

    public void subjectCountsHelper(Map<String, String> sourcesSubjectCounts, Map<String, String> antigenCounts,
                                     Map<String, String> peptidePoolCounts, Map<String, String> proteinCounts,
                                     Map<String, String> proteinPanelCounts, Map<String, String> virusCounts)
    {

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(_test);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(_test);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(_test);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(_test);

        _test.log("Validating the x-axis sources.");

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
                assertTrue(_test.isElementVisible(xaxis.window().append(" div.content-label").withText(entry.getKey())));
                assertTrue(_test.isElementVisible(xaxis.window().append(" div.content-count").withText(entry.getValue()))); // TODO Bad test. It will pass if there is any tag wtih this count. Need to revisit.
            }
        }

        if (antigenCounts != null)
        {
            _test.log("Validating subject counts in the x-axis BAMA - Antigen.");
            xaxis.pickSource(CDSHelper.BAMA);
            _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
            xaxis.setIsotype("IgG");
            xaxis.validateAntigenSubjectCount(antigenCounts, false);
            xaxis.backToSource();
        }

        if (peptidePoolCounts != null)
        {
            _test.log("Validating subject counts in the x-axis ELISPOT - Peptide Pool.");
            xaxis.pickSource(CDSHelper.ELISPOT);
            xaxis.validatePeptidePoolSubjectCount(peptidePoolCounts, false);
            xaxis.backToSource();
        }

        if (proteinPanelCounts != null)
        {
            _test.log("Validating subject counts in the x-axis ICS - Protein Panel.");
            xaxis.pickSource(CDSHelper.ICS);
            xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
            xaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
            xaxis.backToSource();
        }

        if (proteinCounts != null)
        {
            _test.log("Validating subject counts in the x-axis ICS - Protein.");
            xaxis.pickSource(CDSHelper.ICS);
            xaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
            xaxis.validateProteinSubjectCount(proteinCounts, false);
            xaxis.backToSource();
        }

        if (virusCounts != null)
        {
            _test.log("Validating subject counts in the x-axis NAB - Virus.");
            xaxis.pickSource(CDSHelper.NAB);
            xaxis.pickVariable(CDSHelper.NAB_TITERID50);
            xaxis.validateVirusSubjectCount(virusCounts, true);
        }
        else
        {
            xaxis.cancelSelection();
        }

        _test.log("Validating the y-axis source.");
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
                    assertTrue(_test.isElementVisible(yaxis.window().append(" div.content-label").withText(entry.getKey())));
                    assertTrue(_test.isElementVisible(yaxis.window().append(" div.content-count").withText(entry.getValue())));
                }
            }
        }

        if (antigenCounts != null)
        {
            _test.log("Validating subject counts in the y-axis BAMA - Antigen.");
            yaxis.pickSource(CDSHelper.BAMA);
            yaxis.setIsotype("IgG");
            yaxis.validateAntigenSubjectCount(antigenCounts, false);
            yaxis.backToSource();
        }

        if (peptidePoolCounts != null)
        {
            _test.log("Validating subject counts in the y-axis ELISPOT - Peptide Pool.");
            yaxis.pickSource(CDSHelper.ELISPOT);
            yaxis.validatePeptidePoolSubjectCount(peptidePoolCounts, false);
            yaxis.backToSource();
        }

        if (proteinCounts != null)
        {
            _test.log("Validating subject counts in the y-axis ICS - Protein.");
            yaxis.pickSource(CDSHelper.ICS);
            yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN);
            yaxis.validateProteinSubjectCount(proteinCounts, false);
            yaxis.backToSource();
        }

        if (proteinPanelCounts != null)
        {
            _test.log("Validating subject counts in the y-axis ICS - Protein Panel.");
            yaxis.pickSource(CDSHelper.ICS);
            yaxis.setDataSummaryLevel(CDSHelper.ICS_PROTEIN_PANEL);
            yaxis.validateProteinPanelSubjectCount(proteinPanelCounts, false);
            yaxis.backToSource();
        }

        if (virusCounts != null)
        {
            _test.log("Validating subject counts in the y-axis NAB - Virus.");
            yaxis.pickSource(CDSHelper.NAB);
            yaxis.validateVirusSubjectCount(virusCounts, true);
        }
        else
        {
            yaxis.cancelSelection();
        }

        _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);

        if (sourcesSubjectCounts != null)
        {

            _test.log("Validating the color-axis source.");
            coloraxis.openSelectorWindow();

            for (Map.Entry<String, String> entry : sourcesSubjectCounts.entrySet())
            {
                if (entry.getKey().compareTo(CDSHelper.TIME_POINTS) != 0)
                {
//            source = xaxis.xpathWindow().append("//div[contains(@class, 'content-label')][translate(text(), '\\xA0', ' ')='" + entry.getKey() + "']");
//            assertTrue(isElementVisible(source));
//            assertTrue(isElementVisible(source.append("/./following-sibling::div[text()='" + entry.getValue() + "']")));
                    assertTrue(_test.isElementVisible(coloraxis.window().append(" div.content-label").withText(entry.getKey())));
                    assertTrue(_test.isElementVisible(coloraxis.window().append(" div.content-count").withText(entry.getValue())));
                }
            }

            coloraxis.cancelSelection();
        }

    }

    public static class Locators
    {
        public static Locator plotSelection = Locator.css(".selectionfilter .plot-selection");
        public static Locator plotSelectionFilter = Locator.css(".activefilter .plot-selection");
        public static Locator plotSelectionCloseBtn = Locator.css("div.plot-selection div.closeitem");
        public static Locator plotBox = Locator.css("svg a.dataspace-box-plot");
        public static Locator plotTickLinear = Locator.css("g.tick-text > g > text");
        public static Locator plotTick = Locator.css("g.tick-text > a > text");
        public static Locator plotTickContainer = Locator.css("g.tick-text > a > rect");
        public static Locator plotScrollContainer = Locator.css("div.plot-scroll");
        public static Locator plotPoint = Locator.css("svg a.point");
        public static Locator plotSquare = Locator.css("svg a.vis-bin-square");
        public static Locator filterDataButton = Locator.xpath("//span[text()='Filter']");
        public static Locator removeButton = Locator.xpath("//span[text()='Remove']");
        public static Locator timeAxisStudies = Locator.css("div.bottomplot > svg > g.study");

        public static Locator getTimeAxisIconLoc(int studyRowIndex, int imageIndex)
        {
            return Locator.css("div.bottomplot > svg > g:nth-child(" + (studyRowIndex+1) + ") > image:nth-of-type(" + imageIndex + ")");
        }
    }

    public static class PlotGlyphs
    {
        public static String asterisk = "M3-1.1L2.6-1.9L0.5-0.8v-1.8h-1v1.8l-2.1-1.1L-3-1.1L-0.9,0L-3,1.1l0.4,0.7l2.1-1.1v1.9h1V0.7l2.1,1.1L3,1.1 L0.9,0L3-1.1z";
        public static String circle = "M0-2.6c-1.5,0-2.6,1.1-2.6,2.6S-1.4,2.6,0,2.6 c1.5,0,2.6-1.2,2.6-2.6C2.6-1.5,1.5-2.6,0-2.6z M0,1.9c-1.1,0-1.9-0.8-1.9-1.9S-1-1.9,0-1.9C1.1-1.9,1.9-1,1.9,0 C1.9,1.1,1.1,1.9,0,1.9z";
        public static String plus = "M3.1-0.6H0.6v-2.5h-1.2v2.5h-2.5v1.2h2.5v2.5h1.2V0.6h2.5C3.1,0.6,3.1-0.6,3.1-0.6z";
        public static String square = "M3.1-0.6H0.6v-2.5h-1.2v2.5h-2.5v1.2h2.5v2.5h1.2V0.6h2.5C3.1,0.6,3.1-0.6,3.1-0.6z";
        public static String x = "M2.8-2.2L2.2-2.8L0-0.6l-2.2-2.2l-0.6,0.6L-0.6,0l-2.2,2.2l0.6,0.6L0,0.6l2.2,2.2l0.6-0.6L0.6,0L2.8-2.2z";
        public static String u = "M1.9-3.1V0C1.9,1,1,1.9,0,1.9C-1,1.9-1.9,1-1.9,0v-3.1h-1.3V0c0,1.7,1.4,3.1,3.1,3.1c1.7,0,3.1-1.4,3.1-3.1 v-3.1H1.9z";
    }
}
