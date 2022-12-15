package org.labkey.test.tests.cds;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.util.List;

@Category({Git.class})
public class CDSTooltipVerificationTest extends CDSReadOnlyTest
{
    private static final Locator TOOLTIP_TEXT_LOCATOR = Locator.css("div.hopscotch-bubble-container div.hopscotch-bubble-content div.hopscotch-content");
    private final CDSHelper cds = new CDSHelper(this);
    private String RED4ToolTipText = "Vestibulum quam sapien, varius ut, blandit non, interdum in, ante. " +
            "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Duis faucibus accumsan odio. Curabitur convallis. " +
            "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor.";
    private String QED4ToolTipText = "Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor. Duis mattis egestas metus.";
    private String ZAP138ToolTipText = "Nunc nisl. Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. " +
            "Duis at velit eu est congue elementum. In hac habitasse platea dictumst.";

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
        cds.viewLearnAboutPage("Assays");
        LearnGrid learnGrid = new LearnGrid(this);
        learnGrid.setSearch("ICS").clickFirstItem();
        validateToolTip(Locator.linkWithText("RED 4").findElement(getDriver()), RED4ToolTipText);

        log("Verifying the tooltip for Learn about - Products");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        cds.viewLearnAboutPage("Products");
        learnGrid = new LearnGrid(this);
        learnGrid.clickFirstItem();
        validateToolTip(Locator.linkWithText("QED 4").findElement(getDriver()), QED4ToolTipText);

        log("Verifying the tooltip for Learn about - MAbs");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        cds.viewLearnAboutPage("MAbs");
        learnGrid = new LearnGrid(this);
        learnGrid.setSearch("2F5").clickFirstItem();
        validateToolTip(Locator.linkWithText("QED 4").findElement(getDriver()), QED4ToolTipText);

        log("Verifying the tooltip for Learn about - Publications");
        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        cds.viewLearnAboutPage("Publications");
        learnGrid = new LearnGrid(this);
        learnGrid.clickFirstItem();
        validateToolTip(Locator.linkWithText("ZAP 138").findElement(getDriver()), ZAP138ToolTipText);
    }

    public void validateToolTip(WebElement el, String toolTipExpected)
    {
        String linkText = el.getText().trim();
        checker().verifyFalse("Provided element doesn't appear to be a link. Link text:\n" + linkText, linkText.contains("\n"));

        log("Hover over the link with text '" + linkText + "' to validate that the tooltip is shown.");
        String toolTipText;

        // Not a fatal error if a tooltip is not shown.
        String screenShotName = "ValidateToolTip_" + linkText;

        checker().setErrorMark();
        checker().withScreenshot(screenShotName).verifyTrue("Tooltip for '" + linkText + "' didn't show. Show yourself coward!", triggerToolTip(el));

        if (checker().errorsSinceMark() == 0)
        {
            // If the tool-tip is present, checker().verifyTrue returned true, check the text of the tooltip.
            toolTipText = getToolTipText();
            validateToolTipText(toolTipText, List.of(toolTipExpected));
        }

        // Move the mouse off of the element that shows the tool tip, and then wait for the tool tip to disappear.
        dismissTooltip();
    }

    private void validateToolTipText(String toolTipText, List<String> expectedText)
    {
        for (String expected : expectedText)
        {
            // Not a fatal error if the tooltip does not contain the expected text.
            checker().withScreenshot("ToolTipTextError").verifyTrue("Tool tip did not contain text: '" + expected + "'. Found: '" + toolTipText + "'.",
                    toolTipText.trim().toLowerCase().contains(expected.trim().toLowerCase()));
        }
    }

    private String getToolTipText()
    {
        // Shouldn't have to put this check here, but getText is not always return the text of the tooltip so
        // validate that it is there first.
        waitForElementToBeVisible(TOOLTIP_TEXT_LOCATOR);
        return getText(TOOLTIP_TEXT_LOCATOR);
    }

    private boolean triggerToolTip(WebElement el)
    {
        // Move the mouse to the top left corner of the page and make sure there are no popups visible.
        dismissTooltip();

        // Move the mouse over the element.
        mouseOver(el);

        // Wait for the tooltip to show up.
        return waitFor(() ->
                        TOOLTIP_TEXT_LOCATOR.findWhenNeeded(getDriver()).isDisplayed(),
                2_000);
    }

    public void dismissTooltip()
    {
        shortWait().withMessage("Failed to dismiss tooltip").until(wd -> {
        mouseOver(Locator.xpath(CDSHelper.LOGO_IMG_XPATH));
            WebElement bubble = Locator.css(".hopscotch-bubble").findWhenNeeded(getDriver());
            return !bubble.isDisplayed() || bubble.getLocation().getY() <= 0; // Hidden, non-existent, or in the corner will suffice
        });
    }
}
