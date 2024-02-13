package org.labkey.test.components.cds;

import org.jetbrains.annotations.Nullable;
import org.junit.Assert;
import org.labkey.test.Locator;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.ext4.Checkbox;
import org.labkey.test.components.html.Input;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ActiveFilterDialog extends WebDriverComponent<ActiveFilterDialog.ElementCache>
{
    private final WebElement _activeFilterDialogEl;
    private final WebDriver _driver;

    public ActiveFilterDialog(WebDriver driver)
    {
        _driver = driver;
        _activeFilterDialogEl = Locator.tagWithId("div", "filterstatus-id").findElement(this.getDriver());
    }
    @Override
    protected WebDriver getDriver()
    {
        return _driver;
    }

    public String getGroupName()
    {
        return elementCache().groupName.get();
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
            elementCache().sharedGroup.check();
        else
            elementCache().sharedGroup.uncheck();
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
        getWrapper().shortWait().until(ExpectedConditions.elementToBeClickable(elementCache().saveGroup));
        elementCache().saveGroup.click();
        try
        {
            getWrapper().waitForElement(Locator.linkWithText(getGroupName()));
        }
        catch (NoSuchElementException e)
        {
            elementCache().saveGroup.click();
        }
        getWrapper().waitForElement(Locator.linkWithText(getGroupName()));
    }

    public ActiveFilterDialog saveExpectingError(String errorMsg)
    {
        getWrapper().shortWait().until(ExpectedConditions.elementToBeClickable(elementCache().saveGroup));
        elementCache().saveGroup.click();
        try
        {
            getWrapper().waitForElement(elementCache().errorMsg);
        }
        catch (NoSuchElementException e)
        {
            elementCache().saveGroup.click();
        }
        getWrapper().shortWait().until(ExpectedConditions.visibilityOfElementLocated(elementCache().errorMsg));
        Assert.assertEquals("Error message is not as expected", errorMsg, elementCache().errorMsg.findElement(_activeFilterDialogEl).getText());
        return this;
    }

    public void clear()
    {
        elementCache().clear.click();
        getWrapper().waitForElement(elementCache().undo);
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
        getWrapper().waitAndClick(Locator.linkWithText(action));
        return this;
    }

    @Override
    public WebElement getComponentElement()
    {
        return _activeFilterDialogEl;
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
        Input groupName = new Input(Locator.name("groupname").findWhenNeeded(_activeFilterDialogEl), getDriver());
        Input groupDescription = new Input(Locator.textarea("groupdescription").findWhenNeeded(_activeFilterDialogEl), getDriver());
        Checkbox sharedGroup = new Checkbox(Locator.xpath("//input[contains(@id,'creategroupshared')]").findWhenNeeded(getDriver()));
    }
}
