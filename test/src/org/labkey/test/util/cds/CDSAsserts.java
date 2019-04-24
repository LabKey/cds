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
package org.labkey.test.util.cds;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.AssayDetailsPage;
import org.labkey.test.pages.cds.StudyDetailsPage;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class CDSAsserts
{
    private final BaseWebDriverTest _test;
    private final CDSHelper cds;

    public CDSAsserts(BaseWebDriverTest test)
    {
        _test = test;
        cds = new CDSHelper(_test);
    }

    public void assertAllSubjectsPortalPage()
    {
        assertCDSPortalRow("Subject characteristics", "2 subject characteristics", "2 species", "6 decades by age", "3 ethnicities", "60 countries", "2 sexes",
                "10 races", "2 gender identities", "5 circumcision categories", "5 bmi categories", "3 study cohorts");
        assertCDSPortalRow("Products", "6 products", "6 products", "5 classes", "4 developers", "4 types");
        assertCDSPortalRow("Studies", "51 studies", "4 networks", "6 study types", "282 coded labels", "282 treatments", "48 pi", "6 strategy");
    }

    public void assertCDSPortalRow(String byNoun, String expectedTotal, String... expectedDetails)
    {
        _test.waitForElement(CDSHelper.Locators.getByLocator(byNoun), 120000);
        assertTrue("'by " + byNoun + "' search option is not present", _test.isElementPresent(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div[" +
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' " + byNoun + "']]")));

        Set<String> expectedDetailsSet = new HashSet<>(Arrays.asList(expectedDetails));
        String actualDetail = _test.getText(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div[" +
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' " + byNoun + "']]" +
                "/div[contains(@class, 'detailcolumn')]"));

        Set<String> splitDetailsSet = new HashSet<>();
        if (actualDetail.length() > 0)
            splitDetailsSet.addAll(Arrays.asList(actualDetail.split(", ?")));
        assertEquals("Wrong details for search by " + byNoun + ".", expectedDetailsSet, splitDetailsSet);

        String actualTotal = _test.getText(Locator.xpath("//div[starts-with(@id, 'summarydataview')]/div[" +
                "./div[contains(@class, 'bycolumn')]/span[@class = 'label' and text() = ' " + byNoun + "']]" +
                "/div[contains(@class, 'totalcolumn')]"));
        assertEquals("Wrong total for search by " + byNoun + ".", expectedTotal, actualTotal);
    }

    private void assertSelectionStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int speciesCount, int contributorCount, int antigenCount, int maxCount)
    {
        cds.selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, speciesCount, -1, -1);
        _test.waitForElement(CDSHelper.Locators.filterMemberLocator(filteredLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    // Sequential calls to this should have different subject counts.
    private void assertFilterStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int speciesCount, int contributorCount, int antigenCount, int maxCount)
    {
        cds.selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, speciesCount, -1, -1);
        _test.waitForElement(CDSHelper.Locators.filterMemberLocator(filteredLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    @LogMethod
    public void assertNounInfoPage(@LoggedParam String noun, List<String> textToCheck)
    {
        cds.viewInfo(noun);

        // just do simple checks for the placeholder noun pages for now, layout will change so there is no use
        // investing too much automation right now.
        _test.waitForText(textToCheck.get(0));
        _test.assertTextPresent(textToCheck);
        cds.closeInfoPage();
    }

    @LogMethod
    public void assertParticipantIdsOnPage(String[] membersIncluded, String[] membersExcluded)
    {
        if (membersIncluded != null)
            for (String member : membersIncluded)
                _test.assertElementPresent(Locator.linkContainingText(member));

        if (membersExcluded != null)
            for (String member : membersExcluded)
                _test.assertElementNotPresent(Locator.linkContainingText(member));
    }

    @LogMethod
    public void assertParticipantIds(String groupName, Set<String> groupMemberPtids)
    {
        Ext4Helper.resetCssPrefix();
        if (!_test.isElementPresent(Locator.id("participantCategoriesGrid")))
        {
            _test.goToProjectHome();
            _test.clickTab("Manage");
            _test.clickAndWait(Locator.linkContainingText("Manage Subject Groups"));
        }

        _test.waitForText(groupName);

        Set<String> ids = new HashSet<>(Arrays.asList(_test._studyHelper.getParticipantIds(groupName, "Subject").split(",[\\s]*")));
        assertEquals("Wrong ptids in group '" + groupName, groupMemberPtids, ids);
    }

    private void assertPeopleTip(String cls, String name, String portraitFilename, String role)
    {
        Locator btnLocator = Locator.xpath("//a[contains(@class, '" + cls + "') and contains(text(), '" + name + "')]");
        _test.waitForElement(btnLocator);
        _test.mouseOver(btnLocator);

        Locator.XPathLocator portraitLoc = Locator.xpath("//img[@src='/labkey/cds/images/pictures/" + portraitFilename + "']").notHidden();
        _test.waitForElement(portraitLoc);
        Locator.XPathLocator roleLoc = Locator.tag("div").withClass("tip-role").notHidden().withText(role);
        _test.assertElementPresent(roleLoc);
        _test.fireEvent(btnLocator, BaseWebDriverTest.SeleniumEvent.mouseout);
        _test.waitForElementToDisappear(portraitLoc);
        _test.assertElementNotPresent(roleLoc);
    }

    @LogMethod(quiet = true)
    private void assertStudyDetailsFromSummary(@LoggedParam StudyDetailsPage study)
    {
        _test.waitAndClick(Locator.linkWithText(study.getStudyName()));
        study.assertStudyInfoPage();
        cds.closeInfoPage();
    }

    @LogMethod(quiet = true)
    private void assertAssayDetailsFromSummary(@LoggedParam AssayDetailsPage study)
    {
        _test.waitAndClick(Locator.linkWithText(study.getAssayName()));
        study.assertAssayInfoPage();
        cds.closeInfoPage();
    }

    public void verifyAssayInfo(AssayDetailsPage assay)
    {
        cds.viewInfo(assay.getAssayName());
        assay.assertAssayInfoPage();
        cds.closeInfoPage();
    }

    public void verifyLearnAboutPage(List<String> axisItems, boolean validateItemCount)
    {
        if (validateItemCount)
        {
            _test.waitForElement(Locator.tagWithClass("div", "detail-row").append("/td/div/div/h2"));
            int elemCount = _test.getElementCount(Locator.xpath("//div[not(contains(@style, 'display: none'))]/div[contains(@class, 'detail-row')]/td/div/div/div/h2"));
            assertEquals("Unexpected number of items on the Learn About page.", axisItems.size(), elemCount);
        }
        verifyLearnAboutPage(axisItems);
    }

    public void verifyLearnAboutPage(List<String> axisItems)
    {
        for (String item : axisItems)
        {
            _test.waitForElement(Locator.tagWithClass("tr", "detail-row").append("/td/div/div/h2").containing(item), _test.WAIT_FOR_PAGE);
            _test.assertElementPresent(Locator.tagWithClass("tr", "detail-row").append("/td/div/div/h2").withText(item));
        }

    }

    public void verifyEmptyLearnAboutStudyPage()
    {
        _test.assertElementPresent(Locator.xpath("//div[contains(@class, 'detail-empty-text')][text() = 'No available studies meet your selection criteria.']"));
    }

    public void verifyEmptyLearnAboutStudyProductsPage()
    {
        _test.assertElementPresent(Locator.xpath("//div[contains(@class, 'detail-empty-text')][text() = 'No available products meet your selection criteria.']"));
    }

    public void verifyEmptyLearnAboutPublicationsPage()
    {
        _test.assertElementPresent(Locator.xpath("//div[contains(@class, 'detail-empty-text')][text() = 'No available publications meet your selection criteria.']"));
    }

    public void assertDefaultFilterStatusCounts()
    {
        assertFilterStatusCounts(8277, 51, 2, 6, 282); // TODO Test data dependent.
    }

    public void assertSelectionStatusCounts(int subjectCount, int studyCount, int speciesCount, int productCount, int treatmentCount)
    {
        if (subjectCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(subjectCount, "Subject"));
        }

        if (studyCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(studyCount, "Stud"));
        }

        if (speciesCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(speciesCount, "Species"));
        }

        if (productCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(productCount, "Product"));
        }

        if (treatmentCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(treatmentCount, "Treatment"));
        }
    }

    public void assertFilterStatusCounts(int subjectCount, int studyCount, int speciesCount, int productCount, int treatmentCount)
    {
        if (subjectCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(subjectCount, "Subject", "Subjects", true));
        }

        if (studyCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(studyCount, "Study", "Studies", true));
        }

        if (speciesCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(speciesCount, "Species", "Species", false));
        }

        if (productCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(productCount, "Product", "Products", false));
        }

        if (treatmentCount > -1)
        {
            _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(treatmentCount, "Treatment", "Treatments", false));
        }
    }

    @LogMethod
    public void assertVaccineTypeInfoPage(@LoggedParam String vaccineType, String vaccineInfo)
    {
        cds.viewInfo(vaccineType);

        Locator.CssLocator loc = Locator.css(".vaccine-single-body");
        _test.waitForElement(loc);
        _test.assertElementContains(loc, vaccineInfo);
        cds.closeInfoPage();
    }

    @LogMethod
    private void assertVaccineComponentInfoPage(@LoggedParam String vaccineComponent, String conponentInfo)
    {
        cds.viewInfo(vaccineComponent);
        _test.assertElementContains(Locator.css(".component-single-body"), conponentInfo);
        cds.closeInfoPage();
    }

}
