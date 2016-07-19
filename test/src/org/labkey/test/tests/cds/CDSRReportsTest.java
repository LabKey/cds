package org.labkey.test.tests.cds;

import org.jetbrains.annotations.Nullable;
import org.junit.Assume;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.cds.CDSHelper;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.Date;

@Category({})
public class CDSRReportsTest extends CDSReadOnlyTest
{

    private final String REPORT_NAME = "Simple CDS Report";
    private final CDSHelper cds = new CDSHelper(this);

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
    public void validateSimpleRReportViewerURL() throws MalformedURLException
    {

        // This is a report that has both a svg and img graphs.
        final String reportScript = "#PNG report\n" +
                "png(filename=\"${imgout:labkeyl_png}\")\n" +
                "plot(c(rep(25,100), 26:75), c(1:100, rep(1, 50)), ylab= \"L\", xlab=\"LabKey\",\n" +
                "\txlim= c(0, 100), ylim=c(0, 100), main=\"Simple Report by Automation\")\n\n" +
                "#SVG report\n" +
                "dev.off()\n" +
                "svg(\"${svgout:svg}\", width= 4, height=3)\n" +
                "plot(x=1:10,y=(1:10)^2, type='b')\n" +
                "dev.off()";
        Date date = new Date();
        String reportName = REPORT_NAME + " " + date.getTime();
        int reportId;

        goToHome();

        // fail fast if R is not configured
        _rReportHelper.ensureRConfig();

        goToHome();
        goToProjectHome();

        log("Go to the folder where the report will live.");
        clickFolder(getProjectName());

        log("Create an R Report in the current folder.");
        reportId = createReport("CDS", "assay", reportScript, reportName, true);

        log("Go to CDS and validate the report can be seen.");
        goToHome();
        goToProjectHome();
        cds.enterApplication();

        cds.viewLearnAboutPage("Studies");
        URL studiesUrl = getURL();
        String urlString = studiesUrl.toString();
        urlString = urlString + "?reportId=" + reportId;
        getDriver().navigate().to(urlString);

        log("Wait for the report container to render.");

        // Because of the way that CDS works any previous visits to learnview to view a report will create a separate instance of the element.
        // So need to make sure that we find one that does not have 'none' in one of the divs in the path.
        waitForElement(Locator.xpath("//div[contains(@class, 'learnview')]//span//div//div[not(contains(@style, 'none'))]//span//div//span//div[contains(@class, 'reportContent')]"));

        assertTextNotPresent("Failed to load report information.");

        log("Looks like the report was loaded. Time to go home.");

    }

    private int createReport(String schemaName, String queryName, @Nullable String reportScript, String reportName, boolean shareReport)
    {
        int reportId;
        String reportUrl;

        goToSchemaBrowser();
        selectQuery(schemaName, queryName);
        click(Locator.linkWithText("view data"));

        // Check to see if the report already exists. If it does, then just ignore this test.
        _extHelper.clickMenuButton("Reports");
        Assume.assumeFalse("Looks like the report is already there, going to skip the test.", isElementPresent(Locator.xpath("//span[@class='x4-menu-item-text'][text()='" + reportName + "']")));

        _extHelper.clickMenuButton("Reports", "Create R Report");

        if(null != reportScript)
            setCodeEditorValue("script-report-editor", reportScript);

        if(shareReport)
            _rReportHelper.selectOption(RReportHelper.ReportOption.shareReport);

        waitForElement(Locator.tagWithText("span","Save"));
        _rReportHelper.saveReport(reportName);

        waitForText("Query Schema Browser");

        log("Get the reportId from the URL");
        _extHelper.clickMenuButton("Reports", reportName);

        waitForText(reportName);

        reportUrl = getDriver().getCurrentUrl();

        reportId = getReportNumberFromUrl(reportUrl);

        log("Report created. Report ID: " + reportId);

        return reportId;
    }

    private int getReportNumberFromUrl(String url)
    {
        // The last part of the url looks like .reportId=db%3A# where # is the report id.
        // The call to substring(3) skips over the %3A in the url.
        final String REPORT_TAG = ".reportId=db";
        int index;
        String subString;

        index = url.indexOf(REPORT_TAG);
        subString = url.substring(index + REPORT_TAG.length()).substring(3);

        return Integer.parseInt(subString);
    }

}
