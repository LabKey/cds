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
package org.labkey.test.tests.cds;

import org.apache.commons.lang3.StringUtils;
import org.junit.Assert;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.pages.cds.LearnGrid.LearnTab;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebElement;

import java.net.MalformedURLException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.cds.CDSHelper.NAB_MAB_DILUTION_REPORT;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 24)
public class CDSRReportsTest extends CDSReadOnlyTest
{

    private final String REPORT_NAME = "Simple CDS Report";
    private final CDSHelper cds = new CDSHelper(this);

    // This is a report that has both a svg and img graphs.
    private final String REPORT_SCRIPT = "#PNG report\n" +
            "png(filename=\"${imgout:labkeyl_png}\")\n" +
            "plot(c(rep(25,100), 26:75), c(1:100, rep(1, 50)), ylab= \"L\", xlab=\"LabKey\",\n" +
            "\txlim= c(0, 100), ylim=c(0, 100), main=\"Simple Report by Automation\")\n\n" +
            "#SVG report\n" +
            "dev.off()\n" +
            "svg(\"${svgout:svg}\", width= 4, height=3)\n" +
            "plot(x=1:10,y=(1:10)^2, type='b')\n" +
            "dev.off()";

    private RReportHelper _rReportHelper = new RReportHelper(this);

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
    public void validateViewReportBasic() throws MalformedURLException
    {

        Date date = new Date();
        String reportName = REPORT_NAME + " " + date.getTime();

        goToHome();

        // fail fast if R is not configured
        _rReportHelper.ensureRConfig();

        goToHome();
        goToProjectHome();

        log("Go to the folder where the report will live.");
        clickFolder(getProjectName());

        log("Create an R Report in the current folder.");
        cds.createReport(_rReportHelper, getProjectName() + "/query-begin.view?#sbh-qdp-%26CDS%26assay", REPORT_SCRIPT, reportName, true);

        log("Go to CDS and validate the report can be seen in the grid.");
        goToProjectHome();
        cds.enterApplication();

        cds.viewLearnAboutPage(LearnTab.REPORTS);

        assertTextPresent(reportName);
        Assert.assertFalse("MAb reports shouldn't be visible in Learn About", isElementPresent(Locator.tagWithText("h2", NAB_MAB_DILUTION_REPORT)));

        log("Load the report.");
        click(Locator.tagWithText("h2", reportName));
        _ext4Helper.waitForMaskToDisappear();
        waitForElement(Locator.xpath("//div[@class='reportView']"));

        assertElementPresent("Header did not change to report name.", CDSHelper.Locators.studyname.withText(reportName), 1);
        assertElementNotPresent("It looks like there is a description tag for this report but there should not be.", Locator.xpath("//td[@class='learn-report-header-column']/h3[text()='Description']/following-sibling::p"));

        log("Validate that one img tag is shown for this report.");
        waitForElement(Locator.xpath("//table[@class='labkey-output']//img[@name='resultImage']"));
        assertElementPresent(Locator.xpath("//table[@class='labkey-output']//img[@name='resultImage']"), 1);

        log("Validate that one svg tag is shown for this report.");
        assertElementPresent(Locator.css("table[class='labkey-output'] tbody tr td svg"), 1);

        log("Looks like the report was loaded. Time to go home.");
        goToHome();
    }

