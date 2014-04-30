package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.CDSTest;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class DataGridVariableSelector extends DataspaceVariableSelector
{
    private int columnCount = 0;
    private Locator.XPathLocator titleLocator = Locator.tagWithClass("div", "titlepanel").withText("view data grid");

    public DataGridVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "gridcolumnpicker";
    }

    @Override
    public Locator getOpenButton()
    {
        return CDSTest.Locators.cdsButtonLocator("choose from " + columnCount +" columns", "gridcolumnsbtn");
    }

    public void setColumnCount(int columnCount)
    {
        this.columnCount = columnCount;
    }

    public void addGridColumn(String source, String measure, boolean keepOpen, boolean keepSelection)
    {
        _test.waitForElement(titleLocator); // make sure we are looking at grid

        // allow for already open measures
        if (!_test.isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            _test.click(getOpenButton());
            _test.waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        pickMeasure(source, measure, true, keepSelection);

        if (!keepOpen)
        {
            confirmSelection();
            // confirm source header
            _test.waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText(source));
            // confirm column header
            _test.waitForElement(Locator.tagWithClass("span", "x-column-header-text").withText(measure));
        }
    }

    public void addLookupColumn(String source, String measure, String lookup)
    {
        addGridColumn(source, measure, true, true);

        Locator.CssLocator _variablePanelRow = pickerPanel().append(".measuresgrid ." + Ext4Helper.getCssPrefix() + "grid-row");
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(_variablePanelRow.toBy()));
        _test.click(_variablePanelRow.withText(measure));

        _test.waitForElement(Locator.tagWithClass("div", "curselauth").withText(measure + " details"));

        String lookupClass = "variableoptions .lookupgrid";
        Locator.CssLocator _lookupPanelRow = Locator.css("." + lookupClass + " ." + Ext4Helper.getCssPrefix() + "grid-row");
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(_lookupPanelRow.toBy()));
        _test._extHelper.selectExt4GridItem("shortCaption", lookup, -1, lookupClass, true);

        confirmSelection();
    }

    public void removeLookupColumn(String source, String measure, String lookup)
    {
        // TODO: Implement this
    }

    public void removeGridColumn(String source, String measure, boolean keepOpen)
    {
        _test.waitForElement(titleLocator); // make sure we are looking at grid

        // allow for already open measures
        if (!_test.isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            _test.click(getOpenButton());
            _test.waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        pickSource(source);
        _test._ext4Helper.uncheckGridRowCheckbox(measure);

        if (!keepOpen)
        {
            confirmSelection();
            // confirm column removal
            _test.waitForElementToDisappear(Locator.tagWithClass("span", "x-column-header-text").withText(measure));
        }
    }

    @Override
    public void setScale(Scale scale)
    {
        throw new UnsupportedOperationException("Grid does not have a scale");
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSTest.Locators.cdsButtonLocator("select"));
    }
}
