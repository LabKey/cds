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
package org.labkey.test.tests.cds;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.Locators;
import org.labkey.test.categories.Git;
import org.labkey.test.pages.cds.LearnDetailsPage;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({Git.class})
public class CDSTestLearnAbout extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String MISSING_SEARCH_STRING = "If this string ever appears something very odd happened.";
    public static final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
    private final Locator XPATH_RESULT_ROW_TITLE = LearnGrid.Locators.lockedRow;
    private final Locator XPATH_RESULT_ROW_DATA = LearnGrid.Locators.unlockedRow;

    @Before
    public void preTest()
    {

        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();

        // go back to app starting location
        cds.goToAppHome();
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("CDS");
    }

    @Override
    public Timeout testTimeout()
    {
        return new Timeout(60, TimeUnit.MINUTES);
    }

    @Test
    public void testLearnAboutStudies()
    {
        cds.viewLearnAboutPage("Studies");

        List<String> studies = Arrays.asList(CDSHelper.STUDIES);
        _asserts.verifyLearnAboutPage(studies);
    }

    @Test
    public void clickOnLearnAboutStudyItem()
    {
        List<WebElement> returnedItems;
        String[] lockedParts, unlockedParts;

        cds.viewLearnAboutPage("Studies");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        List<WebElement> freeColItems = XPATH_RESULT_ROW_DATA.findElements(getDriver());

        int index = returnedItems.size()/2;

        scrollIntoView(returnedItems.get(index));

        lockedParts = returnedItems.get(index).getText().split("\n");
        unlockedParts = freeColItems.get(index).getText().split("\n");
        returnedItems.get(index).click();

        log("Validating title is " + lockedParts[0]);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + lockedParts[0] + "']")));

        log("Validating Study Type is: " + unlockedParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + unlockedParts[1] + "']").findElement(getDriver()).isDisplayed());

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')]/div[contains(@class, 'breadcrumb')][text()='Studies / ']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']")));
    }

    @Test
    public void testLearnAboutStudiesSearch()
    {
        List<String> searchStrings = new ArrayList<>(Arrays.asList("Proin", "ACETAMINOPHEN", "Phase IIB"));

        cds.viewLearnAboutPage("Studies");

        searchStrings.stream().forEach((searchString) -> validateSearchFor(searchString));

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), MISSING_SEARCH_STRING);
        sleep(CDSHelper.CDS_WAIT);
        _asserts.verifyEmptyLearnAboutStudyPage();
    }

    @Test
    public void verifyLearnAboutStudyDetails()
    {
        final String searchString = CDSHelper.ZAP_117;
        final String grantAffiliation = "Weiss: Protection by Neutralizing Antibodies";
        final String firstContactName = "Helen Holmes";
        final String firstContactEmail = "hholmest@alexa.com";
        final String rationale = "In sagittis dui vel nisl.";
        final String clintrialsId = "blah030";

        cds.viewLearnAboutPage("Studies");
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT);

        log("Verifying data availability on summary page.");
        LearnGrid learnGrid = new LearnGrid(this);
        int rowCount = learnGrid.getRowCount();
        assertTrue("Expected one row in the grid, found " + rowCount + " row(s).", rowCount == 1);
        assertTrue("Row did not contain " + searchString, learnGrid.getRowText(0).contains(searchString));

        log("Start verifying study detail page.");
        learnGrid.getCellWebElement(0, 0).click();
        sleep(CDSHelper.CDS_WAIT);

        log("Verifying study information.");
        List<String> fields = Arrays.asList(CDSHelper.LEARN_ABOUT_ZAP117_INFO_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));
        assertTextPresent(grantAffiliation);

        log("Verifying contact information.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_CONTACT_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));

        assertElementPresent(Locator.xpath("//a[contains(@href, 'mailto:" + firstContactEmail + "')][text()='" + firstContactName + "']"));

        assertElementPresent(Locator.xpath("//a[contains(@href, 'https://clinicaltrials.gov/show/" + clintrialsId + "')]"));

        log("Verifying description section.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_DESCRIPTION_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));
        assertTextPresent(rationale);
        assertElementPresent(Locator.xpath("//a[text()='Click for treatment schema']"));

        validateToolTip(Locator.linkWithText("NAB").findElement(getDriver()), "provided, but not included");

        validateToolTip(Locator.linkWithText("ICS").findElement(getDriver()), "pending study completion");

        validateToolTip(Locator.linkWithText("BAMA").findElement(getDriver()), "Status not available");

    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        log("Extra logging to record time stamps.");
        cds.viewLearnAboutPage("Products");
        log("Should now be on the Learn About - Products page.");
        sleep(30000);
        log("Should have slept for 30 seconds.");
        refresh();
        log("Page was refreshed.");
        sleep(30000);
        log("Should have slept for another 30 seconds. Now wait at most 60 seconds for the page signal to fire.");
        waitForElement(Locators.pageSignal("determinationLearnAboutStudyProductLoaded"), 60000, false);
        log("Signal should have fired. Now wait, at most, 60 seconds for an h2 element with the text 'verapamil hydrochloride'");
        waitForElement(Locator.xpath("//h2").withText("verapamil hydrochloride"), 60000);
        log("Element should be there.");
//        longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]")));

        List<String> studyProducts = Arrays.asList(CDSHelper.PRODUCTS);
        _asserts.verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void clickOnLearnAboutStudyProductsItem()
    {
        List<WebElement> lockedColItems;
        List<WebElement> freeColItems;

        // This code was put in place because we were seeing failure in TeamCity where the page wasn't loading.
        // The TeamCity configuration has been changed to use chrome which looks like it addressed this issue. Going to remove some of these lines for now.
//        log("Extra logging to record time stamps.");
        cds.viewLearnAboutPage("Products");
//        log("Should now be on the Learn About - Study Products page.");
//        sleep(10000);
//        log("Should have slept for 10 seconds.");
        refresh();
        log("Page was refreshed.");
        sleep(10000);
        log("Should have slept for another 10 seconds. Now wait at most 30 seconds for the page signal to fire.");
        waitForElement(Locators.pageSignal("determinationLearnAboutStudyProductLoaded"), 30000, false);
        log("Signal should have fired. Now wait, at most, 30 seconds for an h2 element with the text 'verapamil hydrochloride'");
        waitForElement(Locator.xpath("//h2").withText("verapamil hydrochloride"), 30000);
        log("Element should be there.");
        lockedColItems = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        freeColItems = XPATH_RESULT_ROW_DATA.findElements(getDriver());

        //Because learngrid has a locked column is actually rendered as two grids.
        int listSize = lockedColItems.size();
        int index = listSize / 2;

        scrollIntoView(lockedColItems.get(index));

        String itemTitle = lockedColItems.get(index).getText().split("\n")[0];
        String[] itemClassAndType = freeColItems.get(index).getText().split("\n");

        log("Looking for product: " + itemTitle + " in a list of " + listSize);
        longWait().until(ExpectedConditions.visibilityOf(lockedColItems.get(index)));
        lockedColItems.get(index).click();

        log("Validating title is " + itemTitle);
        longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + itemTitle + "']")));

        log("Validating Product Type is: " + itemClassAndType[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemClassAndType[1] + "']").findElement(getDriver()).isDisplayed());

        String productClass = itemClassAndType[2].replace("Class: ", "");
        log("Validating Class is: " + productClass);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + productClass + "']").findElement(getDriver()).isDisplayed());

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')]/div[contains(@class, 'breadcrumb')][text()='Products / ']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']")));
    }

    @Test
    public void testLearnAboutStudyProductsSearch()
    {
        List<String> searchStrings = new ArrayList<>(Arrays.asList("Pénélope", "acid", "ART", "is a"));

        cds.viewLearnAboutPage("Products");

        searchStrings.stream().forEach((searchString) -> validateSearchFor(searchString));

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), MISSING_SEARCH_STRING);
        sleep(CDSHelper.CDS_WAIT);
        _asserts.verifyEmptyLearnAboutStudyProductsPage();
    }

    @Test
    public void testLearnAboutAssays()
    {
        cds.viewLearnAboutPage("Assays");
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays); // Until the data is stable don't count the assay's shown.

        waitAndClick(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").containing(assays.get(0)));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitForElement(Locator.xpath("//h3[text()='Endpoint description']"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_METHODOLOGY);
        assertElementVisible(Locator.linkWithHref("#learn/learn/Assay/" + CDSHelper.ASSAYS[0].replace(" ", "%20") + "/antigens"));

        //testing variables page
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("variable-list-title").child("h2").withText("Antigen vaccine match indicator"));

        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.

        // testing NAb has virus link rather than antigen link.
        waitAndClick(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitAndClick(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").containing(assays.get(3)));
        waitForElement(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitForElement(Locator.xpath("//h3[text()='Endpoint description']"));
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.linkWithHref("#learn/learn/Assay/" + CDSHelper.ASSAYS[3].replace(" ", "%20") + "/antigens")));
        assertElementVisible(Locator.linkContainingText("Virus List"));

        //testing ICS variables page
        waitAndClick(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitAndClick(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").containing(assays.get(1)));
        waitForElement(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitForElement(Locator.xpath("//h3[text()='Endpoint description']"));

        validateToolTip(Locator.linkWithText("RED 4").findElement(getDriver()), "not approved for sharing");
        validateToolTip(Locator.linkWithText("RED 6").findElement(getDriver()), "not approved for sharing");
        validateToolTip(Locator.tagWithText("span", "w101").findElement(getDriver()), "added");
        validateToolTip(Locator.linkWithText("ZAP 102").findElement(getDriver()), "Status not available");
        validateToolTip(Locator.linkWithText("ZAP 108").findElement(getDriver()), "provided, but not included");
        validateToolTip(Locator.linkWithText("ZAP 115").findElement(getDriver()), "being processed");
        validateToolTip(Locator.linkWithText("ZAP 117").findElement(getDriver()), "pending study completion");

        // Go back to assays and validate the Data Added column.
        cds.viewLearnAboutPage("Assays");
        LearnGrid learnGrid = new LearnGrid(this);
        String toolTipText, cellText, expectedText;
        int dataAddedColumn = learnGrid.getColumnIndex("Data Added");

        log("Checking: " + learnGrid.getCellText(4, 0));
        expectedText = "11 Studies";
        cellText = learnGrid.getCellText(4, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(4, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        // Can't depend upon the text in the tooltip to be in the same order every time. So check for each value separately.
        validateToolTipText(toolTipText, "ZAP 135", "ZAP 139", "ZAP 133", "ZAP 128", "ZAP 129", "ZAP 120", "YOYO 55", "ZAP 118", "ZAP 119", "ZAP 134", "ZAP 117");
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(3, 0));
        expectedText = "5 Studies";
        cellText = learnGrid.getCellText(3, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(3, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, "ZAP 133", "ZAP 128", "YOYO 55", "ZAP 135", "QED 2");
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(2, 0));
        expectedText = "4 Studies";
        cellText = learnGrid.getCellText(2, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(2, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, "ZAP 134", "RED 4", "ZAP 110", "ZAP 111");
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(1, 0));
        expectedText = "14 Studies";
        cellText = learnGrid.getCellText(1, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(1, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, "ZAP 102", "RED 4", "RED 5", "RED 6", "ZAP 105", "ZAP 106", "ZAP 134", "ZAP 136", "ZAP 124", "ZAP 113", "ZAP 115", "ZAP 116", "ZAP 117", "ZAP 118");
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(0, 0));
        expectedText = "1 Study";
        cellText = learnGrid.getCellText(0, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.",  cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(0, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, "ZAP 117");
        log("Tool tip text contained the expected values.");

    }

    @Test
    public void testLearnAboutNABMAbAssay()
    {
        cds.viewLearnAboutPage("Assays");
        LearnGrid summaryGrid = new LearnGrid(this);

        log("Go to NAB MAB assay page");
        summaryGrid.setSearch(CDSHelper.TITLE_NABMAB)
                .clickFirstItem();

        log("Verify Data Availability");
        waitForText("Data Availability");
        List<WebElement> smallHasDataIcons =cds.hasDataDetailIconXPath("").findElements(getDriver());
        assertTrue(smallHasDataIcons.size() == 10);

        assertTrue(isElementPresent(cds.hasDataDetailIconXPath("QED 2")));
        assertFalse(isElementPresent(cds.hasDataDetailIconXPath("QED 1")));
        assertTrue(isElementPresent(cds.noDataDetailIconXPath("RED 6")));

        log("Verify Variables page");
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("variable-list-title").child("h2").withText("Fit Asymmetry"));

        log("Verify Antigens page");
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("detail-description").child("h2").withText("X2160_C25"));
    }

    @Test
    public void testAntigenSearch()
    {
        cds.viewLearnAboutPage("Assays");
        LearnGrid summaryGrid = new LearnGrid(this);

        log("Test basic search functionality.");
        LearnDetailsPage.DetailLearnGrid bamaAntigenGrid = summaryGrid.setSearch(CDSHelper.TITLE_BAMA)
                .clickFirstItem()
                .getGridTab("Antigens");
        bamaAntigenGrid.setSearch(CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA[0]);
        int rowCount = bamaAntigenGrid.getRowCount();

        Assert.assertEquals("There should only be one row returned", 1, rowCount);

        log("Test search persistence");
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        rowCount = bamaAntigenGrid.getRowCount();

        Assert.assertEquals("There should only be one row returned", 1, rowCount);
    }

    @Test
    public void validateSearchNavigation()
    {
        final String STUDIES_LINK = "//h1[@class='lhdv'][text()='Studies']";
        final String ASSAYS_LINK = "//h1[@class='lhdv'][text()='Assays']";
        final String PRODUCTS_LINK = "//h1[@class='lhdv'][text()='Products']";
        final String LEARN_ABOUT = "//span[contains(@class, 'right-label')][text()='Learn about']";
        final String BACK_BUTTON = "//div[contains(@class, 'learnview')]/span/div/div[contains(@class, 'x-container')][not(contains(@style, 'display: none'))]//div[contains(@class, 'learn-up')]//div[contains(@class, 'iarrow')]";

        String searchTextStudies, searchTextAssays, searchTextProducts;
        List<WebElement> returnedItems;

        cds.viewLearnAboutPage("Studies");

        searchTextStudies = "Proin leo odio, porttitor id";
        log("Search for '" + searchTextStudies + "' in Studies");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextStudies);
        waitForElement(XPATH_RESULT_ROW_TITLE);

        log("Go to the detail page of the item returned.");
        returnedItems  = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Click back button to validate that the search value is saved.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Click 'Learn about' and validate that the text box gets cleared.");
        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT);
        assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        assertTrue(this.getFormElement(Locator.xpath(XPATH_TEXTBOX)).length() == 0);

        log("Search in Studies again to give it a history...");
        searchTextStudies = "Oxygen";
        log("Search for '" + searchTextStudies + "' in Studies.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextStudies);
        sleep(CDSHelper.CDS_WAIT);

        log("Go to the detail page of one of the items returned.");
        returnedItems.clear();
        returnedItems  = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT);

        log("Again click the back button to save the search value. It will be checked again in a little while.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go to Assays and try the same basic scenario.");
        click(Locator.xpath(ASSAYS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        searchTextAssays = "NAB";
        log("Search for '" + searchTextAssays + "' in Assays");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextAssays);
        sleep(CDSHelper.CDS_WAIT);

        log("Go to the detail page for " + searchTextAssays + ".");
        returnedItems.clear();
        returnedItems  = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Click back button to validate that the search value is saved.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go to Products and try the same basic scenario.");
        click(Locator.xpath(PRODUCTS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        searchTextProducts = "M\u00E5ns";
        log("Search for '" + searchTextProducts + "' in Products");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextProducts);
        sleep(CDSHelper.CDS_WAIT);

        log("Go to the detail page for " + searchTextProducts + ".");
        returnedItems.clear();
        returnedItems  = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Click back button to validate that the search value is saved.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        assertTrue(searchTextProducts.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now click 'Studies' and validate that the search box is populated as expected.");
        click(Locator.xpath(STUDIES_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now click 'Assays' and validate that the search box is populated as expected.");
        click(Locator.xpath(ASSAYS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Click 'Products' and validate that the search box is populated as expected.");
        click(Locator.xpath(PRODUCTS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(searchTextProducts.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now go to a different part of the app and return using the 'Learn about' link. Search values should be saved.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Validate that the 'Products' search value is there.");
        assertTrue(searchTextProducts.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now click 'Assays' and validate that the search box has the value last searched for in Assays.");
        click(Locator.xpath(ASSAYS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go back to Plots and return using the 'Learn about' link. Search values should be saved and show Assays.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Validate that the 'Assays' search value is there.");
        assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Finally repeat the tests with 'Studies'.");
        click(Locator.xpath(STUDIES_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go back to Plots and return using the 'Learn about' link. Search values should be saved and show Studies.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Validate that the 'Studies' search value is there.");
        assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));
    }

    @Test
    public void validateStudySummaryDataAvailability()
    {
        final int STUDY_WITH_DATA_AVAILABLE = 25;

        cds.viewLearnAboutPage("Studies");
        assertTextPresent("Data not added");

        List<WebElement> hasDataRows = Locator.css(".detail-row-has-data").findElements(getDriver());
        List<WebElement> hasDataIcons = Locator.css(".detail-has-data").findElements(getDriver());
        //hasDataRows is larger than hasDataIcons by a factor of two because of locked columns cause rows to be counted twice.
        assertTrue(hasDataRows.size()/2 == hasDataIcons.size() && hasDataIcons.size() == STUDY_WITH_DATA_AVAILABLE);
    }

    @Test
    public void validateDetailsDataAvailability()
    {
        //Valuse for Study Details inspection
        final String STUDY = "RED 4";
        final String[] ASSAY_TITLES = {"IFNg ELISpot", "ICS", "BAMA"};

        //Valuse for Assay Details inspection
        final int NUM_STUDY_FROM_ASSAY_WITH_DATA = 14;
        final String STUDY_FROM_ASSAY_WITH_NO_DATA = "ZAP 108";

        //Valuse for Study Products Details inspection
        final String PRODUCT = "benztropine mesylate";
        final String[] STUDY_FROM_PRODUCT = {"QED 1", "YOYO 55"};


        log("Testing data availability module in Studies");
        cds.viewLearnAboutPage("Studies");

        Locator element = Locator.xpath("//tr[contains(@class, 'has-data')]/td/div/div/h2[contains(text(), '" + STUDY + "')]");
        assertElementPresent(element);
        scrollIntoView(element);
        mouseOver(element);
        waitForElement(Locator.tagWithClass("tr", "detail-row-hover"));
        waitAndClick(element);

        waitForText("Data Availability");

        assertTrue(isElementPresent(cds.hasDataDetailIconXPath(ASSAY_TITLES[0])));
        assertTrue(isElementPresent(cds.hasDataDetailIconXPath(ASSAY_TITLES[1])));
        assertTrue(isElementPresent(cds.noDataDetailIconXPath(ASSAY_TITLES[2])));


        log("Testing data availability module in Assays");
        cds.viewLearnAboutPage("Assays");
        Locator loc = Locator.xpath("//h2[contains(text(), '" + CDSHelper.ICS + "')]");
        waitAndClick(loc);

        refresh(); //ensures only selecting elements on viewable page.

        waitForText("Data Availability");

        List<WebElement> smallHasDataIcons =cds.hasDataDetailIconXPath("").findElements(getDriver());
        assertTrue(smallHasDataIcons.size() == NUM_STUDY_FROM_ASSAY_WITH_DATA);

        assertFalse(isElementPresent(cds.hasDataDetailIconXPath(STUDY_FROM_ASSAY_WITH_NO_DATA)));
        assertTrue(isElementPresent(cds.noDataDetailIconXPath(STUDY_FROM_ASSAY_WITH_NO_DATA)));


        log("Testing data availability module in Products");
        cds.viewLearnAboutPage("Products");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), PRODUCT);
        sleep(CDSHelper.CDS_WAIT);
        Locator productRow = Locator.xpath("//h2[text() = '" + PRODUCT + "']");
        assertElementPresent(productRow);
//        scrollIntoView(productRow);
        mouseOver(productRow);
        waitForElement(Locator.tagWithClass("tr", "detail-row-hover"));
        waitAndClick(productRow);

        refresh();

        waitForText("Data Availability");

        assertTrue(isElementPresent(cds.hasDataDetailIconXPath(STUDY_FROM_PRODUCT[0])));
        assertTrue(isElementPresent(cds.noDataDetailIconXPath(STUDY_FROM_PRODUCT[1])));
    }

    @Test
    public void validateLearnAboutFiltering()
    {
        LearnGrid learnGrid = new LearnGrid(this);

        cds.viewLearnAboutPage("Studies");

        log("Evaluating sorting...");
        learnGrid.sort("Name & Description");
        List<WebElement> sortedStudyTitles = Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").findElements(getDriver());

        scrollIntoView(sortedStudyTitles.get(sortedStudyTitles.size() - 1));
        String titleForLastElement = sortedStudyTitles.get(sortedStudyTitles.size() - 1).getText();
        learnGrid.sort("Name & Description");
        assertTrue(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").findElements(getDriver())
                .get(0).getText()
                .equals(titleForLastElement));

        log("Evaluating filtering...");
        String[] studiesToFilter = {CDSHelper.STUDIES[0], CDSHelper.STUDIES[7], CDSHelper.STUDIES[20]}; //Arbitrarily chosen
        int numRowsPreFilter = XPATH_RESULT_ROW_TITLE.findElements(getDriver()).size();

        assertTrue("Facet options should all have data before filtering", LearnGrid.FacetGroups.hasData == learnGrid.getFacetGroupStatus("Name & Description"));

        learnGrid.setFacet("Name & Description", studiesToFilter);
        List<WebElement> studyTitlesAfterFilter = Locator.tagWithClass("tr", "detail-row")
                .append("/td//div/div/h2")
                .findElements(getDriver());

        List<String> studiesFiltered =  Arrays.asList(studiesToFilter);
        for (WebElement studyTitlesOnPage : studyTitlesAfterFilter)
        {
            scrollIntoView(studyTitlesOnPage);
            assertTrue(studiesFiltered.contains(studyTitlesOnPage.getText()));
        }

        assertTrue("Both 'In current selection' and 'Not in current selection' group should be present for column with filter", LearnGrid.FacetGroups.both == learnGrid.getFacetGroupStatus("Name & Description"));
        assertTrue("Both 'In current selection' and 'Not in current selection' group should be present for 'Data Added' column after filtering studies", LearnGrid.FacetGroups.both == learnGrid.getFacetGroupStatus("Data Added"));

        log("Evaluating clearing a filter");
        learnGrid.clearFilters("Name & Description");
        int numRowsPostFilter = learnGrid.getRowCount();
        assertTrue(numRowsPreFilter == numRowsPostFilter && numRowsPostFilter == CDSHelper.STUDIES.length);
        assertTrue("Facet options should have data after clearing filter on column", LearnGrid.FacetGroups.hasData == learnGrid.getFacetGroupStatus("Name & Description"));
        assertTrue("Facet options should have data for 'Data Added' column after removing study filter", LearnGrid.FacetGroups.hasData == learnGrid.getFacetGroupStatus("Data Added"));

        log("Evaluating applying two numeric filters");
        //finds the number of rows that have a date column and assay column that satisfy the following filter
        final String yearToFilter = "2004";
        final String numAssaysToFilter = "1";
        int numRowsSatisfyFilter = Locator.xpath("//tr/td/div/div/div[contains(@class, 'detail-gray-text')]" +
                "[contains(text(), '" + numAssaysToFilter + " Assay')]/../../../following-sibling::" +
                "td/div/div/table/tbody/tr[contains(@class, 'detail-gray-text')]/td[contains(text(), '"+ yearToFilter + "')]")
                .findElements(getDriver()).size();

        learnGrid.setWithOptionFacet("Status", "Start Year", yearToFilter);
        learnGrid.setFacet("Data Added", numAssaysToFilter);
        numRowsPostFilter = learnGrid.getRowCount();

        assertTrue(numRowsSatisfyFilter == numRowsPostFilter);

        log("Evaluating persisting to URL");
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        int numRowsPostRefresh = learnGrid.getRowCount();
        assertTrue(numRowsSatisfyFilter == numRowsPostRefresh);

        log("Evaluating filtering to empty grid");
        String strategyToFilter = "s3";
        learnGrid.setFacet("Strategy", strategyToFilter);
        numRowsPostFilter = learnGrid.getRowCount();
        assertTrue(numRowsPostFilter == 0);
        assertTrue("Name & Description facet options should have data with empty grid", LearnGrid.FacetGroups.noData == learnGrid.getFacetGroupStatus("Name & Description"));
        assertTrue("Data Added facet options should have data with empty grid", LearnGrid.FacetGroups.noData == learnGrid.getFacetGroupStatus("Data Added"));

        learnGrid.clearFiltersWithOption("Status", "Start Year");
        learnGrid.clearFilters("Data Added");
    }

    @Test
    public void validateLearnAboutFilterAndDetailsPage()
    {

        // This test is used to validate the fix for issue 29002 (DataSpace: Learn filters restrict info pane link).
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        LearnGrid learnGrid = new LearnGrid(this);

        cds.viewLearnAboutPage("Studies");

        log("Filter the type of study to 'Phase I'");
        String[] studiesToFilter = {"Phase I"}; //Arbitrarily chosen

        learnGrid.setFacet("Type", studiesToFilter);

        log("Open the 'Studies' info pane and then click on the 'learn about' link.");
        cds.openStatusInfoPane("Studies");
        cds.clickLearnAboutInfoPaneItem(CDSHelper.QED_1);

        log("Validate that the learn about page is shown.");
        waitForText(STUDY_INFO_TEXT_TRIGGER);
        assertElementVisible(Locator.linkWithText("Heather Wright"));
        click(CDSHelper.Locators.cdsButtonLocator("Cancel", "filterinfocancel"));

        cds.viewLearnAboutPage("Studies");
        learnGrid.clearFilters("Type");

    }

    @Test
    public void validateAssayAntigens()
    {
        cds.viewLearnAboutPage("Assays");
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays); // Until the data is stable don't count the assay's shown.

        waitAndClick(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").containing(assays.get(0)));
        waitForElement(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitForElement(Locator.xpath("//h3[text()='Endpoint description']"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_METHODOLOGY);

        log("testing BAMA antigens page...");
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.
        waitForElement(Locator.tagWithClass("div", "x-column-header-inner").append("/span").containing("Antigen"));
        for (int i = 0; i < CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA.length; i++)
        {
            // Use this as the conditional test that the page has loaded, and wait for it to load as well.
            waitForElement(Locator.xpath("//div[@class='detail-description']//h2[text()='" + CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA[i] + "']"), 1000, true);
        }

        LearnGrid learnGrid = new LearnGrid(this);
        log("Evaluating sorting...");
        learnGrid.sort("Antigen");
        List<WebElement> sortedAntigenNames = Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").findElements(getDriver());
        scrollIntoView(sortedAntigenNames.get(sortedAntigenNames.size() - 1));
        String titleForLastElement = sortedAntigenNames.get(sortedAntigenNames.size() - 1).getText();
        learnGrid.sort("Antigen");
        assertTrue("Antigens are not sorted as expected", Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").findElements(getDriver())
                .get(0).getText()
                .equals(titleForLastElement));

        log("Evaluating filtering...");
        String[] antigensToFilter = {CDSHelper.BAMA_ANTIGENS_NAME[0], CDSHelper.BAMA_ANTIGENS_NAME[3], CDSHelper.BAMA_ANTIGENS_NAME[5]}; //Arbitrarily chosen
        learnGrid.setFacet("Antigen", antigensToFilter);
        List<WebElement> antigensAfterFilter = Locator.tagWithClass("tr", "detail-row")
                .append("/td//div/div/h2")
                .findElements(getDriver());
        assertTrue("Expected number of antigens after filtering: " + antigensToFilter.length + ", actual number: " + antigensAfterFilter.size(),
                antigensAfterFilter.size() == antigensToFilter.length);
        List<String> studiesFiltered =  Arrays.asList(antigensToFilter);
        for (WebElement antigenTitlesOnPage : antigensAfterFilter)
        {
            scrollIntoView(antigenTitlesOnPage);
            assertTrue("Antigen " + antigenTitlesOnPage.getText() + " is not present", studiesFiltered.contains(antigenTitlesOnPage.getText()));
        }

        log("Evaluating clearing a filter");
        learnGrid.clearFilters("Antigen");
        assertTrue("Not all antigens are present after clearing filter", learnGrid.getTitleRowCount() == CDSHelper.BAMA_ANTIGENS_NAME.length);

        log("testing ICS antigens page");
        waitAndClick(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));
        waitAndClick(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").containing(assays.get(1)));
        waitForElement(Locator.tagWithClass("div", "breadcrumb").containing("Assays /"));

        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        waitForElement(Locator.tagWithClass("div", "x-column-header-inner").append("/span").containing("Protein Panel"));
        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.
        waitForElement(Locator.tagWithClass("div", "x-column-header-inner").append("/span").containing("Protein Panel"));
        sleep(500);
        waitForText(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA[0]);
        assertTextPresent(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA);

        log("Evaluating multi filtering...");
        learnGrid.setWithOptionFacet("Protein:Pools", "Proteins", "POL");
        log(learnGrid.getTitleRowCount() + "a");
        assertTrue("Number of antigens is incorrect after filtering by Proteins \"POL\"", 2 == learnGrid.getTitleRowCount());

        log("Evaluating filter persistence");
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        assertTrue("Antigens are not filtered correctly when loading from URL", 2 == learnGrid.getTitleRowCount());

        learnGrid.setWithOptionFacet("Protein:Pools", "Pools", "POL 2");
        assertTrue("Number of antigens is incorrect after filtering by Pools \"POL 2\"", 1 == learnGrid.getTitleRowCount());
    }

    @Test
    public void validateMultiFiltering()
    {
        LearnGrid learnGrid = new LearnGrid(this);

        //Test basic functionality of multifacet
        cds.viewLearnAboutPage("Studies");
        learnGrid.setWithOptionFacet("Type", "Species", "Vulcan");
        assertTrue(1 == learnGrid.getRowCount());

        //Test filter for alt property persists correctly
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        assertTrue(1 == learnGrid.getRowCount());

        //Test clear doesn't fire for wrong selection in facet panel.
        learnGrid.clearFiltersWithOption("Type", "Type");
        assertTrue(1 == learnGrid.getRowCount());

        //Test basic clear works
        learnGrid.clearFiltersWithOption("Type", "Species");
        assertTrue(CDSHelper.STUDIES.length == learnGrid.getRowCount());

        //Test setting two different filters in multifacet
        learnGrid.setWithOptionFacet("Type", "Species", "Human");
        learnGrid.setWithOptionFacet("Type", "Type", "Phase IIB");
        assertTrue(2 == learnGrid.getRowCount());

        //Test combining filter with another column
        learnGrid.setFacet("Data Added", "2");
        _asserts.verifyEmptyLearnAboutStudyPage();

        //clear all filters and check results are correct in succession.
        learnGrid.clearFilters("Data Added");
        assertTrue(2 == learnGrid.getRowCount());

        learnGrid.clearFiltersWithOption("Type", "Species");
        assertTrue(2 == learnGrid.getRowCount());
        learnGrid.clearFiltersWithOption("Type", "Type");
        assertTrue(CDSHelper.STUDIES.length == learnGrid.getRowCount());

        //test filtering on grant affiliation and network
        learnGrid.setWithOptionFacet("PI", "Grant Affiliation", "Gallo: Systemic, Mucosal & Passive Immunity");
        assertTrue(2 == learnGrid.getRowCount());
        learnGrid.setWithOptionFacet("Name & Description", "Network", "Q");
        assertTrue(1 == learnGrid.getRowCount());
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        assertTrue(1 == learnGrid.getRowCount());
        learnGrid.clearFiltersWithOption("PI", "Grant Affiliation");
        learnGrid.clearFiltersWithOption("Name & Description", "Network");

        learnGrid.setWithOptionFacet("Products", "Product Class", "ante");
        assertTrue(2 == learnGrid.getRowCount());
        learnGrid.clearFiltersWithOption("Products", "Product Class");
    }

    @Test
    public void validateLinksToStudyGrantDocuments()
    {
        final String PDF01_FILE_NAME = "shattock%20opp37872%20novel%20antigens%20for%20mucosal%20protection.pdf";
        final String PDF02_FILE_NAME = "mcelrath%20opp38645%20innate%20to%20adaptive%20immunity.pdf";
        final String DOCX_FILE_NAME = "Gallo OPP41351 Systemic, Mucosal and Passive Immunity.docx";
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        String studyName;
        Locator studyElement;

        log("Validate a link to a pdf file works as expected.");
        clickPDFGrantAffilication(CDSHelper.QED_2, PDF01_FILE_NAME);

        log("Validate that a link to a doc file works as expected.");
        clickDocGrantAffiliation(CDSHelper.QED_1, DOCX_FILE_NAME);

        log("Validated that a document linked to several studies works as expected.");
        clickPDFGrantAffilication(CDSHelper.ZAP_100, PDF02_FILE_NAME);
        clickPDFGrantAffilication(CDSHelper.RED_5, PDF02_FILE_NAME);
        clickPDFGrantAffilication(CDSHelper.RED_8, PDF02_FILE_NAME);

        log("Validate a study that has link but the document is not there.");
        cds.viewLearnAboutPage("Studies");

        studyElement = Locator.xpath("//h2[text() = '" + CDSHelper.RED_1 + "']");
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        assertTrue("There was a visible link to a grant document for this study, and there should not be.", cds.getVisibleGrantDocumentLink() == null);

        goToHome();
        log("All done.");

    }

    @Test
    public void validateReportsDocumentLinks()
    {
        final String STUDY_XPATH_TEMPLATE = "//h2[text() = '$']";
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        String studyXPath, studyName, documentName;
        Locator studyElement;
        WebElement documentLink;

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.RED_5;

        log("Check the links for " + studyName);
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        log("Verify that the expected number of links did show up.");
        Assert.assertEquals("Did not find the expected number of document links.", 3, Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a").findElements(getDriver()).size());

        log("First check the Powerpoint link.");
        documentLink = CDSHelper.Locators.studyReportLink("Epitope Mapping Results Summary").findElement(getDriver());
        assertTrue("Was not able to find link to the Powerpoint document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd260_CAVIMC 031 Linear Epitope Mapping_BaselineSubtracted-3.pptx";
        cds.validateDocLink(documentLink, documentName);

        log("Now check the Excel link.");
        documentLink = CDSHelper.Locators.studyReportLink("NAB Data Summary 2").findElement(getDriver());
        assertTrue("Was not able to find link to the Excel document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd260_CAVIMC-031 Neutralization Data with AUC 3 May 2011-6.xlsx";
        cds.validateDocLink(documentLink, documentName);

        log("Finally for this study validate the pdf file.");
        documentLink = CDSHelper.Locators.studyReportLink("NAB Data Summary 1").findElement(getDriver());
        assertTrue("Was not able to find link to the PDF document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd260_McElrath_Seder_Antibody Responses 1.1 01Jun11.pdf";
        cds.validatePDFLink(documentLink, documentName);

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.RED_9;

        log("Check the links for " + studyName);
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        log("Verify that the expected number of links did show up.");
        Assert.assertEquals("Did not find the expected number of document links.", 9, Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a").findElements(getDriver()).size());

        log("Click on a few of these links to make sure they work. First check the Word Document link.");
        documentLink = CDSHelper.Locators.studyReportLink("CFSE Results Summary").findElement(getDriver());
        assertTrue("Was not able to find link to the Word Document document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd264_DCVax001_CFSE_Memo_JUL13_v4.docx";
        cds.validateDocLink(documentLink, documentName);

        log("Now check one of the PDF link.");
        documentLink = CDSHelper.Locators.studyReportLink("ICS Data Summary").findElement(getDriver());
        assertTrue("Was not able to find link to the PDF document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd264_ICS_LAB_REPORT_19APR13_n24fcm_fh_IL2_CD154_MIMOSA.pdf";
        cds.validatePDFLink(documentLink, documentName);

        cds.viewLearnAboutPage("Studies");

        log("Now validate a study that should have no links.");
        studyName = CDSHelper.QED_2;

        log("Check the links for " + studyName);
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        log("Verify that there are no links.");
        Assert.assertEquals("Did not find the expected number of document links.", 0, Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a").findElements(getDriver()).size());

        log("Validate the related studies links");
        String relatedStudiesText, expectedStudiesText;

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.QED_1;
        expectedStudiesText = "QED 2 (Main study)\nQED 3 (Main study)\nRED 3 (Extension study)\nRED 4 (Extension study)\nZAP 100 (Co-conducted study)\nZAP 111 (HIV follow up study)\nRED 2 (Ancillary study)\nZAP 101 (A poorly-named study relationship)";

        log("Check the links for " + studyName + ". Each of the different relationship types should be listed.");
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);

        Locator relatedStudiesTable = Locator.xpath("//h3[text()='Related Studies']/following-sibling::table[@class='learn-study-info']");

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        log("Now validate that link to the documents works as expected.");
        click(Locator.linkWithText("QED 3"));
        sleep(1000);
        assertTrue("It doesn't look like we navigated to the QED 3 study.", getText(Locator.xpath("//div[@class='studyname']")).equals("QED 3"));
        log("Verify that the related study links for this study are as expected.");
        expectedStudiesText = "QED 1 (Ancillary study)";
        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);
        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        log("Click the related study and make sure we navigate back to the original study.");
        click(Locator.linkWithText("QED 1"));
        sleep(1000);
        assertTrue("It doesn't look like we navigated to the QED 1 study.", getText(Locator.xpath("//div[@class='studyname']")).equals("QED 1"));

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.QED_2;
        expectedStudiesText = "QED 4 (Main study)\nQED 1 (Ancillary study)";

        log("Check the links for " + studyName + ". THis should only have two studies related.");
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.ZAP_105;
        expectedStudiesText = "ZAP 102 (Ancillary study)";

        log("Check the links for " + studyName + ". This should only have one study related, and this should be the last entry in StudyRelationship.txt");
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.RED_2;

        log("Check the links for " + studyName + ". This should have no studies, so validate the element isn't shown.");
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);

        assertFalse("There should be no related studies for this study, but the related studies grid was found.", isElementPresent(relatedStudiesTable));
        assertFalse("The header for the related studies section was found.", isElementPresent(Locator.xpath("//h3[text()='Related Studies']")));

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.ZAP_103;
        expectedStudiesText = "YOYO 55 (Main study)\nZAP 110 (Main study)\nZAP 111 (Main study)\nZAP 105 (HIV follow up study)";

        log("Check the links for " + studyName + ". The relationships for this study were in a 'random' order in StudyRelationship.txt validate that has no effect on the list.");
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        cds.viewLearnAboutPage("Studies");

        studyName = CDSHelper.RED_5;
        expectedStudiesText = "RED 5 (Ancillary study)";

        log("Check the links for " + studyName + ". This is a self referential study. This should not happen but validating that if it does we are ok with it.");
        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        goToHome();
        log("All done.");

    }

    private void clickPDFGrantAffilication(String studyName, String pdfFileName)
    {
//        final String PLUGIN_XPATH = "//embed[@name='plugin']";
        final String STUDY_XPATH_TEMPLATE = "//h2[text() = '$']";
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        String studyXPath;
        Locator studyElement;
        WebElement documentLink;

        pdfFileName = pdfFileName.toLowerCase();

        cds.viewLearnAboutPage("Studies");

        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        log("Validate that study " + studyName + " has a grant document and is of type pdf.");
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        documentLink = cds.getVisibleGrantDocumentLink();
        assertTrue("Was not able to find link to the document for study '" + studyName + "'.", documentLink != null);

        cds.validatePDFLink(documentLink, pdfFileName);
//        log("Now click on the document link.");
//        documentLink.click();
//        sleep(10000);
//        switchToWindow(1);
//
//        log("Validate that the pdf document was loaded into the browser.");
//        assertElementPresent("Doesn't look like the embed elment is present.", Locator.xpath(PLUGIN_XPATH), 1);
//        Assert.assertTrue("The embedded element is not a pdf plugin", getAttribute(Locator.xpath(PLUGIN_XPATH), "type").toLowerCase().contains("pdf"));
//        Assert.assertTrue("The source for the plugin is not the expected document. Expected: '" + pdfFileName + "'. Found: '" + getAttribute(Locator.xpath(PLUGIN_XPATH), "src").toLowerCase() + "'.", getAttribute(Locator.xpath(PLUGIN_XPATH), "src").toLowerCase().contains(pdfFileName));
//
//        log("Close this window.");
//        getDriver().close();
//
//        log("Go back to the main window.");
//        switchToMainWindow();

    }

    private void clickDocGrantAffiliation(String studyName, String docFileName)
    {
        final String STUDY_XPATH_TEMPLATE = "//h2[text() = '$']";
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        String studyXPath, foundDocumentName;
        Locator studyElement;
        WebElement documentLink;
//        File docFile;

        docFileName = docFileName.toLowerCase();

        cds.viewLearnAboutPage("Studies");

        studyXPath = STUDY_XPATH_TEMPLATE.replace("$", studyName);
        studyElement = Locator.xpath(studyXPath);
        log("Validate that study " + studyName + " has a grant document and is of type docx.");
        scrollIntoView(studyElement);
        click(studyElement);
        sleep(1000);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        documentLink = cds.getVisibleGrantDocumentLink();
        assertTrue("Was not able to find link to the document for study '" + studyName + "'.", documentLink != null);

        cds.validateDocLink(documentLink, docFileName);
//        log("Now click on the document link.");
//        docFile = clickAndWaitForDownload(documentLink);
//        foundDocumentName = docFile.getName();
//        Assert.assertTrue("Downloaded document not of the expected name. Expected: '" + docFileName + "' Found: '" + foundDocumentName.toLowerCase() + "'.", docFile.getName().toLowerCase().contains(docFileName));

    }

    //Helper function for data availability tests
    private Locator.XPathLocator getDataRowXPathNoToolTip(String rowText)
    {
        return Locator.xpath("//tr[contains(@class,'item-row')]/td/a[contains(text(), '" + rowText + "')]").parent().parent();
    }

    private void validateSearchFor(String searchString)
    {
        String itemText;
        String[] itemParts;
        List<WebElement> returnedItems;

        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT);  // Same elements are reused between searched, this sleep prevents a "stale element" error.
        returnedItems = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
        log("Found " + returnedItems.size() + " items.");

        for (int i = 0; i < returnedItems.size(); i++)
        {
            returnedItems = XPATH_RESULT_ROW_TITLE.findElements(getDriver());
            WebElement listItem = returnedItems.get(i);
            scrollIntoView(listItem);

            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at detail page of " + itemParts[0]);

            click(listItem);
            sleep(1000);

            assertTextPresentCaseInsensitive(searchString);

            click(CDSHelper.Locators.pageHeaderBack());
            sleep(2000);
        }

    }

    private void validateToolTipText(String toolTipText, String... expectedText)
    {
        for (String expected : expectedText)
        {
            assertTrue("Tool tip did not contain text: '" + expected + "'. Found: '" + toolTipText + "'.", toolTipText.trim().toLowerCase().contains(expected.trim().toLowerCase()));
        }
    }

    private void validateToolTip(WebElement el, String toolTipExpected)
    {
        log("Hover over the link with text '" + el.getText() + "' to validate that the tooltip is shown.");
        String toolTipText;

        assertTrue("Tooltip for '" + el.getText() + "' didn't show. Show yourself coward!", triggerToolTip(el));
        log("It looks like a tooltip was shown for '" + el.getText()+ "'.");

        toolTipText = getToolTipText();

        validateToolTipText(toolTipText, toolTipExpected);

    }

    private boolean triggerToolTip(WebElement el)
    {
        int elWidth = el.getSize().getWidth();
        int elHeight = el.getSize().getHeight();
        boolean bubblePresent = false;

        Actions builder = new Actions(getDriver());

        for (int i = -10; i <= elWidth && i <= elHeight && !bubblePresent; i++)
        {
            sleep(250); // Wait a moment.
            builder.moveToElement(el, i, i).build().perform();
            bubblePresent = isElementPresent(Locator.css("div.hopscotch-bubble-container"));
        }

        return bubblePresent;
    }

    private String getToolTipText()
    {
        return getText(Locator.css("div.hopscotch-bubble-container div.hopscotch-bubble-content div.hopscotch-content"));
    }
}
