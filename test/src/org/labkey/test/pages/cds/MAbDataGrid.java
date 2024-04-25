/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.test.pages.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.cds.CdsGrid;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.labkey.test.WebDriverWrapper.WAIT_FOR_PAGE;
import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_DILUTION_REPORT;
import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_IC50_REPORT;

public class MAbDataGrid extends WebDriverComponent<MAbDataGrid.ElementCache>
{
    public static final String NABMAB_DATASET_NAME = "Neutralization Antibody - Monoclonal Antibodies";

    public static final String MAB_COL = "MAb/Mixture";
    public static final String SPECIES_COL = "Donor Species";
    public static final String ISOTYPE_COL = "Isotype";
    public static final String HXB2_COL = "HXB2 Location";
    public static final String ANTIGEN_BINDING_COL = "Antibody binding type";
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
    public static final List<String> NABMAB_ASSAY_COLUMNS = Arrays.asList("Study", "Mab mix id", "Mab mix label", "Mab mix name std",
            "MAb name source", "Assay identifier", "Cell control mean", "Curve id", "Data summary level", "Fit asymmetry",
            "Fit error", "Fit inflection", "Fit max", "Fit min", "Fit slope", "Initial concentration", "Lab ID", "MAb concentration",
            "MAb concentration units", "Max concentration",	"Max well value", "Mean well value", "Min concentration", "Min well value",
            "Neutralization plus minus", "Neutralization tier",	"Percent neutralization", "Response call IC50",	"Response call IC80", "Slope",
            "Specimen concentration id", "Specimen type", "Target cell", "Titer curve IC50", "Titer curve IC80", "Titer point IC50", "Titer point IC80",
            "Vaccine matched",	"Virus control mean", "Virus dilution",	"Well std dev",	"Virus name", "Virus full name", "Virus type",
            "Virus species", "Virus clade",	"Virus host cell", "Virus backbone");

    public static final List<String> NABMAB_ASSAY_VARIABLES = Arrays.asList("Assay identifier",
            "Cell control mean", "Curve id", "Data summary level", "Fit asymmetry", "Fit error", "Fit inflection", "Fit max", "Fit min", "Fit slope", "Initial concentration", "Lab ID", "MAb concentration units", "MAb concentration");

    public static final List<String> ColumnLabels = Arrays.asList(MAB_COL, SPECIES_COL, ISOTYPE_COL, HXB2_COL, ANTIGEN_BINDING_COL,
            VIRUSES_COL, CLADES_COL, TIERS_COL, GEOMETRIC_MEAN_IC50_COL, STUDIES_COL);

    private final List<String> _columnLabels = new ArrayList<>();

    private final WebDriverWrapper _webDriverWrapper;
    private final WebElement _panelEl;

    public MAbDataGrid(BaseWebDriverTest test)
    {
        _webDriverWrapper = test;
        _panelEl = Locator.id("connector-view-mabgrid").findElement(_webDriverWrapper.getDriver());
    }

    public void setFacet(String columnName, boolean check, String... values)
    {
        setFacet(columnName, check, false, false, false, values);
    }

    public void setFacet(String columnName, boolean check, boolean skipCheckAll, boolean skipOpenDialog, boolean skipDone, String... values)
    {
        if (!skipOpenDialog)
            elementCache().mabGrid.openFilterPanel(columnName);

        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");

        if (!skipCheckAll)
            checkAll(!check);

        for (String value : values)
        {
            Locator.XPathLocator row = gridLoc.append(Locator.tagWithClass("tr", "x-grid-data-row").
                    withChild(Locator.tagWithClass("td", "x-grid-td").
                            withChild(Locator.tagWithText("div", value))));
            Locator.XPathLocator checkbox = row.append(Locator.tagWithClass("td", "x-grid-cell-row-checker"));
            getWrapper().waitAndClick(1000, checkbox, 0);
        }

        if (!skipDone)
            applyFilter();
    }

    public int getFilterOptionsCount()
    {
        Locator.XPathLocator gridLoc = Locator.tagWithClass("div", "filterpanegrid");
        Locator.XPathLocator optionsLoc = gridLoc.append(Locator.tagWithClass("td", "x-grid-cell-row-checker"));
        return optionsLoc.findElements(getWrapper().getDriver()).size();
    }

    public void setFilterSearch(String columnName, String searchValue)
    {
        setFilterSearch(columnName, searchValue, false);
    }

    public void setFilterSearch(String columnName, String searchValue, boolean skipOpenDialog)
    {
        if (!skipOpenDialog)
            elementCache().mabGrid.openFilterPanel(columnName);
        Locator.XPathLocator searchBoxLoc = Locator.tagWithClass("table", "mab-facet-search").append(Locator.tag("input"));
        getWrapper().waitForElement(searchBoxLoc);
        WebElement searchBox = searchBoxLoc.findElement(getWrapper().getDriver());
        getWrapper().setFormElement(searchBox, searchValue);
        WebDriverWrapper.sleep(1000);
    }

    public AntigenFilterPanel openVirusPanel(String columnName)
    {
        elementCache().mabGrid.openFilterPanel(columnName == null ? VIRUSES_COL : columnName);
        return new AntigenFilterPanel(getWrapper());
    }

    private void checkAll(boolean check)
    {
        Locator.XPathLocator checkbox = Locators.filterCheckAllLoc;
        Locator.XPathLocator checkedLoc = checkbox.append(Locator.tagWithClass("div", "x-grid-hd-checker-on"));
        if (check != getWrapper().isElementPresent(checkedLoc))
            getWrapper().click(checkbox.append(Locator.tagWithClass("div", "x-column-header-checkbox")));
    }

