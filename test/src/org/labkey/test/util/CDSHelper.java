package org.labkey.test.util;

import org.jetbrains.annotations.Nullable;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static com.sun.jna.Platform.isMac;

public class CDSHelper
{
    public static final String[] STUDIES = {"DemoSubset", "Not Actually CHAVI 001", "NotCHAVI008", "NotRV144"};
    public static final String[] LABS = {"Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab"};
    public static final String[] ASSAYS = {"Fake ADCC data", "Fake Luminex data", "mRNA assay", "Fake NAb data"};
    public static final String TEST_FEED = WebTestHelper.getBaseURL() + "/Connector/test/testfeed.xml";
    public final static int CDS_WAIT = 1500;
    private final BaseWebDriverTest _test;

    public CDSHelper(BaseWebDriverTest test)
    {
        _test = test;
    }

    @LogMethod(quiet = true)
    public void enterApplication()
    {
        _test.goToProjectHome();
        _test.clickAndWait(Locator.linkWithText("Application"));
        _test.addUrlParameter("maxRows=1000");
        _test.addUrlParameter("_showPlotData=true");

        _test.assertElementNotPresent(Locator.linkWithText("Home"));
        _test.waitForElement(Locator.tagContainingText("h1", "Welcome to the HIV Vaccine"));
        _test.assertElementNotPresent(Locator.linkWithText("Admin"));
        Ext4Helper.setCssPrefix("x-");
    }

    @LogMethod(quiet = true)
    public void pickSort(@LoggedParam String sortBy)
    {
        _test.click(Locator.css(".sortDropdown"));
        _test.waitAndClick(Locator.xpath("//span[text()='" + sortBy + "' and contains(@class, 'x-menu-item-text')]"));
    }

    public void pickSort(String sort, String waitValue)
    {
        pickSort(sort);
        _test.waitForText(waitValue, CDS_WAIT);
    }

    public void pickDimension(String dimension)
    {
        _test.click(Locators.cdsDropDownButtonLocator("dimselectdrop"));
        _test.waitAndClick(Locator.xpath("//span[@class='x-menu-item-text' and text()='" + dimension + "']"));
    }

    public void waitForFilterAnimation()
    {
        Locator floatingFilterLoc = Locator.css(".barlabel.selected");
        _test.waitForElementToDisappear(floatingFilterLoc);
    }

    public void waitForBarToAnimate(final String barLabel)
    {
        _test.waitFor(new BaseWebDriverTest.Checker()
        {
            @Override
            public boolean check()
            {
                Locator barLocator = Locator.tag("div").withClass("bar").withDescendant(Locator.tag("span").withClass("barlabel").withText(barLabel))
                        .append(Locator.tag("span").withClass("index"));
                String width1 = barLocator.findElement(_test.getDriver()).getCssValue("width");
                _test.sleep(50);
                String width2 = barLocator.findElement(_test.getDriver()).getCssValue("width");
                return !"0px".equals(width1) && width1.equals(width2);
            }
        }, "Bar didn't stop animating: " + barLabel, CDS_WAIT * 10);
    }

    public void saveGroup(String name, @Nullable String description)
    {
        _test.click(Locators.cdsButtonLocator("save", "filtersave"));
        _test.waitForText("Live: Update group with new data");
        _test.waitForText("replace an existing group");
        _test.setFormElement(Locator.name("groupname"), name);
        if (null != description)
            _test.setFormElement(Locator.name("groupdescription"), description);
        _test.click(Locators.cdsButtonLocator("save", "groupcreatesave"));
    }

    public void saveOverGroup(String name)
    {
        _test.click(Locators.cdsButtonLocator("save", "filtersave"));
        _test.waitForText("Live: Update group with new data");
        _test.click(CDSHelper.Locators.cdsButtonLocator("replace an existing group"));
        _test.waitAndClick(Locator.tagWithClass("div", "save-label").withText(name));
        _test.click(Locators.cdsButtonLocator("save", "groupupdatesave"));
    }

