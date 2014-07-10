/*
 * Copyright (c) 2014 LabKey Corporation
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
package org.labkey.test.util;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;

public class CDSInitializer
{
    private final BaseWebDriverTest _test;
    private final CDSHelper _cds;
    private final String _project;
    private String[] _desiredStudies;
    private final String[] _emails;
    private final String[] _pictureFileNames;

    public CDSInitializer(BaseWebDriverTest test, String projectName, String[] emails, String[] pictureFileNames)
    {
        _test = test;
        _cds = new CDSHelper(_test);
        _project = projectName;
        _emails = emails;
        _pictureFileNames = pictureFileNames;
    }

    public void setDesiredStudies(String[] studies) {
        _desiredStudies = studies;
    }

    @LogMethod(category = LogMethod.MethodType.SETUP)
    public void setupDataspace()
    {
        setupProject();
        importData();
        populateFactTable();

        // TODO: Re-enable this check once the verify query has been fixed and re-linked in the management webpart
//        initTest.verifyFactTable();

        preCacheCube();
    }

    @LogMethod
    private void preCacheCube()
    {
        _cds.enterApplication();
        _cds.goToSummary();
        _test.waitForElement(CDSHelper.Locators.getByLocator("Studies"));
        _test.goToProjectHome();
    }

    @LogMethod
    private void setupProject()
    {
        _test._containerHelper.createProject(_project, "Dataspace");
        _test._containerHelper.enableModule(_project, "CDS");
        _test.goToManageStudy();
        _test.clickAndWait(Locator.linkWithText("Change Study Properties"));
        _test.waitForElement(Ext4Helper.Locators.radiobutton(_test, "DATE"));
        _test._ext4Helper.selectRadioButton("DATE");
        //We need to set the root study name to blank to hide it from mondrian (issue 19996)
        _test.setFormElement(Locator.name("Label"), "");
        _test.setFormElement(Locator.name("SubjectColumnName"), "SubjectId");
        _test.clickButton("Submit");

        _test.goToProjectHome();
    }

    @LogMethod
    private void importData()
    {
        for (String study : _desiredStudies)
        {
            importComponentStudy(study);
        }

        //Can't add web part until we actually have the datasets imported above
        _test.clickProject(_project);
        PortalHelper portalHelper = new PortalHelper(_test);
        portalHelper.addWebPart("CDS Management");

        importCDSData("Antigens", "antigens.tsv");
        importCDSData("Sites", "sites.tsv");
        importCDSData("People", "people.tsv");
        importCDSData("Citable", "citable.tsv");
        importCDSData("Citations", "citations.tsv");
        importCDSData("AssayPublications", "assay_publications.tsv");
        importCDSData("Vaccines", "vaccines.tsv");
        importCDSData("VaccineComponents", "vaccinecomponents.tsv");

        // prepare RSS news feed
        _test.goToSchemaBrowser();
        _test.selectQuery("announcement", "RSSFeeds");
        _test.waitForText("view data");
        _test.clickAndWait(Locator.linkContainingText("view data"));

        // insert test data feed
        _test.clickButton("Insert New");
        _test.setFormElement(Locator.name("quf_FeedName"), "Dataspace Test Feed");
        _test.setFormElement(Locator.name("quf_FeedURL"), CDSHelper.TEST_FEED);
        _test.clickButton("Submit");
        _test.assertTextPresent(CDSHelper.TEST_FEED);

        createPeoplePictureList(_emails, _pictureFileNames);

        _test.goToSchemaBrowser();
        _test.selectQuery("study", "StudyDesignAssays");
        _test.waitAndClickAndWait(Locator.linkWithText("edit metadata"));

        MetadataEditorHelper editor = new MetadataEditorHelper(_test);

        _test._listHelper.setColumnType(editor.getFieldIndexForName("LabPI"), new ListHelper.LookupInfo(null, "CDS", "People"));
        _test._listHelper.setColumnType(editor.getFieldIndexForName("Contact"), new ListHelper.LookupInfo(null, "CDS", "People"));
        _test._listHelper.setColumnType(editor.getFieldIndexForName("LeadContributor"), new ListHelper.LookupInfo(null, "CDS", "People"));
        editor.save();
    }

    @LogMethod
    private void importComponentStudy(String studyName)
    {
        _test._containerHelper.createSubfolder(_project, studyName, "Study");
        StudyImporter importer = new StudyImporter(_test);
        importer.zipAndImportStudy(BaseWebDriverTest.getSampleData(studyName + ".folder"));
    }

    @LogMethod
    private void importCDSData(String query, String dataFilePath)
    {
        _test.goToProjectHome();
        _test.waitForTextWithRefresh("Fact Table", _test.defaultWaitForPage * 4);  //wait for study to fully load
        _test.clickAndWait(Locator.linkWithText(query));
        _test._listHelper.clickImportData();

        _test.setFormElementJS(Locator.id("tsv3"), BaseWebDriverTest.getFileContents(BaseWebDriverTest.getSampleData(dataFilePath)));
        _test.clickButton("Submit");
    }

    @LogMethod
    public void populateFactTable()
    {
        _test.goToProjectHome();
        _test.clickAndWait(Locator.linkWithText("Populate Fact Table"));
        _test.uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "HIV Test Results"));
        _test.uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "Physical Exam"));
        _test.uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "Lab Results"));
        _test.uncheckCheckbox(Locator.checkboxByNameAndValue("dataset", "ParticipantTreatments"));
        _test.submit();

        _test.assertElementPresent(Locator.linkWithText("NAb"));
        _test.assertElementPresent(Locator.linkWithText("Luminex"));
        _test.assertElementPresent(Locator.linkWithText("MRNA"));
        _test.assertElementPresent(Locator.linkWithText("ADCC"));
        _test._ext4Helper.waitForMaskToDisappear();
    }

    @LogMethod
    public void createPeoplePictureList(String[] emails, String[] fileNames)
    {
        _test.goToProjectHome();
        ListHelper listHelper = new ListHelper(_test);
        ListHelper.ListColumn  personCol = new ListHelper.ListColumn("Person", "Person", ListHelper.ListColumnType.String, "Person Lookup", new ListHelper.LookupInfo(_project, "CDS", "People"));
        ListHelper.ListColumn  pictureCol = new ListHelper.ListColumn("Picture", "Picture", ListHelper.ListColumnType.Attachment, "Picture");

        listHelper.createList(_project, "PeoplePictures", ListHelper.ListColumnType.AutoInteger, "Key", personCol, pictureCol);
        _test.goToManageLists();
        _test.click(Locator.linkWithText("PeoplePictures"));

        for (int i = 0; i < emails.length; i++) {
            String email = emails[i];
            String fileName = fileNames[i];

            _test.clickButton("Insert New");
            _test.selectOptionByText(Locator.name("quf_Person"), email);
            _test.setFormElement(Locator.name("quf_Picture"), BaseWebDriverTest.getSampleData("/pictures/" + fileName));
            _test.clickButton("Submit");
        }

        _test.goToProjectHome();
    }
}
