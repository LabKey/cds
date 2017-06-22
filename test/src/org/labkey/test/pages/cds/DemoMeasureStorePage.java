/*
 * Copyright (c) 2016 LabKey Corporation
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
        for (WebElement tickElement : Locator.css("g.tick-text g text").findElements(axisElement))
            tickLabels.add(tickElement.getText());
        return tickLabels.toArray(new String[tickLabels.size()]);
    }
}
