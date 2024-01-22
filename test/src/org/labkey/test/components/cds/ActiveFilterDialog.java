package org.labkey.test.components.cds;

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.html.Input;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ActiveFilterDialog extends WebDriverComponent<Component.ElementCache>
{
    private final WebElement _activeFilterDialogEl;
    private final WebDriverWrapper _webDriverWrapper;

    public ActiveFilterDialog(BaseWebDriverTest test)
    {
        _webDriverWrapper = test;
        _activeFilterDialogEl = newElementCache().saveGroupEl.refindWhenNeeded(_webDriverWrapper.getDriver());
    }

    public void waitForSaveGroupDialog()
    {
        _webDriverWrapper.waitForElement(newElementCache().saveGroupEl);
    }

    @Override
    public WebElement getComponentElement()
    {
        return _activeFilterDialogEl;
    }

    @Override
    protected WebDriver getDriver()
    {
        return _webDriverWrapper.getDriver();
    }

    public ActiveFilterDialog setGroupName(String value)
    {
        newElementCache().groupName.set(value);
        return this;
    }

    public ActiveFilterDialog setGroupDescription(String value)
    {
        newElementCache().groupDescription.set(value);
        return this;
    }

    public ActiveFilterDialog setSharedGroup(boolean value)
    {
        if (value)
            _webDriverWrapper._ext4Helper.checkCheckbox(newElementCache().sharedGroup);
        return this;
    }

    public ActiveFilterDialog saveAsAGroup()
    {
        newElementCache().saveAsAGroup.click();
        return this;
    }

    public void cancel()
    {
        newElementCache().cancel.click();
    }

    public void saveGroup()
    {
        newElementCache().saveGroup.click();
    }

    public ActiveFilterDialog saveExpectingError(String errorMsg)
    {
        //TODO checks: Duplicate name, desc length, group name length
        doAndWaitForElementToRefresh(() -> newElementCache().saveGroup.click(), newElementCache().errorMsg, 10);
        Assert.assertEquals("Error message is not as expected", errorMsg, newElementCache().errorMsg.findElement(_activeFilterDialogEl).getText());
        return this;
    }

    public ActiveFilterDialog editGroup(String action, @Nullable String groupName, @Nullable String groupDesc, boolean shared)
    {
        newElementCache().editGroup.click();
        if (groupName != null)
            setGroupName(groupName);
        if (groupDesc != null)
            setGroupDescription(groupDesc);
        setSharedGroup(shared);

        newElementCache().save.click();
        _webDriverWrapper.waitAndClick(Locator.linkWithText(action));
        return this;
    }
    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    public class ElementCache extends Component<?>.ElementCache
    {
        Locator saveGroupEl = Locator.tagWithId("div", "filterstatus-id");
        Input groupName = new Input(Locator.name("groupname").findWhenNeeded(_activeFilterDialogEl), getDriver());
        Input groupDescription = new Input(Locator.textarea("groupdescription").findWhenNeeded(_activeFilterDialogEl), getDriver());
        Locator.XPathLocator sharedGroup = Locator.xpath("//input[contains(@id,'creategroupshared')]");

        final WebElement clear = Locator.linkWithText("Clear").findWhenNeeded(_activeFilterDialogEl);
        final WebElement cancel = Locator.linkWithText("Cancel").findWhenNeeded(_activeFilterDialogEl);
        final WebElement saveAsAGroup = Locator.linkWithText("Save as a group").findWhenNeeded(_activeFilterDialogEl);
        final WebElement save = Locator.linkWithText("Save").findWhenNeeded(_activeFilterDialogEl);
        final WebElement saveGroup = Locator.linkWithText("Save group").findWhenNeeded(_activeFilterDialogEl);
        final WebElement editGroup = Locator.linkWithText("Edit group").findWhenNeeded(_activeFilterDialogEl);
        final Locator errorMsg = Locator.tagWithClass("div", "errormsg");

    }
}
