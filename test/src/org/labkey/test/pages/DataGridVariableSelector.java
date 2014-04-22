package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.CDSTest;

public class DataGridVariableSelector extends DataspaceVariableSelector
{
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
        return CDSTest.Locators.cdsButtonLocator("choose columns", "gridcolumnsbtn");
    }

    public void addGridColumn(String source, String measure, boolean keepOpen, boolean keepSelection)
    {
        _test.waitForElement(Locator.css("div.dimgroup").withText("Data Grid")); // make sure we are looking at grid

        // allow for already open measures
        if (!_test.isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            _test.click(CDSTest.Locators.cdsButtonLocator("Choose Columns"));
            _test.waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        pickMeasure(source, measure, true, keepSelection);

        if (!keepOpen)
        {
            _test.click(CDSTest.Locators.cdsButtonLocator("select"));
        }
    }

    public void removeGridColumn(String source, String measure, boolean keepOpen)
    {
        _test.waitForElement(Locator.css("div.dimgroup").withText("Data Grid")); // make sure we are looking at grid

        // allow for already open measures
        if (!_test.isElementPresent(Locator.id("gridmeasurewin").notHidden()))
        {
            _test.click(CDSTest.Locators.cdsButtonLocator("Choose Columns"));
            _test.waitForElement(Locator.id("gridmeasurewin").notHidden());
        }

        pickSource(source);
        _test._ext4Helper.uncheckGridRowCheckbox(measure);

        if (!keepOpen)
        {
            _test.click(CDSTest.Locators.cdsButtonLocator("select"));
        }
    }
}