    public void selectBarsHelper(boolean isShift, String... bars)
    {
        if (bars == null || bars.length == 0)
            throw new IllegalArgumentException("Please specify bars to select.");

        Keys multiSelectKey;
        if (isShift)
            multiSelectKey = Keys.SHIFT;
        else if (isMac())
            multiSelectKey = Keys.COMMAND;
        else
            multiSelectKey = Keys.CONTROL;

        waitForBarToAnimate(bars[0]);

        String subselect = bars[0];
        WebElement el = _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//span[@class='barlabel' and text() = '" + bars[0] + "']").toBy()));
        _test.clickAt(el, 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
        _test.waitForElement(Locators.filterMemberLocator(subselect), CDS_WAIT);
        waitForFilterAnimation();
        if(bars.length > 1)
        {
            Actions builder = new Actions(_test.getDriver());

            builder.keyDown(multiSelectKey).build().perform();

            for(int i = 1; i < bars.length; i++)
            {
                el = _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locator.xpath("//span[@class='barlabel' and text() = '" + bars[i] + "']").toBy()));
                _test.clickAt(el, 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
                subselect = bars[i];
                if (subselect.length() > 10)
                    subselect = subselect.substring(0, 9);
                _test.waitForElement(Locators.filterMemberLocator(subselect));
                waitForFilterAnimation();
            }

            builder.keyUp(multiSelectKey).build().perform();
        }
    }

    public void applySelection(String barLabel)
    {
        applySelection(barLabel, barLabel);
    }

