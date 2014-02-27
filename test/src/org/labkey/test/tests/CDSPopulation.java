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
package org.labkey.test.tests;

import org.junit.experimental.categories.Category;
import org.labkey.test.BaseSeleniumWebTest;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.NoSuite;
import org.labkey.test.util.PostgresOnlyTest;

import java.io.File;

/**
 * User: kristinf
 * Date: April 26, 2012
 */
@Category(NoSuite.class)
public class CDSPopulation extends BaseSeleniumWebTest implements PostgresOnlyTest
{
    private static final String PROJECT_NAME = "Dataspace";
    private static final File STUDY_ZIP = new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/notforcheckin/cds_data.folder.zip");

    @Override
    public String getAssociatedModuleDirectory()
    {
        return "server/modules/CDS";
    }

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        deleteProject(getProjectName(), afterTest);
    }

    @Override
    public void doTestSteps()
    {
        _containerHelper.createProject(PROJECT_NAME, "Study");
        importStudyFromZip(STUDY_ZIP);
        enableModule(PROJECT_NAME, "CDS");

        importCDSData("Antigens", new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/antigens.tsv"));
        importCDSData("Labs", new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/notforcheckin/labs.tsv"));
        importCDSData("People", new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/notforcheckin/people.tsv"));
        importCDSData("Assays", new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/notforcheckin/cds_assays.txt"));
        importCDSData("Studies", new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/notforcheckin/cds_studies.txt"));
        importCDSData("AssayPublications", new File(BaseSeleniumWebTest.getSampledataPath(), "CDS/notforcheckin/assay_publications.tsv"));

        populateFactTable();
        verifyCDSApplication();
    }

    private void verifyCDSApplication()
    {
//        selenium.windowMaximize(); // Count bars don't render properly when hidden.
        clickProject(PROJECT_NAME);
        goToModule("CDS");

        clickAndWait(Locator.linkWithText("Application"));

        assertLinkNotPresentWithText("Home");
        assertLinkNotPresentWithText("Admin");
    }

    private void importCDSData(String query, File dataFile)
    {
        goToModule("CDS");
        clickAndWait(Locator.linkWithText(query));
        _listHelper.clickImportData();

        setFormElement(Locator.id("tsv3"), getFileContents(dataFile), true);
        clickButton("Submit");
    }

    private void populateFactTable()
    {
        goToModule("CDS");
        clickAndWait(Locator.linkWithText("Populate Fact Table"));
        submit();
    }

    private void goToAppHome()
    {
        clickAt(Locator.xpath("//div[contains(@class, 'connectorheader')]//div[contains(@class, 'logo')]"), "1,1");
        waitForElement(Locator.xpath("//div[contains(@class, 'connectorheader')]//div[contains(@class, 'logo')]/h2/br"), BaseSeleniumWebTest.WAIT_FOR_JAVASCRIPT);
    }

    private class CDSTester
    {

    }
}
