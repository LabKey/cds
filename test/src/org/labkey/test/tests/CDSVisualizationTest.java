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
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PostgresOnlyTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;

@Category({CustomModules.class, CDS.class})
public class CDSVisualizationTest extends BaseWebDriverTest implements PostgresOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String PGROUP1 = "visgroup 1";
    private final String PGROUP2 = "visgroup 2";
    private final String PGROUP3 = "visgroup 3";
    private final String PGROUP3_COPY = "copy of visgroup 3";

    @BeforeClass
    @LogMethod(category = LogMethod.MethodType.SETUP)
    public static void doSetup() throws Exception
    {
        CDSVisualizationTest initTest = new CDSVisualizationTest();

        initTest.doCleanup(false);
        CDSInitializer _initializer = new CDSInitializer(initTest, initTest.getProjectName());
        _initializer.setupDataspace();
        initTest.createParticipantGroups();

        currentTest = initTest;
    }

    @Before
    public void preTest()
    {
        Ext4Helper.setCssPrefix("x-");

        windowMaximize(); // Provides more useful screenshots on failure
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
        final String WT_PLSE_LOG = "1\n10\n100\n1\n10\n100";
        Locator plotSelectionLoc = Locator.css(".selectionfilter .plot-selection");
        Locator plotSelectionFilterLoc = Locator.css(".activefilter .plot-selection");
        Locator plotSelectionX = Locator.css(".selectionfilter .plot-selection .closeitem");

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
        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();

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
        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();
        waitForElement(plotSelectionLoc);

        assertEquals("An unexpected number of plot selections were visible.", 2, plotSelectionLoc.findElements(getDriver()).size());
        _asserts.assertSelectionStatusCounts(1, 1, 2);

        plotSelectionX.findElement(getDriver()).click(); // remove the x variable from the selection.
        _asserts.assertSelectionStatusCounts(2, 1, 2);
        plotSelectionX.findElement(getDriver()).click(); // remove the y variable from the selection.
        assertElementNotPresent(plotSelectionLoc);

        // Select them again and apply them as a filter.
        builder.moveToElement(points.get(10)).moveByOffset(-25, -15).clickAndHold().moveByOffset(45, 40).release().perform();
        waitForElement(plotSelectionLoc);

        assertEquals("An unexpected number of plot selections were visible.", 2, plotSelectionLoc.findElements(getDriver()).size());
        _asserts.assertSelectionStatusCounts(1, 1, 2);

        cds.useSelectionAsFilter();
        assertEquals("An unexpected number of plot selection filters were visible", 2, plotSelectionFilterLoc.findElements(getDriver()).size());
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
        Locator boxLoc = Locator.css("svg .box");
        Locator tickLoc = Locator.css("g.tick-text a text");

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        // Choose the y-axis and verify that only 1 box plot shows if there is no x-axis chosen.
        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Lab Results", "CD4");
        yaxis.confirmSelection();

        waitForElement(boxLoc);
        assertElementPresent(boxLoc, 1);

        // Choose a categorical axis to verify that multiple box plots will appear.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Demographics", "Sex");
        xaxis.confirmSelection();

        waitForElement(tickLoc.withText("f"));
        assertElementPresent(boxLoc, 2);

        // Choose a continuous axis and verify that the chart goes back to being a scatter plot.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Lab Results", "Hemoglobin");
        xaxis.confirmSelection();

        waitForElementToDisappear(boxLoc);

        // Verify that we can go back to boxes after being in scatter mode.
        xaxis.openSelectorWindow();
        xaxis.pickMeasure("Demographics", "Race");
        xaxis.confirmSelection();

        waitForElement(tickLoc.withText("Asian"));
        assertElementPresent(boxLoc, 6);
    }

    @Test
    public void verifySavedGroupPlot()
    {
        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        Locator boxLoc = Locator.css("svg .box");
        Locator xtickLoc = Locator.css("g.tick-text > a > text");

        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        yaxis.openSelectorWindow();
        yaxis.pickMeasure("Physical Exam", "Diastolic Blood Pressure");
        yaxis.confirmSelection();

        xaxis.openSelectorWindow();
        xaxis.pickMeasure("User groups", "My saved groups");
        xaxis.setVariableOptions(PGROUP1, PGROUP2, PGROUP3);
        xaxis.confirmSelection();

        waitForElement(xtickLoc.withText(PGROUP1));
        waitForElement(xtickLoc.withText(PGROUP2));
        waitForElement(xtickLoc.withText(PGROUP3));
        assertElementPresent(boxLoc, 3);
        waitForElement(xtickLoc.withText("115"));
        waitForElement(xtickLoc.withText("70"));

        xaxis.openSelectorWindow();
        xaxis.setVariableOptions(PGROUP1, PGROUP2);
        xaxis.confirmSelection();

        waitForElement(xtickLoc.withText(PGROUP1));
        waitForElement(xtickLoc.withText(PGROUP2));
        waitForElementToDisappear(xtickLoc.withText(PGROUP3));
        assertElementPresent(boxLoc, 2);
        waitForElementToDisappear(xtickLoc.withText("115"));
        waitForElementToDisappear(xtickLoc.withText("70"));

        xaxis.openSelectorWindow();
        xaxis.setVariableOptions(PGROUP3, PGROUP3_COPY);
        xaxis.confirmSelection();

        waitForElementToDisappear(xtickLoc.withText(PGROUP1));
        waitForElementToDisappear(xtickLoc.withText(PGROUP2));
        waitForElement(xtickLoc.withText(PGROUP3));
        waitForElement(xtickLoc.withText(PGROUP3_COPY));
        assertElementPresent(boxLoc, 2);
        waitForElement(xtickLoc.withText("115"));
        waitForElement(xtickLoc.withText("70"));
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
                "N/A", 47,
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
        assertElementPresent(colorLegendGlyph, 5);
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
}
