package org.labkey.test.tests.cds;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.SortDirection;
import org.labkey.test.pages.cds.CDSPlot;
import org.labkey.test.pages.cds.ColorAxisVariableSelector;
import org.labkey.test.pages.cds.DataspaceVariableSelector;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelpCenterUtil;
import org.labkey.test.util.cds.CDSHelper;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.cds.CDSHelper.CDS_WAIT;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 30)
public class CDSVisualizationPlotTest extends CDSReadOnlyTest
{
    protected static final String MOUSEOVER_FILL = "#41C49F";
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSPlot cdsPlot = new CDSPlot(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String XPATH_SUBJECT_COUNT = "//div[contains(@class, 'status-row')]//span[contains(@class, 'hl-status-label')][contains(text(), 'Subject')]/./following-sibling::span[contains(@class, ' hl-status-count ')][not(contains(@class, 'hideit'))]";

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
        yaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType(CDSHelper.CELL_TYPE_CD8);
        xaxis.setAntigensAggregated(CDSHelper.ICS_ANY_POL);
        xaxis.confirmSelection();

        log("Validate that the Log Gutters are there.");
        assertTrue("Did not find the Log Gutter on the bottom of the plot.", cdsPlot.hasXLogGutter());
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);
        assertTrue("Did not find the Log Gutter on the left hand side of the plot.", cdsPlot.hasYLogGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0);

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
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);
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
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0);
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
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);
        assertTrue("For ELISPOT vs ICS y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getYGutterPlotPointCount() > 0);

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
        assertTrue("There is an x-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);
        assertTrue("For NAB vs ICS y-axis gutter plot was not present.", cdsPlot.hasYGutter());
        assertTrue("There is an y-axis gutter plot, but there are no data points in it.", cdsPlot.getXGutterPlotPointCount() > 0);

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
        mouseOver(Locator.css(CDSHelpCenterUtil.OUTSIDE_POPUP_LOGO_CSS));

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
        assertEquals("Incorrect number of points highlighted after clicking x axis category", 316, cdsPlot.waitForPointsWithColor(MOUSEOVER_FILL));
        log("Ensure correct total number of points.");
        assertEquals("Incorrect total number of points after clicking x axis category", 3627, cdsPlot.getPointCount());
        log("Apply category selection as a filter.");

        // Need to do this because there is more than one "Filter" buton in the OM, but only want the visible one.
        cdsPlot.doAndWaitForPlotRefresh(() -> waitAndClick(CDSHelper.Locators.cdsButtonLocator("Filter")));

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
        cdsPlot.selectXAxes("White", "Multiracial", "Native Hawaiian/Paci", "Native American/Alas. Other");
        sleep(3000); // Let the animation end.

        log("Ensure correct number of points are highlighted.");
        assertEquals("Incorrect number of points highlighted after clicking x axis categories", 1443, cdsPlot.getPointCountByColor(MOUSEOVER_FILL));
        assertEquals("Incorrect total number of points after clicking x axis categories", 3627, cdsPlot.getPointCount());
        log("Apply selection as exclusive filter.");
        cdsPlot.doAndWaitForPlotRefresh(() -> waitAndClick(CDSHelper.Locators.cdsButtonLocator("Remove")));
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
        sleep(CDS_WAIT);
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
        sleep(CDS_WAIT);
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
        sleep(CDS_WAIT);
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
        sleep(CDS_WAIT);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.ICS);
        xaxis.pickVariable(CDSHelper.ICS_MAGNITUDE_BACKGROUND_SUB);
        xaxis.setCellType("All");
        xaxis.confirmSelection();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        waitForElement(CDSPlot.Locators.plotTickLinear.withText("200"));
        assertElementPresent(CDSPlot.Locators.plotPoint, 290);

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        sleep(CDS_WAIT);
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
    public void verifyPKLinePlot()
    {
        cds.initModuleProperties(false); // temporarily hide hidden to confirm SubjectId can be used for color

        goToProjectHome();
        cds.enterApplication();

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector coloraxis = new ColorAxisVariableSelector(this);

        log("Plot PK MAb with Study Day and Line option");
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.PKMAB);
        yaxis.pickVariable(CDSHelper.PKMAB_CONCENTRATION);
        yaxis.confirmSelection();
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.confirmSelection();

        final Locator lineLoc = Locator.css("svg g.layer path.line");

        final int totalPKSubjectCount = 34;
        int plotLineCount = lineLoc.findElements(getDriver()).size();
        assertEquals("Number of lines in plot is not as expected", totalPKSubjectCount, plotLineCount);

        String cssPathToSvg = "div.plot:not(.thumbnail) > svg:nth-of-type(1)";

        log("Verify PK MAb plot tooltip");
        cds.clickPointInPlot(cssPathToSvg, 1);
        // By design the tool tip does not show up instantly, so adding a pause to give it a chance.
        sleep(1000);
        cdsPlot.validateToolTipText("Visit time", "MAb or mixture standardized name", "MAb or mixture label");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        log("Verify line plot with color with Subject Id");
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_SUBJECT_ID);
        coloraxis.confirmSelection();

        String green = "#52B700";
        final Locator greenLineLoc = Locator.css("svg g.layer path.line[stroke='" + green + "']");

        plotLineCount = getElementCount(lineLoc);
        assertEquals("Number of lines in plot is not as expected", totalPKSubjectCount, plotLineCount);
        int plotGreenLineCount = getElementCount(greenLineLoc);
        assertEquals("Number of green lines in plot is not as expected", 3, plotGreenLineCount);

        log("Verify PK MAb with Study Hours and Line option");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_HOURS);
        xaxis.confirmSelection();

        assertTrue("X axis label is not as expected for Hours time point", isElementVisible(Locator.tagWithClass("li", "variable-label").withText("Hours after initial infusion")));
        plotLineCount = getElementCount(lineLoc);
        assertEquals("Number of lines in plot is not as expected", totalPKSubjectCount, plotLineCount);
        plotGreenLineCount = getElementCount(greenLineLoc);
        assertEquals("Number of green lines in plot is not as expected", 3, plotGreenLineCount);

        log("Verify line plot using non Subject Characteristics as color");
        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.PKMAB);
        coloraxis.pickVariable(CDSHelper.PKMAB_MAB_LABEL);
        coloraxis.confirmSelection();

        plotGreenLineCount = getElementCount(greenLineLoc);
        assertEquals("Line should also use color for a non-Subject Characteristic field that won't change over time", 3, plotGreenLineCount);

        coloraxis.openSelectorWindow();
        coloraxis.pickSource(CDSHelper.SUBJECT_CHARS);
        coloraxis.pickVariable(CDSHelper.DEMO_SUBJECT_ID);
        coloraxis.confirmSelection();

        log("Filter to fewer subjects");
        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.addRaceFilter(CDSHelper.RACE_WHITE);
        _asserts.assertFilterStatusCounts(5, 1, 1, 2, 2);

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this, true); // color btn hidden since color exist, skip check
        waitForElement(lineLoc);
        plotLineCount = getElementCount(lineLoc);
        assertEquals("Number of lines in plot is not as expected", 5, plotLineCount);
        plotGreenLineCount = getElementCount(greenLineLoc);
        assertEquals("Number of green lines in plot is not as expected", 1, plotGreenLineCount);

        log("Verify PK MAb with Line & Box plot type");
        xaxis.openSelectorWindow();
        xaxis.pickVariable(CDSHelper.TIME_POINTS_DAYS);
        xaxis.setPlotType(CDSHelper.PLOT_TYPE_BOX_AND_LINE);
        xaxis.confirmSelection();

        plotLineCount = getElementCount(lineLoc);
        assertEquals("Number of lines in plot is not as expected", 5, plotLineCount);
        plotGreenLineCount = getElementCount(greenLineLoc);
        assertEquals("Number of green lines in plot is not as expected", 1, plotGreenLineCount);

        final Locator boxLoc = Locator.css("svg g.layer g.dataspace-box-group");
        assertEquals("Number of boxes in plot is not as expected", 15, getElementCount(boxLoc));

        cds.initModuleProperties(true); // toggle module property back, test dependency
    }
}
