/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

import org.awaitility.Awaitility;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.rules.Timeout;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.pages.cds.LearnDetailsPage;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.pages.cds.LearnGrid.LearnTab;
import org.labkey.test.util.cds.CDSAsserts;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 40)
public class CDSTestLearnAbout extends CDSReadOnlyTest
{
    // whether column locking is enabled for the learn grids
    public static final boolean COLUMN_LOCKING = false;

    public static final String DATA_ADDED_TOOLTIP = "Integrated data added";
    public static final String DATA_NOT_ADDED_TOOLTIP = "Integrated data not added";
    public static final String[] MAB_MIXTURES = {"1361", "2158", "2297", "1H9", "1.00E+09", "1NC9", "2F5", "3.00E+03", "3BNC60", "3BNC117", "4.00E+10",
            "10E8.2", "10E8.2/iMab", "10E8.4", "10E8.4/iMab", "10E8.5", "10E8.5/iMab",
            "17b", "19B", "19e", "1393A", "A12", "A14",
            "Ab530039K", "Ab530039L", "Ab530057", "Ab530139K1", "Ab530139K2", "Ab530168", "Ab530204", "Ab530212", "Ab530238K", "Ab530239", "Ab530402.1",
            "Ab530402.2", "AB-000402-1", "AB-000403-1", "AB-000404-1", "AB-000405-1", "AB-000406-1", "AB-000407-1", "AB-000408-1", "AB-000409-1",
            "AB-000410-1", "AB-000411-1", "AB-000412-1", "AB-000413-1", "AB-000414-1", "AB-000415-1", "AB-000416-1", "AB-000417-1", "AB-000418-1",
            "AB-000419-1", "AB-000420-1", "AB-000421-1", "AB-000422-1", "AB-000423-1", "AB-000424-1", "AB-000425-1", "AB-000426-1", "AB-000427-1",
            "AB-000428-1", "AB-000429-1", "AB-000430-1", "AB-000431-1", "AB-000432-1", "AB-000433-1", "AB-000434-1", "AB-000435-1", "AB-000436-1",
            "AB-000437-1", "AB-000438-1", "AB-000439-1", "AB-000440-1", "AB-000441-1", "AB-000442-1", "AB-000443-1", "AB-000444-1", "AB-000445-1",
            "AB-000446-1", "AB-000447-1", "AB-000448-1", "AB-000449-1", "AB-000450-1", "AB-000451-1", "AB-000452-1", "AB-000453-1", "AB-000454-1",
            "AB-000455-1", "AB-000456-1", "AB-000457-1", "AB-000458-1", "AB-000459-1", "AB-000460-1", "AB-000461-1", "AB-000462-1", "AB-000463-1",
            "AB-000464-1", "AB-000465-1", "AB-000466-1", "AB-000467-1", "AB-000468-1", "AB-000469-1", "AB-000470-1", "AB-000471-1", "AB-000472-1",
            "AB-000473-1", "AB-000474-1", "AB-000475-1", "AB-000476-1", "AB-000477-1", "AB-000478-1", "AB-000479-1", "AB-000480-1", "AB-000481-1",
            "AB-000482-1", "AB-000483-1", "AB-000484-1", "AB-000485-1", "AB-000796-1", "AB-000797-1", "AB-000798-1", "AB-000799-1", "AB-000800-1",
            "AB-000801-1", "AB-000802-1", "AB-000803-1", "AB-000804-1", "AB-000805-1", "AB-000806-1", "AB-000807-1", "AB-000808-1", "AB-000809-1",
            "B9", "b12", "B21", "CH27", "CH28", "CH31", "CH38", "CH103", "DH511", "HIVIG", "iMab", "iMab/CCFV", "iMab/LM52", "iMab/SCFV", "J3",
            "L9-i3", "L9-i4", "M785-U1", "mAb 1.1", "mAb 2.1", "mAb 3.1", "mAb 4.1", "mAb 5.1", "mAb 6.1", "mAb 7.1", "mAb 8.1", "mAb 9.1", "mAb 10.1",
            "mAb 11.1", "mAb 28.1", "mAb 31.1", "mAb 33.1", "mAb 34.1", "mAb 37.1", "mAb 93", "mAb 94", "mAb 95", "mAb 96", "mAb 97", "mAb 98", "mAb 99",
            "mAb 100", "mAb 101", "mAb 102", "mAb 103", "mAb 104", "mAb 105", "mAb 106", "mAb 107", "mAb 108", "mAb 109", "mAb 110", "mAb 111", "mAb 112",
            "mAb 113", "mAb 114", "mAb 115", "mAb 116", "mAb 117", "mAb 118", "mAb 119", "mAb 120", "mAb 121", "mAb 122", "mAb 123", "mAb 124", "mAb 125",
            "mAb 126", "mAb 127", "mAb 128", "MVN", "MVN/A12", "P16i", "PG9", "PGDM1400", "PGT121", "PGT121 + PGDM1400", "PGT121 + PGT145", "PGT123", "PGT125",
            "PGT126", "PGT127", "PGT128", "PGT128 + 3BNC117 + PGDM1400", "PGT128/3BNC117 + PGDM1400", "PGT130", "PGT135", "PGT143", "PGT145", "PGT151", "PGT151/3BNC117",
            "Pi", "RhiMab", "sCD4", "VRC01", "VRC01/CCFV", "VRC01/SCFV", "VRC07-523-LS", "VRC13", "VRC26.25"};
    public static final org.labkey.test.Locator.XPathLocator LEARN_ROW_TITLE_LOC = Locator.tagWithClass("tr", "detail-row").append("/td//div/div/h2");
    public static final org.labkey.test.Locator.XPathLocator LEARN_HAS_DATA_ROW_TITLE_LOC = Locator.tagWithClass("tr", "detail-row-has-data").append("/td//div/div/h2");
    public static final org.labkey.test.Locator.XPathLocator DETAIL_PAGE_BREADCRUMB_LOC = Locator.tagWithClass("div", "breadcrumb");
    private static final Locator TOOLTIP_TEXT_LOCATOR = Locator.css("div.hopscotch-bubble-container div.hopscotch-bubble-content div.hopscotch-content");
    private final CDSHelper cds = new CDSHelper(this);
    private final CDSAsserts _asserts = new CDSAsserts(this);
    private final String MISSING_SEARCH_STRING = "If this string ever appears something very odd happened.";
    private final Locator XPATH_RESULT_ROW_TITLE = COLUMN_LOCKING ? LearnGrid.Locators.lockedRow : LearnGrid.Locators.gridRows;
    private final Locator XPATH_RESULT_ROW_DATA = COLUMN_LOCKING ? LearnGrid.Locators.unlockedRow : LearnGrid.Locators.gridRows;

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
        cds.viewLearnAboutPage(LearnTab.STUDIES);