    private void applySelection(String barLabel, String filteredLabel)
    {
        selectBars(barLabel);
        _test.waitForElement(Locators.filterMemberLocator(filteredLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void selectBars(String... bars)
    {
        selectBarsHelper(false, bars);
    }

    public void shiftSelectBars(String... bars)
    {
        selectBarsHelper(true, bars);
    }

    public void goToAppHome()
    {
        _test.click(Locator.xpath("//div[contains(@class, 'connectorheader')]//div[contains(@class, 'logo')]"));
        _test.waitForElement(Locator.tagContainingText("h1", "Welcome to the HIV Vaccine"));
    }

    public void goToSummary()
    {
        NavigationLink.SUMMARY.makeNavigationSelection(_test);
    }

    public void clearFilter()
    {
        _test.waitForElement(Locators.cdsButtonLocator("clear", "filterclear"));
        _test.waitAndClick(Locators.cdsButtonLocator("clear", "filterclear"));
        _test.waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));
    }

    public void clearAllFilters()
    {
        // clear filters
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "filterclear").notHidden()))
        {
            clearFilter();
        }
    }

    public void useSelectionAsFilter()
    {
        _test.click(Locators.cdsButtonLocator("use as filter"));
        waitForClearSelection(); // wait for animation
    }

    public void clearSelection()
    {
        _test.click(Locators.cdsButtonLocator("clear", "selectionclear"));
        waitForClearSelection();
    }

    public void clearAllSelections()
    {
        // clear selections
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "selectionclear").notHidden()))
        {
            clearSelection();
        }
    }

    private void waitForClearSelection()
    {
        Locator.XPathLocator panel = Locator.tagWithClass("div", "selectionpanel");
        _test.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(panel.toBy()));
    }

    public void clickBy(String byNoun)
    {
        Locator.XPathLocator loc = Locators.getByLocator(byNoun);
        _test.waitForElement(loc);
        _test.click(loc);
        _test.waitForElement(Locator.css("div.label").withText("Showing number of: Subjects"), CDS_WAIT);
        _test.waitForElement(Locator.css(".dimgroup").withText(byNoun));
    }

    public void viewInfo(String barLabel)
    {
        waitForBarToAnimate(barLabel);
        Locator.XPathLocator barLocator = Locator.tag("div").withClass("small").withDescendant(Locator.tag("span").withClass("barlabel").withText(barLabel));
        _test.scrollIntoView(barLocator); // screen might be too small
        _test.mouseOver(barLocator);
        _test.fireEvent(barLocator.append("//button"), BaseWebDriverTest.SeleniumEvent.click); // TODO: FirefoxDriver doesn't tigger :hover styles. Click with Javascript.
        _test.waitForElement(Locators.cdsButtonLocator("Close"));
        _test.waitForElement(Locator.css(".savetitle").withText(barLabel), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void viewLearnAboutPage(String learnAxis)
    {
        NavigationLink.LEARN.makeNavigationSelection(_test);

        Locator.XPathLocator headerContainer = Locator.tag("div").withClass("learn-header-container");
        Locator.XPathLocator header = Locator.tag("h1").withClass("lhdv");
        Locator.XPathLocator activeHeader = header.withClass("active");

        if (!_test.isElementPresent(headerContainer.append(activeHeader.withText(learnAxis))))
        {
            WebElement initialLearnAboutPanel = Locator.tag("div").withClass("learncolumnheader").parent().index(0).waitForElement(_test.getDriver(), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
            _test.click(headerContainer.append(header.withText(learnAxis)));
            _test.shortWait().until(ExpectedConditions.stalenessOf(initialLearnAboutPanel));
        }
    }

    public void closeInfoPage()
    {
        _test.click(Locators.cdsButtonLocator("Close"));
        _test.waitForElementToDisappear(Locator.button("Close"), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void deleteGroupFromSummaryPage(String name)
    {
        Locator.XPathLocator groupListing = Locator.tagWithClass("div", "grouplabel").containing(name);
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(groupListing.toBy()));
        _test.click(groupListing);
        _test.waitForElement(Locators.cdsButtonLocator("delete"));
        _test.click(Locators.cdsButtonLocator("delete"));
        _test.waitForText("Are you sure you want to delete");
        _test.click(Locator.linkContainingText("Delete"));
        _test.waitForText("Welcome to the HIV Vaccine Collaborative Dataspace.");
        _test.waitForElementToDisappear(groupListing);
    }

    public void toggleExplorerBar(String largeBarText)
    {
        _test.sleep(500);
        _test.click(Locator.xpath("//div[@class='bar large']//span[contains(@class, 'barlabel') and text()='" + largeBarText + "']//..//..//div[contains(@class, 'saecollapse')]//p"));
        _test.sleep(500);
    }

    public void openStatusInfoPane(String label)
    {
        _test.assertElementPresent(Locator.tagWithClass("ul", "detailstatus"));
        _test.waitAndClick(Locator.tagWithClass("span", "statme").withText(label));

        _test.waitForElement(Locator.tagWithClass("div", "infopane"));
    }

    public void openFilterInfoPane(Locator.XPathLocator filterMember)
    {
        _test.click(Locator.tagWithClass("div", "wrapitem").withDescendant(filterMember));

        // 'update' button represents the update of a filter
        _test.waitForElement(Locators.cdsButtonLocator("update", "filterinfoaction"));
    }

    public void changeInfoPaneSort(String fromSort, String toSort)
    {
        Locator.XPathLocator infoPane = Locator.tagWithClass("div", "infopane");
        Locator.XPathLocator sorter = infoPane.withDescendant(Locator.tagWithClass("div", "sorter"));

        _test.waitForElement(infoPane);
        _test.waitForElement(sorter.withDescendant(Locator.tagContainingText("span", fromSort)));

        _test.click(Locators.infoPaneSortButtonLocator());

        Locator.XPathLocator sortItemLabel = Locator.tagWithClass("span", "x-menu-item-text").withText(toSort);
        Locator.XPathLocator sortItem = Locator.tagWithClass("div", "infosortmenu").append(Locator.tagWithClass("div", "x-menu-item").withDescendant(sortItemLabel));
        _test.waitAndClick(sortItem.notHidden());
        _test.waitForElement(sorter.withDescendant(Locator.tagContainingText("span", toSort)));
    }

    public void selectInfoPaneItem(String label, boolean onlyThisItem)
    {
        Locator.XPathLocator memberLabel = Locator.tagWithClass("div", "x-grid-cell-inner").containing(label);

        if (onlyThisItem)
        {
            // click the label
            _test.click(memberLabel);
        }
        else
        {
            Locator.XPathLocator row = Locator.tagWithClass("tr", "x-grid-data-row");
            Locator.XPathLocator check = Locator.tagWithClass("td", "x-grid-cell-row-checker");

            // click the checkbox
            _test.click(row.withDescendant(memberLabel).child(check));
        }
    }

    /**
     * Call this with the info pane display open.
     * @param setAND - Exclusive flag that will select either 'AND' or 'OR' depending on the value.
     */
    public void selectInfoPaneOperator(boolean setAND)
    {
        String radioLabel = (setAND ? "(AND)" : "(OR)");
        _test.click(Locator.tagWithClass("label", "x-form-cb-label").containing(radioLabel));
    }

    public enum NavigationLink
    {
        HOME("Home", Locator.tagContainingText("h1", "Welcome to the")),
        LEARN("Learn about studies, assays", Locator.tagWithClass("div", "titlepanel").withText("Learn About...")),
        SUMMARY("Find subjects", Locator.tagWithClass("div", "titlepanel").withText("find subjects...")),
        PLOT("Plot data", Locator.tagWithClass("a", "yaxisbtn")),
        GRID("View data grid", Locator.tagWithClass("div", "titlepanel").withText("view data grid"));

        private String _linkText;
        private Locator.XPathLocator _expectedElement;

        private NavigationLink(String linkText, Locator.XPathLocator expectedElement)
        {
            _linkText = linkText;
            _expectedElement = expectedElement.notHidden();
        }

        public String getLinkText()
        {
            return _linkText;
        }

        public Locator.XPathLocator getLinkLocator()
        {
            return Locator.tagWithClass("div", "navigation-view").append(Locator.tagWithClass("div", "nav-label").withText(_linkText));
        }

        public Locator.XPathLocator getExpectedElement()
        {
            return _expectedElement;
        }

        public void makeNavigationSelection(BaseWebDriverTest _test)
        {
            _test.click(getLinkLocator());
            _test.waitForElement(getExpectedElement());
        }
    }

    public static class Locators
    {

        public static Locator.XPathLocator getByLocator(String byNoun)
        {
            return Locator.xpath("//div[contains(@class, 'bycolumn')]//span[contains(@class, 'label') and contains(text(), '" + byNoun + "')]");
        }

        public static Locator.XPathLocator cdsButtonLocator(String text)
        {
            return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsButtonLocator(String text, String cssClass)
        {
            return Locator.xpath("//a[contains(@class, '" + cssClass + "')]").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and text()='" + text + "']"));
        }

        public static Locator.XPathLocator cdsButtonLocatorContainingText(String text)
        {
            return Locator.xpath("//a").withPredicate(Locator.xpath("//span[contains(@class, 'x-btn-inner') and contains(text(),'" + text + "')]"));
        }

        public static Locator.XPathLocator cdsDropDownButtonLocator(String cssClass)
        {
            return Locator.xpath("//button[contains(@class, 'imgbutton') and contains(@class, '" + cssClass + "')]");
        }

        public static Locator.XPathLocator filterMemberLocator()
        {
            return Locator.tagWithClass("div", "memberitem");
        }

        public static Locator.XPathLocator filterMemberLocator(String filterText)
        {
            return filterMemberLocator().containing(filterText);
        }

        public static Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural)
        {
            return getFilterStatusLocator(count, singular, plural, false);
        }

        public static Locator.XPathLocator getFilterStatusLocator(int count, String singular, String plural, boolean highlight)
        {
            return Locator.xpath("//li//span[text()='" + (count != 1 ? plural : singular) + "']/../span[contains(@class, '" + (highlight ? "hl-" : "") + "status-count') and text()='" + count + "']");
        }

        public static Locator.XPathLocator getSelectionStatusLocator(int count, String match)
        {
            return Locator.xpath("//li//span[contains(text(), '" + match + "')]/../span[contains(@class, 'status-subcount') and text()='" + count + "']");
        }

        public static Locator.XPathLocator infoPaneSortButtonLocator()
        {
            return Locator.tagWithClass("button", "ipdropdown");
        }
    }
}
