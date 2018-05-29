package org.labkey.test.pages.cds;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.ext4.Checkbox;
import org.openqa.selenium.WebElement;

public class AntigenFilterPanel
{
    private final WebDriverWrapper _test;

    public AntigenFilterPanel(WebDriverWrapper test)
    {
        _test = test;
    }

    public void checkAll(boolean check)
    {
        Locator.XPathLocator label = Locator.tagWithAttribute("label", "test-data-value", "neutralization_tier-all");
        WebElement checkboxContainer = label.parent("td").findElement(_test.getDriver());
        new Checkbox.CheckboxFinder().find(checkboxContainer).set(check);
    }

    public Locator.XPathLocator getRowLoc(String testValue)
    {
        return Locator.tag("tr").
                withDescendant(Locator.tagWithClass("table", "col-check")
                        .withDescendant(Locator.tagWithAttribute("label", "test-data-value", testValue)));
    }

    public Locator.XPathLocator getCellLoc(String testValue, int colInd)
    {
        Locator.XPathLocator rowLoc = getRowLoc(testValue);
        return rowLoc.append(Locator.tagWithClass("td", "x-table-layout-cell")).index(colInd);
    }

    public boolean isVirusDisabled(String testValue)
    {
        Locator.XPathLocator virusLoc = getCellLoc(testValue, 2);
        Locator.XPathLocator disabledVirusLoc = virusLoc.append(Locator.tagWithClass("table", "col-disable"));
        return _test.isElementPresent(disabledVirusLoc);
    }

    public boolean isVirusChecked(String testValue)
    {
        Locator.XPathLocator virusLoc = getCellLoc(testValue, 2);
        Locator.XPathLocator disabledVirusLoc = virusLoc.append(Locator.tagWithClass("table", "x-form-cb-checked"));
        return _test.isElementPresent(disabledVirusLoc);
    }

    public void checkVirus(String testValue, boolean check)
    {
        if (check != isVirusChecked(testValue))
            _test.click(getCellLoc(testValue, 2));
    }

    public int getCount(String testValue)
    {
        Locator.XPathLocator countLoc = getCellLoc(testValue, 3);
        return Integer.valueOf(countLoc.findElements(_test.getDriver()).get(0).getText());
    }

}
