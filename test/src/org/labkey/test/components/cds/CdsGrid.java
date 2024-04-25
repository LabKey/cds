package org.labkey.test.components.cds;

import org.jetbrains.annotations.NotNull;
import org.labkey.remoteapi.collections.CaseInsensitiveHashMap;
import org.labkey.test.Locator;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.ext4.Checkbox;
import org.labkey.test.pages.cds.DataGrid;
import org.labkey.test.selenium.LazyWebElement;
import org.labkey.test.util.LabKeyExpectedConditions;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.TestLogger;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.labkey.test.util.cds.CDSHelper.CDS_WAIT;

public class CdsGrid extends BaseCdsComponent<CdsGrid.ElementCache>
{
    public static final String FACET_HAS_DATA_HEADER = "Has data in current selection";
    public static final String FACET_NO_DATA_HEADER = "No data in current selection";

    private final GridElement _gridEl;

    public CdsGrid(String gridClass, WebDriverComponent<?> gridPanel)
    {
        super(gridPanel.getWrapper());
        _gridEl = new GridElement(Locator.byClass("x-grid").withClass(gridClass), gridPanel);
    }

    @Override
    public WebElement getComponentElement()
    {
        return _gridEl;
    }

    @Override
    protected void clearElementCache()
    {
        super.clearElementCache();
        _gridEl.unfind();
    }

    public WebElement waitForGrid()
    {
        return Locators.rowLoc.waitForElement(this, CDS_WAIT);
    }

    public void doAndWaitForGridUpdate(Runnable function)
    {
        doAndWaitForRowUpdate(() -> {
            function.run();
            getWrapper().shortWait().until(ExpectedConditions.stalenessOf(getComponentElement()));
        });
    }

    public void doAndWaitForRowUpdate(Runnable function)
    {
        WebElement beforeRows = waitForGrid();
        getWrapper().doAndWaitForElementToRefresh(() -> {
            function.run();
            clearElementCache();
        }, Locator.css("table.x-grid-table"), this, getWrapper().shortWait());
        getWrapper().shortWait().until(ExpectedConditions.stalenessOf(beforeRows));
        getWrapper()._ext4Helper.waitForMaskToDisappear();
        waitForGrid();
    }

    @LogMethod
    public void sort(@LoggedParam final String columnName)
    {
        doAndWaitForRowUpdate(() -> {
            WebElement columnHeader = elementCache().getColumnHeader(columnName);
            getWrapper().mouseOver(columnHeader);
            columnHeader.click();
        });
        Locator.tagWithClassContaining("div", "x-column-header-sort-").withText(columnName)
                .waitForElement(this, 2_000);
    }

    public boolean isColumnFiltered(String columnHeaderName)
    {
        return Locators.filteredColumnHeaderLocator(columnHeaderName).existsIn(elementCache());
    }

