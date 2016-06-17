/*
 * Copyright (c) 2015-2016 LabKey Corporation
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

import org.apache.commons.lang3.SystemUtils;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;

public class InfoPane
{
    private final static String cssSubjectsCount = "div.detailstatuslist ul.detailstatus div:nth-child(1) li span:nth-child(4)";
    private final static String cssSpeciesCount = "div.detailstatuslist ul.detailstatus div:nth-child(2) li span:nth-child(4)";
    private final static String cssStudiesCount = "div.detailstatuslist ul.detailstatus div:nth-child(3) li span:nth-child(4)";
    private final static String cssProductCount = "div.detailstatuslist ul.detailstatus div:nth-child(4) li span:nth-child(4)";
    private final static String cssTreatmentsCount = "div.detailstatuslist ul.detailstatus div:nth-child(5) li span:nth-child(4)";
    private final static String cssTimePointsCount = "div.detailstatuslist ul.detailstatus div:nth-child(6) li span:nth-child(4)";
    private final static String cssAntigensInXCount = "div.detailstatuslist ul.detailstatus div:nth-child(7) li span:nth-child(4)";
    private final static String cssAntigensInYCount = "div.detailstatuslist ul.detailstatus div:nth-child(8) li span:nth-child(4)";

    private final static String cssMeasuresGrid = "div.measuresgrid";
    private final static String cssFilterAction = "a.filterinfoaction";
    private final static String cssFilterCancel = "a.filterinfocancel";

    protected BaseWebDriverTest _test;
    protected CDSHelper _cds;

    public InfoPane(BaseWebDriverTest test)
    {
        _test = test;
        _cds = new CDSHelper(test);
    }

    public void clickFilter()
    {
        _test.click(Locator.css(cssFilterAction));
    }

    public void clickCancel()
    {
        _test.click(Locator.css(cssFilterCancel));
    }

    public void setFilter(String... studiesFilter)
    {

        // Wait a moment.
        _test.sleep(CDSHelper.CDS_WAIT);

        Keys multiSelectKey;
        if (SystemUtils.IS_OS_MAC)
            multiSelectKey = Keys.COMMAND;
        else
            multiSelectKey = Keys.CONTROL;

        // Clear the current selection.
        if(!_test.isElementPresent(Locator.css("div.x-column-header-checkbox.x-grid-hd-checker-on")))
        {
            _test.click(Locator.css("div.x-column-header-checkbox"));
            _test.sleep(CDSHelper.CDS_WAIT);
        }
        _test.click(Locator.css("div.x-column-header-checkbox"));
        _test.sleep(CDSHelper.CDS_WAIT);

        Actions builder = new Actions(_test.getDriver());
        builder.keyDown(multiSelectKey).build().perform();

        for(String val : studiesFilter){
            _test.click(Locator.xpath("//tr//div[@title='" + val + "']"));
            _test.sleep(500);
        }

        _test.click(Locator.css(cssFilterAction));

        _test.sleep(CDSHelper.CDS_WAIT);
        _test._ext4Helper.waitForMaskToDisappear();

        _waitForSpinners(_test);

    }

    private static void _waitForSpinners(BaseWebDriverTest _test)
    {
        // Wait for the spinning circle to go away.
        while(_test.isElementPresent(Locator.xpath("//div[contains(@class, 'item-spinner-mask')]")))
        {
            _test.log("Waiting for counts to complete before returning.");
            _test.sleep(1000);
        }
    }

    private static String _tryToGetCounts(BaseWebDriverTest _test, String cssPath)
    {
        String text;

        text = _test.getText(Locator.css(cssPath)).replace(",", "");

        // If the text is empty let's try and wait in a semi-smart way.
        if(text.trim().length() == 0)
        {
            _waitForSpinners(_test);

            // Try again.
            text = _test.getText(Locator.css(cssPath)).replace(",", "");

            if(text.trim().length() == 0)
            {

                // If it is still empty do one last long wait.
                _test.sleep(CDSHelper.CDS_WAIT_ANIMATION);
                text = _test.getText(Locator.css(cssPath)).replace(",", "");

            }

        }

        return text;
    }

    private static String _getGridText(BaseWebDriverTest _test)
    {
        return _test.getText(Locator.css(cssMeasuresGrid));
    }

    public void waitForSpinners()
    {
        _waitForSpinners(_test);
    }

    public int getSubjectCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssSubjectsCount));
    }

    public int getSpeciesCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssSpeciesCount));
    }

    public String getSpeciesList()
    {
        return _test.getText(Locator.css(cssMeasuresGrid));
    }

    public void clickSpeciesCount()
    {
        _test.click(Locator.css(cssSpeciesCount));
    }

    public int getStudiesCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssStudiesCount));
    }

    public void clickStudiesCount()
    {
        _test.click(Locator.css(cssStudiesCount));
    }

    public int getProductCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssProductCount));
    }

    public void clickProductCount()
    {
        _test.click(Locator.css(cssProductCount));
    }

    public int getTreatmentsCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssTreatmentsCount));
    }

    public void clickTreatmentsCount()
    {
        _test.click(Locator.css(cssTreatmentsCount));
    }

    public int getTimePointsCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssTimePointsCount));
    }

    public void clickTimePointsCount()
    {
        _test.click(Locator.css(cssTimePointsCount));
    }

    public String getTimePointsList()
    {
        return _test.getText(Locator.css(cssMeasuresGrid));
    }

    public int getAntigensInXCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssAntigensInXCount));
    }

    public void clickAntigensInXCount()
    {
        _test.click(Locator.css(cssAntigensInXCount));
    }

    public int getAntigensInYCount()
    {
        return Integer.parseInt(_tryToGetCounts(_test, cssAntigensInYCount));
    }

    public void clickAntigensInYCount()
    {
        _test.click(Locator.css(cssAntigensInYCount));
    }

}
