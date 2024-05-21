package org.labkey.test.pages.cds;

import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class GroupDetailsPage extends LabKeyPage<GroupDetailsPage.ElementCache>
{
    public GroupDetailsPage(WebDriver driver)
    {
        super(driver);
        Ext4Helper.setCssPrefix("x-");
    }

    @Override
    public void waitForPage()
    {
        shortWait().until(ExpectedConditions.visibilityOf(elementCache().groupName));
    }

    public String getGroupName()
    {
        return elementCache().groupName.getText();
    }

    public String getGroupDescription()
    {
        return elementCache().groupDesc.getText();
    }

    public List<String> getGroupList()
    {
        return getTexts(elementCache().groupModuleGrid.findElements(getDriver()));
    }

    public GroupDetailsPage clickDeleteAndCancel()
    {
        clickDeleteGroup("Cancel");
        return this;
    }

    public void deleteGroup()
    {
        clickDeleteGroup("Delete");
        CDSHelper.NavigationLink.HOME.waitForReady(this);
    }

    private void clickDeleteGroup(String option)
    {
        elementCache().delete.click();
        WebElement window = Ext4Helper.Locators.window("Delete Group").waitForElement(getDriver(), 2_000);
        shortWait().until(ExpectedConditions.textToBePresentInElement(window, "Are you sure you want to delete \""));
        WebElement confirmButton = CDSHelper.Locators.cdsButtonLocator(option, "x-toolbar-item").findElement(window);
        confirmButton.click();
        shortWait().until(ExpectedConditions.invisibilityOf(window));
    }

    @Override
    protected GroupDetailsPage.ElementCache newElementCache()
    {
        return new GroupDetailsPage.ElementCache();
    }

    protected class ElementCache extends LabKeyPage<?>.ElementCache
    {
        private final WebElement groupName = Locator.tagWithClass("div", "studyname").refindWhenNeeded(this);
        private final WebElement groupDesc = Locator.tagWithClass("table", "group-description").refindWhenNeeded(this);
        private final Locator.XPathLocator groupModuleGrid = Locator.tagWithClassContaining("div", "groupslearnmodulegrid");

        private final WebElement editDetails = Locator.linkWithText("Edit details").findWhenNeeded(this);
        private final WebElement delete = Locator.linkWithText("Delete").findWhenNeeded(this);
    }
}
