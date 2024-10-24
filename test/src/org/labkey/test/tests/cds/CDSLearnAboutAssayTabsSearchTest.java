package org.labkey.test.tests.cds;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.LearnDetailsPage;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.util.cds.CDSHelper;

import java.util.Arrays;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 5)
public class CDSLearnAboutAssayTabsSearchTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();
        // go back to app starting location
        cds.goToAppHome();
    }

    /*
     Test coverage for
     Issue 48916: CDS : search not working for assay variables or antigens
     */
    @Test
    public void testVariablesSearch()
    {
        LearnGrid summaryGrid = cds.viewLearnAboutPage(LearnGrid.LearnTab.ASSAYS);

        log("Test basic search functionality.");
        LearnDetailsPage.DetailLearnGrid icsVariableGrid = summaryGrid
                .clickItemContaining(CDSHelper.TITLE_ICS)
                .getGridTab(LearnGrid.LearnTab.ASSAY_VARIABLES);
        icsVariableGrid.setSearch("%");
        Assert.assertEquals("Incorrect count in search result", 3, icsVariableGrid.getRowCount());
        Assert.assertEquals("Search results for Assay-->Variable is incorrect", Arrays.asList("Magnitude (% cells) - Background subtracted",
                        "Magnitude (% cells) - Background",
                        "Magnitude (% cells) - Raw"),
                getTexts(Locator.tagWithClass("div", "variable-list-title").findElements(getDriver())));

        icsVariableGrid.setSearch("Junk search");
        Assert.assertEquals("Incorrect count in search result", 0, icsVariableGrid.getRowCount());
        Assert.assertTrue("Missing text for no result found", isTextPresent("No available variables meet your selection criteria."));
    }

    @Test
    public void testAntigenSearch()
    {
        LearnGrid summaryGrid = cds.viewLearnAboutPage(LearnGrid.LearnTab.ASSAYS);

        log("Test basic search functionality.");
        LearnDetailsPage.DetailLearnGrid bamaAntigenGrid = summaryGrid
                .clickItemContaining(CDSHelper.TITLE_BAMA)
                .getGridTab(LearnGrid.LearnTab.ASSAY_ANTIGENS);

        bamaAntigenGrid.setSearch("antibody");
        Assert.assertEquals("Incorrect search result", 0, bamaAntigenGrid.getRowCount());

        bamaAntigenGrid.setSearch(CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA[0]);
        scrollIntoView(Locator.tagWithClass("div", "detail-gray-text").containing("Scaffold A"));
        scrollIntoView(Locator.tagWithClass("p", "detail-gray-text").containing("Diversity"));
        Assert.assertEquals("Incorrect search result", 1, bamaAntigenGrid.getRowCount());

        assertElementPresent(Locator.tagWithClass("p", "detail-gray-text").containing("E Subtype"));
        assertElementPresent(Locator.tagWithClass("p", "detail-gray-text").containing("F Subtype"));
        scrollIntoView(Locator.tagWithClass("div", "detail-gray-text").containing("cds_ag_1323"));

        assertElementPresent(Locator.tagWithId("div", "app-view-assayantigengrid-body"));
    }
}