    @Test
    public void validateViewReportComplex() throws MalformedURLException
    {
        final String LONG_STRING = "This is a \"long\" string." + StringUtils.repeat("a", 7200);

        // Setting categories has proven to be very unreliable. It's not relevant to the test so those parts have been commented out.

        Date date = new Date();
//        String[] categoryNames = {"Automation_A", "Automation_B"};
        String[] reports = {"A " + REPORT_NAME, "B " + REPORT_NAME, "C " + REPORT_NAME, "D " + REPORT_NAME, "E " + REPORT_NAME};

        String[] descriptions = {"Tr\u00ef\u00e7k\u00ff \u00c7h\u00e5r\u00a7",
                "This is a a very basic type of description.\nBut there is a line break in it.",
                "",
                LONG_STRING,
                "Here is some description with a link to <a href=\"www.amazon.com\">amazon</a>."
        };

        int[] reportCounts = {0, 0, 0, 0, 0};

        goToHome();
        sleep(500);

        // fail fast if R is not configured
        _rReportHelper.ensureRConfig();

//        log("Create some categories.");
//        createCategory(categoryNames[0], categoryNames[1]);

        goToHome();
        goToProjectHome();

        log("Go to the folder where the report will live.");
        clickFolder(getProjectName());

        log("Create an couple of R Reports in the current folder.");
        for (int i = 0; i < reports.length; i++)
        {
            reports[i] = reports[i] + " " + date.getTime();
            cds.createReport(_rReportHelper, getProjectName() + "/query-begin.view?#sbh-qdp-%26CDS%26assay", REPORT_SCRIPT, reports[i], true);
            sleep(500);
        }

        goToProjectHome();
        clickTab("Clinical and Assay Data");
        sleep(2000);
        click(Locator.tag("a").withAttributeContaining("href", "editDataViews"));
        sleep(2000);

        // Wait for the grid to load at least 5 items (the number of reports created for this test) before starting to check.
        // Can't use the waitForElement library because it expects an exact number of elements. Because other tests may have created reports/plots, we can not be sure of the total in the grid.
        waitFor(() -> 5 <= Locator.xpath("//table[@role='presentation']//tr[@role='row']").findElements(getDriver()).size(), WAIT_FOR_JAVASCRIPT);

        ReportProperties reportProperties;

        log("Validate report '" + reports[0] + "' is there and then set it's properties.");
        assertTextPresent(reports[0]);
        reportProperties = new ReportProperties(reports[0]);
//        reportProperties.setCategory(categoryNames[0])
        reportProperties.setDescription(descriptions[0])
                .setStatus(ReportStatus.DRAFT)
                .clickSave();
        _ext4Helper.waitForMaskToDisappear();

        log("Validate report '" + reports[1] + "' is there and then set it's properties.");
        assertTextPresent(reports[1]);
        reportProperties = new ReportProperties(reports[1]);
//        reportProperties.setCategory(categoryNames[0])
        reportProperties.setDescription(descriptions[1])
                .setStatus(ReportStatus.FINAL)
                .clickSave();
        _ext4Helper.waitForMaskToDisappear();

        log("Validate report '" + reports[2] + "' is there and then set it's properties.");
        assertTextPresent(reports[2]);
        reportProperties = new ReportProperties(reports[2]);
//        reportProperties.setCategory(categoryNames[1])
        reportProperties.setStatus(ReportStatus.NONE)
                .clickSave();
        _ext4Helper.waitForMaskToDisappear();

        log("Validate report '" + reports[3] + "' is there and then set it's properties.");
        assertTextPresent(reports[3]);
        reportProperties = new ReportProperties(reports[3]);
//        reportProperties.setCategory(categoryNames[1])
        reportProperties.setDescription(descriptions[3])
                .setStatus(ReportStatus.LOCKED)
                .clickSave();
        _ext4Helper.waitForMaskToDisappear();

        log("Validate report '" + reports[4] + "' is there and then set report to be hidden.");
        assertTextPresent(reports[4]);
        reportProperties = new ReportProperties(reports[4]);
//        reportProperties.setCategory(categoryNames[1])
        reportProperties.setDescription(descriptions[4])
                .setStatus(ReportStatus.UNLOCKED)
                .setVisibility("Hidden")
                .clickSave();
        _ext4Helper.waitForMaskToDisappear();

        log("Go to CDS and validate the report can be seen.");
        goToHome();
        goToProjectHome();
        cds.enterApplication();

        LearnGrid grid = cds.viewLearnAboutPage(LearnTab.REPORTS);

        for (int i = 0; i < reports.length - 1; i++)
        {
            log("Validate that report '" + reports[i] + "' is visible in the CDS grid.");
            assertTextPresent(reports[i]);
        }

        log("Validate the hidden report is not visible in CDS grid");
        assertTextNotPresent(reports[reports.length - 1]);

        log("Now validate individual aspects of the reports in CDS.");
        log("Number of reports shown: " + grid.getRowCount());

        List<String> gridText = grid.getGridText();
        assertTrue("No text values were returned for the grid rows.", gridText.size() > 0);

        log("Look at the data for the report as it appears in the grid.");

        for (int i = 0; i < gridText.size(); i++)
        {
            // This list may contain more than the reports created in this test. So specifically look for the reports created in this test.
            if (gridText.get(i).contains(reports[0]))
            {
                assertTrue("Description for report '" + reports[0] + "' not as expected.", gridText.get(i).contains(descriptions[0]));
//                Assert.assertTrue("Category for report '" + reports[0] + "' not as expected.", gridText.get(i).contains(categoryNames[0]));
                reportCounts[0] = reportCounts[0] + 1;
            }
            if (gridText.get(i).contains(reports[1]))
            {
                assertTrue("Description for report '" + reports[1] + "' not as expected.", gridText.get(i).contains(descriptions[1].replace("\n", " ")));
//                Assert.assertTrue("Category for report '" + reports[1] + "' not as expected.", gridText.get(i).contains(categoryNames[0]));
                reportCounts[1] = reportCounts[1] + 1;
            }
            if (gridText.get(i).contains(reports[2]))
            {
//                Assert.assertTrue("Category for report '" + reports[2] + "' not as expected.", gridText.get(i).contains(categoryNames[1]));
                reportCounts[2] = reportCounts[2] + 1;
            }
            if (gridText.get(i).contains(reports[3]))
            {
                assertTrue("Description for report '" + reports[3] + "' not as expected.", gridText.get(i).contains(descriptions[3]));
//                Assert.assertTrue("Category for report '" + reports[3] + "' not as expected.", gridText.get(i).contains(categoryNames[1]));
                reportCounts[3] = reportCounts[3] + 1;
            }
        }

        log("Validate that the report was present the expected number of times.");
        for (int i = 0; i < reportCounts.length - 1; i++)
        {
            assertTrue("Expected to find report '" + reports[i] + "' 1 time, found it " + reportCounts[i] + " times.", reportCounts[i] == 1);
        }

        for (int i = 0; i < reports.length - 1; i++)
        {
            log("Load the report '" + reports[i] + "' and check the detail page for it.");
            scrollIntoView(Locator.tagWithText("h2", reports[i]));
            click(Locator.tagWithText("h2", reports[i]));
            _ext4Helper.waitForMaskToDisappear();
            waitForElements(Locator.xpath("//table[@class='labkey-output']"), 3);

            assertElementPresent("Header did not change to report name.", CDSHelper.Locators.studyname.withText(reports[i]), 1);
            if (i != 2)
            {
                assertElementPresent("Did not find the expected description tag for this report.", Locator.xpath("//td[@class='learn-report-header-column']/h3[text()='Description']/following-sibling::p[text()='" + descriptions[i] + "']"), 1);
            }
            else
            {
                assertElementNotPresent("It looks like there is a description tag for this report but there should not be.", Locator.xpath("//td[@class='learn-report-header-column']/h3[text()='Description']/following-sibling::p"));
            }


            log("Validate that one img tag is shown for this report.");
            assertElementPresent(Locator.xpath("//table[@class='labkey-output']//img[@name='resultImage']"), 1);

            log("Validate that one svg tag is shown for this report.");
            assertElementPresent(Locator.css("table[class='labkey-output'] tbody tr td svg"), 1);

            cds.viewLearnAboutPage(LearnTab.REPORTS);

        }

        log("Looks like the report was loaded. Time to go home.");

    }