    @LogMethod(quiet = true)
    public WebElement openFilterPanel(@LoggedParam String columnHeaderName)
    {
        WebElement columnHeader = elementCache().getColumnHeader(columnHeaderName);
        WebElement filterIcon = Locator.tagWithClass("div", "x-column-header-trigger").findElement(columnHeader);
        getWrapper().mouseOver(filterIcon);
        filterIcon.click();
        getWrapper()._ext4Helper.waitForMask();
        // Sometimes the tooltip sticks around, wait for it's style to change.
        getWrapper().waitForElement(Locator.tagWithId("div", "ext-quicktips-tip").withPredicate("contains(@style, 'display: none')"), 10000);
        return getWrapper().shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.byClass("x-window-filterwindow")));
    }

    public void setCheckBoxFilter(String columnName, Boolean clearFirst, String... values)
    {
        WebElement filterWindow = openFilterPanel(columnName);

        getWrapper().shortWait().until(LabKeyExpectedConditions.animationIsDone(Locator.tagWithClass("div", "x-toolbar-text").withText(columnName).findElement(filterWindow)));

        if (clearFirst)
        {
            Checkbox.Ext4Checkbox().locatedBy(Locator.byClass("x-column-header-text")).timeout(CDS_WAIT).waitFor(filterWindow).uncheck();
        }

        for (String val : values)
        {
            WebElement row = Locator.tagWithClass("tr", "x-grid-data-row")
                    .withDescendant(Locator.tagWithAttribute("td", "role", "gridcell").withText(val))
                    .waitForElement(filterWindow, CDS_WAIT);
            getWrapper().scrollIntoView(row);
            Checkbox.Ext4Checkbox().locatedBy(Locator.byClass("x-grid-row-checker")).find(row).check();
        }

        doAndWaitForGridUpdate(() -> CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn").findElement(filterWindow).click());

    }

    public void setFilter(String columnName, String value)
    {
        setFilter(columnName, null, value);
    }

    @LogMethod
    public void setFilter(@LoggedParam String columnName, @LoggedParam String filter, @LoggedParam String value)
    {
        WebElement filterWindow = openFilterPanel(columnName);
        WebElement filterBtn = CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn").findElement(filterWindow);
        getWrapper().scrollIntoView(filterBtn);
        if (null != filter)
            getWrapper()._ext4Helper.selectComboBoxItem("Value:", filter);

        WebElement input = Locator.css("#value_1 input").waitForElement(filterWindow, CDS_WAIT);
        getWrapper().setFormElement(input, value);
        doAndWaitForGridUpdate(() -> {
            filterBtn.click();
            CDSHelper.Locators.filterMemberLocator(columnName).waitForElement(getDriver(), CDS_WAIT * 2);
        });
    }

    @LogMethod
    public void setFacet(@LoggedParam String columnName, @LoggedParam String label)
    {
        WebElement filterWindow = openFilterPanel(columnName);

        WebElement filterGrid = Locator.tagWithClass("div", "filterpanegrid").waitForElement(filterWindow, CDS_WAIT);
        WebElement row = Locator.tagWithClass("div", "x-grid-cell-inner").containing(label).findElement(filterGrid);

        row.click();

        Locator.XPathLocator update = CDSHelper.Locators.cdsButtonLocator("Update", "filter-btn");
        Locator.XPathLocator filter = CDSHelper.Locators.cdsButtonLocator("Filter", "filter-btn");

        final WebElement button = Locator.XPathLocator.union(update, filter).findElement(filterWindow);

        doAndWaitForGridUpdate(button::click);
    }

    public boolean isHasData(String columnName, String value)
    {
        return isFacetContains(columnName, true, value);
    }

    public boolean isNoData(String columnName, String value)
    {
        return isFacetContains(columnName, false, value);
    }

    public boolean isFacetContains(String columnName, boolean hasData, String value)
    {
        WebElement filterWindow = openFilterPanel(columnName);
        boolean result = getFacetValues(filterWindow, hasData).contains(value);
        getWrapper().waitAndClick(CDSHelper.Locators.cdsButtonLocator("Cancel", "filter-btn"));
        return result;
    }

    public String getFacetValues(WebElement filterWindow, boolean hasData)
    {
        WebElement gridLoc = Locator.tagWithClass("div", "filterpanegrid").waitForElement(filterWindow, CDS_WAIT);
        String facetContent = gridLoc.getText();
        if (hasData)
        {
            if (!facetContent.contains(FACET_HAS_DATA_HEADER))
                return "";
            if (facetContent.contains(FACET_NO_DATA_HEADER))
            {
                facetContent = facetContent.substring(0, facetContent.indexOf(FACET_NO_DATA_HEADER));
            }
        }
        else
        {
            if (!facetContent.contains(FACET_NO_DATA_HEADER))
                return "";
            facetContent = facetContent.substring(facetContent.indexOf(FACET_NO_DATA_HEADER));
        }
        TestLogger.log(facetContent);
        return facetContent;
    }

    @LogMethod
    public void clearFilters(@LoggedParam String columnName)
    {
        WebElement filterWindow = openFilterPanel(columnName);
        WebElement clearButton = CDSHelper.Locators.cdsButtonLocator("Clear", "filter-btn").waitForElement(filterWindow, CDS_WAIT);
        doAndWaitForGridUpdate(clearButton::click);
        DataGrid.Locators.sysmsg.containing("Filter removed.").waitForElement(getDriver(), CDS_WAIT);
    }

    public List<String> getColumnNames()
    {
        return elementCache().getColumnNames();
    }

    public List<WebElement> getDataRows()
    {
        return elementCache().getDataRows();
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component<?>.ElementCache
    {
        private List<WebElement> columnHeaders;
        private List<String> columnNames;
        private final Map<String, WebElement> columnHeadersByName = new CaseInsensitiveHashMap<>();

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
                columnHeaders = Collections.unmodifiableList(Locators.columnHeader.findElements(this));
            return columnHeaders;
        }

        protected List<String> getColumnNames()
        {
            if (columnNames == null)
            {
                columnNames = getColumnHeaders().stream().map(el -> Locator.byClass("x-column-header-text").findElement(el).getAttribute("innerHTML")).toList();
                for (int i = 0; i < columnNames.size(); i++)
                {
                    String colName = columnNames.get(i);
                    columnHeadersByName.put(colName, columnHeaders.get(i));
                }
            }
            return columnNames;
        }

        protected List<WebElement> getDataRows()
        {
            return Locator.tagWithAttribute("tr", "role", "row").findElements(this);
        }
    }

    public static final class Locators
    {
        static Locator.XPathLocator rowLoc = Locator.XPathLocator.union(
                Locator.byClass("detail-description"),
                Locator.byClass("detail-empty-text"),
                Locator.byClass("x-grid-data-row"));
        public static Locator.XPathLocator columnHeader = Locator.tagWithClass("div", "x-column-header");
        public static Locator.XPathLocator rowCheckBoxLoc = Locator.tagWithClass("td", "x-grid-cell-row-checker");

        public static Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "x-column-header-inner").withText(columnHeaderName);
        }

        public static Locator.XPathLocator cellLocator(String cellContent)
        {
            return Locator.tagWithClass("div", "x-grid-cell-inner").containing(cellContent);
        }

        public static Locator.XPathLocator filteredColumnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "filtered-column").withText(columnHeaderName);
        }
    }

}

class GridElement extends LazyWebElement<GridElement>
{
    public GridElement(@NotNull Locator locator, @NotNull SearchContext searchContext)
    {
        super(locator, searchContext);
    }

    protected void unfind()
    {
        setWrappedElement(null);
    }
}