        List<String> studies = Arrays.asList(CDSHelper.STUDIES);
        _asserts.verifyLearnAboutPage(studies);
    }

    @Test
    public void clickOnLearnAboutStudyItem()
    {
        List<WebElement> returnedItems;
        String[] lockedParts, unlockedParts;

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        returnedItems = XPATH_RESULT_ROW_TITLE.findElements(learnGrid.getGrid());
        List<WebElement> freeColItems = XPATH_RESULT_ROW_DATA.findElements(learnGrid.getGrid());

        int index = returnedItems.size() / 2;

        scrollIntoView(returnedItems.get(index));

        lockedParts = returnedItems.get(index).getText().split("\n");
        unlockedParts = freeColItems.get(index).getText().split("\n");
        returnedItems.get(index).click();

        if (COLUMN_LOCKING)
        {
            log("Validating title is " + lockedParts[0]);
            shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + lockedParts[0] + "']")));

            log("Validating Study Type is: " + unlockedParts[1]);
            assert (Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + unlockedParts[1] + "']").findElement(getDriver()).isDisplayed());
        }
        else
        {
            log("Validating title is " + lockedParts[0]);
            shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + lockedParts[0] + "']")));

            log("Validating Study Type is: " + lockedParts[3]);
            assert (Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + lockedParts[3] + "']").findElement(getDriver()).isDisplayed());
        }

        log("Validating return link works.");
        click(DETAIL_PAGE_BREADCRUMB_LOC.withText("Studies /"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']")));
    }

    @Test
    public void testLearnAboutStudiesSearch()
    {
        List<String> searchStrings = new ArrayList<>(Arrays.asList("Proin", "ACETAMINOPHEN", "Phase IIB"));

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);

        searchStrings.stream().forEach((searchString) -> validateSearchFor(learnGrid, searchString));

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        learnGrid.setSearch(MISSING_SEARCH_STRING);
        _asserts.verifyEmptyLearnAboutStudyPage();
    }

    @Test
    public void verifySchemaLinks()
    {
        final String studyName = CDSHelper.QED_1;

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);

        learnGrid.setSearch(studyName);
        goToDetail(studyName, false);
        String treatmentLinkId = "groups_treatment_link";
        waitForElement(Locator.id(treatmentLinkId));
        sleep(CDSHelper.CDS_WAIT);

        log("Verify Treatment Schema link under Groups");
        scrollIntoView(Locator.id(treatmentLinkId));
        click(Locator.tagWithId("a", treatmentLinkId).withText("Click for treatment schema"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        assertTextPresent("Treatment Schedule by Day");

        getDriver().close();
        switchToMainWindow();

        log("Verify Assay Schema link under Methods");
        String assayLinkId = "methods_assay_link";
        assertElementPresent(Locator.id(assayLinkId));
        click(Locator.tagWithId("a", assayLinkId).withText("Click for assay schema"));
        sleep(CDSHelper.CDS_WAIT);
        switchToWindow(1);
        assertTextPresent("Assay Schedule by Study Day");

        getDriver().close();
        switchToMainWindow();
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
        final String specimenRepoLabel = "HVTN 505";

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        log("Searching for '" + searchString + "'.");
        learnGrid.setSearch(searchString);

        log("Verifying integrated data availability on summary page.");
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
        assertElementPresent(Locator.xpath("//a[contains(@href, 'http://www.specimenrepository.org/RepositorySite/search/replaySearch?study=" + specimenRepoLabel + "')]"));

        log("Verifying description section.");
        fields = Arrays.asList(CDSHelper.LEARN_ABOUT_DESCRIPTION_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));
        assertTextPresent(rationale);

        validateToolTip(Locator.linkWithText("NAB").findElement(getDriver()), DATA_ADDED_TOOLTIP);

        validateToolTip(Locator.linkWithText("ICS").findElement(getDriver()), DATA_ADDED_TOOLTIP);

        validateToolTip(Locator.linkWithText("BAMA").findElement(getDriver()), DATA_ADDED_TOOLTIP);

    }

    @Test
    public void verifyLearnAboutAntigenDetails()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.ANTIGENS);
        log("Searching for '" + CDSHelper.ANTIGEN_HIV_1C + "'.");
        learnGrid.setSearch(CDSHelper.ANTIGEN_HIV_1C);

        int rowCount = learnGrid.getRowCount();
        assertEquals("Expected one row in antigen grid, found " + rowCount + " row(s).", 1, rowCount);
        assertTrue("Row did not contain " + CDSHelper.ANTIGEN_HIV_1C, learnGrid.getRowText(0).contains(CDSHelper.ANTIGEN_HIV_1C));

        learnGrid.getCellWebElement(0, 0).click();
        sleep(CDSHelper.CDS_WAIT);

        assertTrue("Missing antigen tab headers", isTextPresent("Antigen information", "Isolate", "Antigen type", "Production component"));
        assertTrue("Antigen Information: Full Name is missing", isTextPresent("HIV-1 C.9999.B2 [gp120.D7.avi] 293F.LC.DU_PPF"));
        assertTrue("Isolate: Species is missing", isTextPresent("HIV-1"));
        assertTrue("Antigen Type: Virus type is missing", isTextPresent("antigen type virus type HIV-1"));
        assertTrue("Production component: Manufacturer is missing", isTextPresent("University of Southern California"));
    }

    @Test
    public void verifyStudyDetailsMabListing()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        String studyName = "RED 4";

        learnGrid.setSearch(studyName);
        goToDetail(studyName, true);
        Locator breadcrumb = DETAIL_PAGE_BREADCRUMB_LOC.withText("Studies /");
        waitForElement(breadcrumb);

        log("Verify mAb listing section");
        assertElementPresent(Locator.tagWithText("h3", "Monoclonal antibodies"));

        verifyDetailFieldLabels(false, "mAb 93", "mAb 94", "mAb 95", "mAb 96", "mAb 97", "mAb 98",
                "mAb 99", "mAb 100", "mAb 101", "mAb 102");
        assertElementNotPresent(Locator.linkWithText("mAb 103"));

        Locator.XPathLocator mabListToggle = Locator.tagWithClass("span", "show-hide-toggle-mabs");
        showAllExpandAndVerify(mabListToggle, 26);
        verifyDetailFieldLabels(false, "mAb 93", "mAb 94", "mAb 95", "mAb 96", "mAb 97", "mAb 98",
                "mAb 99", "mAb 100", "mAb 101", "mAb 102",
                "mAb 113", "mAb 114", "mAb 115", "mAb 116",
                "mAb 117", "mAb 118", "mAb 119", "mAb 120",
                "mAb 121", "mAb 122", "mAb 123", "mAb 124",
                "mAb 125", "mAb 126", "mAb 127");

        verifyShowAllCollapse(mabListToggle, 26);

        log("Verify mAb link");
        click(Locator.linkWithText("mAb 93"));
        waitForElement(Locator.tagWithText("h3", "mAb 93 details"));
    }

    @Test
    public void verifyStudyDetailsGroupsListing()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        String studyName = "RED 4";

        learnGrid.setSearch(studyName);
        goToDetail(studyName, true);
        Locator breadcrumb = DETAIL_PAGE_BREADCRUMB_LOC.withText("Studies /");
        waitForElement(breadcrumb);

        log("Verify Groups section");
        assertElementPresent(Locator.tagWithId("h3", "treatment_groups_title"));
        assertTextPresent("The study consisted of 13 groups:");

        verifyGroupLabels(false,
                "Group 1: rh123 12 ug combined with blah 10 ug administered IM at weeks 0, 1, 23, and 43",
                "Group 2: rhesus abc combined with got-123 110 ug administered IM at weeks 3 and 10",
                "Group 3: rhAXYZ 120 ug administered IM at weeks 0, 8, 16, 32",
                "Group 4: rhAXYZ 122 ug administered IM at weeks 3, 9, 18, and 36",
                "Group 5: rhAXYZ 1000 ug administered IM at weeks 3, 9, 18, and 36",
                "Group 6: rhAXYZ 122 ug administered IM at weeks 3, 9, 18, and 36",
                "Group 7: rhAXYZ 2110 ug administered IM at weeks 3, 9, 18, and 36",
                "Group 8: GPI-0100 100 ug administered IM at weeks 0, 4, and 24",
                "Group 10: rhAXYZ 1211 ug administered IM at weeks 5, 10, 15, and 30 with bbaaxxyyyzzz");
        assertElementNotPresent(Locator.linkWithText("Group 11: rhAXYZ 1100 ug administered IM at weeks 3, 19, 38, and 56"));

        Locator.XPathLocator groupsToggle = Locator.tagWithClass("span", "show-hide-toggle-groups");
        showAllExpandAndVerify(groupsToggle, 3);
        verifyGroupLabels(false,
                "Group 11: rhAXYZ 1100 ug administered IM at weeks 3, 19, 38, and 56",
                "Group 12: rhAXYZ 122 ug administered IM at weeks 3, 9, 18, and 36",
                "Group 13: No product administered to this control group.");

        verifyShowAllCollapse(groupsToggle, 3);
    }

    @Test
    public void verifyStudyDetailsShowAll()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        String studyName = "ZAP 110";

        learnGrid.setSearch(studyName);
        goToDetail(studyName, true);
        Locator breadcrumb = DETAIL_PAGE_BREADCRUMB_LOC.withText("Studies /");
        waitForElement(breadcrumb);

        log("Verify over 10 Products");
        Locator.XPathLocator productListToggle = Locator.tagWithClass("span", "show-hide-toggle-products");
        showAllExpandAndVerify(productListToggle, 1);
        scrollIntoView(productListToggle);
        assertTextPresent("Salicylic Acid");
        verifyShowAllCollapse(productListToggle, 1);

        log("Verify over 10 Reports");
        Locator.XPathLocator reportsListToggle = Locator.tagWithClass("span", "show-hide-toggle-reports");
        showAllExpandAndVerify(reportsListToggle, 1);
        scrollIntoView(reportsListToggle);
        assertTextPresent("Assay Data Summary");
        verifyShowAllCollapse(reportsListToggle, 1);

        log("Verify over 10 Publications");
        Locator.XPathLocator pubListToggle = Locator.tagWithClass("span", "show-hide-toggle-pub");
        showAllExpandAndVerify(pubListToggle, 1);
        scrollIntoView(pubListToggle);
        assertTextPresent("T cell responses and their role in protection after HIV-1 infection.");
        verifyShowAllCollapse(pubListToggle, 1);
    }

    @Test
    public void testLearnAboutStudyProducts()
    {
        cds.viewLearnAboutPage(LearnTab.PRODUCTS);

        List<String> studyProducts = Arrays.asList(CDSHelper.PRODUCTS);
        _asserts.verifyLearnAboutPage(studyProducts);
    }

    @Test
    public void testLearnAboutMAbsSummaryPage()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.MABS);
        waitForElement(Locator.xpath("//h2").withText("1361"), 60000);

        log("Verify mAb listing in summary page");
        List<String> mAbs = Arrays.asList(MAB_MIXTURES);
        _asserts.verifyLearnAboutPage(mAbs);

        log("Verify mAb summary page fields");

        verifyMAbSummaryRow(learnGrid, "2F5", "Individual mAb", "human", "IgG3?", "gp160", "gp160", "gp41 MPER", "gp41 MPER");
        verifyMAbSummaryRow(learnGrid, "PGT151/3BNC117", "Bispecific mAb", "human", "IgG", "gp160, Env", "Env, gp160", "gp120 CD4BS, gp41-gp120 (quartenary interface)", "gp41-gp120 (quartenary interface), gp120 CD4BS");
    }

    private void verifyMAbSummaryRow(LearnGrid learnGrid, String mAbName, String type, String species, String isotype, String hxb2, String altHxb2, String bindingType, String altBindingType)
    {
        learnGrid.setSearch(mAbName);

        Locator.XPathLocator fieldLoc = Locator.tagWithClass("div", "detail-black-text");

        List<WebElement> rowItems = XPATH_RESULT_ROW_TITLE.findElements(learnGrid.getGrid());
        assertEquals("Search is not returning mAbs as expected", 1, rowItems.size());

        assertTrue("Type not as expected", isElementVisible(fieldLoc.withText(type)));
        assertTrue("Donor Species not as expected", isElementVisible(fieldLoc.withText(species)));
        assertTrue("Isotype not as expected", isElementVisible(fieldLoc.withText(isotype)));
        assertTrue("HXB2 Location not as expected", isElementPresent(fieldLoc.withText(hxb2)) || isElementPresent(fieldLoc.withText(altHxb2)));
        assertTrue("Antibody binding type not as expected", isElementPresent(fieldLoc.withText(bindingType)) || isElementPresent(fieldLoc.withText(altBindingType)));
    }

    @Test
    public void verifyLearnAboutMabDetails()
    {
        final String infoHeader = "Monoclonal antibody information";
        final String dataHeader = "Integrated data";

        final String labelStandardname = "Standard name";
        final String labelAntibodyType = "Antibody type";
        final String labelLanlid = "LANL ID";
        final String labelOthernames = "Other names";
        final String labelIsotype = "Isotype";
        final String labelHXB2 = "HXB2 Location";
        final String labelBindingType = "Antibody binding type";
        final String labelSpecies = "Species";
        final String labelDonorCode = "Donor code";
        final String labelDonarClade = "Donor clade";

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.MABS);

        String mAbName = "2F5";

        log("Verify mAb details for " + mAbName);

        learnGrid.setSearch(mAbName);
        goToDetail(mAbName, true);

        Locator breadcrumb = DETAIL_PAGE_BREADCRUMB_LOC.withText("Monoclonal Antibodies /");
        waitForElement(breadcrumb);

        log("Verify mAb details section headers");
        verifySectionHeaders(infoHeader, dataHeader, mAbName + " details");

        log("Verify external LANL link");
        String lanlLinkLoc = "//a[contains(@href, 'https://www.hiv.lanl.gov/mojo/immunology/search/ab/results?Search&id=$')]";
        assertElementPresent(Locator.xpath(lanlLinkLoc.replace("$", "815")));

        log("Verify mAb detail field labels");
        verifyDetailFieldLabels(labelStandardname, labelAntibodyType, labelLanlid, labelOthernames, labelIsotype,
                labelHXB2, labelBindingType, labelSpecies);

        log("Verify mab detail field values");
        verifyDetailFieldValues(mAbName, "Individual mAb", "815", "2F5 (PlantForm) (other)", "IgG3?", "gp160", "gp41 MPER", "human");

        click(breadcrumb);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']")));


        mAbName = "PGT128/3BNC117 + PGDM1400";
        log("Verify mAb details for a 'Bispecific mAb mixture': " + mAbName);

        learnGrid.setSearch(mAbName);
        goToDetail(mAbName, false);

        waitForElement(breadcrumb);

        log("Verify mAb details section headers");

        verifySectionHeaders(infoHeader, "3BNC117 details", "PGDM1400 details", "PGT128 details");

        log("Verify external LANL links for each mab in the mix");
        assertElementPresent(Locator.xpath(lanlLinkLoc.replace("$", "2586")));
        assertElementPresent(Locator.xpath(lanlLinkLoc.replace("$", "3201")));
        assertElementPresent(Locator.xpath(lanlLinkLoc.replace("$", "2642")));

        log("Verify mAb detail field labels");
        verifyDetailFieldLabels(labelStandardname, labelAntibodyType, labelOthernames, labelIsotype,
                labelHXB2, labelBindingType, labelLanlid, labelSpecies, labelDonorCode, labelDonarClade);

        log("Verify mab detail field values");
        verifyDetailFieldValues(mAbName, "Bispecific mAb mixture", "PGT128/3BNC117 + PGDM1400 (other)",
                "IgG", "gp160", "gp120 CD4BS", "2586", "human", "M1217", "B",
                "Env", "gp120 V2", "3201", "C",
                "IgG1", "gp120 V3", "2642", "3053", "CRF02_AG");
    }

    private void verifySectionHeaders(String... headers)
    {
        for (String header : headers)
        {
            Assert.assertTrue(header + " section header is not present", isElementPresent(Locator.tagWithText("h3", header)));
        }
    }

    private void verifyDetailFieldLabels(boolean useDivider, String... labels)
    {
        for (String label : labels)
        {
            Assert.assertTrue(label + " label is not present", isElementPresent(Locator.tagWithClass("td", "item-label").withText(label + (useDivider ? ":" : ""))));
        }
    }

    private void verifyGroupLabels(boolean useDivider, String... labels)
    {
        for (String label : labels)
        {
            Assert.assertTrue(label + " label is not present", isElementPresent(Locator.tagWithClass("li", "item-value").withText(label + (useDivider ? ":" : ""))));
        }
    }

    private void verifyDetailFieldLabels(String... labels)
    {
        verifyDetailFieldLabels(true, labels);
    }

    private void verifyDetailFieldValues(String... values)
    {
        for (String value : values)
        {
            Assert.assertTrue(value + " field value is not present", isElementPresent(Locator.tagWithClass("td", "item-value").withText(value)));
        }
    }

    @Test
    public void clickOnLearnAboutStudyProductsItem()
    {
        List<WebElement> lockedColItems;
        List<WebElement> freeColItems;

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.PRODUCTS);
        log("Signal should have fired. Now wait, at most, 30 seconds for an h2 element with the text 'verapamil hydrochloride'");
        waitForElement(Locator.xpath("//h2").withText("verapamil hydrochloride"), 30000);
        log("Element should be there.");
        lockedColItems = XPATH_RESULT_ROW_TITLE.findElements(learnGrid.getGrid());
        freeColItems = XPATH_RESULT_ROW_DATA.findElements(learnGrid.getGrid());

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

        if (COLUMN_LOCKING)
        {
            log("Validating Product Type is: " + itemClassAndType[1]);
            assert (Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemClassAndType[1] + "']").findElement(getDriver()).isDisplayed());

            String productClass = itemClassAndType[2].replace("Class: ", "");
            log("Validating Class is: " + productClass);
            assert (Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + productClass + "']").findElement(getDriver()).isDisplayed());
        }
        else
        {
            log("Validating Product Type is: " + itemClassAndType[2]);
            assert (Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + itemClassAndType[2] + "']").findElement(getDriver()).isDisplayed());

            String productClass = itemClassAndType[3].replace("Class: ", "");
            log("Validating Class is: " + productClass);
            assert (Locator.xpath("//table[contains(@class, 'learn-study-info')]//tbody//tr//td[contains(@class, 'item-value')][text()='" + productClass + "']").findElement(getDriver()).isDisplayed());
        }

        log("Validating return link works.");
        click(DETAIL_PAGE_BREADCRUMB_LOC.withText("Products /"));

        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'title')][text()='Learn about...']")));
    }

    @Test
    public void testLearnAboutStudyProductsSearch()
    {
        List<String> searchStrings = new ArrayList<>(Arrays.asList("acid", "ART", "is a"));

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.PRODUCTS);

        searchStrings.stream().forEach((searchString) -> validateSearchFor(learnGrid, searchString));

        // "Developer" column isn't shown on product details page
        learnGrid.setSearch("Pénélope");
        Assert.assertEquals("Wrong number of search results", 3, learnGrid.getRowCount());

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        learnGrid.setSearch(MISSING_SEARCH_STRING);
        _asserts.verifyEmptyLearnAboutStudyProductsPage();
    }

    @Test
    public void testLearnAboutPublications()
    {
        log("Verify Publications listing page");
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);

        List<WebElement> publicationLockedLists = XPATH_RESULT_ROW_TITLE.findElements(learnGrid.getGrid());
        List<WebElement> freeColItems = XPATH_RESULT_ROW_DATA.findElements(learnGrid.getGrid());

        final String expectedPublicationTitle = "Modification of the Association Between T-Cell Immune Responses and Human Immunodeficiency Virus " +
                "Type 1 Infection Risk by Vaccine-Induced Antibody Responses in the HVTN 505 Trial";
        final String expectedPublictionLabel = "Fong Y 2018 J Infect Dis";

        log("size" + publicationLockedLists.size());
        scrollIntoView(publicationLockedLists.get(1));

        if (COLUMN_LOCKING)
        {
            String secondPublicationTitle = publicationLockedLists.get(1).getText();
            String[] secondPublicationUnlockedParts = freeColItems.get(1).getText().split("\n");

            log(secondPublicationTitle);
            log("Validating the 2nd newest publication: publications should be ordered by date desc by default");
            Assert.assertEquals("Publication title not as expected", expectedPublictionLabel + "\n" + expectedPublicationTitle, secondPublicationTitle);
            Assert.assertEquals("Publication journal not as expected", "J Infect Dis", secondPublicationUnlockedParts[0]);
            Assert.assertEquals("Publication author not as expected", "Fong Y", secondPublicationUnlockedParts[1]);
            Assert.assertEquals("Publication journal not as expected", "2018 Mar 28", secondPublicationUnlockedParts[2]);
        }
        else
        {
            String[] publicationText = publicationLockedLists.get(1).getText().split("\n");

            log(publicationText[0]);
            log("Validating the 2nd newest publication: publications should be ordered by date desc by default");
            Assert.assertEquals("Publication label not as expected", expectedPublictionLabel, publicationText[0]);
            Assert.assertEquals("Publication title not as expected", expectedPublicationTitle, publicationText[1]);
            Assert.assertEquals("Publication journal not as expected", "J Infect Dis", publicationText[2]);
            Assert.assertEquals("Publication author not as expected", "Fong Y", publicationText[3]);
            Assert.assertEquals("Publication journal not as expected", "2018 Mar 28", publicationText[4]);
        }

        log("Verify Publications detail page");
        publicationLockedLists.get(1).click();
        sleep(CDSHelper.CDS_WAIT);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + expectedPublictionLabel + "']")));
        Assert.assertTrue("Detail page publication title not as expected", isElementVisible(Locator.tagWithClass("div", "module").append(Locator.tagWithText("p", expectedPublicationTitle))));
        Assert.assertTrue("Publication info not as expected", isElementVisible(Locator.tagWithClass("div", "publication_item").containing("J Infect Dis. 2018 Mar 28;217(8):1280-1288.")));

        log("Verify Publications search");
        List<String> searchStrings = new ArrayList<>(Arrays.asList("Calmette-Guérin", "Korioth-Schmitz B", "3152265", "Clin Vaccine Immunol"));
        LearnGrid learnPubGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        searchStrings.stream().forEach((searchString) -> validateSearchFor(learnPubGrid, searchString));
        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        learnPubGrid.setSearch(MISSING_SEARCH_STRING);
        _asserts.verifyEmptyLearnAboutPublicationsPage();
    }

    @Test
    public void testLearnAboutPublicationData()
    {
        final String publication_data_1 = "Publication Datasets - Monoclonal antibodies";
        final String publication_data_2 = "Analysis Data - T Cell Immune Response";
        final String publication_data_3 = "Publication Datasets";

        final String publication_1 = "Bekker LG 2018 Lancet HIV";
        final String publication_2 = "Fong Y 2018 J Infect Dis";

        log("Verify Publication Details Data");
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        LearnDetailsPage learnDetailsPage = learnGrid.clickFirstItem();
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + publication_1 + "']")));

        verifyNonIntegratedDetailFieldValues(publication_data_1, "(PDF)");
        learnDetailsPage.clickBack();
        learnGrid = new LearnGrid(LearnTab.PUBLICATIONS, this);
        learnGrid.clickItem(1);
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.xpath("//div[contains(@class, 'learnheader')]//div//div[text()='" + publication_2 + "']")));

        verifyNonIntegratedDetailFieldValues(publication_data_2, "(Archive)");
        verifyNonIntegratedDownloadLink(publication_data_2, "t_cell_data.zip");

        verifyNonIntegratedDetailFieldValues(publication_data_3, "(TSV)");
        verifyNonIntegratedDownloadLink(publication_data_3, "t_cell_ir.tsv");
    }

    @Test
    public void testLearnAboutPublicationAbstract()
    {
        final String Fong_Abstract = "Abstract 863 characters: hDJoxyG11NJqUgDFg2qA, gif7hK7hg0 f1qt9BvGzrvdMXxCiCrM. " +
                "x1hCLq8AdopPkzsuWPTZ rhSBFSgRVe X9gf4WZWEs kG0rqeetP1. Sj5n6U9nQz RMtx EiJaG1 kWHPOCkoKd ysFBFRe696 3WLrfeRKS5" +
                " yZLTIG0O8mzniwi8CI0d T6GhTW8Ed1 VrH2GJEau9 EAmrZd3Cmt FSzxwT3JcS F5D7X6K5Rb F3Rp0PUgWF QsyPgn bEci GSSIHmqWMz 2caxBEHKF7 " +
                "YcjKXJFT8n hqh90Ulh3T G3pundG62H te1Crk zvKe NgfH36cjlP LMqqU9JIUY goaYn3MqZH 7a09KB9saR RfDFf1l5mv hDJ oxyG11NJqUgDFg2qA " +
                "gif7hK7hg0 f1qt9BvGzrvdMXxCiCrM. x1hCLq8AdopPkzsuWPTZ rhSBFSgRVe X9g f4WZWEs kG0rqeetP1-Sj5n6U9nQz RMtx EiJaG1 kWHPOCkoKd " +
                "ysFBFRe696 3WL rfeRKS5 yZLTIG0O8mzniwi8CI0d T6GhTW8Ed1 VrH2GJEau9 EAmrZd3C@mt FSz xwT3JcS F5D7X6K5Rb F3Rp0PUgWF ~QsyPgn bEci " +
                "GSSIHmqWMz 2caxBEHKF7YcjKXJFT %55 8n hqh90Ulh3T G3pundG62H te1Crk zvKe NgfH36cjlP LMqqU9 JIUY *goaYn3 MqZH 7a09KB9saR R";

        log("Verify Publication Abstract details");
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        learnGrid.clickItemContaining("Bekker");
        assertTrue(Locator.tagWithText("h3", "Abstract").findElement(getDriver()).isDisplayed());

        log("Verify Publication Abstract details - Fong");
        learnGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        learnGrid.clickItemContaining("fong");
        waitForElement(Locator.tagWithText("h3", "Abstract"));
        assertTrue(Locator.tagWithText("h3", "Abstract").followingSibling("p").findElement(getDriver()).getText().contains(Fong_Abstract));

        log("Verify No Publication Abstract details");
        learnGrid = cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        learnGrid.clickItemContaining("mayer");
        assertFalse(isElementPresent(Locator.tagWithText("h3", "Abstract")));
    }

    @Test
    public void testAssayTutorial()
    {
        LearnGrid grid = cds.viewLearnAboutPage(LearnTab.ASSAYS);

        log("Go to NAB assay page - verify tutorial section");
        grid.clickItemContaining(CDSHelper.TITLE_NAB);

        assertTextPresent("Assay information", "Tutorials");
        WebElement tutorialSec = Locator.tagWithClass("table", "assay-tutorial").findElement(getDriver());
        Awaitility.await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            Assert.assertEquals("Assay tutorial section should be present.", 1,
                    Locator.tagWithClass("div", "assay-tutorial-img-container").findElements(tutorialSec).size());
            Assert.assertEquals("One tutorial video link should be present.", 1,
                    Locator.tagWithClass("a", "assay-tutorial-video").findElements(tutorialSec).size());
            Assert.assertEquals("Two downloadable tutorials should be present.", 2,
                    Locator.tagWithId("div", "tutorial-doc-id").findElements(getDriver() ).size());
        });

        log("Go to BAMA assay page - verify absence of tutorial section");
        cds.viewLearnAboutPage(LearnTab.ASSAYS);
        grid.clickItemContaining(CDSHelper.TITLE_BAMA);
        assertElementNotPresent("Assay tutorial section should not be present.", Locator.tagWithClass("div", "assay-tutorial-img-container"));

    }

    @Test
    public void testLearnAboutAssays()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays); // Until the data is stable don't count the assay's shown.

        learnGrid.clickItemContaining("BAMA");
        sleep(CDSHelper.CDS_WAIT);
        waitForElementToBeVisible(Locator.tagWithText("h3", "Endpoint description"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_METHODOLOGY);
        assertElementPresent(Locator.linkWithText("View Antigen List"));
        assertTrue("Incorrect link for antigen list",
                Locator.linkWithText("View Antigen List").findElement(getDriver()).getAttribute("href").contains("#learn/learn/Assay/" + CDSHelper.ASSAYS[0].replace(" ", "%20") + "/antigens"));
        /*
            Test coverage for :
            Secure Issue 47890: Dataspace - Blank Assay page when navigating from Variables/Antigens Assay tabs to Learn grid
         */
        click(Locator.linkWithText("View Antigen List")); // Navigates to antigen tab
        waitForText("C.con.env03 140 CF");
        click(Locator.tagWithClass("div", "iarrow"));
        sleep(CDSHelper.CDS_WAIT);
        _ext4Helper.waitForMaskToDisappear();
        learnGrid = new LearnGrid(LearnTab.ASSAYS, this);
        learnGrid.clickFirstItem();
        sleep(CDSHelper.CDS_WAIT);

        //testing variables page
        waitForElementToBeVisible(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("variable-list-title").child("h2").withText("Antigen vaccine match indicator"));

        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.

        // testing NAb has virus link rather than antigen link.
        waitForElementToBeVisible(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitAndClick(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));

        waitForElementToBeVisible(LEARN_ROW_TITLE_LOC.containing(assays.get(3)));
        waitAndClick(LEARN_ROW_TITLE_LOC.containing(assays.get(3)));

        waitForElement(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitForElement(Locator.xpath("//h3[text()='Endpoint description']"));
        shortWait().until(ExpectedConditions.visibilityOfElementLocated(Locator.linkWithHref("#learn/learn/Assay/" + CDSHelper.ASSAYS[3].replace(" ", "%20") + "/antigens")));
        assertElementVisible(Locator.linkContainingText("Virus List"));

        //testing ICS variables page
        waitForElementToBeVisible(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitAndClick(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));

        waitForElementToBeVisible(LEARN_ROW_TITLE_LOC.containing(assays.get(1)));
        waitAndClick(LEARN_ROW_TITLE_LOC.containing(assays.get(1)));

        waitForElementToBeVisible(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitForElementToBeVisible(Locator.xpath("//h3[text()='Endpoint description']"));

        validateToolTip(Locator.linkWithText("RED 4").findElement(getDriver()), DATA_ADDED_TOOLTIP);
        validateToolTip(Locator.linkWithText("RED 6").findElement(getDriver()), DATA_ADDED_TOOLTIP);
        validateToolTip(Locator.tagWithText("span", "w101").findElement(getDriver()), DATA_NOT_ADDED_TOOLTIP);
        validateToolTip(Locator.linkWithText("ZAP 102").findElement(getDriver()), DATA_ADDED_TOOLTIP);
        validateToolTip(Locator.linkWithText("ZAP 108").findElement(getDriver()), DATA_NOT_ADDED_TOOLTIP);
        validateToolTip(Locator.linkWithText("ZAP 115").findElement(getDriver()), DATA_ADDED_TOOLTIP);

        Locator.XPathLocator showAllListToggle = Locator.tagWithClass("td", "show-hide-toggle-integrateddata");
        showAllExpandAndVerify(showAllListToggle, 6);
        validateToolTip(Locator.linkWithText("ZAP 117").findElement(getDriver()), DATA_ADDED_TOOLTIP);
        verifyShowAllCollapse(showAllListToggle, 6);

        // Go back to assays and validate the Data Added column.
        learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);
        String toolTipText, cellText, expectedText;
        int dataAddedColumn = learnGrid.getColumnIndex("Data Added");

        log("Checking: " + learnGrid.getCellText(5, 0));
        expectedText = "11 Studies";
        cellText = learnGrid.getCellText(5, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.", cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(5, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        // Can't depend upon the text in the tooltip to be in the same order every time. So check for each value separately.
        validateToolTipText(toolTipText, List.of("YOYO 55", "ZAP 117", "ZAP 118", "ZAP 119", "ZAP 120", "ZAP 128", "ZAP 129", "ZAP 133", "ZAP 134", "ZAP 135", "and 1 more..."));
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(4, 0));
        expectedText = "5 Studies";
        cellText = learnGrid.getCellText(4, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.", cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(4, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, List.of("ZAP 133", "ZAP 128", "YOYO 55", "ZAP 135", "QED 2"));
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(3, 0));
        expectedText = "4 Studies";
        cellText = learnGrid.getCellText(3, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.", cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(3, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, List.of("ZAP 134", "RED 4", "ZAP 110", "ZAP 111"));
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(2, 0));
        expectedText = "14 Studies";
        cellText = learnGrid.getCellText(2, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.", cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(2, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, List.of("RED 4", "RED 5", "RED 6", "ZAP 102", "ZAP 105", "ZAP 106", "ZAP 113", "ZAP 115", "ZAP 116", "ZAP 117", "and 4 more..."));
        log("Tool tip text contained the expected values.");

        sleep(1000);

        log("Checking: " + learnGrid.getCellText(1, 0));
        expectedText = "1 Study";
        cellText = learnGrid.getCellText(1, dataAddedColumn);
        assertTrue("Data Added' column text not as expected. Expected: '" + expectedText + "'. Found: '" + cellText + "'.", cellText.trim().toLowerCase().contains(expectedText.trim().toLowerCase()));
        log("'Data Added' column text as expected.");

        toolTipText = learnGrid.showDataAddedToolTip(1, dataAddedColumn)
                .getToolTipText();
        log("Tool tip: '" + toolTipText + "'");
        validateToolTipText(toolTipText, List.of("ZAP 117"));
        log("Tool tip text contained the expected values.");

    }

    @Test
    public void testLearnAboutNABMAbAssay()
    {
        LearnGrid summaryGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);

        log("Go to NAB MAB assay page");
        summaryGrid.clickItemContaining(CDSHelper.TITLE_NABMAB);

        log("Verify Integrated Data Availability");
        waitForText("Integrated data");

        Locator.XPathLocator showAllListToggle = Locator.tagWithClass("td", "show-hide-toggle-integrateddata");
        showAllExpandAndVerify(showAllListToggle, 2);

        List<WebElement> smallHasDataIcons = cds.hasDataDetailIconXPath("").findElements(getDriver());
        checker().verifyEquals("Icon size not as expected.", 10, smallHasDataIcons.size());

        verifyShowAllCollapse(showAllListToggle, 2);

        assertElementPresent(cds.hasDataDetailIconXPath("QED 2"));
        assertElementNotPresent(cds.hasDataDetailIconXPath("QED 1"));
        assertElementPresent(cds.noDataDetailIconXPath("RED 6"));

        log("Verify Variables page");
        waitForElementToBeVisible(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("variable-list-title").child("h2").withText("Fit asymmetry"));

        log("Verify Antigens page");
        Locator assayAntigenTab = Locator.xpath("//div").withClass("learnabouttab").child("h1").withText("Antigens");
        waitForElementToBeVisible(assayAntigenTab);
        waitAndClick(assayAntigenTab);
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("detail-description").child("h2").withText("X2160_C25"));

        log("Verify row for 'BJOX002000.03.2.delta624G.E625R.3-5' virus");

        Locator rowLocator = Locator.tagWithAttribute("tr", "data-recordid", "BJOX002000.03.2.delta624G.E625R.3-5Env Pseudotype");

        waitForElementToBeVisible(rowLocator);

        WebElement rowElement = rowLocator.findElement(getDriver());

        scrollIntoView(rowElement);

        log("Verify virus short name");
        checker().verifyEquals("Virus short name not as expected.",
                "BJOX002000.03.2.delta624G.E625R.3-5",
                Locator.tagWithClass("div", "detail-description").childTag("h2").findElement(rowElement).getText());

        log("Verify Virus full name");
        checker().verifyEquals("Virus full name is incorrect.",
                "BJOX002000.03.2.delta624G.E625R.3-5,TZM-bl,full name",
                Locator.tagWithClass("div", "antigen-description").childTag("p").findElement(rowElement).getText());

        log("Verify Species");
        checker().verifyTrue("Species with the expected value 'HIV' is not visible.",
                Locator.tagWithClass("div", "detail-gray-text").containing("HIV").findElement(rowElement).isDisplayed());

        log("Verify Panels");
        checker().verifyTrue("Doesn't look like 'Diversity' is listed in the Panels.",
                Locator.tagWithClass("div", "detail-text").childTag("p").containing("Diversity").findElement(rowElement).isDisplayed());

        log("Verify Host Cell");
        checker().verifyTrue("Host cell with expected value '294T/18' is not visible.",
                Locator.tagWithClass("div", "detail-gray-text").containing("294T/18").findElement(rowElement).isDisplayed());

        log("Verify Backbone");
        checker().verifyTrue("Backbone with expected value 'SG3 beta env 2' is not visible.",
                Locator.tagWithClass("div", "detail-gray-text").withText("SG3 beta env 2").findElement(rowElement).isDisplayed());

        log("Searching for a string '" + MISSING_SEARCH_STRING + "' that should not be found.");
        cds.viewLearnAboutPage(LearnTab.MABS)
                .setSearch(MISSING_SEARCH_STRING);
        _asserts.verifyEmptyLearnAboutMAbProductsPage();

    }

    @Test
    public void testLearnAboutNABAssayAntigenTab()
    {
        LearnGrid summaryGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);

        log("Go to NAB assay page");
        summaryGrid.clickItemContaining(CDSHelper.GRID_TITLE_NAB);

        log("Verify NAb Antigens page");
        Locator assayAntigenTab = Locator.xpath("//div").withClass("learnabouttab").child("h1").withText("Antigens");
        waitForElementToBeVisible(assayAntigenTab);
        waitAndClick(assayAntigenTab);
        sleep(CDSHelper.CDS_WAIT);

        log("Verify row for 'Ce2010_F5.LucR.T2A.ecto' virus");

        Locator rowLocator = Locator.tagWithAttribute("tr", "data-recordid", "Ce2010_F5.LucR.T2A.ectoIMC Virus");

        waitForElementToBeVisible(rowLocator);

        WebElement rowElement = rowLocator.findElement(getDriver());

        scrollIntoView(rowElement);

        log("Verify Virus short name");
        checker().verifyEquals("Virus short name not as expected.",
                "Ce2010_F5.LucR.T2A.ecto",
                Locator.tagWithClass("div", "detail-description").childTag("h2").findElement(rowElement).getText());

        log("Verify Virus long name");
        checker().verifyEquals("Virus long name is incorrect.",
                "Ce2010_F5.LucR.T2A.ecto,A3R5,full name",
                Locator.tagWithClass("div", "antigen-description").childTag("p").findElements(rowElement).get(0).getText());

        log("Verify Virus other names");
        checker().verifyEquals("Virus other names is incorrect.",
                "Other names: Ce2010_F5.LucR.T2A.ecto, IMC, A3R5, ut massa",
                Locator.tagWithClass("div", "antigen-description").childTag("p").findElements(rowElement).get(1).getText());

        log("Verify Species");
        checker().verifyTrue("Species with the expected value 'HIV' is not visible.",
                Locator.tagWithClass("div", "detail-gray-text").containing("HIV").findWhenNeeded(rowElement).isDisplayed());

        log("Verify Panels");
        checker().verifyTrue("Doesn't look like 'F Subtype' is listed in the Panels.",
                Locator.tagWithClass("div", "detail-text").childTag("p").containing("F Subtype").findElement(rowElement).isDisplayed());

        log("Verify Host Cell");
        checker().verifyTrue("Host cell with expected value '293T/17' is not visible.",
                Locator.tagWithClass("div", "detail-gray-text").containing("293T/17").findElement(rowElement).isDisplayed());

        log("Verify Backbone");
        checker().verifyTrue("Backbone with expected value 'SG3 beta env 4' is not visible.",
                Locator.tagWithClass("div", "detail-gray-text").withText("SG3 beta env 4").findElement(rowElement).isDisplayed());

    }


    @Test
    public void validateSearchNavigation()
    {
        String searchTextStudies, searchTextAssays, searchTextProducts;

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);

        searchTextStudies = "Proin leo odio, porttitor id";
        log("Search for '" + searchTextStudies + "' in Studies");
        LearnDetailsPage learnDetailsPage = learnGrid
                .setSearch(searchTextStudies)
                .clickFirstItem();

        log("Click back button to validate that the search value is saved.");
        learnDetailsPage.clickBack();
        assertTrue(searchTextStudies.equals(learnGrid.getSearch()));

        log("Click 'Learn about' and validate that the text box gets cleared.");

        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        LearnGrid finalLearnGrid = learnGrid;
        Awaitility.await().untilAsserted(() -> assertTrue(finalLearnGrid.getSearch().isEmpty()));

        log("Search in Studies again to give it a history...");
        searchTextStudies = "Oxygen";
        log("Search for '" + searchTextStudies + "' in Studies.");
        learnGrid.setSearch(searchTextStudies)
                .clickFirstItem();

        log("Again click the back button to save the search value. It will be checked again in a little while.");
        learnDetailsPage.clickBack();
        assertTrue(searchTextStudies.equals(learnGrid.getSearch()));

        log("Go to Assays and try the same basic scenario.");
        learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS, false);

        searchTextAssays = "NAB";
        log("Search for '" + searchTextAssays + "' in Assays");
        learnGrid.setSearch(searchTextAssays)
                .clickFirstItem();

        log("Click back button to validate that the search value is saved.");
        learnDetailsPage.clickBack();
        assertTrue(searchTextAssays.equals(learnGrid.getSearch()));

        log("Go to Products and try the same basic scenario.");
        learnGrid = cds.viewLearnAboutPage(LearnTab.PRODUCTS, false);

        searchTextProducts = "M\u00E5ns";
        log("Search for '" + searchTextProducts + "' in Products");
        learnGrid.setSearch(searchTextProducts)
                .clickFirstItem();

        log("Click back button to validate that the search value is saved.");
        learnDetailsPage.clickBack();
        assertEquals(searchTextProducts, learnGrid.getSearch());

        log("Now click 'Studies' and validate that the search box is populated as expected.");
        assertEquals(searchTextStudies, cds.viewLearnAboutPage(LearnTab.STUDIES, false).getSearch());

        log("Now click 'Assays' and validate that the search box is populated as expected.");
        assertEquals(searchTextAssays, cds.viewLearnAboutPage(LearnTab.ASSAYS, false).getSearch());

        log("Click 'Products' and validate that the search box is populated as expected.");
        learnGrid = cds.viewLearnAboutPage(LearnTab.PRODUCTS, false);
        assertEquals(searchTextProducts, learnGrid.getSearch());

        log("Now go to a different part of the app and return using the 'Learn about' link. Search values should be saved.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);

        log("Validate that the 'Products' search value is there.");
        assertEquals(searchTextProducts, learnGrid.getSearch());

        log("Now click 'Assays' and validate that the search box has the value last searched for in Assays.");
        learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS, false);
        assertEquals(searchTextAssays, learnGrid.getSearch());

        log("Go back to Plots and return using the 'Learn about' link. Search values should be saved and show Assays.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        waitForText("Learn about...");

        log("Validate that the 'Assays' search value is there.");
        assertEquals(searchTextAssays, learnGrid.getSearch());

        log("Finally repeat the tests with 'Studies'.");
        learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES, false);
        assertEquals(searchTextStudies, learnGrid.getSearch());

        log("Go back to Plots and return using the 'Learn about' link. Search values should be saved and show Studies.");
        CDSHelper.NavigationLink.PLOT.makeNavigationSelection(this);

        CDSHelper.NavigationLink.LEARN.makeNavigationSelection(this);
        waitForText("Learn about...");

        log("Validate that the 'Studies' search value is there.");
        assertEquals(searchTextStudies, learnGrid.getSearch());
    }

    @Test
    public void validateStudySummaryDataAvailability()
    {
        final int STUDY_WITH_DATA_AVAILABLE = 34;//For available integrated assays, non-integrated assays, and publications

        cds.viewLearnAboutPage(LearnTab.STUDIES);
        assertTextPresent("Data not added");

        List<WebElement> hasDataRows = Locator.css(".detail-row-has-data").findElements(getDriver());
        List<WebElement> hasDataIcons = Locator.css(".detail-has-data").findElements(getDriver());

        if (COLUMN_LOCKING)
            //hasDataRows is larger than hasDataIcons by a factor of two because of locked columns cause rows to be counted twice.
            assertTrue(hasDataRows.size() / 2 == hasDataIcons.size() && hasDataIcons.size() == STUDY_WITH_DATA_AVAILABLE);
        else
            assertTrue(hasDataRows.size() == hasDataIcons.size() && hasDataIcons.size() == STUDY_WITH_DATA_AVAILABLE);
    }

    public void goToDetail(String itemName, boolean hasData)
    {
        Locator loc = hasData ? LEARN_HAS_DATA_ROW_TITLE_LOC.withText(itemName).notHidden() : LEARN_ROW_TITLE_LOC.withText(itemName).notHidden();
        WebElement element = shortWait().until(ExpectedConditions.visibilityOfElementLocated(loc));
        element.click();
        shortWait().until(ExpectedConditions.invisibilityOf(element));
        waitForElement(CDSHelper.Locators.studyname.notHidden());
    }

    @Test
    public void testIntegratedDataInstructions()
    {
        Locator plotLink = Locator.linkWithHref("#chart");
        Locator gridLink = Locator.linkWithHref("#data");
        Locator mabLink = Locator.linkWithHref("#mabgrid");

        String studyName = "QED 2";
        log("Verify instruction text on Learn About page for Studies - " + studyName);
        cds.viewLearnAboutPage(LearnTab.STUDIES);
        goToDetail(studyName, true);
        assertTextPresent("Visualize subject-level data in");
        assertElementPresent(plotLink);
        assertElementPresent(gridLink);
        assertTextPresent("For mAb data, go to");
        assertElementPresent(mabLink);

        String assayName = CDSHelper.ASSAYS_FULL_TITLES[1]; //ICS
        log("Verify instruction text on Learn About page for Assays - " + assayName);
        cds.viewLearnAboutPage(LearnTab.ASSAYS);
        goToDetail(assayName, true);
        assertTextPresent("Visualize subject-level data in ");
        assertElementPresent(plotLink);
        assertElementPresent(gridLink);

        String mabAssayName = CDSHelper.ASSAYS_FULL_TITLES[4]; //NAb MAb
        log("Verify instruction text on Learn About page for NAB MAB assay - " + assayName);
        cds.viewLearnAboutPage(LearnTab.ASSAYS);
        goToDetail(mabAssayName, true);
        assertElementPresent(mabLink);
        assertTextPresent("to visualize or export mAb data");

        String productName = "2F5";
        log("Verify instruction text on Learn About page for Products - " + productName);
        cds.viewLearnAboutPage(LearnTab.PRODUCTS);
        goToDetail(productName, true);
        assertTextPresent("Visualize subject-level data in");
        assertElementPresent(plotLink);
        assertElementPresent(gridLink);
        assertTextPresent("Additional data may be available. See study page.");

        String MAbName = "2F5";
        log("Verify sub-header instruction text on Learn About page for MAbs - " + MAbName);
        cds.viewLearnAboutPage(LearnTab.MABS);
        goToDetail(MAbName, true);

        log("Verify sub-header instruction under MAb Characterization Studies");
        assertTextPresent("to visualize or export mAb data");
        assertElementPresent(mabLink);
        log("Verify sub-header instruction under MAb Administration Studies");
        assertTextPresent("to visualize or export mAb data");


        String publicationName = "Fong Y 2018 J Infect Dis";
        log("Verify instruction text on Learn About page for Publications - " + publicationName);
        cds.viewLearnAboutPage(LearnTab.PUBLICATIONS);
        goToDetail(publicationName, false);
        assertTextPresent("Go to Plot to view or Grid to export.  Additional non-integrated data files may be available for download. See study page.");
    }

    @Test
    public void testNonIntegratedData()
    {
        String ni_assay1_label = "ILLUMINA 454";
        String ni_assay2_label = "ILLUMINA 454-X";
        String ni_assay2_identifier = "ILLUMINA 454-X";
        String ni_assay3_label = "ARV drug levels";
        String ni_assay3_identifier = "ARV DL";
        String ni_assay4_label = "Viral load";
        String ni_assay5_label = "Viral sequencing";
        String study1 = "RED 4";
        String study2 = "ZAP 135";

        verifyNonIntegratedDataHeader(study1);
        log("Non-Integrated data with metadata only, and no link to assay learn, and no downloadable data");
        verifyNonIntegratedDetailFieldValues(ni_assay1_label, null);

        log("Non-Integrated data with metadata, no link to assay learn, has downloadable data");
        verifyNonIntegratedDetailFieldValues(ni_assay2_label, "(TSV)");
        verifyNonIntegratedDownloadLink(ni_assay2_identifier, "ILLUMINA_454_X.tsv");

        verifyNonIntegratedDataHeader(study2);
        log("Non-Integrated data with with Learn Assay page, and downloadable data");
        verifyNonIntegratedDetailFieldValues(ni_assay3_label, "(Archive)");
        verifyNonIntegratedDetailFieldValues(ni_assay4_label, "(CSV)");
        verifyNonIntegratedDownloadLink(ni_assay3_identifier, "cvd277_ARV_Drug_Levels.zip");
        click(Locator.linkContainingText(ni_assay3_label));
        sleep(CDSHelper.CDS_WAIT_LEARN);
        verifyDetailFieldValues("ARV drug levels (ARV drug levels)");

        log("Non-Integrated data with with Learn Assay page, and no downloadable data");
        cds.viewLearnAboutPage(LearnTab.STUDIES);
        goToDetail(study2, true);
        verifyNonIntegratedDetailFieldValues(ni_assay5_label, null);

        log("Validate tooltip");
        scrollIntoView(Locator.linkWithText("ARV drug levels"));
        sleep(1000);
        validateToolTip(Locator.linkWithText("ARV drug levels").findElement(getDriver()), "Non-integrated data added to Dataspace");
        validateToolTip(Locator.linkWithText("Viral load").findElement(getDriver()), "Non-integrated data added to Dataspace");
        validateToolTip(Locator.linkWithText("Viral sequencing").findElement(getDriver()), "Non-integrated data has not been added at this time");

        click(Locator.linkContainingText(ni_assay5_label));
        sleep(CDSHelper.CDS_WAIT_LEARN);
        verifyDetailFieldValues("Viral sequencing (Viral sequencing)");
    }

    private void verifyNonIntegratedDetailFieldValues(String value, String suffix)
    {
        Locator.XPathLocator niLoc = Locator.tagWithClass("td", "non-integrated-data").containing(value);

        Assert.assertTrue(value + " field value is not present", isElementPresent(niLoc));

        if (suffix != null)
        {
            Assert.assertTrue(suffix + " is not present", isElementPresent(niLoc.containing(suffix)));
        }

        mouseOver(Locator.xpath(CDSHelper.LOGO_IMG_XPATH));
        sleep(CDSHelper.CDS_WAIT_LEARN);
    }

    private void verifyNonIntegratedDownloadLink(String altText, String documentName)
    {
        Locator.XPathLocator downloadLinkLocator = Locator.tagWithAttributeContaining("img", "alt", altText);
        scrollIntoView(downloadLinkLocator);
        File downloadedFile = clickAndWaitForDownload(downloadLinkLocator);
        assertTrue(downloadedFile + " not downloaded.", downloadedFile.getName().contains(documentName));
    }

    private void verifyNonIntegratedDataHeader(String studyName)
    {
        log("Verify Don-Integrated Data header for " + studyName);

        cds.viewLearnAboutPage(LearnTab.STUDIES);
        goToDetail(studyName, true);

        verifySectionHeaders("Non-integrated data");

        Locator.XPathLocator nonIntegratedDataElement = Locator.tagWithAttributeContaining("div", "id", "studynonintegrateddata");
        assertElementPresent(nonIntegratedDataElement);

        Locator.XPathLocator instructions = nonIntegratedDataElement.withDescendant(Locator.tag("p")).containing("Download individual files");
        assertElementPresent(instructions);
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

        final String partialLogMsgIntegratedData = "Testing integrated data availability module in ";
        final String waitForTextIntegratedData = "Integrated data";

        log(partialLogMsgIntegratedData + "Studies");
        cds.viewLearnAboutPage(LearnTab.STUDIES);

        goToDetail(STUDY, true);

        waitForText(waitForTextIntegratedData);

        assertElementPresent(cds.hasDataDetailIconXPath(ASSAY_TITLES[0]));
        assertElementPresent(cds.hasDataDetailIconXPath(ASSAY_TITLES[1]));
        assertElementPresent(cds.noDataDetailIconXPath(ASSAY_TITLES[2]));


        log(partialLogMsgIntegratedData + "Assays");
        cds.viewLearnAboutPage(LearnTab.ASSAYS);
        Locator loc = Locator.xpath("//h2[contains(text(), '" + CDSHelper.ICS + "')]");
        waitForElementToBeVisible(loc);
        waitAndClick(loc);

        refresh(); //ensures only selecting elements on viewable page.

        waitForText(waitForTextIntegratedData);

        Locator.XPathLocator showAllListToggle = Locator.tagWithClass("td", "show-hide-toggle-integrateddata");
        showAllExpandAndVerify(showAllListToggle, 6);

        List<WebElement> smallHasDataIcons = cds.hasDataDetailIconXPath("").findElements(getDriver());
        assertTrue(smallHasDataIcons.size() == NUM_STUDY_FROM_ASSAY_WITH_DATA);

        assertElementNotPresent(cds.hasDataDetailIconXPath(STUDY_FROM_ASSAY_WITH_NO_DATA));
        assertElementPresent(cds.noDataDetailIconXPath(STUDY_FROM_ASSAY_WITH_NO_DATA));

        verifyShowAllCollapse(showAllListToggle, 6);

        log(partialLogMsgIntegratedData + "Products");
        cds.viewLearnAboutPage(LearnTab.PRODUCTS)
                .setSearch(PRODUCT);

        goToDetail(PRODUCT, true);

        refresh();

        waitForText(waitForTextIntegratedData);

        assertElementPresent(cds.hasDataDetailIconXPath(STUDY_FROM_PRODUCT[0]));
        assertElementPresent(cds.noDataDetailIconXPath(STUDY_FROM_PRODUCT[1]));

        log(partialLogMsgIntegratedData + "mAbs");
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.MABS);
        String mAbName = "2F5";

        learnGrid.setSearch(mAbName);

        Locator.XPathLocator mabRowLoc = LEARN_HAS_DATA_ROW_TITLE_LOC.withText(mAbName);
        log("Verify mAb integrated data availability on summary page");
        assertElementPresent(mabRowLoc);
        assertElementVisible(Locator.tagWithText("div", "2 Studies Accessible"));
        goToDetail(mAbName, true);

        refresh();
        waitForText(waitForTextIntegratedData);

        Locator subHeaderCharacterization = Locator.tagContainingText("div", "MAb Characterization Studies");
        Locator subHeaderAdministration = Locator.tagContainingText("div", "MAb Administration Studies");
        log("Verify mAb integrated data availability sub listing with 2 categories");
        assertElementPresent(cds.hasDataDetailIconXPath(CDSHelper.ZAP_117));

        showAllListToggle = Locator.tagWithClass("td", "show-hide-toggle-integrateddata");
        showAllExpandAndVerify(showAllListToggle, 3);

        assertElementPresent(cds.hasDataDetailIconXPath(CDSHelper.ZAP_134));

        verifyShowAllCollapse(showAllListToggle, 3);

        assertElementVisible(subHeaderCharacterization);
        assertElementVisible(subHeaderAdministration);

        log("Verify mAb labeled as label");
        Locator labeledAsLoc = cds.getDataRowXPath(CDSHelper.ZAP_117).append(Locator.tagWithClass("td", "data-availability-alt-label")
                .withText("Labeled as 2F5 (PlantForm); 2F5 (Polymun) (IAM 2F5, IAM-41-2F5, IAM2F5, c2F5)"));
        assertElementPresent(labeledAsLoc);

        log("Verify mAb integrated data availability sub listing with only 1 category");
        learnGrid = cds.viewLearnAboutPage(LearnTab.MABS);
        mAbName = "PGT121";
        learnGrid.setSearch(mAbName);
        mabRowLoc = LEARN_HAS_DATA_ROW_TITLE_LOC.withText(mAbName);
        assertElementPresent(mabRowLoc);
        assertElementPresent(Locator.tagWithText("div", "1 Study Accessible").notHidden());
        goToDetail(mAbName, true);
        assertElementNotPresent(cds.hasDataDetailIconXPath(CDSHelper.ZAP_130));
        assertElementPresent(cds.noDataDetailIconXPath(CDSHelper.ZAP_130));
        assertElementPresent(cds.hasDataDetailIconXPath(CDSHelper.ZAP_134));
        assertFalse(isElementPresent(subHeaderCharacterization) && isElementVisible(subHeaderCharacterization));
        assertElementVisible(subHeaderAdministration);
    }

    @Test
    public void verifyLearnAboutMabProductDetail()
    {
        LearnGrid summaryGrid = cds.viewLearnAboutPage(LearnTab.PRODUCTS);

        String mabProduct = "2F5";
        summaryGrid.clickItemContaining(mabProduct);

        log("Verify Integrated Data Availability");
        waitForText("Integrated data");
        Locator.XPathLocator showAllListToggle = Locator.tagWithClass("td", "show-hide-toggle-integrateddata");

        showAllExpandAndVerify(showAllListToggle, 3);

        List<WebElement> smallHasDataIcons = cds.hasDataDetailIconXPath("").findElements(getDriver());
        assertEquals("Number of studies using the mAb product is not as expected", 1, smallHasDataIcons.size());

        verifyShowAllCollapse(showAllListToggle, 3);

        String mAbStdName = "2F5";
        log("Verify link to mAb details page from product page");
        Locator mabLink = Locator.tagWithClass("a", "learn-product-mab-link").withText(mAbStdName);
        WebElement mabLinkEl = mabLink.findElementOrNull(getDriver());
        Assert.assertNotNull("Link to mAb detail page is not present", mabLinkEl);
        mabLinkEl.click();
        waitForText("2F5 (PlantForm) (other)");
    }

    @Test
    public void testLearnAboutPKMAbAssay()
    {
        LearnGrid summaryGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);

        summaryGrid.clickItemContaining(CDSHelper.TITLE_PKMAB);

        log("Verify Integrated Data Availability");
        waitForText("Integrated data");
        List<WebElement> smallHasDataIcons = cds.hasDataDetailIconXPath("").findElements(getDriver());
        assertEquals("Number of studies with PK MAb data is not as expected", 1, smallHasDataIcons.size());

        assertElementPresent(cds.hasDataDetailIconXPath(CDSHelper.ZAP_134));
        assertElementNotPresent(cds.hasDataDetailIconXPath(CDSHelper.ZAP_136));
        assertElementPresent(cds.noDataDetailIconXPath(CDSHelper.ZAP_136));

        log("Verify Assay Dimension");
        List<String> fields = Arrays.asList(CDSHelper.LEARN_ABOUT_PKMAB_ASSAY_DIM_FIELDS);
        fields.stream().forEach((field) -> assertTextPresent(field));

        log("Verify Variables page");
        waitForElementToBeVisible(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        waitAndClick(Locator.tagWithClass("h1", "lhdv").withText("Variables"));
        sleep(CDSHelper.CDS_WAIT);
        waitForElement(Locator.xpath("//div").withClass("variable-list-title").child("h2").withText("MAb or mixture standardized name"));

        log("Verify Antigens tab is not present");
        Locator antigenTabLoc = Locator.xpath("//div").withClass("learnabouttab").child("h1").withText("Antigens");
        assertFalse("Antigen tab should not be present for PK MAb assay", isElementPresent(antigenTabLoc) && isElementVisible(antigenTabLoc));
    }

    @Test
    public void validateLearnAboutFiltering()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);

        log("Evaluating sorting...");
        learnGrid.sort("Name & Description");
        List<WebElement> sortedStudyTitles = LEARN_ROW_TITLE_LOC.findElements(getDriver());

        scrollIntoView(sortedStudyTitles.get(sortedStudyTitles.size() - 1));
        String titleForLastElement = sortedStudyTitles.get(sortedStudyTitles.size() - 1).getText();
        learnGrid.sort("Name & Description");
        assertEquals(titleForLastElement, LEARN_ROW_TITLE_LOC.findElements(getDriver())
                .get(0).getText());

        log("Evaluating filtering...");
        String[] studiesToFilter = {CDSHelper.STUDIES[0], CDSHelper.STUDIES[7], CDSHelper.STUDIES[20]}; //Arbitrarily chosen
        int numRowsPreFilter = learnGrid.getRowCount();

        assertEquals("Facet options should all have data before filtering", LearnGrid.FacetGroups.hasData, learnGrid.getFacetGroupStatus("Name & Description"));

        learnGrid.setFacet("Name & Description", studiesToFilter);
        List<WebElement> studyTitlesAfterFilter = LEARN_ROW_TITLE_LOC.findElements(getDriver());

        List<String> studiesFiltered = Arrays.asList(studiesToFilter);
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
        int numRowsSatisfyFilter = Locator.xpath("//tr/td/div/div/div[contains(@class, 'detail-gray-text')]" +
                        "[contains(text(), ' Integrated Assay')]/../../../following-sibling::" +
                        "td/div/div/table/tbody/tr[contains(@class, 'detail-gray-text')]/td[contains(text(), '" + yearToFilter + "')]")
                .findElements(getDriver()).size();

        learnGrid.setWithOptionFacet("Status", "Start Year", yearToFilter);
        learnGrid.setFacet("Data Added", "Integrated data");
        numRowsPostFilter = learnGrid.getRowCount();

        assertTrue(numRowsSatisfyFilter == numRowsPostFilter);

        log("Evaluating persisting to URL");
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        learnGrid = new LearnGrid(LearnTab.STUDIES, this);
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

        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);

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

        cds.viewLearnAboutPage(LearnTab.STUDIES)
                .clearFilters("Type");

    }

    @Test
    public void validateAssayAntigens()
    {
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.ASSAYS);
        List<String> assays = Arrays.asList(CDSHelper.ASSAYS_FULL_TITLES);
        _asserts.verifyLearnAboutPage(assays); // Until the data is stable don't count the assay's shown.

        waitForElementToBeVisible(LEARN_ROW_TITLE_LOC.containing(assays.get(0)));
        waitAndClick(LEARN_ROW_TITLE_LOC.containing(assays.get(0)));
        waitForElement(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitForElement(Locator.xpath("//h3[text()='Endpoint description']"));
        assertTextPresent(CDSHelper.LEARN_ABOUT_BAMA_METHODOLOGY);

        log("testing BAMA antigens page...");
        Locator assayAntigenTab = Locator.xpath("//div").withClass("learnabouttab").child("h1").withText("Antigens");
        waitForElementToBeVisible(assayAntigenTab);
        waitAndClick(assayAntigenTab);
        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.
        waitForElement(Locator.tagWithClass("div", "x-column-header-inner").append("/span").containing("Antigen"));
        verifyBAMAAntigenTabColumns();

        for (int i = 0; i < CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA.length; i++)
        {
            // Use this as the conditional test that the page has loaded, and wait for it to load as well.
            waitForElement(Locator.xpath("//div[@class='detail-description']//h2[text()='" + CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_DATA[i] + "']"), 1000, true);
        }

        learnGrid = new LearnGrid(LearnTab.ASSAY_ANTIGENS, this);
        log("Evaluating sorting...");
        learnGrid.sort("Antigen");
        List<WebElement> sortedAntigenNames = LEARN_ROW_TITLE_LOC.findElements(getDriver());
        scrollIntoView(sortedAntigenNames.get(sortedAntigenNames.size() - 1));
        String titleForLastElement = sortedAntigenNames.get(sortedAntigenNames.size() - 1).getText();
        learnGrid.sort("Antigen");
        assertTrue("Antigens are not sorted as expected", LEARN_ROW_TITLE_LOC.findElements(getDriver())
                .get(0).getText()
                .equals(titleForLastElement));

        log("Evaluating filtering...");
        String[] antigensToFilter = {CDSHelper.BAMA_ANTIGENS_NAME[0], CDSHelper.BAMA_ANTIGENS_NAME[3], CDSHelper.BAMA_ANTIGENS_NAME[5]}; //Arbitrarily chosen
        learnGrid.setFacet("Antigen", antigensToFilter);
        List<WebElement> antigensAfterFilter = LEARN_ROW_TITLE_LOC.findElements(getDriver());
        assertTrue("Expected number of antigens after filtering: " + antigensToFilter.length + ", actual number: " + antigensAfterFilter.size(),
                antigensAfterFilter.size() == antigensToFilter.length);
        List<String> studiesFiltered = Arrays.asList(antigensToFilter);
        for (WebElement antigenTitlesOnPage : antigensAfterFilter)
        {
            scrollIntoView(antigenTitlesOnPage);
            assertTrue("Antigen " + antigenTitlesOnPage.getText() + " is not present", studiesFiltered.contains(antigenTitlesOnPage.getText()));
        }

        log("Evaluating clearing a filter");
        learnGrid.clearFilters("Antigen");
        assertTrue("Not all antigens are present after clearing filter", learnGrid.getTitleRowCount() == CDSHelper.BAMA_ANTIGENS_NAME.length);

        log("testing ICS antigens page");
        waitForElementToBeVisible(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitAndClick(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));
        waitForElementToBeVisible(LEARN_ROW_TITLE_LOC.containing(assays.get(1)));
        waitAndClick(LEARN_ROW_TITLE_LOC.containing(assays.get(1)));
        waitForElement(DETAIL_PAGE_BREADCRUMB_LOC.withText("Assays /"));

        waitForElementToBeVisible(assayAntigenTab);
        waitAndClick(assayAntigenTab);
        Locator proteinPanelLoc = Locator.tagWithClass("div", "x-column-header-inner").append("/span").containing("Protein Panel");
        waitForElement(proteinPanelLoc);
        refresh(); //refreshes are necessary to clear previously viewed tabs from the DOM.
        waitForElement(proteinPanelLoc);
        sleep(500);
        waitForText(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA[0]);
        assertTextPresent(CDSHelper.LEARN_ABOUT_ICS_ANTIGEN_TAB_DATA);

        log("Evaluating multi filtering...");
        learnGrid = new LearnGrid(LearnTab.ASSAY_ANTIGENS, this);
        learnGrid.setWithOptionFacet("Protein:Pools", "Proteins", "POL");
        log(learnGrid.getTitleRowCount() + "a");
        assertTrue("Number of antigens is incorrect after filtering by Proteins \"POL\"", 2 == learnGrid.getTitleRowCount());

        log("Evaluating filter persistence");
        refresh();
        sleep(CDSHelper.CDS_WAIT_LEARN);
        learnGrid = new LearnGrid(LearnTab.ASSAY_ANTIGENS, this);
        assertTrue("Antigens are not filtered correctly when loading from URL", 2 == learnGrid.getTitleRowCount());

        learnGrid.setWithOptionFacet("Protein:Pools", "Pools", "POL 2");
        assertTrue("Number of antigens is incorrect after filtering by Pools \"POL 2\"", 1 == learnGrid.getTitleRowCount());
    }

    private void verifyBAMAAntigenTabColumns()
    {
        for (String column : CDSHelper.LEARN_ABOUT_BAMA_ANTIGEN_COLUMNS)
        {
            assertElementPresent(Locator.tagWithClass("span", "x-column-header-text").withText(column));
        }
    }

    @Test
    public void validateMultiFiltering()
    {
        //Test basic functionality of multifacet
        LearnGrid learnGrid = cds.viewLearnAboutPage(LearnTab.STUDIES);
        learnGrid.setWithOptionFacet("Type", "Species", "Vulcan");
        assertTrue(1 == learnGrid.getRowCount());

        //Test filter for alt property persists correctly
        refresh();
        learnGrid = new LearnGrid(LearnTab.STUDIES, this);
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
        learnGrid.setFacet("Data Added", "Data not added");
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
        learnGrid.setWithOptionFacet("Name & Description", "Network", "CAVD");
        assertTrue(1 == learnGrid.getRowCount());
        refresh();
        learnGrid = new LearnGrid(LearnTab.STUDIES, this);
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
        String PDF01_FILE_NAME;
        String PDF02_FILE_NAME;
        final String DOCX_FILE_NAME = "Gallo OPP41351 Systemic, Mucosal and Passive Immunity.docx";
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        if (getBrowserType() == WebDriverWrapper.BrowserType.CHROME)
        {
            PDF01_FILE_NAME = "shattock%20opp37872%20novel%20antigens%20for%20mucosal%20protection.pdf";
            PDF02_FILE_NAME = "mcelrath%20opp38645%20innate%20to%20adaptive%20immunity.pdf";
        }
        else
        {
            PDF01_FILE_NAME = "Shattock OPP37872 Novel Antigens for Mucosal Protection.pdf";
            PDF02_FILE_NAME = "McElrath OPP38645 Innate to Adaptive Immunity.pdf";
        }

        log("Validate a link to a pdf file works as expected.");
        clickPDFGrantAffilication(CDSHelper.QED_2, PDF01_FILE_NAME);

        if (getBrowserType() == BrowserType.CHROME)
        {
            log("Validate that a link to a doc file works as expected.");
            clickDocGrantAffiliation(CDSHelper.QED_1, DOCX_FILE_NAME);
        }
        else
        {
            // TODO Bug in CDS.
            log("We have a bug in Firefox where we don't persist the doc file name when downloading.");
            log("Skipping this check for now.");
        }

        log("Validated that a document linked to several studies works as expected.");
        clickPDFGrantAffilication(CDSHelper.ZAP_100, PDF02_FILE_NAME);

        // Chrome will open the file Firefox will download.
        if (getBrowserType() == WebDriverWrapper.BrowserType.CHROME)
        {
            clickPDFGrantAffilication(CDSHelper.RED_5, PDF02_FILE_NAME);
            clickPDFGrantAffilication(CDSHelper.RED_8, PDF02_FILE_NAME);
        }
        else
        {
            // Since the different studies have a link to the same file need to account for multiple versions in the download dir.
            clickPDFGrantAffilication(CDSHelper.RED_5, PDF02_FILE_NAME.replace(".pdf", "(1).pdf"));
            clickPDFGrantAffilication(CDSHelper.RED_8, PDF02_FILE_NAME.replace(".pdf", "(2).pdf"));
        }

        log("Validate a study that has link but the document is not there.");
        cds.viewLearnAboutPage(LearnTab.STUDIES);

        goToDetail(CDSHelper.RED_1, false);

        waitForText(STUDY_INFO_TEXT_TRIGGER);

        assertTrue("There was a visible link to a grant document for this study, and there should not be.", cds.getVisibleGrantDocumentLink() == null);

        goToHome();
        log("All done.");

    }

    @Test
    public void validateReportsDocumentLinks()
    {
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        String studyName, documentName;
        WebElement documentLink;

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.RED_5;

        log("Check the links for " + studyName);
        goToDetail(studyName, false);

        waitForText(STUDY_INFO_TEXT_TRIGGER);

        log("Verify that the expected number of links did show up.");
        Assert.assertEquals("Did not find the expected number of document links.", 3, Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a").findElements(getDriver()).size());

        log("First check the Powerpoint link.");
        documentLink = Locator.tagWithAttributeContaining("img", "alt", "Epitope Mapping Results Summary").findElementOrNull(getDriver());
        assertTrue("Was not able to find link to the Powerpoint document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd260_CAVIMC 031 Linear Epitope Mapping_BaselineSubtracted-3.pptx";
        scrollIntoView(documentLink);
        cds.validateDocLink(documentLink, documentName);

        log("Now check the Excel link.");

        documentLink = Locator.tagWithAttributeContaining("img", "alt", "NAB Data Summary 2").findElementOrNull(getDriver());
        assertTrue("Was not able to find link to the Excel document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd260_CAVIMC-031 Neutralization Data with AUC 3 May 2011-6.xlsx";
        scrollIntoView(documentLink);
        cds.validateDocLink(documentLink, documentName);

        log("Finally for this study validate the pdf file.");
        documentLink = Locator.tagWithAttributeContaining("img", "alt", "NAB Data Summary 1").findElementOrNull(getDriver());
        assertTrue("Was not able to find link to the PDF document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd260_McElrath_Seder_Antibody Responses 1.1 01Jun11.pdf";
        scrollIntoView(documentLink);
        cds.validatePDFLink(documentLink, documentName);

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.RED_9;

        log("Check the links for " + studyName);
        goToDetail(studyName, false);

        waitForText(STUDY_INFO_TEXT_TRIGGER);

        log("Verify that the expected number of links show up. There should be 9 of them.");
        waitForElements(Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a"), 9);

        log("Click on a few of these links to make sure they work. First check the Word Document link.");
        documentLink = Locator.tagWithAttributeContaining("img", "alt", "CFSE Results Summary").findElementOrNull(getDriver());
        assertTrue("Was not able to find link to the Word Document document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd264_DCVax001_CFSE_Memo_JUL13_v4.docx";
        scrollIntoView(documentLink);
        cds.validateDocLink(documentLink, documentName);

        log("Now check one of the PDF link.");
        documentLink = Locator.tagWithAttributeContaining("img", "alt", "ICS Data Summary").findElementOrNull(getDriver());
        assertTrue("Was not able to find link to the PDF document for study '" + studyName + "'.", documentLink != null);
        documentName = "cvd264_ICS_LAB_REPORT_19APR13_n24fcm_fh_IL2_CD154_MIMOSA.pdf";
        scrollIntoView(documentLink);
        cds.validatePDFLink(documentLink, documentName);

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        log("Now validate a study that should have no links.");
        studyName = CDSHelper.QED_2;

        log("Check the links for " + studyName);
        goToDetail(studyName, false);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        log("Verify that there are no links.");
        Assert.assertEquals("Did not find the expected number of document links.", 0, Locator.xpath(CDSHelper.Locators.REPORTS_LINKS_XPATH + "//a").findElements(getDriver()).size());

        log("Validate the related studies links");
        String relatedStudiesText, expectedStudiesText;

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.QED_1;
        expectedStudiesText = "QED 2 (Main study)\nQED 3 (Main study)\nRED 3 (Extension study)\nRED 4 (Extension study)\nZAP 100 (Co-conducted study)\nZAP 111 (HIV follow up study)\nRED 2 (Ancillary study)\nZAP 101 (A poorly-named study relationship)";

        log("Check the links for " + studyName + ". Each of the different relationship types should be listed.");
        goToDetail(studyName, false);

        Locator relatedStudiesTable = Locator.xpath("//h3[text()='Related studies']/following-sibling::table[@class='learn-study-info']");

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        log("Now validate that link to the documents works as expected.");
        click(Locator.linkWithText("QED 3"));
        CDSHelper.Locators.studyname.withText("QED 3").waitForElement(getDriver(), 5_000);
        log("Verify that the related study links for this study are as expected.");
        expectedStudiesText = "QED 1 (Ancillary study)";
        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);
        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        log("Click the related study and make sure we navigate back to the original study.");
        click(Locator.linkWithText("QED 1"));
        CDSHelper.Locators.studyname.withText("QED 1").waitForElement(getDriver(), 5_000);

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.QED_2;
        expectedStudiesText = "QED 4 (Main study)\nQED 1 (Ancillary study)";

        log("Check the links for " + studyName + ". This should only have two studies related.");
        goToDetail(studyName, false);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.ZAP_105;
        expectedStudiesText = "ZAP 102 (Ancillary study)";

        log("Check the links for " + studyName + ". This should only have one study related, and this should be the last entry in StudyRelationship.txt");
        goToDetail(studyName, false);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.RED_2;

        log("Check the links for " + studyName + ". This should have no studies, so validate the element isn't shown.");
        goToDetail(studyName, false);

        assertFalse("There should be no related studies for this study, but the related studies grid was found.", isElementPresent(relatedStudiesTable));
        assertFalse("The header for the related studies section was found.", isElementPresent(Locator.xpath("//h3[text()='Related Studies']")));

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.ZAP_103;
        expectedStudiesText = "YOYO 55 (Main study)\nZAP 110 (Main study)\nZAP 111 (Main study)\nZAP 105 (HIV follow up study)";

        log("Check the links for " + studyName + ". The relationships for this study were in a 'random' order in StudyRelationship.txt validate that has no effect on the list.");
        goToDetail(studyName, false);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        studyName = CDSHelper.RED_5;
        expectedStudiesText = "RED 5 (Ancillary study)";

        log("Check the links for " + studyName + ". This is a self referential study. This should not happen but validating that if it does we are ok with it.");
        goToDetail(studyName, false);

        relatedStudiesText = getText(relatedStudiesTable);
        log("Text: " + relatedStudiesText);

        Assert.assertEquals("The text for the related studies is not as expected.", expectedStudiesText, relatedStudiesText);

        goToHome();
        log("All done.");

    }

    private void clickPDFGrantAffilication(String studyName, String pdfFileName)
    {
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        WebElement documentLink;

        pdfFileName = pdfFileName.toLowerCase();

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        log("Validate that study " + studyName + " has a grant document and is of type pdf.");
        goToDetail(studyName, false);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        documentLink = cds.getVisibleGrantDocumentLink();
        assertTrue("Was not able to find link to the document for study '" + studyName + "'.", documentLink != null);

        cds.validatePDFLink(documentLink, pdfFileName);

    }

    private void clickDocGrantAffiliation(String studyName, String docFileName)
    {
        final String STUDY_INFO_TEXT_TRIGGER = "Study information";

        WebElement documentLink;

        docFileName = docFileName.toLowerCase();

        cds.viewLearnAboutPage(LearnTab.STUDIES);

        log("Validate that study " + studyName + " has a grant document and is of type docx.");

        goToDetail(studyName, false);
        waitForText(STUDY_INFO_TEXT_TRIGGER);

        documentLink = cds.getVisibleGrantDocumentLink();
        assertTrue("Was not able to find link to the document for study '" + studyName + "'.", documentLink != null);

        cds.validateDocLink(documentLink, docFileName);

    }

    //Helper function for data availability tests
    private Locator.XPathLocator getDataRowXPathNoToolTip(String rowText)
    {
        return Locator.xpath("//tr[contains(@class,'item-row')]/td/a[contains(text(), '" + rowText + "')]").parent().parent();
    }

    private void validateSearchFor(LearnGrid learnGrid, String searchString)
    {
        log("Searching for '" + searchString + "'.");
        learnGrid.setSearch(searchString);
        int rowCount = learnGrid.getRowCount();
        log("Found " + rowCount + " items.");

        Assert.assertTrue("No search results for " + searchString, rowCount > 0);

        for (int i = 0; i < rowCount; i++)
        {
            LearnDetailsPage learnDetailsPage = learnGrid.clickItem(i);

            Assert.assertTrue("Item didn't contain searched text: " + searchString, learnDetailsPage.getComponentElement()
                    .getText().toLowerCase().contains(searchString.toLowerCase()));

            learnDetailsPage.clickBack();
        }

    }

    private void validateToolTipText(String toolTipText, List<String> expectedText)
    {
        for (String expected : expectedText)
        {
            // Not a fatal error if the tooltip does not contain the expected text.
            checker().withScreenshot("ToolTipTextError").verifyTrue("Tool tip did not contain text: '" + expected + "'. Found: '" + toolTipText + "'.",
                    toolTipText.trim().toLowerCase().contains(expected.trim().toLowerCase()));
        }
    }

    private void validateToolTip(WebElement el, String toolTipExpected)
    {
        String linkText = el.getText().trim();
        checker().verifyFalse("Provided element doesn't appear to be a link. Link text:\n" + linkText, linkText.contains("\n"));

        log("Hover over the link with text '" + linkText + "' to validate that the tooltip is shown.");
        String toolTipText;

        // Not a fatal error if a tooltip is not shown.
        String screenShotName = "ValidateToolTip_" + linkText;

        checker().setErrorMark();
        checker().withScreenshot(screenShotName).verifyTrue("Tooltip for '" + linkText + "' didn't show. Show yourself coward!", triggerToolTip(el));

        if (checker().errorsSinceMark() == 0)
        {
            // If the tool-tip is present, checker().verifyTrue returned true, check the text of the tooltip.
            toolTipText = getToolTipText();
            validateToolTipText(toolTipText, List.of(toolTipExpected));
        }

        // Move the mouse off of the element that shows the tool tip, and then wait for the tool tip to disappear.
        cds.dismissTooltip();

    }

    private boolean triggerToolTip(WebElement el)
    {
        // Move the mouse to the top left corner of the page and make sure there are no popups visible.
        cds.dismissTooltip();

        // Move the mouse over the element.
        mouseOver(el);

        // Wait for the tooltip to show up.
        return waitFor(() ->
                        TOOLTIP_TEXT_LOCATOR.findWhenNeeded(getDriver()).isDisplayed(),
                2_000);
    }

    private String getToolTipText()
    {
        // Shouldn't have to put this check here, but getText is not always return the text of the tooltip so
        // validate that it is there first.
        waitForElementToBeVisible(TOOLTIP_TEXT_LOCATOR);
        return getText(TOOLTIP_TEXT_LOCATOR);
    }

    private void showAllExpandAndVerify(Locator showAllListToggle, int remaining)
    {
        log("Expand Show all & Verify");
        scrollIntoView(showAllListToggle);
        assertElementPresent(showAllListToggle.withText("(show all)"));
        assertTextPresent("and " + remaining + " more");
        mouseOver(showAllListToggle);
        click(showAllListToggle);

        waitForElement(showAllListToggle.withText("(show less)"));
        assertTextPresent("and " + remaining + " more");
    }

    private void verifyShowAllCollapse(Locator showAllListToggle, int remaining)
    {
        log("Verify show all list collapse");
        scrollIntoView(showAllListToggle);
        mouseOver(showAllListToggle);
        click(showAllListToggle);
        waitForElement(showAllListToggle.withText("(show all)"));
        assertTextPresent("and " + remaining + " more");
    }
}
