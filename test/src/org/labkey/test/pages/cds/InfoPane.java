/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

public class InfoPane
{
    private final static String cssSubjectsCount = "div.detailstatuslist ul.detailstatus div.info_Subject li span:nth-child(4)";
    private final static String cssSpeciesCount = "div.detailstatuslist ul.detailstatus div.info_Species li span:nth-child(4)";
    private final static String cssStudiesCount = "div.detailstatuslist ul.detailstatus div.info_Study li span:nth-child(4)";
    private final static String cssProductCount = "div.detailstatuslist ul.detailstatus div.info_Product li span:nth-child(4)";
    private final static String cssTreatmentsCount = "div.detailstatuslist ul.detailstatus div.info_Treatment li span:nth-child(4)";
    private final static String cssTimePointsCount = "div.detailstatuslist ul.detailstatus div.info_TimePoint li span:nth-child(4)";
    private final static String cssAntigensInXCount = "div.detailstatuslist ul.detailstatus div.info_AntigensInX li span:nth-child(4)";
    private final static String cssAntigensInYCount = "div.detailstatuslist ul.detailstatus div.info_AntigensInY li span:nth-child(4)";
    private final static String cssActiveFilter = "div.activefilter";

    // mAb Info Pane
    private final static String cssMabMixtureCounts = "div.detailstatuslist ul.detailstatus div.info_mixCount li span:nth-child(4)";
    private final static String cssMabCounts = "div.detailstatuslist ul.detailstatus div.info_mabCount li span:nth-child(4)";
    private final static String cssMabDonorCounts = "div.detailstatuslist ul.detailstatus div.info_donorCount li span:nth-child(4)";
    private final static String cssMabStudiesCount = "div.detailstatuslist ul.detailstatus div.info_studyCount li span:nth-child(4)";
    private final static String cssMabVirusPairCount = "div.detailstatuslist ul.detailstatus div.info_mab_virus_pairs_count li span:nth-child(4)";
    private final static String cssMabVirusCount = "div.detailstatuslist ul.detailstatus div.info_virusCount li span:nth-child(4)";

    private final static String cssMeasuresGrid = "div.measuresgrid";
    private final static String cssFilterAction = "a.filterinfoaction";
    private final static String cssFilterCancel = "a.filterinfocancel";
    private final static String cssClose = "a.infoplotcancel";

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

    public void clickClose() {
        _test.click(Locator.css(cssClose));
    }

    public void clickActiveFilter(String text)
    {
        Locator.findElements(_test.getDriver(), Locator.css(cssActiveFilter))
                .stream()
                .filter(s -> s.getText().contains(text))
                .findFirst()
                .ifPresent(WebElement::click);
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
        _test.waitForElement(Locator.css(cssPath));

        String text = _test.getText(Locator.css(cssPath)).replace(",", "");

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

    public int getMabMixturesCount() {
        return Integer.parseInt(_tryToGetCounts(_test, cssMabMixtureCounts));
    }

    public String getMabMixturesList()
    {
        return getMabListText();
    }

    public void clickMabMixturesCount() {
        _test.click(Locator.css(cssMabMixtureCounts));
    }

    public int getMabCount() {
        return Integer.parseInt(_tryToGetCounts(_test, cssMabCounts));
    }

    public void clickMabCount() {
        _test.click(Locator.css(cssMabCounts));
    }

    public String getMabList()
    {
        return getMabListText();
    }

    public int getMabDonorCounts() {
        return Integer.parseInt(_tryToGetCounts(_test, cssMabDonorCounts));
    }

    public void clickMabDonorCounts() {
        _test.click(Locator.css(cssMabDonorCounts));
    }

    public String getMabDonorList()
    {
        return getMabListText();
    }

    public int getMabStudiesCount() {
        return Integer.parseInt(_tryToGetCounts(_test, cssMabStudiesCount));
    }

    public void clickMabStudiesCount() {
        _test.click(Locator.css(cssMabStudiesCount));
    }

    public String getMabStudiesList()
    {
        return getMabListText();
    }

    public int getMabVirusPairCount() {
        return Integer.parseInt(_tryToGetCounts(_test, cssMabVirusPairCount));
    }

    public void clickMabVirusPairCount() {
        _test.click(Locator.css(cssMabVirusPairCount));
    }

    public String getMabVirusPairList()
    {
        return getMabListText();
    }

    public int getMabVirusCount() {
        return Integer.parseInt(_tryToGetCounts(_test, cssMabVirusCount));
    }

    public void clickMabVirusCount() {
        _test.click(Locator.css(cssMabVirusCount));
    }

    public String getMabVirusList()
    {
        return getMabListText();
    }

    private String getMabListText()
    {
        _test.waitForElementToBeVisible(Locator.css(cssMeasuresGrid));
        int listSize = 0;
        int tries = 1;

        // Rather than just sleep see if the txt is changing (growing) if it is keep trying a couple of times or until it is no longer growing.
        while((tries <= 10) && (listSize != _test.getText(Locator.css(cssMeasuresGrid)).trim().length()))
        {
            _test.log("List Size: " + listSize + " tries: " + tries);
            _test.sleep(1000);
            listSize = _test.getText(Locator.css(cssMeasuresGrid)).trim().length();
            tries++;
        }

        return _test.getText(Locator.css(cssMeasuresGrid)).trim();
    }
}
