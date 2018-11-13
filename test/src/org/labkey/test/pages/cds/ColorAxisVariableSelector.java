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

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import java.util.ArrayList;
import java.util.List;

public class ColorAxisVariableSelector extends DataspaceVariableSelector
{
    private final String XPATHID = "color-axis-selector";

    public ColorAxisVariableSelector(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected String getPickerClass()
    {
        return "coloraxispicker";
    }

    public Locator.CssLocator window()
    {
        return Locator.css(".color-axis-selector");
    }

    @Override
    protected boolean isMeasureMultiSelect()
    {
        return false;
    }

    @Override
    public Locator getOpenButton()
    {
        return Locator.tagWithClass("*", "colorbtn").notHidden();
    }

    @Override
    public void confirmSelection()
    {
        _test.click(CDSHelper.Locators.cdsButtonLocator("Set color"));
        _test.sleep(1500);
        _test._ext4Helper.waitForMaskToDisappear(120000);  // Wait 2 mins. The test have much lower performance on TC. Until we have a real performance test (consistent environment etc...) I would rather not fail function test for it.
        // There is a bug where the mouse can end up over a time axis data point which will generate a hopscotch bubble.
        // However that is not the bubble indicating median values. So moving mouse out of the way.
        _test.mouseOver(Locator.xpath("//img[contains(@src, 'logo.png')]"));
        _test.waitForElementToDisappear(Locator.css("div.hopscotch-bubble.animated.hopscotch-callout.no-number"));
    }

    public void openSelectorWindow()
    {
        super.openSelectorWindow(XPATHID, "color");
    }

    public void pickSource(String source)
    {
        // If not currently on the source page, move there.
        if (_test.isElementPresent(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//span[contains(@class, 'back-action')]")))
        {
            backToSource();
        }
        super.pickSource(XPATHID, source);
    }

    public void backToSource()
    {
        _test.click(Locator.xpath("//div[contains(@class, '" + XPATHID + "')]//span[contains(@class, 'back-action')]"));
        _test.sleep(750);
    }

    public void setScale(Scale scale)
    {
        throw new UnsupportedOperationException("No log scale for color variable");
    }

    public void showLegend()
    {
        Locator element = Locator.css("li[id='color-legend'] svg path.legend-point");
        Locator legendElement = Locator.css("div.hopscotch-bubble svg text.legend-text");
        // The legend is only shown if the mouse is over a visible part of the glyph. If the glyph is something like
        // the circle the mouse will be over the center of the circle and will not result in the legend being shown.
        _test.mouseOver(element);

        try
        {
            _test.waitForElementToBeVisible(legendElement);
        }
        catch(org.openqa.selenium.WebDriverException wde)
        {
            _test.log("No legend was shown. Try moving the mouse slightly.");
            int xOffset = 10;
            while ((_test.isElementVisible(legendElement)) && (xOffset <= 50))
            {
                Actions builder = new Actions(_test.getDriver());
                builder.moveToElement(element.findElement(_test.getDriver()), xOffset, 0).build().perform();
                xOffset += 10;
            }
        }
    }

    public ArrayList<String> getLegendText()
    {
        ArrayList<String> legendText = new ArrayList<>();

        showLegend();

        List<WebElement> legends = Locator.css("div.hopscotch-bubble svg text.legend-text").findElements(_test.getDriver());
        for (WebElement we : legends)
        {
            legendText.add(we.getText());
        }

        return legendText;
    }
}
