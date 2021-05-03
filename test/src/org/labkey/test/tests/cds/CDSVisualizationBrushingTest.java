package org.labkey.test.tests.cds;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.labkey.test.util.cds.CDSHelper.CDS_WAIT;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 15)
public class CDSVisualizationBrushingTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subject')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";

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
        return new Timeout(15, TimeUnit.MINUTES);
    }

    @BeforeClass
    public static void setShowHiddenVariables()
    {
        CDSVisualizationBrushingTest currentTest = (CDSVisualizationBrushingTest) getCurrentTest();
        currentTest.cds.initModuleProperties(true); //set ShowHiddenVariables property to true
    }

    @AfterClass
    public static void resetShowHiddenVariables()
    {
        CDSVisualizationBrushingTest currentTest = (CDSVisualizationBrushingTest) getCurrentTest();
        currentTest.cds.initModuleProperties(false); // reset ShowHiddenVariables property back to false
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
        String tempStr;
        String cssPathBrushWindow;
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
            checker().verifyEquals("The 'undefined x value' gutter has a brush window and it should not.", heightWidth, 0);
        }

        if (hasXGutter)
        {
            log("Verify no brush in 'undefined y value' gutter.");
            cssPathBrushWindow = "div.bottomplot > svg > g.brush > rect.extent";
            gutterBrushWindow = Locator.css(cssPathBrushWindow).findElement(getDriver());
            tempStr = gutterBrushWindow.getAttribute("width");
            heightWidth = Integer.parseInt(tempStr);
            checker().verifyEquals("The 'undefined y value' gutter has a brush window and it should not.", heightWidth, 0);
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

    private void brushPlot(int svgIndex, Double pointPosition, CDSHelper.PlotPoints pointType, int xOffSet, int yOffSet, boolean applyFilter)
    {
        if (pointPosition < 0 || pointPosition > 1)
            throw new IllegalArgumentException("Point position must be between zero and one, inclusive");
        WebElement svg = Locator.css("div:not(.thumbnail) > svg").index(svgIndex).findElement(getDriver());
        List<WebElement> points = pointType.getLocator().waitForElements(svg, CDS_WAIT);
        log(String.format("CDSVisualizationTest.brushPlot: Number of points in WebElement list: %d", points.size()));
        int pointIndex = points.size() * pointPosition.intValue();
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
        sleep(1000); // Wait briefly for the mask to show up (this may not be needed).
        _ext4Helper.waitForMaskToDisappear(60000);

        tempStr = getText(Locator.xpath(XPATH_SUBJECT_COUNT));
        subjectCountAfter = Integer.parseInt(tempStr.replaceAll(",", ""));

        checker().verifyTrue(String.format("The subject count after applying filter was not less than or equal to before. Before: %d After: %d", subjectCountBefore, subjectCountAfter),
                subjectCountBefore >= subjectCountAfter);
        sleep(1000); // Wait briefly for the mask to show up (this may not be needed).
        _ext4Helper.waitForMaskToDisappear();

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

    }

}