    private void createCategory(String... categoryNames)
    {
        final String XPATH_TO_DIALOG = "//div[contains(@class, 'data-window')]//div[contains(@class, 'x4-window-header')]//span[text()='Manage Categories']/ancestor::div[contains(@class, 'data-window')]";
        goToHome();
        goToProjectHome();

        goToManageViews();

        click(Locator.linkContainingText("Manage Categories"));

        waitForElement(Locator.xpath(XPATH_TO_DIALOG + "//div[contains(@class, 'x4-toolbar')]//span[text()='New Category']"));

        for (String category : categoryNames)
        {
            // If the category does not exists create it.
            if (!isElementPresent(Locator.xpath(XPATH_TO_DIALOG + "//td[@role='gridcell']//div[text()='" + category + "']")))
            {
                clickButton("New Category", 0);
                WebElement newCategoryField = Locator.xpath("//input[contains(@id, 'textfield') and @name='label']").notHidden().waitForElement(getDriver(), WAIT_FOR_JAVASCRIPT);
                // Previously was calling:  setFormElement(newCategoryField, category);
                // However that started failing recently (11/1/2016) and consistently on TeamCity. Maybe new chrome driver is cause?
                // The change below did pass with a personal build on TC. However if this continues to fail I would recommend commenting out the "category" part of the test.
                newCategoryField.clear();
                newCategoryField.sendKeys(category);
                sleep(1000);
                fireEvent(newCategoryField, SeleniumEvent.blur);
                sleep(1000);
                waitForElement(Locator.xpath(XPATH_TO_DIALOG + "//td[@role='gridcell']//div[text()='" + category + "']"));
            }
        }

        clickButton("Done", 0);

    }

