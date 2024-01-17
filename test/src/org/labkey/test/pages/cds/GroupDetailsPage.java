package org.labkey.test.pages.cds;

import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class GroupDetailsPage extends LabKeyPage<LabKeyPage.ElementCache>
{
    public GroupDetailsPage(WebDriver driver)
    {
        super(driver);
        waitForPage();
    }

    @Override
    public void waitForPage()
    {
        _test.waitForText("Edit details");
    }

    public String getGroupName()
    {
        return newElementCache().groupName.getText();
    }

    public String getGroupDescription()
    {
        return newElementCache().groupDesc.getText();
    }

    public GroupDetailsPage deleteGroup(String option)
    {
        newElementCache().delete.click();
        Ext4Helper.Locators.windowButton("Delete Group", option);
        return this;
    }
    @Override
    protected GroupDetailsPage.ElementCache newElementCache()
    {
        return new GroupDetailsPage.ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        private final WebElement groupName = Locator.tagWithClass("div","studyname").findWhenNeeded(this);
        private final WebElement groupDesc = Locator.tag("div").findWhenNeeded(this); //Update after product change

        private final WebElement editDetails = Locator.linkWithText("Edit details").findWhenNeeded(this);
        private final WebElement delete = Locator.linkWithText("Delete").findWhenNeeded(this);
    }
}
