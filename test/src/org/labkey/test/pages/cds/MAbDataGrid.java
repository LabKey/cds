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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_DILUTION_REPORT;
import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_IC50_REPORT;

public class MAbDataGrid extends WebDriverComponent<MAbDataGrid.ElementCache>
{
    public static final String NABMAB_DATASET_NAME = "Neutralization Antibody - Monoclonal Antibodies";

    public static final String MAB_COL = "MAb/Mixture";
    public static final String SPECIES_COL = "Donor Species";
    public static final String ISOTYPE_COL = "Isotype";
    public static final String HXB2_COL = "HXB2 Location";
    public static final String VIRUSES_COL = "Viruses";
    public static final String CLADES_COL = "Clades";
    public static final String TIERS_COL = "Tiers";
    public static final String GEOMETRIC_MEAN_IC50_COL = "Geometric mean Curve IC50";
    public static final String STUDIES_COL = "Studies";

    public static final String GRID_TITLE_STUDY_AND_MABS = "Study and MAbs";
    public static final List<String> STUDY_AND_MABS_COLUMNS = Arrays.asList("Study", "Mab mix id", "Mab mix label", "Mab mix name std");
    public static final String GRID_TITLE_MABS_META = "MAbs";
    public static final List<String> MABS_COLUMNS = Arrays.asList("Mab mix id", "Mab mix label", "Mab mix name std", "Mab id", "Mab name std", "Mab Lanl id");
    public static final String GRID_TITLE_NAB_MAB_ASSAY = "NAB MAB";
    public static final List<String> NABMAB_ASSAY_COLUMNS = Arrays.asList("Study", "Mab mix id", "Mab mix label", "Mab mix name std", "Mab name source", "Assay identifier", "Curve id", "Data summary level");

    public static final List<String> NABMAB_ASSAY_VARIABLES = Arrays.asList("Assay identifier",
            "Curve id", "Data summary level", "Fit asymmetry", "Fit error", "Fit inflection", "Fit max", "Fit min", "Fit slope", "Initial concentration", "Lab ID", "Mab concentration units", "Mab concentration");

    public static final List<String> ColumnLabels = Arrays.asList(MAB_COL, SPECIES_COL, ISOTYPE_COL, HXB2_COL,
            VIRUSES_COL, CLADES_COL, TIERS_COL, GEOMETRIC_MEAN_IC50_COL, STUDIES_COL);

    private final List<String> _columnLabels = new ArrayList<>();

    private final WebDriverWrapper _webDriverWrapper;
    private final DataGrid _gridHelper;

    private final WebElement _gridEl;

    public MAbDataGrid(WebElement gridEl, BaseWebDriverTest test, WebDriverWrapper webDriverWrapper)
    {
        _webDriverWrapper = webDriverWrapper;
        _gridHelper = new DataGrid(test);
        _gridEl = gridEl;
    }

    public void setFacet(String columnName, boolean check, String... values)
    {
        setFacet(columnName, check, false, false, false, values);
    }

    public void setFacet(String columnName, boolean check, boolean skipCheckAll, boolean skipOpenDialog, boolean skipDone, String... values)
    {
        if (!skipOpenDialog)
            _gridHelper.openFilterPanel(columnName);

        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");

        if (!skipCheckAll)
            checkAll(!check);

        for (String value : values)
        {
            Locator.XPathLocator row = gridLoc.append(Locator.tagWithClass("tr", "x-grid-data-row").
                    withChild(Locator.tagWithClass("td", "x-grid-td").
                            withChild(Locator.tagWithText("div", value))));
            Locator.XPathLocator checkbox = row.append(Locator.tagWithClass("td", "x-grid-cell-row-checker"));
            _webDriverWrapper.waitAndClick(1000, checkbox, 0);
        }

        if (!skipDone)
            applyFilter();
    }

    public int getFilterOptionsCount()
    {
        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");
        Locator.XPathLocator optionsLoc = gridLoc.append(Locator.tagWithClass("td", "x-grid-cell-row-checker"));
        return optionsLoc.findElements(_webDriverWrapper.getDriver()).size();
    }

    public void setFilterSearch(String columnName, String searchValue)
    {
        setFilterSearch(columnName, searchValue, false);
    }

    public void setFilterSearch(String columnName, String searchValue, boolean skipOpenDialog)
    {
        if (!skipOpenDialog)
            _gridHelper.openFilterPanel(columnName);
        Locator.XPathLocator searchBoxLoc = Locator.tagWithClass("table", "mab-facet-search").append(Locator.tag("input"));
        _webDriverWrapper.waitForElement(searchBoxLoc);
        WebElement searchBox = searchBoxLoc.findElement(_webDriverWrapper.getDriver());
        _webDriverWrapper.setFormElement(searchBox, searchValue);
        WebDriverWrapper.sleep(1000);
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
        if ((check && !_webDriverWrapper.isElementPresent(checkedLoc))
            || (!check && _webDriverWrapper.isElementPresent(checkedLoc)))
            _webDriverWrapper.click(checkbox.append(Locator.tagWithClass("div", "x-column-header-checkbox")));
    }

