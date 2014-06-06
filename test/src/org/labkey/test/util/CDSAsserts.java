package org.labkey.test.util;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.AssayDetailsPage;
import org.labkey.test.pages.StudyDetailsPage;
import org.labkey.test.tests.CDSTest;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
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
        assertCDSPortalRow("Subject characteristics", "32 subject characteristics", "3 countries", "2 sexes", "2 hiv infection statuses", "1 species", "6 races & subtypes");
        assertCDSPortalRow("Study products", "3 study products");
        assertCDSPortalRow("Labs", "3 labs");
        assertCDSPortalRow("Assays", "4 assays", "3 target areas", "3 methodologies");
        assertCDSPortalRow("Studies", "4 studies");
    }

    private void assertCDSPortalRow(String byNoun, String expectedTotal, String... expectedDetails)
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

    private void assertSelectionStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int assayCount, int contributorCount, int antigenCount, int maxCount)
    {
        cds.selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, assayCount);
        _test.waitForElement(CDSHelper.Locators.filterMemberLocator(filteredLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    // Sequential calls to this should have different subject counts.
    private void assertFilterStatusPanel(String barLabel, String filteredLabel, int subjectCount, int studyCount, int assayCount, int contributorCount, int antigenCount, int maxCount)
    {
        cds.selectBars(barLabel);
        assertFilterStatusCounts(subjectCount, studyCount, assayCount);
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
        cds.waitForBarToAnimate(noun);
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
    public void assertParticipantIds(String groupName, String[] membersIncluded, String[] membersExcluded)
    {
        _test.waitForText(groupName);

        String ids = _test._studyHelper.getParticipantIds(groupName, "Participant");
        if (membersIncluded != null)
            for (String member : membersIncluded)
                assertTrue(ids.contains(member));

        if (membersExcluded != null)
            for (String member : membersExcluded)
                assertFalse(ids.contains(member));
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

    public void verifyLearnAboutPage(List<String> axisItems)
    {
        for (String item : axisItems)
        {
            _test.waitForElement(Locator.tagWithClass("div", "detail-wrapper").append("/div/div/h2").withText(item));
        }
        _test.assertElementPresent(Locator.tagWithClass("div", "detail-wrapper"), axisItems.size());
    }

    public void assertDefaultFilterStatusCounts(CDSTest _test)
    {
        assertFilterStatusCounts(29, 4, 4);
    }

    public void assertSelectionStatusCounts(int subjectCount, int studyCount, int assayCount)
    {
        _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(subjectCount, "Subject"));
        _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(studyCount, "Stud"));
        _test.waitForElement(CDSHelper.Locators.getSelectionStatusLocator(assayCount, "Assays"));
    }

    public void assertFilterStatusCounts(int subjectCount, int studyCount, int assayCount)
    {
        _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(subjectCount, "Subject", "Subjects", true));
        _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(studyCount, "Study", "Studies", true));
        _test.waitForElement(CDSHelper.Locators.getFilterStatusLocator(assayCount, "Assay", "Assays", true));
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
