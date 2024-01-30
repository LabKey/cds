package org.labkey.test.components.cds;

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.html.Input;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ActiveFilterDialog extends WebDriverComponent<ActiveFilterDialog.ElementCache>
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
        _webDriverWrapper.waitForElement(elementCache().saveGroupEl);
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
        elementCache().groupName.set(value);
        return this;
    }

    public ActiveFilterDialog setGroupDescription(String value)
    {
        elementCache().groupDescription.set(value);
        return this;
    }

    public ActiveFilterDialog setSharedGroup(boolean value)
    {
        if (value)
            _webDriverWrapper._ext4Helper.checkCheckbox(elementCache().sharedGroup);
        return this;
    }

    public ActiveFilterDialog saveAsAGroup()
    {
        elementCache().saveAsAGroup.click();
        return this;
    }

    public void cancel()
    {
        elementCache().cancel.click();
    }

    public void saveGroup()
    {
        elementCache().saveGroup.click();
        _webDriverWrapper.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(Locator.tagWithId("div", "savedgroupname-id")
                .withAttributeContaining("style", "display: none")));
    }

    public ActiveFilterDialog saveExpectingError(String errorMsg)
    {
        elementCache().saveGroup.click();
        _webDriverWrapper.shortWait().until(ExpectedConditions.visibilityOfElementLocated(elementCache().errorMsg));
        Assert.assertEquals("Error message is not as expected", errorMsg, elementCache().errorMsg.findElement(_activeFilterDialogEl).getText());
        return this;
    }

    public void clear()
    {
        elementCache().clear.click();
        _webDriverWrapper.waitForElement(elementCache().undo);
    }

    public ActiveFilterDialog editGroup(String action, @Nullable String groupName, @Nullable String groupDesc, boolean shared)
    {
        try
        {
            elementCache().editGroup.click();
        }
        catch (NoSuchElementException e)
        {
            elementCache().saveAs.click();
        }
        if (groupName != null)
            setGroupName(groupName);
        if (groupDesc != null)
            setGroupDescription(groupDesc);
        setSharedGroup(shared);

        elementCache().save.click();
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
        final WebElement clear = Locator.linkWithText("clear").findWhenNeeded(_activeFilterDialogEl);
        final Locator.XPathLocator undo = Locator.linkWithText("Undo");
        final WebElement cancel = Locator.linkWithText("Cancel").findWhenNeeded(_activeFilterDialogEl);
        final WebElement saveAsAGroup = Locator.linkWithText("Save as a group").findWhenNeeded(_activeFilterDialogEl);
        final WebElement save = Locator.linkWithText("Save").refindWhenNeeded(_activeFilterDialogEl);
        final WebElement saveGroup = Locator.linkWithText("Save group").findWhenNeeded(_activeFilterDialogEl);
        final WebElement editGroup = Locator.linkWithText("Edit group").findWhenNeeded(_activeFilterDialogEl);
        final WebElement saveAs = Locator.linkWithText("Save as").findWhenNeeded(_activeFilterDialogEl);
        final Locator errorMsg = Locator.tagWithClass("div", "errormsg");
        Locator saveGroupEl = Locator.tagWithId("div", "filterstatus-id");
        Input groupName = new Input(Locator.name("groupname").findWhenNeeded(_activeFilterDialogEl), getDriver());
        Input groupDescription = new Input(Locator.textarea("groupdescription").findWhenNeeded(_activeFilterDialogEl), getDriver());
        Locator.XPathLocator sharedGroup = Locator.xpath("//input[contains(@id,'creategroupshared')]");

    }
}
