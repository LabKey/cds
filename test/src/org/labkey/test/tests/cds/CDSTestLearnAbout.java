package org.labkey.test.tests.cds;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Category({})
public class CDSTestLearnAbout extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String MISSING_SEARCH_STRING = "If this string ever appears something very odd happened.";
    private final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
    private final String XPATH_RESULT_ROW = "//div[not(contains(@style, 'display: none'))]/div/div/table/tbody/tr[contains(@class, 'detail-row')]";

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
        String[] itemParts;
//        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudies')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-container')]";

        cds.viewLearnAboutPage("Studies");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());

        int index = returnedItems.size()/2;

        itemParts = returnedItems.get(index).getText().split("\n");
        returnedItems.get(index).click();

        log("Validating title is " + itemParts[0]);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//span[text()='" + itemParts[0] + "']").toBy()));

        log("Validating Study Type is: " + itemParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[1] + "']").findElement(getDriver()).isDisplayed());

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')]/span[contains(@class, 'breadcrumb')][text()='Studies / ']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']").toBy()));
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
        final String searchString = "QED 2";
        final String grantAffiliation = "Nulla tellus. In sagittis dui vel nisl.";
        final String dataAvailability = "iaculis diam erat fermentum justo nec";
        final String firstContactName = "Juan Owens";
        final String firstContactEmail = "jowens5@deviantart.com";
        final String rationale = "Nullam molestie nibh in lectus. Pellentesque at nulla.";

        cds.viewLearnAboutPage("Studies");
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Verifying data availability on summary page.");
        assert(Locator.xpath("//div[contains(@class, 'data-availability-text')][text()='" + dataAvailability + "']").findElement(getDriver()).isDisplayed());

        log("Start verifying study detail page.");
        List<WebElement> returnedItems  = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Verifying study information.");
        List<String> fields = Arrays.asList(CDSHelper.LEARN_ABOUT_QED2_INFO_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));
        assertTextPresent(grantAffiliation);

        log("Verifying contact information.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_QED2_CONTACT_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));

        assertElementPresent(Locator.xpath("//a[contains(@href, 'mailto:" + firstContactEmail + "')][text()='" + firstContactName + "']"));

        log("Verifying description section.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_QED2_DESCRIPTION_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));
        assertTextPresent(rationale);
        assertElementPresent(Locator.xpath("//a[text()='Click for treatment schema']"));
    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        log("Extra logging to record time stamps.");
        cds.viewLearnAboutPage("Study products");
        log("Should now be on the Learn About - Study Products page.");
        sleep(30000);
        log("Should have slept for 30 seconds.");
        refresh();
        log("Page was refreshed.");
        sleep(30000);
        log("Should have slept for another 30 seconds. Now wait at most 60 seconds for the page signal to fire.");
        waitForElement(LabKeyPage.Locators.pageSignal("determinationLearnAboutStudyProductLoaded"), 60000, false);
        log("Signal should have fired. Now wait, at most, 60 seconds for an h2 element with the text 'verapamil hydrochloride'");
        waitForElement(Locator.xpath("//h2").withText("verapamil hydrochloride"), 60000);
        log("Element should be there.");
//        longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]").toBy()));

        List<String> studyProducts = Arrays.asList(CDSHelper.PRODUCTS);
        _asserts.verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void clickOnLearnAboutStudyProductsItem()
    {
        List<WebElement> returnedItems;
        String[] itemParts;
//        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-container')]";

        log("Extra logging to record time stamps.");
        cds.viewLearnAboutPage("Study products");
        log("Should now be on the Learn About - Study Products page.");
        sleep(30000);
        log("Should have slept for 30 seconds.");
        refresh();
        log("Page was refreshed.");
        sleep(30000);
        log("Should have slept for another 30 seconds. Now wait at most 60 seconds for the page signal to fire.");
        waitForElement(LabKeyPage.Locators.pageSignal("determinationLearnAboutStudyProductLoaded"), 60000, false);
        log("Signal should have fired. Now wait, at most, 60 seconds for an h2 element with the text 'verapamil hydrochloride'");
        waitForElement(Locator.xpath("//h2").withText("verapamil hydrochloride"), 60000);
        log("Element should be there.");
//        longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]").toBy()));
        returnedItems = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());

        int index = returnedItems.size()/2;

        itemParts = returnedItems.get(index).getText().split("\n");
        log("Looking for product: " + itemParts[0] + " in a list of " + returnedItems.size());
        longWait().until(ExpectedConditions.visibilityOf(returnedItems.get(index)));
        returnedItems.get(index).click();

        log("Validating title is " + itemParts[0]);
        longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//span[text()='" + itemParts[0] + "']").toBy()));

        log("Validating Product Type is: " + itemParts[1]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[1] + "']").findElement(getDriver()).isDisplayed());

        log("Validating Class is: " + itemParts[2]);
        assert(Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemParts[2] + "']").findElement(getDriver()).isDisplayed());

        log("Validating return link works.");
        click(Locator.xpath("//div[contains(@class, 'learn-up')]/span[contains(@class, 'breadcrumb')][text()='Study products / ']"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']").toBy()));
    }

    @Test
    public void testLearnAboutStudyProductsSearch()
    {
        List<String> searchStrings = new ArrayList<>(Arrays.asList("Pénélope", "acid", "ART", "is a"));

        cds.viewLearnAboutPage("Study products");

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
        waitForElement(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_ANALYTE_DATA);

        //testing variables page
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        waitForElement(Locator.tagWithClass("div", "list-entry-container"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_VARIABLES_DATA);

        refresh();

        waitForElement(Locator.tagWithClass("div", "list-entry-container"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_VARIABLES_DATA);

        //testing BAMA antigens page
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        waitForElement(Locator.tagWithClass("div", "list-title-bar").append("/div").containing("Antigen"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA);

        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.

        //testing ICS antigens page
        waitAndClick(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));
        waitAndClick(Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2").containing(assays.get(1)));
        waitForElement(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));

        refresh();

        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        waitForElement(Locator.tagWithClass("div", "list-title-bar").append("/div").containing("Protein Panel"));
        waitForText(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA[0]);
        assertTextPresent(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA);
    }

    @Test
    public void validateSearchNavigation()
    {
        final String STUDIES_LINK = "//h1[@class='lhdv'][text()='Studies']";
        final String ASSAYS_LINK = "//h1[@class='lhdv'][text()='Assays']";
        final String PRODUCTS_LINK = "//h1[@class='lhdv'][text()='Study products']";
        final String LEARN_ABOUT = "//span[contains(@class, 'right-label')][text()='Learn about']";
        final String BACK_BUTTON = "//div[contains(@class, 'learnview')]/span/div/div[contains(@class, 'x-container')][not(contains(@style, 'display: none'))]//div[contains(@class, 'learn-up')]//span[contains(@class, 'iarrow')]";

        String searchTextStudies, searchTextAssays, searchTextProducts;
        List<WebElement> returnedItems;

        cds.viewLearnAboutPage("Studies");

        searchTextStudies = "Proin leo odio, porttitor id";
        log("Search for '" + searchTextStudies + "' in Studies");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextStudies);
        waitForElement(Locator.xpath(XPATH_RESULT_ROW));

        log("Go to the detail page of the item returned.");
        returnedItems  = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Click back button to validate that the search value is saved.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        Assert.assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Click 'Learn about' and validate that the text box gets cleared.");
        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT);
        Assert.assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        Assert.assertTrue(this.getFormElement(Locator.xpath(XPATH_TEXTBOX)).length() == 0);

        log("Search in Studies again to give it a history...");
        searchTextStudies = "Oxygen";
        log("Search for '" + searchTextStudies + "' in Studies.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextStudies);
        sleep(CDSHelper.CDS_WAIT);

        log("Go to the detail page of one of the items returned.");
        returnedItems.clear();
        returnedItems  = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT);

        log("Again click the back button to save the search value. It will be checked again in a little while.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        Assert.assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go to Assays and try the same basic scenario.");
        click(Locator.xpath(ASSAYS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        searchTextAssays = "NAB";
        log("Search for '" + searchTextAssays + "' in Assays");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextAssays);
        sleep(CDSHelper.CDS_WAIT);

        log("Go to the detail page for " + searchTextAssays + ".");
        returnedItems.clear();
        returnedItems  = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Click back button to validate that the search value is saved.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        Assert.assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go to Study products and try the same basic scenario.");
        click(Locator.xpath(PRODUCTS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        searchTextProducts = "M\u00E5ns";
        log("Search for '" + searchTextProducts + "' in Products");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchTextProducts);
        sleep(CDSHelper.CDS_WAIT);

        log("Go to the detail page for " + searchTextProducts + ".");
        returnedItems.clear();
        returnedItems  = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Click back button to validate that the search value is saved.");
        Locator.xpath(BACK_BUTTON).findElement(getDriver()).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(Locator.xpath(XPATH_TEXTBOX).findElement(getDriver()).isDisplayed());
        Assert.assertTrue(searchTextProducts.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now click 'Studies' and validate that the search box is populated as expected.");
        click(Locator.xpath(STUDIES_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now click 'Assays' and validate that the search box is populated as expected.");
        click(Locator.xpath(ASSAYS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Click 'Study Products' and validate that the search box is populated as expected.");
        click(Locator.xpath(PRODUCTS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(searchTextProducts.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now go to a different part of the app and return using the 'Learn about' link. Search values should be saved.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Validate that the 'Study products' search value is there.");
        Assert.assertTrue(searchTextProducts.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Now click 'Assays' and validate that the search box has the value last searched for in Assays.");
        click(Locator.xpath(ASSAYS_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go back to Plots and return using the 'Learn about' link. Search values should be saved and show Assays.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Validate that the 'Assays' search value is there.");
        Assert.assertTrue(searchTextAssays.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Finally repeat the tests with 'Studies'.");
        click(Locator.xpath(STUDIES_LINK));
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        Assert.assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

        log("Go back to Plots and return using the 'Learn about' link. Search values should be saved and show Studies.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        click(Locator.xpath(LEARN_ABOUT));
        waitForText("Learn about...");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Validate that the 'Studies' search value is there.");
        Assert.assertTrue(searchTextStudies.equals(this.getFormElement(Locator.xpath(XPATH_TEXTBOX))));

    }

    @Test
    public void validateStudySummaryDataAvailability()
    {
        final int STUDY_WITH_DATA_AVAILABLE = 25;

        cds.viewLearnAboutPage("Studies");
        assertTextPresent("Data Added");

        List<WebElement> hasDataRows = Locator.css(".detail-row-has-data").findElements(getDriver());
        List<WebElement> hasDataIcons = Locator.css(".detail-has-data").findElements(getDriver());
        Assert.assertTrue(hasDataRows.size() == hasDataIcons.size() && hasDataIcons.size() == STUDY_WITH_DATA_AVAILABLE);
    }

    @Test
    public void validateDetailsDataAvailability()
    {
        final String HAS_DATA_ICON = "smallCheck.png";
        final String HAS_NO_DATA_ICON = "smallGreyX.png";

        //Valuse for Study Details inspection
        final String STUDY = "RED 4";
        final String[] ASSAY_TITLES = {"IFNg ELISpot", "Intracellular Cytokine Staining", "HIV Binding Antibody"};

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
        waitAndClick(element);

        waitForText("Data Availability");

        Assert.assertTrue(isElementPresent(getDataRowXPath(ASSAY_TITLES[0]).append("//td//img[contains(@src, '" + HAS_DATA_ICON + "')]")));
        Assert.assertTrue(isElementPresent(getDataRowXPath(ASSAY_TITLES[1]).append("//td//img[contains(@src, '" + HAS_DATA_ICON + "')]")));
        Assert.assertTrue(isElementPresent(getDataRowXPath(ASSAY_TITLES[2]).append("//td//img[contains(@src, '" + HAS_NO_DATA_ICON + "')]")));


        log("Testing data availability module in Assays");
        cds.viewLearnAboutPage("Assays");
        Locator loc = Locator.xpath("//h2[contains(text(), '" + CDSHelper.ICS + "')]");
        waitAndClick(loc);

        refresh(); //ensures only selecting elements on viewable page.

        waitForText("Data Availability");

        List<WebElement> smallHasDataIcons =getDataRowXPath("").append("//td//img[contains(@src, '"  + HAS_DATA_ICON +  "')]").findElements(getDriver());
        Assert.assertTrue(smallHasDataIcons.size() == NUM_STUDY_FROM_ASSAY_WITH_DATA);

        Assert.assertFalse(isElementPresent(getDataRowXPath(STUDY_FROM_ASSAY_WITH_NO_DATA).append("//td//img[contains(@src, '"  + HAS_DATA_ICON +  "')]")));
        Assert.assertTrue(isElementPresent(getDataRowXPath(STUDY_FROM_ASSAY_WITH_NO_DATA).append("//td//img[contains(@src, '" + HAS_NO_DATA_ICON + "')]")));


        log("Testing data availability module in Study Products");
        cds.viewLearnAboutPage("Study products");
        waitAndClick(Locator.xpath("//h2[text() = '" + PRODUCT + "']"));

        refresh();

        waitForText("Data Availability");

        Assert.assertTrue(isElementPresent(getDataRowXPath(STUDY_FROM_PRODUCT[0]).append("//td//img[contains(@src, '" + HAS_DATA_ICON + "')]")));
        Assert.assertTrue(isElementPresent(getDataRowXPath(STUDY_FROM_PRODUCT[1]).append("//td//img[contains(@src, '" + HAS_NO_DATA_ICON + "')]")));
    }

    //Helper function for data availability tests
    private Locator.XPathLocator getDataRowXPath(String rowText)
    {
        return Locator.xpath("//tr[contains(@class,'item-row')]/td/a[contains(text(), '" + rowText + "')]").parent().parent();
    }

    private void validateSearchFor(String searchString)
    {
        String itemText;
        String[] itemParts;
        List<WebElement> returnedItems;
//        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-wrapper')]";

        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT);  // Same elements are reused between searched, this sleep prevents a "stale element" error.
        returnedItems = Locator.xpath(XPATH_RESULT_ROW).findElements(getDriver());
        log("Found " + returnedItems.size() + " items.");

        for (WebElement listItem : returnedItems)
        {
            itemText = listItem.getText();
            itemParts = itemText.split("\n");
            log("Looking at study " + itemParts[0]);
            assert(itemText.toLowerCase().contains(searchString.toLowerCase()));
        }

    }

}
