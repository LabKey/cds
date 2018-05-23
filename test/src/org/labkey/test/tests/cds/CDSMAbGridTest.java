package org.labkey.test.tests.cds;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.AntigenFilterPanel;
import org.labkey.test.pages.cds.MAbDataGrid;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.labkey.test.pages.cds.MAbDataGrid.*;

@Category({})
public class CDSMAbGridTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);

    @Before
    public void preTest()
    {
        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();

        cds.goToAppHome();
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Override
    public Timeout testTimeout()
    {
        return new Timeout(60, TimeUnit.MINUTES);
    }

    @Test
    public void testMAbPage()
    {
        CDSHelper.NavigationLink.MABGRID.makeNavigationSelection(this);
        MAbDataGrid grid = new MAbDataGrid(getGridEl(), this, this);

        log("Verify subject based info pane presence for mAb and other tabs");
        Locator.XPathLocator subjectInfoPane = CDSHelper.Locators.subjectInfoPaneHeader().notHidden();
        assertElementNotPresent(subjectInfoPane);
        CDSHelper.NavigationLink.GRID.makeNavigationSelection(this);
        assertElementPresent(subjectInfoPane);
        CDSHelper.NavigationLink.MABGRID.makeNavigationSelection(this);

        log("Verify mAb summary grid content");
        grid.clearAllFilters();
        Assert.assertEquals("Number of mab/mabmix rows is not as expected", 54, grid.getMabCounts());
        Assert.assertEquals("Geometric mean value for '2F5' is not as expected", "1.50583", grid.getMabCellValue("2F5", GEOMETRIC_MEAN_IC50_COL));
    }

    @Test
    public void testMAbGridWithFiltering()
    {
        CDSHelper.NavigationLink.MABGRID.makeNavigationSelection(this);
        MAbDataGrid grid = new MAbDataGrid(getGridEl(), this, this);
        grid.clearAllFilters();

        log("Verify mAb mix filter");
        List<String> filteredColumns = new ArrayList<>();
        grid.setFacet(MAB_COL,false,"2F5", "A14");
        filteredColumns.add(MAB_COL);
        verifyGridCountAndFilteredColumns(grid, 52, filteredColumns);

        log("Verify mAb mix metadata filters");
        grid.setFacet(SPECIES_COL,false,"llama");
        filteredColumns.add(SPECIES_COL);
        verifyGridCountAndFilteredColumns(grid, 49, filteredColumns);

        grid.setFacet(ISOTYPE_COL,true,"[blank]", "IgG3?");
        filteredColumns.add(ISOTYPE_COL);
        verifyGridCountAndFilteredColumns(grid, 42, filteredColumns);

        grid.setFacet(HXB2_COL,true,"[blank]");
        filteredColumns.add(HXB2_COL);
        verifyGridCountAndFilteredColumns(grid, 41, filteredColumns);

        log("Verify IC50 filter updates geometric mean values");
        Assert.assertEquals("Geometric mean value for 'AB-000402-1' is not as expected prior to filtering", "0.03717", grid.getMabCellValue("AB-000402-1", GEOMETRIC_MEAN_IC50_COL));
        grid.setFacet(GEOMETRIC_MEAN_IC50_COL,true,"< 0.1");
        filteredColumns.add(GEOMETRIC_MEAN_IC50_COL);
        verifyGridCountAndFilteredColumns(grid, 21, filteredColumns);
        Assert.assertEquals("Geometric mean value for 'AB-000402-1' is not as expected after filtering", "0.02388", grid.getMabCellValue("AB-000402-1", GEOMETRIC_MEAN_IC50_COL));

        log("Verify study filter");
        grid.setFacet(STUDIES_COL,true,"z118", "z128");
        filteredColumns.add(STUDIES_COL);
        verifyGridCountAndFilteredColumns(grid, 10, filteredColumns);

        log("Verify virus filter panel reflects active filter counts");
        AntigenFilterPanel virusPanel = grid.openVirusPanel(null);
        String testValue = "virus-1A-B-MN.3";
        Assert.assertTrue(virusPanel.isVirusChecked(testValue));
        Assert.assertTrue("Virus should have been filtered out for selection", virusPanel.isVirusDisabled(testValue));
        Assert.assertEquals("MAb count is not as expected", 0, virusPanel.getCount(testValue));

        testValue = "virus-1B-A-Q23.17";
        Assert.assertTrue(virusPanel.isVirusChecked(testValue));
        Assert.assertFalse("Virus should be active for selection", virusPanel.isVirusDisabled(testValue));
        Assert.assertEquals("MAb count is not as expected", 3, virusPanel.getCount(testValue));

        virusPanel.checkVirus(testValue, false);
        grid.applyFilter();
        filteredColumns.addAll(4, Arrays.asList(VIRUSES_COL, CLADES_COL, TIERS_COL));
        log("Verify virus filter panel reflects active filter counts");
        verifyGridCountAndFilteredColumns(grid, 8, filteredColumns);

        virusPanel = grid.openVirusPanel(CLADES_COL);
        Assert.assertFalse(virusPanel.isVirusChecked(testValue));
        Assert.assertEquals("MAb count is not as expected", 3, virusPanel.getCount(testValue));
        grid.cancelFilter();

        log("Verify removing filters");
        grid.clearAllFilters();
        verifyGridCountAndFilteredColumns(grid, 54, new ArrayList<>());
    }

    private void verifyGridCountAndFilteredColumns(MAbDataGrid grid, int rowCount, List<String> filteredColumns)
    {
        Assert.assertEquals("Number of mab/mabmix rows is not as expected", rowCount, grid.getMabCounts());
        Assert.assertEquals("Columns with filtered icons aren't as expected", filteredColumns, grid.getFilteredColumns());
    }

    @Test
    public void testMAbSearchFilter()
    {
        CDSHelper.NavigationLink.MABGRID.makeNavigationSelection(this);
        MAbDataGrid grid = new MAbDataGrid(getGridEl(), this, this);
        grid.clearAllFilters();

        log("Verify mAb mix filter with search");
        List<String> filteredColumns = new ArrayList<>();
        grid.setFacet(MAB_COL,true,"2F5", "A14");
        filteredColumns.add(MAB_COL);
        verifyGridCountAndFilteredColumns(grid, 2, filteredColumns);

        log("Verify search narrows down options");
        grid.setFilterSearch(MAB_COL, "B21");
        Assert.assertEquals("Facet options aren't narrowed down as expected", 1, grid.getFilterOptionsCount());

        log("Verify 'Check All' not present with search");
        Assert.assertFalse("Check All shouldn't be visible with search text present", grid.isCheckAllPresent());

        log("Verify newly checked as well as hidden checked values are both applied as filters");
        grid.setFacet(MAB_COL,true, true, true, false, "B21");
        verifyGridCountAndFilteredColumns(grid, 3, filteredColumns);

        log("Verify backspace on search");
        grid.setFilterSearch(MAB_COL, "f5");
        Assert.assertEquals("Facet options aren't narrowed down as expected", 1, grid.getFilterOptionsCount());
        grid.setFacet(MAB_COL,false, true, true, true, "2F5");

        grid.setFilterSearch(MAB_COL, "f", true);
        Assert.assertEquals("Facet options aren't narrowed down as expected", 5, grid.getFilterOptionsCount());

        log("Verify clear on search");
        grid.setFilterSearch(MAB_COL, "", true);
        Assert.assertTrue("Facet options aren't narrowed down as expected", grid.getFilterOptionsCount() > 100);

        grid.applyFilter();
        verifyGridCountAndFilteredColumns(grid, 2, filteredColumns);
    }

    private WebElement getGridEl()
    {
        return Locator.tagWithClass("div", "mab-connector-grid").findElement(getDriver());
    }

}
