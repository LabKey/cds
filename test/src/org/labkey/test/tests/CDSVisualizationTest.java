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
import org.labkey.test.util.Maps;
import org.labkey.test.util.PostgresOnlyTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.tests.CDSVisualizationTest.Locators.*;

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
    @LogMethod(category = LogMethod.MethodType.SETUP)
    public static void doSetup() throws Exception
    {
        CDSVisualizationTest initTest = new CDSVisualizationTest();

        initTest.doCleanup(false);
        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setDesiredStudies(DESIRED_STUDIES);
        _initializer.setupDataspace();
        initTest.createParticipantGroups();

        currentTest = initTest;
    }

    @Before
    public void preTest()
    {
        Ext4Helper.setCssPrefix("x-");

        cds.enterApplication();
        cds.clearAllFilters();
        cds.clearAllSelections();
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
        final String CD4_LYMPH = "200\n400\n600\n800\n1000\n1200\n200\n400\n600\n800\n1000\n1200\n1400\n1600\n1800\n2000\n2200\n2400";
        final String HEMO_CD4_UNFILTERED = "6\n8\n10\n12\n14\n16\n18\n20\n100\n200\n300\n400\n500\n600\n700\n800\n900\n1000\n1100\n1200\n1300";
        final String WT_PLSE_LOG = "60\n70\n80\n90\n100\n50\n60\n70\n80\n90\n100";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "CD4");
        xaxis.confirmSelection();
        waitForElement(Locator.css(".curseltitle").containing("Y AXIS"));
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

        Actions builder = new Actions(getDriver());
        List<WebElement> points;
        points = Locator.css("svg g a.point path").findElements(getDriver());

        // Test hover events
        builder.moveToElement(points.get(33)).perform();

        // Check that related points are colored appropriately.
        for (int i = 33; i < 38; i++)
        {
            assertEquals("Related point had an unexpected fill color", MOUSEOVER_FILL, points.get(i).getAttribute("fill"));
            assertEquals("Related point had an unexpected stroke color", MOUSEOVER_STROKE, points.get(i).getAttribute("stroke"));
        }

        builder.moveToElement(points.get(33)).moveByOffset(10, 10).perform();

        // Check that the points are no longer highlighted.
        for (int i = 33; i < 38; i++)
        {
            assertEquals("Related point had an unexpected fill color", NORMAL_COLOR, points.get(i).getAttribute("fill"));
            assertEquals("Related point had an unexpected stroke color", NORMAL_COLOR, points.get(i).getAttribute("stroke"));
        }

        // Test brush events.
        builder.moveToElement(points.get(10)).moveByOffset(-45, -75).clickAndHold().moveByOffset(130, 160).release().perform();

        for (int i = 10; i < 15; i++)
        {
            assertEquals("Brushed point had an unexpected fill color", BRUSHED_FILL, points.get(i).getAttribute("fill"));
            assertEquals("Brushed point had an unexpected stroke color", BRUSHED_STROKE, points.get(i).getAttribute("stroke"));
        }

        builder.moveToElement(points.get(37)).moveByOffset(-25, 0).clickAndHold().release().perform();

        // Check that the points are no longer brushed.
        for (int i = 10; i < 15; i++)
        {
            assertEquals("Related point had an unexpected fill color", NORMAL_COLOR, points.get(i).getAttribute("fill"));
            assertEquals("Related point had an unexpected stroke color", NORMAL_COLOR, points.get(i).getAttribute("stroke"));
        }

        // Brush the same area, then apply that selection as a filter.
        builder.moveToElement(points.get(10)).moveByOffset(-45, -75).clickAndHold().moveByOffset(130, 160).release().perform();
        waitForElement(plotSelection);

        assertEquals("An unexpected number of plot selections were visible.", 2, plotSelection.findElements(getDriver()).size());
        _asserts.assertSelectionStatusCounts(1, 1, 2);

        plotSelectionX.findElement(getDriver()).click(); // remove the x variable from the selection.
        _asserts.assertSelectionStatusCounts(2, 1, 2);
        plotSelectionX.findElement(getDriver()).click(); // remove the y variable from the selection.
        assertElementNotPresent(plotSelection);

        // Select them again and apply them as a filter.
        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();
        waitForElement(plotSelection);

        assertEquals("An unexpected number of plot selections were visible.", 2, plotSelection.findElements(getDriver()).size());
        _asserts.assertSelectionStatusCounts(1, 1, 2);

        cds.useSelectionAsFilter();
        assertEquals("An unexpected number of plot selection filters were visible", 2, plotSelectionFilter.findElements(getDriver()).size());
        _asserts.assertFilterStatusCounts(1, 1, 2);

        // Test that variable selectors are reset when filters are cleared (Issue 20138).
        cds.clearFilter();
        waitForElement(Locator.css(".yaxisbtn span.x-btn-button").withText("choose variable"));
        waitForElement(Locator.css(".xaxisbtn span.x-btn-button").withText("choose variable"));
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

        // Choose a categorical axis to verify that multiple box plots will appear.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Demographics", "Sex");
        xaxis.confirmSelection();

        waitForElement(Locators.plotTick.withText("f"));
        assertElementPresent(plotBox, 2);

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
        assertElementPresent(plotBox, 6);
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

        _asserts.verifyLearnAboutPage(Arrays.asList(CDSHelper.ASSAYS));
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
        _asserts.verifyLearnAboutPage(Arrays.asList(CDSHelper.ASSAYS));
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

        _asserts.verifyLearnAboutPage(Arrays.asList(CDSHelper.ASSAYS));
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
        color.pickMeasure("Demographics", "TreatmentID");
        color.confirmSelection();

        Locator.CssLocator colorLegend = Locator.css("#color-legend > svg");
        Locator.CssLocator colorLegendGlyph = colorLegend.append("> .legend-point");
        waitForElement(colorLegend);
        assertElementPresent(colorLegendGlyph, 5);

        List<WebElement> legendGlyphs = colorLegendGlyph.findElements(getDriver());
        Map<String, Integer> treatmentCounts = Maps.of(
                "N/A", 107,
                "Placebo", 23,
                "Prime-boost ALVAC HIV", 9,
                "Prime-boost VRC-HIVADV014-00-VP", 22,
                "null", 3
        );

        Set<String> foundTreatments = new HashSet<>();

        for (WebElement el : legendGlyphs)
        {
            String fill = el.getAttribute("fill");
            String path = el.getAttribute("d");
            List<WebElement> points = Locator.css(String.format("a.point > path[fill='%s'][d='%s']", fill, path)).findElements(getDriver());

            String treatmentId = getPointProperty("TreatmentID", points.get(0).findElement(By.xpath("..")));
            assertEquals("Wrong number of points for treatment: " + treatmentId, treatmentCounts.get(treatmentId), (Integer)points.size());

            foundTreatments.add(treatmentId);
        }

        assertEquals("Found incorrect TreatmentIds", treatmentCounts.keySet(), foundTreatments);

        int expectedPointCount = 0;
        for (Map.Entry<String, Integer> treatmentCount : treatmentCounts.entrySet())
        {
            expectedPointCount += treatmentCount.getValue();
        }
        assertEquals("Wrong number of points on scatter plot", expectedPointCount, Locator.css("a.point").findElements(getDriver()).size());

        // issue 20446
        color.openSelectorWindow();
        color.pickMeasure("Demographics", "TreatmentID");
        color.confirmSelection();
        assertEquals("Wrong number of points on scatter plot", expectedPointCount, Locator.css("a.point").findElements(getDriver()).size());
        waitForElement(colorLegendGlyph);
        assertElementPresent(colorLegendGlyph, 5);
    }
    @Test
    public void verifyStudyAxis()
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        Locator studyAxisLoc = Locator.css("div.study-axis svg");
        Locator studyGroups = Locator.css("g.study");
        Locator studyVisits = Locator.css("rect.visit");
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
        assertEquals("Unexpected number of visits on the study axis.", 52, studyVisits.findElements(getDriver()).size());

        WebElement studyAxisTest1 = studyGroups.findElements(getDriver()).get(3);
        studyVisitEls = studyAxisTest1.findElements(studyVisits.toBy());

        // Sort the visits for Study Axis Test 1 by x location because DOM insertion varies by platform and browser
        // version, so this is the only accurate way to actually get the first visit for that study.
        Collections.sort(studyVisitEls, new Comparator<WebElement>()
        {
            @Override
            public int compare(WebElement o1, WebElement o2)
            {
                return o1.getLocation().getX() - o2.getLocation().getX();
            }
        });

        // Check that study axis hovers appear when hovered over.
        builder.moveToElement(studyVisitEls.get(0)).perform();
        waitForElement(visitHover);
        assertElementPresent(visitHover.withText("Study Axis Test 1\nMonth 1\nDay 0 (meaning varies)\nFirst Vaccination"));

        // Check that hovers disappear
        builder.moveToElement(studyVisitEls.get(0)).moveByOffset(0, -500).perform();
        waitForElementToDisappear(visitHover);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Time points", "Study days");
        xaxis.setVariableRadio("Day 0 (meaning varies)");
        xaxis.confirmSelection();
        waitForTextToDisappear("NotRV144");

        assertEquals("Unexpected number of visits on the study axis.", 37, studyVisits.findElements(getDriver()).size());

        WebElement notRV144 = studyGroups.findElements(getDriver()).get(0);
        WebElement diamondVisit = notRV144.findElement(studyVisits.toBy());
        assertTrue("Visit didnt have a transform as expected.", !diamondVisit.getAttribute("transform").equals(""));

        studyAxisTest1 = studyGroups.findElements(getDriver()).get(3);
        WebElement rectVisit = studyAxisTest1.findElement(studyVisits.toBy());
        assertTrue("Visit had a transform.", rectVisit.getAttribute("transform").equals(""));

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Time points", "Study weeks");
        xaxis.setVariableRadio("Unaligned");
        xaxis.confirmSelection();
        waitForText("NotRV144");

        // Assert that we have the same amount of visits even with study weeks.
        assertEquals("Unexpected number of visits on the study axis.", 52, studyVisits.findElements(getDriver()).size());
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
        assertEquals("Wrong number of antigens for NAb", 26, getElementCount(yaxis.variableOptionsRow()));
        yaxis.cancelSelection();

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();
        xaxis.pickSource("Luminex");
        waitForElement(xaxis.variableOptionsRow().withText("gp41"));
        assertEquals("Wrong number of antigens for Luminex", 1, getElementCount(xaxis.variableOptionsRow()));
        xaxis.pickSource("NAb");
        waitForElement(xaxis.variableOptionsRow().withText("BaL.01"));
        assertEquals("Wrong number of antigens for NAb", 26, getElementCount(xaxis.variableOptionsRow()));
        xaxis.pickSource("ADCC");
        waitForElement(xaxis.variableOptionsRow().withText("pCenvFs2_Pt1086_B2"));
        assertEquals("Wrong number of antigens for ADCC", 4, getElementCount(xaxis.variableOptionsRow()));
        xaxis.cancelSelection();

        final ColorAxisVariableSelector color = new ColorAxisVariableSelector(this);
        color.openSelectorWindow();
        color.pickSource("Luminex");
        assertFalse("Antigen picker found in color variable selector", doesElementAppear(new Checker()
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
        String sharedVirus = "T271-11";
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
        assertEquals(42, plotDataTable.getDataRowCount());
        assertEquals(42, getElementCount(Locator.linkWithText(uniqueVirus)));
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
        assertEquals(63, plotDataTable.getDataRowCount());
        assertEquals(63, getElementCount(Locator.linkWithText(uniqueVirus)) + getElementCount(Locator.linkWithText(sharedVirus)));
        getDriver().close();
        switchToMainWindow();
    }

    @Test
    public void verifyAntigenScatterPlot()
    {
        String xVirus = "BaL.01";
        String yVirus = "SUMA.LucR.T2A.ecto";
        String yVirus2 = "H061.14";

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        ColorAxisVariableSelector color = new ColorAxisVariableSelector(this);

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("NAb", "AUC");
        xaxis.setVariableOptions(xVirus);
        xaxis.confirmSelection();
        yaxis.pickMeasure("NAb", "AUC");
        yaxis.setVariableOptions(yVirus);
        yaxis.confirmSelection();

        waitForElement(plotTick.withText("0.06"));
        assertElementPresent(plotPoint, 86); // TODO: Possibly wrong; null-null points in bottom bottom left

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        switchToWindow(1);
        DataRegionTable plotDataTable = new DataRegionTable("query", this);
        assertEquals(86, plotDataTable.getDataRowCount());
        getDriver().close();
        switchToMainWindow();

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("NAb", "AUC");
        yaxis.setVariableOptions(yVirus, yVirus2);
        yaxis.confirmSelection();

        waitForElement(plotTick.withText("0.08"));
        assertElementPresent(plotPoint, 172); // TODO: Possibly wrong; null-null points in bottom bottom left

        click(CDSHelper.Locators.cdsButtonLocator("view data"));
        switchToWindow(1);
        plotDataTable = new DataRegionTable("query", this);
        assertEquals(86, plotDataTable.getDataRowCount());
        getDriver().close();
        switchToMainWindow();

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
    public String getAssociatedModuleDirectory()
    {
        return null;
    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        deleteProject(getProjectName(), afterTest);
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
        public static Locator plotSelectionX = Locator.css(".selectionfilter .plot-selection .closeitem");
        public static Locator plotBox = Locator.css("svg .box");
        public static Locator plotTick = Locator.css("g.tick-text > a > text");
        public static Locator plotPoint = Locator.css("svg a.point");
    }
}
