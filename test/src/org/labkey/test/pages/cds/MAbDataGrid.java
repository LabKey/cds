package org.labkey.test.pages.cds;

import com.google.common.collect.ImmutableList;
import org.labkey.remoteapi.collections.CaseInsensitiveHashMap;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class MAbDataGrid extends WebDriverComponent<MAbDataGrid.ElementCache>
{
    public static final String MAB_COL = "Mab/Mixture";
    public static final String SPECIES_COL = "Donor Species";
    public static final String ISOTYPE_COL = "Isotype";
    public static final String HXB2_COL = "HXB2 Location";
    public static final String VIRUSES_COL = "Viruses";
    public static final String CLADES_COL = "Clades";
    public static final String TIERS_COL = "Tiers";
    public static final String GEOMETRIC_MEAN_IC50_COL = "Geometric mean Curve IC50";
    public static final String STUDIES_COL = "Studies";

    public static final List<String> ColumnLabels = Arrays.asList(MAB_COL, SPECIES_COL, ISOTYPE_COL, HXB2_COL,
            VIRUSES_COL, CLADES_COL, TIERS_COL, GEOMETRIC_MEAN_IC50_COL, STUDIES_COL);

    private final List<String> _columnLabels = new ArrayList<>();

    private final WebDriverWrapper _webDriverWrapper;
    private final DataGrid _gridHelper;

    private final WebElement _gridEl;

    public MAbDataGrid(WebElement gridEl, BaseWebDriverTest test, WebDriverWrapper webDriverWrapper)
    {
        this._webDriverWrapper = webDriverWrapper;
        this._gridHelper = new DataGrid(test);
        this._gridEl = gridEl;
    }

    public void setFacet(String columnName, boolean check, String... values)
    {
        _gridHelper.openFilterPanel(columnName);
        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");

        checkAll(!check);

        for (String value : values)
        {
            Locator.XPathLocator row = gridLoc.append(Locator.tagWithClass("tr", "x-grid-data-row").
                    withChild(Locator.tagWithClass("td", "x-grid-td").
                            withChild(Locator.tagWithText("div", value))));
            Locator.XPathLocator checkbox = row.append(Locator.tagWithClass("td", "x-grid-cell-row-checker"));
            _webDriverWrapper.waitAndClick(1000, checkbox, 0);
        }

        applyFilter();
    }

    public AntigenFilterPanel openVirusPanel(String columnName)
    {
        _gridHelper.openFilterPanel(columnName == null ? VIRUSES_COL : columnName);
        return new AntigenFilterPanel(_webDriverWrapper);
    }

    private void checkAll(boolean check)
    {
        Locator.XPathLocator checkbox = Locators.filterCheckAllLoc;
        Locator.XPathLocator checkedLoc = checkbox.append(Locator.tagWithClass("div", "x-grid-hd-checker-on"));
        if((check && !_webDriverWrapper.isElementPresent(checkedLoc))
            || (!check && _webDriverWrapper.isElementPresent(checkedLoc)))
            _webDriverWrapper.click(checkbox.append(Locator.tagWithClass("div", "x-column-header-checkbox")));
    }

    public void clearAllFilters()
    {
        String[] uniqueFacetFilterColumns = {MAB_COL, SPECIES_COL, ISOTYPE_COL, HXB2_COL, GEOMETRIC_MEAN_IC50_COL, STUDIES_COL};
        for (String column : uniqueFacetFilterColumns)
        {
            clearFacetFilter(column);
        }
        clearVirusFilter();
    }

    public void clearFacetFilter(String columnName)
    {
        if (!_gridHelper.isColumnFiltered(columnName))
            return;

        _gridHelper.openFilterPanel(columnName);
        checkAll(true);
        applyFilter();
    }

    public List<String> getFilteredColumns()
    {
        List<String> filteredColumns = new ArrayList<>();
        for (String column : ColumnLabels)
        {
            if (_gridHelper.isColumnFiltered(column))
                filteredColumns.add(column);
        }
        return filteredColumns;
    }

    public void clearVirusFilter()
    {
        if (!_gridHelper.isColumnFiltered(VIRUSES_COL))
            return;
        _gridHelper.openFilterPanel(VIRUSES_COL);
        AntigenFilterPanel virusPanel = new AntigenFilterPanel(_webDriverWrapper);
        virusPanel.checkAll(false);
        virusPanel.checkAll(true);
        applyFilter();
    }

    public void applyFilter()
    {
        List<WebElement> buttons = CDSHelper.Locators.cdsButtonLocator("Done").findElements(_webDriverWrapper.getDriver());
        final WebElement button = buttons.get(0);

        _gridHelper.applyAndWaitForGrid(() -> {
            button.click();
            _webDriverWrapper.sleep(500);
            _webDriverWrapper._ext4Helper.waitForMaskToDisappear();
        });
    }

    public void cancelFilter()
    {
        List<WebElement> buttons = CDSHelper.Locators.cdsButtonLocator("Cancel").findElements(_webDriverWrapper.getDriver());
        final WebElement button = buttons.get(0);
        button.click();
    }

    public int getMabCounts()
    {
        return elementCache().getDataRows().size();
    }

    public List<String> getColumnLabels()
    {
        if (_columnLabels.isEmpty())
        {
            _columnLabels.addAll(_webDriverWrapper.getTexts(elementCache().getColumnHeaders()));
            _columnLabels.remove(0); // remove selector column
        }

        return ImmutableList.copyOf(_columnLabels);
    }

    public String getMabCellValue(String mabName, String columnLabel)
    {
        int colInd = ColumnLabels.indexOf(columnLabel) + 1;
        WebElement row = Locators.getRowLocByMabName(mabName).findElement(this);
        List<WebElement> cells = Locator.xpath("td").findElements(row);
        return cells.get(colInd).getText();
    }

    @Override
    public WebElement getComponentElement()
    {
        return this._gridEl;
    }

    @Override
    public MAbDataGrid.ElementCache elementCache()
    {
        return (MAbDataGrid.ElementCache) super.elementCache();
    }

    @Override
    protected MAbDataGrid.ElementCache newElementCache()
    {
        return new MAbDataGrid.ElementCache();
    }

    @Override
    protected WebDriver getDriver()
    {
        return null;
    }

    public static class Locators
    {
        public static Locator.XPathLocator columnHeader = Locator.tagWithClass("div", "x-column-header-align-left");
        public static Locator.XPathLocator rowCheckBoxLoc = Locator.tagWithClass("td", "x-grid-cell-row-checker");
        public static Locator.XPathLocator filterCheckAllLoc = Locator.tagWithClass("div", "x-box-target").withChild(Locator.tagWithClass("div", "x-column-header-last").withText("All"));

        public static Locator.XPathLocator getRowLocByMabName(String mAbName)
        {
            return Locator.tagWithAttribute("tr", "data-recordid", mAbName);
        }

        public static Locator.XPathLocator getRowCheckbox(int rowInd)
        {
            return Locators.rowCheckBoxLoc.index(rowInd);
        }

        public static Locator.XPathLocator getMabCheckbox(String mAbName)
        {
            return Locators.getRowLocByMabName(mAbName).append(Locators.rowCheckBoxLoc);
        }
    }

    public class ElementCache extends Component.ElementCache
    {
        private final WebElement mabGrid = Locator.tagWithClass("div", "mab-connector-grid").findWhenNeeded(this);
        private List<WebElement> columnHeaders;
        private final Map<String, WebElement> columnHeadersByName = new CaseInsensitiveHashMap<>();

        protected List<WebElement> getDataRows()
        {
            return Locator.tagWithAttribute("tr", "role", "row").findElements(this);
        }

        protected WebElement getDataRow(int row)
        {
            return getDataRows().get(row);
        }

        protected WebElement getColumnHeader(String colName)
        {
            if (!columnHeadersByName.containsKey(colName))
            {
                columnHeadersByName.put(colName, Locator.findAnyElement("Column header named " + colName, this,
                        Locators.columnHeader.withText(colName),
                        Locators.columnHeader.withText(colName.toLowerCase())));
            }
            return columnHeadersByName.get(colName);
        }

        protected List<WebElement> getColumnHeaders()
        {
            if (columnHeaders == null)
                columnHeaders = ImmutableList.copyOf(Locators.columnHeader.findElements(mabGrid));
            return columnHeaders;
        }
    }

}
