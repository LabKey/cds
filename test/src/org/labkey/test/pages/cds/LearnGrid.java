/*
 * Copyright (c) 2016-2018 LabKey Corporation
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

import org.jetbrains.annotations.NotNull;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.cds.BaseCdsComponent;
import org.labkey.test.components.cds.CdsGrid;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.TestLogger;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.List;

import static org.labkey.test.tests.cds.CDSTestLearnAbout.COLUMN_LOCKING;
import static org.labkey.test.util.cds.CDSHelper.CDS_WAIT;

public class LearnGrid extends BaseCdsComponent<LearnGrid.ElementCache>
{
    private final WebElement _learnPanel;
    private final LearnTab _learnTab;

    protected LearnGrid(LearnTab learn, Locator panelLoc, WebDriverWrapper wdw)
    {
        super(wdw);
        _learnTab = learn;
        _learnPanel = wdw.shortWait().until(ExpectedConditions.visibilityOfElementLocated(panelLoc));
        wdw._ext4Helper.waitForMaskToDisappear();
        getGrid().waitForGrid();
    }

    public LearnGrid(LearnTab learn, WebDriverWrapper wdw)
    {
        this(learn, Locator.byClass("learnview"), wdw);
    }

    public enum FacetGroups { hasData, noData, both }

    public enum LearnTab
    {
        STUDIES("Studies", "learnstudies"),
        ASSAYS("Assays", "learnassays"),
        PRODUCTS("Products", "learnstudyproducts"),
        ANTIGENS("Antigens", "learnantigens"),
        MABS("MAbs", "mablearngrid"),
        PUBLICATIONS("Publications", "publicationlearngrid"),
        GROUPS("Groups", "learngroups"),
        REPORTS("Reports", "reportlearngrid"),
        ASSAY_ANTIGENS("Antigens", "antigengrid"),
        ASSAY_VARIABLES("Variables", "variable-list-grid"),
        ;

        private final String _tabLabel;
        private final String _gridClass;

        LearnTab(String tabLabel, String gridClass)
        {
            _tabLabel = tabLabel;
            _gridClass = gridClass;
        }

        public String getTabLabel()
        {
            return _tabLabel;
        }

        public String getGridClass()
        {
            return _gridClass;
        }
    }

    @Override
    public WebElement getComponentElement()
    {
        return _learnPanel;
    }

    public CdsGrid getGrid()
    {
        return elementCache().grid;
    }

    @LogMethod
    public int getRowCount()
    {
        if (COLUMN_LOCKING)
        {
            int numRowsWithLockedPortion = Locators.lockedRow.findElements(getGrid()).size();
            int numRowsWithUnlockedPortion = Locators.unlockedRow.findElements(getGrid()).size();
            Assert.assertEquals("Locked and unlocked row portions should match", numRowsWithLockedPortion, numRowsWithUnlockedPortion);
            return numRowsWithUnlockedPortion;
        }
        else
            return Locators.gridRows.findElements(getGrid()).size();
    }

    @LogMethod
    public int getTitleRowCount()
    {
        List<WebElement> antigensAfterFilter = Locator.tagWithClass("tr", "detail-row")
                .append("/td//div/div/h2")
                .findElements(getGrid());
        return antigensAfterFilter.size();
    }

    public LearnDetailsPage clickFirstItem()
    {
        WebElement link = Locators.rowDescriptionLink.findElement(getGrid());
        return clickDetailsLink(link, link.getText());
    }

    public LearnDetailsPage clickDetails(String description)
    {
        WebElement link  = Locators.rowDescriptionLink.withText(description).findElement(getGrid());
        return clickDetailsLink(link, description);
    }

    @NotNull
    private LearnDetailsPage clickDetailsLink(WebElement detailsLink, String description)
    {
        TestLogger.log("Viewing details for " + description);
        detailsLink.click();
        getWrapper().shortWait().until(ExpectedConditions.invisibilityOf(detailsLink));
        getWrapper().shortWait().until(ExpectedConditions.visibilityOfElementLocated(LearnDetailsPage.Locators.tabHeaders.withText(_learnTab == LearnTab.GROUPS ? "Details" : "Overview")));

        return new LearnDetailsPage(getWrapper());
    }

    @LogMethod (quiet = true)
    public LearnGrid setSearch(@LoggedParam String searchQuery)
    {
        elementCache().grid.doAndWaitForRowUpdate(() ->
                getWrapper().actionPaste(elementCache().searchBox, searchQuery));

        return this;
    }

    @LogMethod
    public LearnGrid clearSearch()
    {
        elementCache().grid.doAndWaitForGridUpdate(() -> Locators.clearSearch.findElement(this).click());
        return this;
    }

    public String getSearch()
    {
        return getWrapper().getFormElement(elementCache().searchBox);
    }

    @LogMethod(quiet = true)
    public WebElement openFilterPanel(@LoggedParam String columnHeaderName)
    {
        return elementCache().grid.openFilterPanel(columnHeaderName);
    }

    @LogMethod
    public FacetGroups getFacetGroupStatus(@LoggedParam String columnName)
    {
        return getFacetGroupStatusWithOption(columnName, null);
    }

    @LogMethod
    public FacetGroups getFacetGroupStatusWithOption(@LoggedParam String columnName, @LoggedParam String option)
    {
        WebElement filterWindow = openFilterPanel(columnName);
        BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT_LEARN);

        if (option != null)
        {
            Locator.css(".sortDropdown").findElement(filterWindow).click();
            Locator.css(".x-menu-item").withText(option).findElement(filterWindow).click();
            BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT_LEARN);
        }

        FacetGroups status = FacetGroups.noData;
        if (Locators.hasData.existsIn(filterWindow) && Locators.noData.existsIn(filterWindow))
            status = FacetGroups.both;
        else if (Locators.hasData.existsIn(filterWindow))
            status = FacetGroups.hasData;

        CDSHelper.Locators.cdsButtonLocator("Cancel", "filter-btn").waitForElement(filterWindow, CDS_WAIT).click();
        getWrapper()._ext4Helper.waitForMaskToDisappear();

        return status;
    }

    @LogMethod
    public LearnGrid setFacet(@LoggedParam String columnName, @LoggedParam String... labels)
    {
        setWithOptionFacet(columnName, null, labels);
        return this;
    }

    public LearnGrid setWithOptionFacet(@LoggedParam String columnName, @LoggedParam String option, @LoggedParam String... labels)
    {
        WebElement filterWindow = openFilterPanel(columnName);

        if (option != null)
        {
            Locator.css(".sortDropdown").findElement(filterWindow).click();
            Locator.css(".x-menu-item").withText(option).findElement(getDriver()).click();
            BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT_LEARN);
        }

        WebElement filterpanegrid = Locator.byClass("filterpanegrid").notHidden().findElement(filterWindow);

        Locator.byClass("x-column-header-checkbox").notHidden().findElement(filterpanegrid).click();

        for (String label : labels)
        {
            Locators.getFacetCheckboxForValue(label).findElement(filterpanegrid).click();
        }

        Locator.XPathLocator search = CDSHelper.Locators.cdsButtonLocator("Search", "filter-btn");
        elementCache().grid.doAndWaitForGridUpdate(() -> search.findElement(filterWindow).click());

        return this;
    }

    @LogMethod
    public LearnGrid clearFilters(@LoggedParam String columnName)
    {
        clearFiltersWithOption(columnName, null);
        return this;
    }

    public LearnGrid clearFiltersWithOption(@LoggedParam String columnName, @LoggedParam String option)
    {
        WebElement filterWindow = openFilterPanel(columnName);

        if (option != null)
        {
            Locator.css(".sortDropdown").findElement(filterWindow).click();
            Locator.css(".x-menu-item").withText(option).findElement(getDriver()).click();
            BaseWebDriverTest.sleep(CDSHelper.CDS_WAIT_LEARN);
        }

        WebElement clearBtn = CDSHelper.Locators.cdsButtonLocator("Clear", "filter-btn").findElement(filterWindow);
        elementCache().grid.doAndWaitForGridUpdate(clearBtn::click);

        return this;
    }

    @LogMethod
    public LearnGrid sort(@LoggedParam final String columnName)
    {
        elementCache().grid.sort(columnName);

        return this;
    }

    // Columns are separated by a \n.
    public String getRowText(int rowIndex)
    {
        if (COLUMN_LOCKING) {
            WebElement lockedRow = getWrapper().scrollIntoView(Locators.lockedRow.findElements(getGrid()).get(rowIndex));// Why do I have to scroll this into view to get the text?
            return lockedRow.getText() + "\n" + Locators.unlockedRow.findElements(getGrid()).get(rowIndex).getText();
        }
        else {
            WebElement rowEl = getWrapper().scrollIntoView(Locators.gridRows.findElements(getGrid()).get(rowIndex));// Why do I have to scroll this into view to get the text?
            return rowEl.getText();
        }
    }

    // Assume 0 based for rows and columns.
    public String getCellText(int rowIndex, int cellIndex)
    {
        return getCellWebElement(rowIndex, cellIndex).getText();
    }

    public LearnGrid showDataAddedToolTip(int rowIndex, int cellIndex)
    {
        // Scroll the row into view.
        if (COLUMN_LOCKING)
            getWrapper().scrollIntoView(Locators.lockedRow.findElements(getGrid()).get(rowIndex));
        else
            getWrapper().scrollIntoView(Locators.gridRows.findElements(getGrid()).get(rowIndex));

        // The tool-tip shows up on a mouse enter event. So first go to the grey text under the icon then move over it.
        getWrapper().mouseOver(getCellWebElement(rowIndex, cellIndex).findElement(Locator.byClass("detail-gray-text")));
        WebDriverWrapper.sleep(500); // If the mouse moves too quickly ext may not always see it, so pause for a moment.
        getWrapper().mouseOver(getCellWebElement(rowIndex, cellIndex).findElement(Locator.byClass("detail-has-data")));

        // The tool-tip has a small delay before it is shown.
        Locator.css("div.hopscotch-bubble-container").waitForElement(getDriver(), 5_000);
        WebDriverWrapper.sleep(500);
        return this;
    }

    // Assume 0 based for both.
    public WebElement getCellWebElement(int rowIndex, int cellIndex)
    {
        int cellCountLocked;
        WebElement cellWebElement;

        if (COLUMN_LOCKING)
        {
            cellWebElement = Locators.lockedRow.findElements(getGrid()).get(rowIndex);
            getWrapper().scrollIntoView(cellWebElement);

            cellCountLocked = cellWebElement.findElements(Locator.tag("td")).size();

            if (cellIndex < cellCountLocked)
            {
                return cellWebElement.findElements(Locator.tag("td")).get(cellIndex);
            }
            else
            {
                // The index is not in the locked columns, so we have to do a little offset and need to look at the unlocked grid.
                cellWebElement = Locators.unlockedRow.findElements(getGrid()).get(rowIndex);
                return cellWebElement.findElements(Locator.tag("td")).get(cellIndex - cellCountLocked);
            }
        }
        else
        {
            cellWebElement = Locators.gridRows.findElements(getGrid()).get(rowIndex);
            getWrapper().scrollIntoView(cellWebElement);

            return cellWebElement.findElements(Locator.tag("td")).get(cellIndex);
        }
    }

    // There should only be one tool-tip present at a time.
    public String getToolTipText()
    {
        return getWrapper().getText(Locator.css("div.hopscotch-bubble-container"));
    }

    // Text values in each of the columns is separated by a \n.
    public List<String> getGridText()
    {
        List<String> gridText = new ArrayList<>();

        for (int i=0; i < getRowCount(); i++)
        {
            gridText.add(getRowText(i));
        }

        return gridText;
    }

    public String[] getColumnNames()
    {
        String colHeaderStr;
        if (COLUMN_LOCKING)
            colHeaderStr = Locators.lockedRowHeader.findElement(getGrid()).getText() + "\n" + Locators.unlockedRowHeader.findElement(getGrid()).getText();
        else
            colHeaderStr = Locators.gridRowHeader.findElement(getGrid()).getText();
        return colHeaderStr.split("\n");
    }

    public int getColumnIndex(String columnName)
    {
        String[] columns = getColumnNames();
        int index = -1;

        for (int i = 0; i < columns.length; i++)
        {
            if (columns[i].trim().toLowerCase().equals(columnName.trim().toLowerCase()))
            {
                index = i;
                break;
            }
        }

        return index;
    }

    public static class Locators
    {
        public static final Locator.XPathLocator searchBox = Locator.xpath("//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input");

        public static final Locator.XPathLocator clearSearch = Locator.xpath("//table[contains(@class, 'learn-search-input')]//tbody//tr//td//div");
        public static final Locator.XPathLocator unlockedRow = Locator.xpath("./div/div/div/div[not(contains(@class, 'x-grid-inner-locked'))]/div/div/table/tbody/tr");
        public static final Locator.XPathLocator unlockedRowHeader = Locator.xpath("./div/div/div/div[not(contains(@class, 'x-grid-inner-locked'))]/div[contains(@class, 'x-grid-header-ct')]");
        public static final Locator.XPathLocator lockedRow = Locator.xpath("./div/div/div/div[contains(@class, 'x-grid-inner-locked')]/div/div/table/tbody/tr");
        public static final Locator.XPathLocator lockedRowHeader = Locator.xpath("./div/div/div/div[contains(@class, 'x-grid-inner-locked')]/div[contains(@class, 'x-grid-header-ct')]");

        public static final Locator.XPathLocator gridRows = Locator.xpath("//div[contains(@class, 'x-grid-view')]/table/tbody/tr");
        public static final Locator.XPathLocator gridRowHeader = Locator.xpath("//div[contains(@class, 'x-grid-header-ct')]");

        public static final Locator.XPathLocator hasData = Locator.tagWithClass("div", "x-grid-group-title").withText("In current selection");
        public static final Locator.XPathLocator noData = Locator.tagWithClass("div", "x-grid-group-title").withText("Not in current selection");

        public static final Locator rowsWithData = Locator.css(".detail-row-has-data");
        public static final Locator rowsWithDataNotAccessible = Locator.css(".detail-has-data-gray");
        public static final Locator rowsWithDataAccessible = Locator.css(".detail-has-data-green");
        public static final Locator.XPathLocator rowDescriptionLink = Locator.byClass("detail-description").childTag("h2");

        public static Locator.XPathLocator getFacetCheckboxForValue(String label)
        {
            return Locator.xpath("//tr[contains(@class, 'x-grid-row')]//td/div[text() = '"
                    + label + "']/../preceding-sibling::td/div/div[contains(@class, 'x-grid-row-checker')]");
        }

        public static Locator.XPathLocator columnHeaderLocator(String columnHeaderName)
        {
            return Locator.tagWithClass("div", "x-column-header-inner").withText(columnHeaderName);
        }

    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    public class ElementCache extends Component<?>.ElementCache
    {
        protected final CdsGrid grid = new CdsGrid(_learnTab._gridClass, LearnGrid.this);
        private final WebElement searchBox = Locators.searchBox.findWhenNeeded(this);
    }

}
