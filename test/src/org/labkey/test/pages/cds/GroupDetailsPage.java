package org.labkey.test.pages.cds;

import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.cds.CDSHelper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class GroupDetailsPage extends LabKeyPage<GroupDetailsPage.ElementCache>
{
    public GroupDetailsPage(WebDriver driver)
    {
        super(driver);
    }

    @Override
    public void waitForPage()
    {
        waitForText("Edit details");
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

    public GroupDetailsPage deleteGroup(String option)
    {
        newElementCache().delete.click();
        CDSHelper.Locators.cdsButtonLocator(option, "x-toolbar-item").notHidden().findElement(getDriver()).click();
        return this;
    }

    @Override
    protected GroupDetailsPage.ElementCache newElementCache()
    {
        return new GroupDetailsPage.ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        private final WebElement groupName = Locator.tagWithClass("div", "studyname").refindWhenNeeded(this);
        private final WebElement groupDesc = Locator.tagWithId("table", "group-description-id").refindWhenNeeded(this);
        private final Locator.XPathLocator groupModuleGrid = Locator.tagWithClassContaining("div", "groupslearnmodulegrid");

        private final WebElement editDetails = Locator.linkWithText("Edit details").findWhenNeeded(this);
        private final WebElement delete = Locator.linkWithText("Delete").findWhenNeeded(this);
    }
}