    public boolean isCheckAllPresent()
    {
        return _webDriverWrapper.isElementVisible(Locators.filterCheckAllLoc);
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
        List<WebElement> buttons;

        Locator virusFilter = Locator.xpath("//div[contains(@class, 'x-window-closable')]//div[@class='header']//div[text()='Viruses tested against mAbs']");
        int index;

        if ((_webDriverWrapper.isElementPresent(virusFilter)) &&(_webDriverWrapper.isElementVisible(virusFilter)))
        {
            // The filter being applied is the virus filter.
            buttons = CDSHelper.Locators.cdsButtonLocator("Done").findElements(_webDriverWrapper.getDriver());
            index = 0;
        }
        else
        {
            buttons = CDSHelper.Locators.cdsButtonLocator("Filter").findElements(_webDriverWrapper.getDriver());
            index = 1;
        }

        final WebElement button = buttons.get(index);

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

    public void clearAllSelections()
    {
        Locator.XPathLocator checkbox = Locators.headerCheckboxLoc;
        Locator.XPathLocator checkedLoc = checkbox.withClass("x-grid-hd-checker-on");
        _webDriverWrapper.click(checkbox);
        if (_webDriverWrapper.isElementPresent(checkedLoc))
            _webDriverWrapper.click(checkbox);
    }

    public void selectMAbs(String ...mabNames)
    {
        checkMAbs(true, mabNames);
    }

    public void unselectMAbs(String ...mabNames)
    {
        checkMAbs(false, mabNames);
    }

    public void checkMAbs(boolean check, String ...mabNames)
    {
        for (String mabName: mabNames)
        {
            if (isMabChecked(mabName) != check)
            {
                _webDriverWrapper.click(Locators.getMabCheckbox(mabName));
            }
        }
    }

    public boolean isMabChecked(String mabName)
    {
        return _webDriverWrapper.isElementPresent(Locators.getSelectedRowLocByMabName(mabName));
    }

    public void openDilutionReport()
    {
        openMAbReport(NAB_MAB_DILUTION_REPORT);
    }

    public void openIC50Report()
    {
        openMAbReport(NAB_MAB_IC50_REPORT);
    }

    public void openMAbReport(String reportName)
    {
        _webDriverWrapper.click(Locators.getMAbReportBtn(reportName));
        _webDriverWrapper.sleep(500);
        _webDriverWrapper.waitForElement(Locators.getMAbReportHeader(reportName));
        _webDriverWrapper._ext4Helper.waitForMaskToDisappear();
    }

    public void leaveReportView()
    {
        _webDriverWrapper.click(Locators.reportHeader);
    }

    public Locator.XPathLocator getDilutionReportBtn()
    {
        return Locators.getMAbReportBtn(NAB_MAB_DILUTION_REPORT);
    }

    public Locator.XPathLocator getIC50ReportBtn()
    {
        return Locators.getMAbReportBtn(NAB_MAB_IC50_REPORT);
    }

    public String getReportOutput()
    {
        return Locators.reportOutput.findElement(_webDriverWrapper.getDriver()).getText();
    }

    public Locator.XPathLocator getReportImageOut()
    {
        return Locators.reportImgOutput();
    }

    public void verifyCDSExcel(CDSExport expected, boolean countOnly)
    {
        _gridHelper.verifyCDSExcel(expected, countOnly);
    }

    public void verifyCDSCSV(CDSExport expected) throws IOException
    {
        _gridHelper.verifyCDSCSV(expected);
    }

    @Override
    public WebElement getComponentElement()
    {
        return _gridEl;
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
        public static Locator.XPathLocator headerCheckboxLoc = Locator.tagWithClass("div", "x-column-header-checkbox");
        public static Locator.XPathLocator reportBtn = Locator.tagWithClass("a", "mabgridcolumnsbtn");
        public static Locator.XPathLocator reportHeader = Locator.tagWithClass("div", "title-and-back-panel")
                .withChild(Locator.tagWithClass("div", "breadcrumb").withText("Monoclonal antibodies /"));
        public static Locator.XPathLocator reportOutput = Locator.tagWithClass("table", "labkey-output");

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

        public static Locator.XPathLocator getSelectedRowLocByMabName(String mAbName)
        {
            return Locator.tagWithAttribute("tr", "data-recordid", mAbName).withClass("x-grid-row-selected");
        }

        public static Locator.XPathLocator getMAbReportBtn(String reportName)
        {
            return reportBtn.withText(reportName);
        }

        public static Locator.XPathLocator getMAbReportHeader(String reportName)
        {
            return reportHeader.withChild(Locator.tagWithText("div", reportName));
        }

        public static Locator.XPathLocator reportImgOutput()
        {
            return reportOutput.append(Locator.tagWithAttribute("img", "name", "resultImage"));
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
                columnHeaders = Collections.unmodifiableList(Locators.columnHeader.findElements(mabGrid));
            return columnHeaders;
        }
    }

}
