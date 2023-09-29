package org.labkey.test.tests.cds;

import org.junit.Assert;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.util.cds.CDSHelper;
import org.labkey.test.util.core.webdav.WebDavUploadHelper;

import java.io.File;
import java.util.Arrays;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 5)
public class CDSStaticBlogsOnPublicPageTest extends CDSReadOnlyTest
{
    private final CDSHelper cds = new CDSHelper(this);
    protected static final File PUBLIC_FOLDER = TestFileUtils.getSampleData("/dataspace/publicPage");

    @Test
    public void testSteps()
    {
        goToHome();
        goToModule("FileContent");
        new WebDavUploadHelper(getCurrentContainerPath()).uploadDirectory(PUBLIC_FOLDER);

        goToProjectHome();
        cds.enterApplication();
        cds.logOutFromApplication();

        Locator moveDown = Locator.tagWithClass("a", "circle move-section-down");
        waitForElement(moveDown);
        cds.clickHelper(moveDown.findElement(getDriver()), () -> waitForText("10", "Assays"));
        Assert.assertEquals("Always growing statistics is incorrect", "94\n" +
                "Products\n" +
                "55\n" +
                "Studies\n" +
                "8277\n" +
                "Subjects\n" +
                "10\n" +
                "Assays", Locator.tagWithClass("div", "pill").findElement(getDriver()).getText());

        cds.clickHelper(moveDown.index(1).findElement(getDriver()), () -> waitForText("Recent Blog Posts"));
        Assert.assertTrue("News section is missing", isElementPresent(Locator.tagWithText("h1", "News")));
        Assert.assertEquals("Incorrect number of thumbnails", 4,
                Locator.tag("a").findElements(Locator.tagWithClass("tr", "thumbnail").findElement(getDriver())).size());
        Assert.assertEquals("Incorrect blog publication dates", Arrays.asList("August 11, 2023", "July 25, 2023", "March 17, 2014", "January 28, 2014"),
                getTexts(Locator.tag("td").findElements(Locator.tagWithClass("tr", "pub-date").findElement(getDriver()))));
        Assert.assertEquals("Incorrect blog titles", Arrays.asList("Getting Started with Lab Inventory Tracking",
                        "What's New in LabKey 23.7", "Release: LabKey Server v14.1", "Article: MedCity covers the LabKey story: \"Open-sourced in Seattle\""),
                getTexts(Locator.tag("td").findElements(Locator.tagWithClass("tr", "blog-title").findElement(getDriver()))));
        clickAndWait(Locator.linkWithId("thumbnail1"));
        Assert.assertEquals("Incorrect navigation after thumbnail is clicked", "https://www.labkey.com/lab-inventory-tracking/", getURL().toString());
    }
}