    public boolean isCheckAllPresent()
    {
        return getWrapper().isElementVisible(Locators.filterCheckAllLoc);
    }

    public void clearAllFilters()
    {
        Optional<WebElement> clearAllFilterBtn = CDSHelper.Locators.cdsButtonLocator("clear", "mabfilterclear").findOptionalElement(getDriver());
        clearAllFilterBtn.ifPresent(webElement ->
                elementCache().mabGrid.doAndWaitForGridUpdate(webElement::click));
        Locator.tagWithClass("div", "filtered-column").waitForElementToDisappear(this, WAIT_FOR_PAGE);
    }

    public boolean hasGridColumnFilters()
    {
        String[] uniqueFacetFilterColumns = {MAB_COL, SPECIES_COL, ISOTYPE_COL, HXB2_COL, GEOMETRIC_MEAN_IC50_COL, STUDIES_COL, VIRUSES_COL};
        for (String column : uniqueFacetFilterColumns)
        {
            if (elementCache().mabGrid.isColumnFiltered(column))
                return true;
        }
        return false;
    }

    public boolean isColumnFiltered(String column)
    {
        return elementCache().mabGrid.isColumnFiltered(column);
    }

    public void clearAllColumnFilters()
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
        if (!elementCache().mabGrid.isColumnFiltered(columnName))
            return;

        elementCache().mabGrid.openFilterPanel(columnName);
        checkAll(true);
        applyFilter();
    }

    public List<String> getFilteredColumns()
    {
        List<String> filteredColumns = new ArrayList<>();
        for (String column : ColumnLabels)
        {
            if (elementCache().mabGrid.isColumnFiltered(column))
                filteredColumns.add(column);
        }
        return filteredColumns;
    }

    public void clearVirusFilter()
    {
        if (!elementCache().mabGrid.isColumnFiltered(VIRUSES_COL))
            return;
        elementCache().mabGrid.openFilterPanel(VIRUSES_COL);
        AntigenFilterPanel virusPanel = new AntigenFilterPanel(getWrapper());
        virusPanel.checkAll(false);
        virusPanel.checkAll(true);
        applyFilter();
    }

    public void applyFilter()
    {
        String buttonText;

        Locator virusFilter = Locator.xpath("//div[contains(@class, 'x-window-closable')]//div[@class='header']//div[text()='Viruses tested against mAbs']");

        if (virusFilter.findOptionalElement(getDriver()).map(WebElement::isDisplayed).orElse(false))
        {
            // The filter being applied is the virus filter.
            buttonText = "Done";
        }
        else
        {
            buttonText = "Filter";
        }

        final WebElement button = CDSHelper.Locators.cdsButtonLocator(buttonText).findElement(getDriver());

        elementCache().mabGrid.doAndWaitForGridUpdate(() -> {
            button.click();
            getWrapper().shortWait().until(ExpectedConditions.stalenessOf(button));
            getWrapper()._ext4Helper.waitForMaskToDisappear();
        });
    }

    public void cancelFilter()
    {
        List<WebElement> buttons = CDSHelper.Locators.cdsButtonLocator("Cancel").findElements(getWrapper().getDriver());
        final WebElement button = buttons.get(0);
        button.click();
    }

    public int getMabCounts()
    {
        return elementCache().mabGrid.getDataRows().size();
    }

    public List<String> getColumnLabels()
    {
        return elementCache().mabGrid.getColumnNames();
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
        getWrapper().click(checkbox);
        if (getWrapper().isElementPresent(checkedLoc))
            getWrapper().click(checkbox);
        getWrapper().sleep(2000);
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
                getWrapper().click(Locators.getMabCheckbox(mabName));
            }
        }
    }

    public boolean isMabChecked(String mabName)
    {
        return getWrapper().isElementPresent(Locators.getSelectedRowLocByMabName(mabName));
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
        getWrapper().click(Locators.getMAbReportBtn(reportName));
        getWrapper().sleep(500);
        getWrapper().waitForElement(Locators.getMAbReportHeader(reportName));
        getWrapper()._ext4Helper.waitForMaskToDisappear(10000);
    }

    public void leaveReportView()
    {
        getWrapper().click(Locators.reportHeader);
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
        return Locators.reportOutput.findElement(getWrapper().getDriver()).getText();
    }

    public Locator.XPathLocator getReportImageOut()
    {
        return Locators.reportImgOutput();
    }

    public void verifyCDSExcel(CDSExport expected, boolean countOnly)
    {
        new DataGrid(_webDriverWrapper).verifyCDSExcel(expected, countOnly);
    }

    public void verifyCDSCSV(CDSExport expected) throws IOException
    {
        new DataGrid(_webDriverWrapper).verifyCDSCSV(expected);
    }

    @Override
    public WebElement getComponentElement()
    {
        return _panelEl;
    }

    @Override
    protected MAbDataGrid.ElementCache newElementCache()
    {
        return new MAbDataGrid.ElementCache();
    }

    @Override
    protected WebDriver getDriver()
    {
        return _webDriverWrapper.getDriver();
    }

    @Override
    public WebDriverWrapper getWrapper()
    {
        // Avoid creating a new `Ext4Helper`, which resets the css prefix
        return _webDriverWrapper;
    }

    public static class Locators
    {
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
            return CdsGrid.Locators.rowCheckBoxLoc.index(rowInd);
        }

        public static Locator.XPathLocator getMabCheckbox(String mAbName)
        {
            return Locators.getRowLocByMabName(mAbName).append(CdsGrid.Locators.rowCheckBoxLoc);
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

    public class ElementCache extends Component<?>.ElementCache
    {
        private final CdsGrid mabGrid = new CdsGrid("mab-connector-grid", MAbDataGrid.this);
    }

}
