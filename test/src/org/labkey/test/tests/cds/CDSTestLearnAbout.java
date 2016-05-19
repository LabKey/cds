package org.labkey.test.tests.cds;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.categories.CDS;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Category({CDS.class})
public class CDSTestLearnAbout extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String MISSING_SEARCH_STRING = "If this string ever appears something very odd happened.";

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
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudies')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-container')]";

        cds.viewLearnAboutPage("Studies");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());

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
        final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";

        cds.viewLearnAboutPage("Studies");

        searchStrings.stream().forEach((searchString) -> validateSearchFor(searchString));

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), MISSING_SEARCH_STRING);
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
        final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
        final String XPATH_RESULTLIST = "//div[contains(@class, 'detail-wrapper')]";

        cds.viewLearnAboutPage("Studies");
        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Verifying data availability on summary page.");
        assert(Locator.xpath("//div[contains(@class, 'data-availability-text')][text()='" + dataAvailability + "']").findElement(getDriver()).isDisplayed());

        log("Start verifying study detail page.");
        List<WebElement> returnedItems  = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
        returnedItems.get(0).click();
        sleep(CDSHelper.CDS_WAIT_ANIMATION);

        log("Verifying study information.");
        List<String> fields = Arrays.asList(CDSHelper.LEARN_ABOUT_QED2_INFO_FIELDS);
        fields.stream().forEach((field) ->  {
            assertTextPresent(field);
        });
        assertTextPresent(grantAffiliation);

        log("Verifying contact information.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_QED2_CONTACT_FIELDS);
        fields.stream().forEach((field) ->  {
            assertTextPresent(field);
        });

        assertElementPresent(Locator.xpath("//a[contains(@href, 'mailto:" + firstContactEmail + "')][text()='" + firstContactName + "']"));

        log("Verifying description section.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_QED2_DESCRIPTION_FIELDS);
        fields.stream().forEach((field) ->  {
            assertTextPresent(field);
        });
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
        waitForElement(LabKeyPage.Locators.pageSignal("determinationLearnAboutStudyProductLoaded"), 60000);
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
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-container')]";

        log("Extra logging to record time stamps.");
        cds.viewLearnAboutPage("Study products");
        log("Should now be on the Learn About - Study Products page.");
        sleep(30000);
        log("Should have slept for 30 seconds.");
        refresh();
        log("Page was refreshed.");
        sleep(30000);
        log("Should have slept for another 30 seconds. Now wait at most 60 seconds for the page signal to fire.");
        waitForElement(LabKeyPage.Locators.pageSignal("determinationLearnAboutStudyProductLoaded"), 60000);
        log("Signal should have fired. Now wait, at most, 60 seconds for an h2 element with the text 'verapamil hydrochloride'");
        waitForElement(Locator.xpath("//h2").withText("verapamil hydrochloride"), 60000);
        log("Element should be there.");
//        longWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]").toBy()));
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());

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
        final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";

        cds.viewLearnAboutPage("Study products");

        searchStrings.stream().forEach((searchString) -> validateSearchFor(searchString));

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        sleep(CDSHelper.CDS_WAIT_ANIMATION);
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), MISSING_SEARCH_STRING);
        _asserts.verifyEmptyLearnAboutStudyProductsPage();

    }

    @Test
    public void testLearnAboutAssays()
    {
        cds.viewLearnAboutPage("Assays");
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays); // Until the data is stable don't count the assay's shown.

        waitAndClick(Locator.tagWithClass("div", "detail-container").append("/div/div/h2").containing(assays.get(0)));
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
        waitAndClick(Locator.tagWithClass("div", "detail-container").append("/div/div/h2").containing(assays.get(1)));
        waitForElement(Locator.tagWithClass("span", "breadcrumb").containing("Assays /"));

        refresh();

        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Antigens"));
        waitForElement(Locator.tagWithClass("div", "list-title-bar").append("/div").containing("Protein Panel"));
        waitForText(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA[0]);
        assertTextPresent(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA);
    }

    private void validateSearchFor(String searchString)
    {
        String itemText;
        String[] itemParts;
        List<WebElement> returnedItems;
        final String XPATH_TEXTBOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
        final String XPATH_RESULTLIST = "//div[contains(@class, 'learnview')]//span//div//div[contains(@class, 'learnstudyproducts')]//div[contains(@class, 'learncolumnheader')]/./following-sibling::div[contains(@class, 'detail-wrapper')]";

        log("Searching for '" + searchString + "'.");
        this.setFormElement(Locator.xpath(XPATH_TEXTBOX), searchString);
        sleep(CDSHelper.CDS_WAIT_ANIMATION);  // Same elements are reused between searched, this sleep prevents a "stale element" error.
        returnedItems = Locator.xpath(XPATH_RESULTLIST).findElements(getDriver());
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
