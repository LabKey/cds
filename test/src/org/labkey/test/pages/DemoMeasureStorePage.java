package org.labkey.test.pages;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by cnathe on 8/3/2015.
 */
public class DemoMeasureStorePage
{
    private final BaseWebDriverTest _test;

    public DemoMeasureStorePage(BaseWebDriverTest test)
    {
        _test = test;
    }

    public void selectPlotByTitle(String title)
    {
        _test.click(Locator.linkWithText(title));
        _test.waitForElement(Locator.css("svg g text").withText(title));
    }

    public int getNumPlotPoints()
    {
        return _test.getElementCount(Locator.css("svg g a.point"));
    }

    public String[] getPlotAxisTicks(String axis)
    {
        List<String> tickLabels = new ArrayList<>();
        WebElement axisElement = Locator.css("svg g.axis").findElements(_test.getDriver()).get("y".equals(axis) ? 1 : 0);
        for (WebElement tickElement : axisElement.findElements(Locator.css("g.tick-text g text").toBy()))
            tickLabels.add(tickElement.getText());
        return tickLabels.toArray(new String[tickLabels.size()]);
    }
}
