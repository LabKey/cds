package org.labkey.test.tests.cds;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.pages.cds.DataGrid;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.pages.cds.LearnGrid.LearnTab;
import org.labkey.test.pages.cds.XAxisVariableSelector;
import org.labkey.test.pages.cds.YAxisVariableSelector;
import org.labkey.test.util.TextSearcher;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;

@Category({})
public class CDSStudyTooltipTest extends CDSReadOnlyTest
{
    private static final Locator.XPathLocator TOOLTIP_TEXT_LOCATOR = Locator.tagWithClass("div", "hopscotch-content");
    private static final String RED4ToolTipText = "Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. " +
            "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis. " +
            "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor.";
    private static final String QED4ToolTipText = "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus.";
    private static final String ZAP134ToolTipText = "Aenean sit amet justo. Morbi ut odio. Cras mi pede, malesuada in, imperdiet et, commodo vulputate, justo. In blandit ultrices enim.";
    private static final String ZAP138ToolTipText = "Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. " +
            "Duis at velit eu est congue elementum. In hac habitasse platea dictumst.";

    private final CDSHelper cds = new CDSHelper(this);

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
    }

    @Test
    public void testLearnPagesTooltip()
    {
        log("Verifying the tooltip for Learn about - Assays");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);
        learnGrid.clickItemContaining(CDSHelper.TITLE_ICS);
        validateToolTip(Locator.linkWithText(CDSHelper.RED_4).findElement(getDriver()), RED4ToolTipText);

        log("Verifying the tooltip for Learn about - Products");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        learnGrid = cds.viewLearnAboutPage(LearnTab.PRODUCTS);
        learnGrid.clickFirstItem();
        validateToolTip(Locator.linkWithText(CDSHelper.QED_4).findElement(getDriver()), QED4ToolTipText);

        log("Verifying the tooltip for Learn about - MAbs");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        learnGrid = cds.viewLearnAboutPage(LearnTab.MABS);
        learnGrid.clickItemContaining("2F5");
        validateToolTip(Locator.linkWithText(CDSHelper.QED_4).findElement(getDriver()), QED4ToolTipText);

        log("Verifying the tooltip for Learn about - Publications");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        learnGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        learnGrid.clickFirstItem();
        validateToolTip(Locator.linkWithText(CDSHelper.ZAP_138).findElement(getDriver()), ZAP138ToolTipText);
    }

    @Test
    public void testFilterPanelTooltip()
    {
        log("Verifying the tooltip for filter panel study list");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        WebElement studiesPanel = cds.openStatusInfoPane("Studies");
        validateToolTip(Locator.tagWithClass("div", "single-axis-explorer")
                .withPredicate("text()='" + CDSHelper.QED_4 + "'").findElement(studiesPanel), QED4ToolTipText);
    }

    @Test
    public void testSearchPagesTooltip()
    {
        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.clickBy("Assays");
        cds.toggleExplorerBar(CDSHelper.TITLE_ICS);
        validateToolTip(CDSHelper.Locators.barLabel.withText(CDSHelper.RED_4).refindWhenNeeded(getDriver()), RED4ToolTipText);

        CDSHelper.NavigationLink.SUMMARY.makeNavigationSelection(this);
        cds.clickBy("Studies");
        validateToolTip(CDSHelper.Locators.barLabel.withText(CDSHelper.QED_4).refindWhenNeeded(getDriver()), QED4ToolTipText);
    }

    @Test
    public void testMAbGridTooltip()
    {
        CDSHelper.NavigationLink.MABGRID.makeNavigationSelection(this);
        DataGrid dataGrid = new DataGrid(this);
        WebElement filterPanel = dataGrid.openFilterPanel("Studies");
        validateToolTip(Locator.byClass("x-grid-cell-inner").withText(CDSHelper.RED_4).findElement(filterPanel), RED4ToolTipText);
    }

    @Test
    public void testPlotTooltip()
    {
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        YAxisVariableSelector yaxis = new YAxisVariableSelector(this);
        yaxis.openSelectorWindow();
        yaxis.pickSource(CDSHelper.PKMAB);
        yaxis.pickVariable(CDSHelper.PKMAB_CONCENTRATION);
        yaxis.confirmSelection();

        XAxisVariableSelector xaxis = new XAxisVariableSelector(this);
        xaxis.openSelectorWindow();
        xaxis.pickSource(CDSHelper.TIME_POINTS);
        xaxis.confirmSelection();

        validateToolTip(waitForElementToBeVisible(Locator.css("svg text.study-label")), ZAP134ToolTipText);
    }

    public void validateToolTip(WebElement el, String toolTipExpected)
    {
        String linkText = el.getText().trim();

        log("Hover over the link with text '" + linkText + "' to validate that the tooltip is shown.");

        // Not a fatal error if a tooltip is not shown.
        String tooltipText = triggerToolTip(el);
        checker().wrapAssertion(() -> assertTextPresent(new TextSearcher(tooltipText), toolTipExpected));
        checker().screenShotIfNewError("ValidateToolTip_" + linkText);

        // Filter panel tooltip is a little more sticky
        CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel")
                .findOptionalElement(getDriver())
                .ifPresent(WebElement::click);

        // Move the mouse off of the element that shows the tool tip, and then wait for the tool tip to disappear.
        dismissTooltip(this);
    }

    private String triggerToolTip(WebElement el)
    {
        // Move the mouse to the top left corner of the page and make sure there are no popups visible.
        dismissTooltip(this);

        return waitFor(() -> {
            // Move the mouse over the element.
            mouseOver(el);

            try
            {
                // Check for the tooltip.
                return TOOLTIP_TEXT_LOCATOR.findElement(getDriver()).getText();
            }
            catch (NoSuchElementException | StaleElementReferenceException retry)
            {
                return null;
            }
        }, 2_000);
    }

    public static void dismissTooltip(WebDriverWrapper webDriver)
    {
        webDriver.shortWait().withMessage("Failed to dismiss tooltip").until(wd -> {
        webDriver.mouseOver(Locator.xpath(CDSHelper.LOGO_IMG_XPATH));
            WebElement bubble = Locator.css(".hopscotch-bubble").findWhenNeeded(webDriver.getDriver());
            return !bubble.isDisplayed() || bubble.getLocation().getY() <= 0; // Hidden, non-existent, or in the corner will suffice
        });
    }
}
