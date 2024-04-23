/*
 * Copyright (c) 2017 LabKey Corporation
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

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.util.LogMethod;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LearnDetailsPage
{
    protected WebDriverWrapper _test;

    public LearnDetailsPage(WebDriverWrapper test)
    {
        _test = test;
    }

    public DetailLearnGrid getGridTab(LearnGrid.LearnTab assayTab)
    {
        WebElement tabEl = _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locators.tabHeaders.withText(assayTab.getTabLabel())));
        if (!tabEl.getDomAttribute("class").contains("active"))
        {
            tabEl.click();
            _test.shortWait().until(ExpectedConditions.stalenessOf(tabEl));
        }
        return new DetailLearnGrid(assayTab, _test);
    }

    public void clickBack()
    {
        WebElement backButtonElement = Locators.backButton.findElement(_test.getDriver());
        backButtonElement.click();
        _test.shortWait().until(ExpectedConditions.invisibilityOf(backButtonElement));
        _test.shortWait().until(ExpectedConditions.visibilityOfElementLocated(LearnGrid.Locators.searchBox));
    }

    public static class Locators
    {
        public static final Locator.XPathLocator backButton = Locator.xpath("//div[contains(@class, 'learnview')]/span/div/div[contains(@class, 'x-container')][not(contains(@style, 'display: none'))]//div[contains(@class, 'learn-up')]//div[contains(@class, 'iarrow')]");
        public static final Locator.XPathLocator tabHeaders = Locator.tag("div").withClass("learnabouttab").childTag("h1");
    }

    public static class DetailLearnGrid extends LearnGrid
    {
        public DetailLearnGrid(LearnTab learnTab, WebDriverWrapper test)
        {
            super(learnTab, Locator.css(".learnheader ~ .x-container"), test);
        }

        @Override
        @LogMethod
        public int getRowCount()
        {
            return Locator.tag("tr").findElements(elementCache().grid).size();
        }
    }

}