    // Incomplete. Should add other fields and an option to change the icons.
    public class ReportProperties{

        private final String XPATH_CHECKBOX = "//label[text()='Share this report with all users?']/preceding-sibling::input[@type='button']";

        private ReportProperties(String reportName)
        {
            click(Locator.xpath("//a[text()='" + reportName + "']/ancestor::tr[@role='row']//td//span[contains(@class, 'edit-views-link')]"));
            waitForElement(Locator.xpath("//div[contains(@class, 'data-window')]//div[contains(@class, 'x4-toolbar')]//span[text()='Save']"));
        }

        public String getName()
        {
            return getFormElement(Locator.xpath("//input[@name='viewName']"));
        }

        public ReportProperties setName(String reportName)
        {
            setFormElement(Locator.xpath("//input[@name='viewName']"), reportName);
           return this;
        }

        public ReportProperties setStatus(ReportStatus status)
        {
            String statusString;
            switch(status)
            {
                case DRAFT:
                    statusString = "Draft";
                    break;
                case FINAL:
                    statusString = "Final";
                    break;
                case LOCKED:
                    statusString = "Locked";
                    break;
                case UNLOCKED:
                    statusString = "Unlocked";
                    break;
                case NONE:
                default:
                    statusString = "None";
                    break;
            }
            _ext4Helper.selectComboBoxItem("Status", statusString);
            return this;
        }

        public ReportProperties setCategory(String categoryName)
        {
            _ext4Helper.selectComboBoxItem("Category", categoryName);
            return this;
        }

        public ReportProperties setDescription(String description)
        {
            setFormElement(Locator.textarea("description"), description);
            return this;
        }

        public ReportProperties setSharedCheckbox(boolean checked)
        {
            if (checked)
                _ext4Helper.checkCheckbox(Locator.xpath(XPATH_CHECKBOX));
            else
                _ext4Helper.checkCheckbox(Locator.xpath(XPATH_CHECKBOX));

            return this;
        }

        public boolean getSharedCheckbox()
        {
            return _ext4Helper.isChecked(Locator.xpath(XPATH_CHECKBOX));
        }

        public ReportProperties setVisibility(String option)
        {
            _ext4Helper.selectRadioButton("Visibility", option);
            return this;
        }

        public void clickSave()
        {
            clickButton("Save", 0);
        }

    }

    public enum ReportStatus{
        NONE,
        DRAFT,
        FINAL,
        LOCKED,
        UNLOCKED
    }
}
