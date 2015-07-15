/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
package org.labkey.test.util;

import com.google.common.base.Function;
import org.apache.commons.lang3.SystemUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.pages.DataGridVariableSelector;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.text.NumberFormat;
import java.util.List;

public class CDSHelper
{
    public static final String[] STUDIES = {"CAVD 256", "CAVD 264", "HVTN 039", "HVTN 040", "HVTN 503", "HVTN 908"}; // TODO Test data dependent.
    public static final String[] LABS = {"Arnold/Bellew Lab", "LabKey Lab", "Piehler/Eckels Lab"};
    public static final String[] ASSAYS = {"BAMA", "ELISpot", "ICS", "NAb"};
    public static final String EMPTY_ASSAY = "HIV-1 RT-PCR";
    public static final String TEST_FEED = WebTestHelper.getBaseURL() + "/Connector/test/testfeed.xml";
    public final static int CDS_WAIT = 2000;
    public static final String[] RACE_VALUES = {"Asian", "Asian/Pacific Island", "Black", "Hawaiian/Pacific Isl", "Multiracial", "Native American", "Native American/Alas", "Native Hawaiian/Paci", "Other", "Unknown", "White"};

    public static final String BAMA = "BAMA (Binding Ab multiplex assay)";
    public static final String BAMA_ANTIGEN = "Antigen";
    public static final String BAMA_ASSAY = "Assay Identifier";
    public static final String BAMA_LAB_SRC_KEY = "Bama Lab Source Key";
    public static final String BAMA_CLADE = "Clade";
    public static final String BAMA_DETECTION = "Detection System";
    public static final String BAMA_DILUTION = "Dilution";
    public static final String BAMA_EXP_ASSAYD = "Exp Assayid";
    public static final String BAMA_INSTRUMENT_CODE = "Instrument Code";
    public static final String BAMA_ISOTYPE = "Isotype";
    public static final String BAMA_LAB = "Lab";
    public static final String BAMA_MAGNITUDE_BLANK = "Magnitude (mfi) - Blank";
    public static final String BAMA_MAGNITUDE_BASELINE = "Magnitude (mfi) - Blank Baseline";
    public static final String BAMA_MAGNITUDE_DELTA = "Magnitude (mfi) - Delta";
    public static final String BAMA_MAGNITUDE_RAW = "Magnitude (mfi) - Raw";
    public static final String BAMA_MAGNITUDE_DELTA_BASELINE = "Magnitude (mfi) – Delta Baseline";
    public static final String BAMA_MAGNITUDE_RAW_BASELINE = "Magnitude (mfi) – Raw Baseline";
    public static final String BAMA_PROTEIN = "Protein";
    public static final String BAMA_PROTEIN_PANEL = "Protein Panel";
    public static final String BAMA_RESPONSE_CALL = "Response Call (1/0) Calculated per Response Code";
    public static final String BAMA_SPECIMEN = "Specimen type";
    public static final String BAMA_VACCINE = "Vaccine Matched";
    public static final String BAMA_VISIT = "Visit";
    public static final String BAMA_VISIT_DAY = "Visit Day";

    public static final String DEMOGRAPHICS = "Subject characteristics";
    public static final String DEMO_AGEGROUP = "Age Group at Enrollment";
    public static final String DEMO_AGE = "Age at Enrollment";
    public static final String DEMO_BMI = "BMI at Enrollment";
    public static final String DEMO_CIRCUMCISED = "Circumcised at Enrollment";
    public static final String DEMO_COUNTRY = "Country at Enrollment";
    public static final String DEMO_HISPANIC = "Hispanic";
    public static final String DEMO_RACE = "Race";
    public static final String DEMO_SEX = "Sexatbirth";
    public static final String DEMO_SPECIES = "Species";
    public static final String DEMO_SUBSPECIES = "Subspecies";
    public static final String DEMO_VISIT = "Visit";

    public static final String ELISPOT = "ELISPOT (Enzyme-Linked ImmunoSpot)";
    public static final String ELISPOT_ANTIGEN = "Antigen Panel";
    public static final String ELISPOT_ASSAY = "Assay Identifier";
    public static final String ELISPOT_CELL_NAME = "Cell Name";
    public static final String ELISPOT_CELL_TYPE = "Cell Type";
    public static final String ELISPOT_CLADE = "Clade";
    public static final String ELISPOT_LAB_SRC_KEY = "Els Ifng Lab Source Key";
    public static final String ELISPOT_EXP_ASSAY = "Exp Assayid";
    public static final String ELISPOT_MARKER_NAME = "Functional Marker Name";
    public static final String ELISPOT_MARKER_TYPE = "Functional Marker Type";
    public static final String ELISPOT_LAB = "Lab";
    public static final String ELISPOT_MAGNITUDE = "Magnitude (% cells)";
    public static final String ELISPOT_MAGNITUDE_NEG = "Magnitude (% cells) - Negative";
    public static final String ELISPOT_MAGNITUDE_RAW = "Magnitude (% cells) - Raw";
    public static final String ELISPOT_PROTEIN =  "Protein";
    public static final String ELISPOT_PROTEIN_PANEL =  "Protein Panel";
    public static final String ELISPOT_RESPONSE =  "Response call";
    public static final String ELISPOT_SPECIMEN =  "Specimen type";
    public static final String ELISPOT_VACCINE =  "Vaccine Method";
    public static final String ELISPOT_VISIT =  "Visit";
    public static final String ELISPOT_VISIT_DAY =  "Visit Day";

    public static final String ICS = "ICS (Intracellular Cytokine Staining)";
    public static final String ICS_ANTIGEN = "Antigen";
    public static final String ICS_ASSAY = "Assay identifier";
    public static final String ICS_CELL_NAME = "Cell name";
    public static final String ICS_CELL_TYPE = "Cell type";
    public static final String ICS_CLADE = "Clade";
    public static final String ICS_EXP_ASSAY = "Exp Assayid";
    public static final String ICS_MARKER_NAME = "Functional marker name";
    public static final String ICS_MARKER_TYPE = "Functional marker type";
    public static final String ICS_LAB_SRC_KEY = "Ics Lab Source Key";
    public static final String ICS_LAB = "Lab";
    public static final String ICS_MAGNITUDE = "Magnitude";
    public static final String ICS_MAGNITUDE_ADJ = "Magnitude adjusted";
    public static final String ICS_MAGNITUDE_NEG = "Magnitude negative";
    public static final String ICS_PROTEIN = "Protein";
    public static final String ICS_PROTEIN_SUBPANEL = "Protein subpanel";
    public static final String ICS_VISIT_DAY = "Protocol Visit Day";
    public static final String ICS_RESPONSE = "Response call";
    public static final String ICS_SPECIMEN = "Specimen type";
    public static final String ICS_VACCINE = "Vaccine matched";
    public static final String ICS_VISIT = "Visit";

    public static final String NAB = "NAb (Neutralizing antibody)";
    public static final String NAB_ASSAY = "Assay Identifier";
    public static final String NAB_CLADE = "Clade";
    public static final String NAB_EXP_ASSAY = "Exp Assayid";
    public static final String NAB_INIT_DILUTION = "Initial dilution";
    public static final String NAB_ISOLATE = "Isolate";
    public static final String NAB_LAB = "Lab";
    public static final String NAB_LAB_SRC_KEY = "Nab Lab Source Key";
    public static final String NAB_RESPONSE = "Response call";
    public static final String NAB_SPECIMEN = "Specimen type";
    public static final String NAB_TARGET_CELL = "Target cell";
    public static final String NAB_TIER = "Tier";
    public static final String NAB_TITERIC50 = "Titer IC50";
    public static final String NAB_TITERIC80 = "Titer IC80";
    public static final String NAB_VISIT = "Visit";
    public static final String NAB_VISIT_DAY = "Visit Day";

//    public static final String[][] Y_AXIS_SOURCES =
//            {{DEMOGRAPHICS, DEMO_AGEGROUP, DEMO_AGE, DEMO_BMI},
//            {BAMA, BAMA_MAGNITUDE_BLANK, BAMA_MAGNITUDE_BASELINE, BAMA_MAGNITUDE_RAW, BAMA_MAGNITUDE_RAW, BAMA_MAGNITUDE_DELTA_BASELINE, BAMA_MAGNITUDE_RAW_BASELINE},
//            {ELISPOT, ELISPOT_MAGNITUDE, ELISPOT_MAGNITUDE_NEG, ELISPOT_MAGNITUDE_RAW},
//            {ICS, ICS_MAGNITUDE, ICS_MAGNITUDE_ADJ, ICS_MAGNITUDE_NEG},
//            {NAB, NAB_TITERIC50, NAB_TITERIC80}};
//    public static final String[][] X_AXIS_SOURCES =
//            {{DEMOGRAPHICS, DEMO_AGEGROUP, DEMO_AGE, DEMO_BMI, DEMO_CIRCUMCISED, DEMO_COUNTRY, DEMO_HISPANIC, DEMO_RACE, DEMO_SEX, DEMO_SPECIES, DEMO_SUBSPECIES, DEMO_VISIT},
//            {"Time points", "Study days", "Study weeks", "Study months"},
//            {BAMA, BAMA_ANTIGEN, BAMA_ASSAY, BAMA_LAB_SRC_KEY, BAMA_CLADE, BAMA_DATA_SUMMARY, BAMA_DETECTION, BAMA_DILUTION, BAMA_EXP_ASSAYD, BAMA_INSTRUMENT_CODE, BAMA_ISOTYPE, BAMA_LAB, BAMA_MAGNITUDE_BLANK, BAMA_MAGNITUDE_BASELINE, BAMA_MAGNITUDE_DELTA, BAMA_MAGNITUDE_RAW, BAMA_MAGNITUDE_DELTA_BASELINE, BAMA_MAGNITUDE_RAW_BASELINE, BAMA_PROTEIN, BAMA_PROTEIN_PANEL, BAMA_RESPONSE_CALL, BAMA_SPECIMEN, BAMA_VACCINE, BAMA_VISIT, BAMA_VISIT_DAY},
//            {ELISPOT, ELISPOT_ANTIGEN, ELISPOT_ASSAY, ELISPOT_CELL_NAME, ELISPOT_CELL_TYPE, ELISPOT_CLADE, ELISPOT_DATA_SUMMARY, ELISPOT_LAB_SRC_KEY, ELISPOT_EXP_ASSAY, ELISPOT_MARKER_NAME, ELISPOT_MARKER_TYPE, ELISPOT_LAB, ELISPOT_MAGNITUDE, ELISPOT_MAGNITUDE_NEG, ELISPOT_MAGNITUDE_RAW, ELISPOT_PROTEIN, ELISPOT_PROTEIN_PANEL, ELISPOT_RESPONSE, ELISPOT_SPECIMEN, ELISPOT_VACCINE, ELISPOT_VISIT, ELISPOT_VISIT_DAY},
//            {ICS, ICS_ANTIGEN, ICS_ASSAY, ICS_CELL_NAME, ICS_CELL_TYPE, ICS_CLADE, ICS_DATA_SUMMARY, ICS_EXP_ASSAY, ICS_MARKER_NAME, ICS_MARKER_TYPE, ICS_LAB_SRC_KEY, ICS_LAB, ICS_MAGNITUDE, ICS_MAGNITUDE_ADJ, ICS_MAGNITUDE_NEG, ICS_PROTEIN, ICS_PROTEIN_SUBPANEL, ICS_VISIT_DAY, ICS_RESPONSE, ICS_SPECIMEN, ICS_VACCINE, ICS_VISIT},
//            {NAB, NAB_ANTIGEN, NAB_ASSAY, NAB_CLADE, NAB_DATA_SUMMARY, NAB_ENVELOPE, NAB_EXP_ASSAY, NAB_INIT_DILUTION, NAB_LAB, NAB_LAB_SRC_KEY, NAB_RESPONSE, NAB_SPECIMEN, NAB_TARGET_CELL, NAB_TITERIC50, NAB_TITERIC80, NAB_VISIT, NAB_VISIT_DAY}};
//    public static final String[][] COLOR_AXIS_SOURCES =
//            {{DEMOGRAPHICS, DEMO_CIRCUMCISED, DEMO_COUNTRY, DEMO_HISPANIC, DEMO_RACE, DEMO_SEX, DEMO_SPECIES, DEMO_SUBSPECIES},
//            {BAMA, BAMA_ANTIGEN, BAMA_ASSAY, BAMA_LAB_SRC_KEY, BAMA_CLADE, BAMA_DATA_SUMMARY, BAMA_DETECTION, BAMA_DILUTION, BAMA_EXP_ASSAYD, BAMA_INSTRUMENT_CODE, BAMA_ISOTYPE, BAMA_LAB, BAMA_PROTEIN, BAMA_PROTEIN_PANEL, BAMA_RESPONSE_CALL, BAMA_SPECIMEN, BAMA_VACCINE},
//            {ELISPOT, ELISPOT_ANTIGEN, ELISPOT_ASSAY, ELISPOT_CELL_NAME, ELISPOT_CELL_TYPE, ELISPOT_CLADE, ELISPOT_DATA_SUMMARY, ELISPOT_MARKER_NAME, ELISPOT_MARKER_TYPE, ELISPOT_LAB, ELISPOT_PROTEIN, ELISPOT_PROTEIN_PANEL, ELISPOT_RESPONSE, ELISPOT_SPECIMEN, ELISPOT_VACCINE},
//            {ICS, ICS_ANTIGEN, ICS_ASSAY, ICS_CELL_NAME, ICS_CELL_TYPE, ICS_CLADE, ICS_DATA_SUMMARY, ICS_MARKER_NAME, ICS_MARKER_TYPE, ICS_LAB, ICS_PROTEIN, ICS_PROTEIN_SUBPANEL, ICS_RESPONSE, ICS_SPECIMEN, ICS_VACCINE},
//            {NAB, NAB_ANTIGEN, NAB_ASSAY, NAB_CLADE, NAB_DATA_SUMMARY, NAB_ENVELOPE, NAB_LAB, NAB_RESPONSE, NAB_SPECIMEN, NAB_TARGET_CELL}};
//
    // Set this to true if you want to skip the import of data, setting up the project and cleaning up onld projects.
    public static final boolean debugTest = true;

    private final BaseWebDriverTest _test;
    private static final boolean ValidateCounts = false;

    public CDSHelper(BaseWebDriverTest test)
    {
        _test = test;
    }

    @LogMethod(quiet = true)
    public void enterApplication()
    {
        _test.goToProjectHome();
        _test.clickAndWait(Locator.linkWithText("Application"));
        _test.addUrlParameter("_showPlotData=true");

        _test.assertElementNotPresent(Locator.linkWithText("Home"));
        _test.waitForElement(Locator.tagContainingText("h1", "Welcome to the HIV Vaccine"));
        _test.assertElementNotPresent(Locator.linkWithText("Admin"));
        _test.waitForElement(Locator.tagWithClass("body", "appready"));
        Ext4Helper.setCssPrefix("x-");
    }

    @LogMethod(quiet = true)
    public void pickSort(@LoggedParam final String sortBy)
    {
        _test.click(Locator.id("sae-hierarchy-dropdown"));

        applyAndWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.waitAndClick(Locator.xpath("//li[text()='" + sortBy + "' and contains(@class, 'x-boundlist-item')]"));
                return null;
            }
        });

        _test.waitForFormElementToEqual(Locator.input("sae-hierarchy"), sortBy);
    }

    public void pickDimension(final String dimension)
    {
        applyAndWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(Locators.dimensionHeaderLocator(dimension));
                return null;
            }
        });

        _test.waitForElement(Locators.activeDimensionHeaderLocator(dimension));
    }

    public void saveLiveGroup(String name, @Nullable String description)
    {
        saveGroup(name, description, "live");
    }

    public void saveSnapshotGroup(String name, @Nullable String description)
    {
        saveGroup(name, description, "snapshot");
    }

    private void saveGroup(String name, @Nullable String description, String type)
    {
        _test.click(Locators.cdsButtonLocator("save", "filtersave"));
        _test.waitForText("Live: Update group with new data");
        _test.waitForText("replace an existing group");
        _test.setFormElement(Locator.name("groupname"), name);
        if (null != description)
            _test.setFormElement(Locator.name("groupdescription"), description);

        if ("snapshot".equals(type))
        {
            _test.click(Ext4Helper.Locators.radiobutton(_test, "Snapshot: Keep this group static"));
        }

        applyAndMaybeWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(Locators.cdsButtonLocator("save", "groupcreatesave"));
                return null;
            }
        });
    }

    public void saveOverGroup(String name)
    {
        _test.click(Locators.cdsButtonLocator("save", "filtersave"));
        _test.waitForText("Live: Update group with new data");
        _test.click(CDSHelper.Locators.cdsButtonLocator("replace an existing group"));
        _test.waitAndClick(Locator.tagWithClass("div", "save-label").withText(name));
        _test.click(Locators.cdsButtonLocator("save", "groupupdatesave"));
    }

    public void selectBars(String... bars)
    {
        selectBars(false, bars);
    }

    public void shiftSelectBars(String... bars)
    {
        selectBars(true, bars);
    }

    public void selectBars(boolean isShift, String... bars)
    {
        if (bars == null || bars.length == 0)
            throw new IllegalArgumentException("Please specify bars to select.");

        Keys multiSelectKey;
        if (isShift)
            multiSelectKey = Keys.SHIFT;
        else if (SystemUtils.IS_OS_MAC)
            multiSelectKey = Keys.COMMAND;
        else
            multiSelectKey = Keys.CONTROL;

        clickBar(bars[0]);

        if (bars.length > 1)
        {
            Actions builder = new Actions(_test.getDriver());
            builder.keyDown(multiSelectKey).build().perform();

            for (int i = 1; i < bars.length; i++)
            {
                clickBar(bars[i]);
            }

            builder.keyUp(multiSelectKey).build().perform();
        }
    }

    private void clickBar(String barLabel)
    {
        WebElement detailStatusPanel = Locator.css("ul.detailstatus").waitForElement(_test.getDriver(), CDS_WAIT); // becomes stale after filter is applied
        _test.shortWait().until(ExpectedConditions.elementToBeClickable(Locators.barLabel.withText(barLabel).toBy()));
        _test.clickAt(_test.getElement(Locators.barLabel.withText(barLabel)), 1, 1, 0); // Click left end of bar; other elements might obscure click on Chrome
        _test.waitForElement(Locators.filterMemberLocator(barLabel), CDS_WAIT);
        _test.shortWait().until(ExpectedConditions.stalenessOf(detailStatusPanel));
        waitForFilterAnimation();
    }

    private void waitForFilterAnimation()
    {
        Locator floatingFilterLoc = Locator.css(".barlabel.selected");
        _test.waitForElementToDisappear(floatingFilterLoc);
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
        final WebElement clearButton = _test.waitForElement(Locators.cdsButtonLocator("clear", "filterclear"));

        applyAndMaybeWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                clearButton.click();
                return null;
            }
        });
        _test.waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));
    }

    public void ensureNoFilter()
    {
        // clear filters
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "filterclear").notHidden()))
        {
            clearFilter();
        }
    }

    public void undoClearFilter()
    {
        _test.waitForElement(Locator.xpath("//div[@class='emptytext' and text()='All subjects']"));

        applyAndMaybeWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(Locator.linkWithText("Undo"));
                return null;
            }
        });

        _test.waitForElement(Locators.cdsButtonLocator("clear", "filterclear"));
    }

    public void useSelectionAsSubjectFilter()
    {
        _test.click(Locators.cdsButtonLocator("filter subjects"));
        waitForClearSelection(); // wait for animation
    }

    public void useSelectionAsDataFilter()
    {
        _test.click(Locators.cdsButtonLocator("filter data"));
        waitForClearSelection(); // wait for animation
    }

    public void clearSelection()
    {
        _test.click(Locators.cdsButtonLocator("clear", "selectionclear"));
        waitForClearSelection();
    }

    public void ensureNoSelection()
    {
        // clear selections
        if (_test.isElementPresent(CDSHelper.Locators.cdsButtonLocator("clear", "selectionclear").notHidden()))
        {
            clearSelection();
        }
    }

    private void waitForClearSelection()
    {
        _test.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div.selectionpanel")));
        _test.shortWait().until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("span.status-subcount")));
    }

    public void clickBy(final String byNoun)
    {
        final WebElement link = _test.waitForElement(Locators.getByLocator(byNoun));

        applyAndWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                link.click();
//                _test.waitForElement(Locator.css("div.label").withText("Showing number of: Subjects"), CDS_WAIT);
                _test.waitForElement(Locators.activeDimensionHeaderLocator(byNoun));
                return null;
            }
        });

    }

    public void hideEmpty()
    {
        applyAndWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(CDSHelper.Locators.cdsButtonLocator("hide empty"));
                return null;
            }
        });

        _test.waitForElementToDisappear(Locator.tagWithClass("div", "barchart").append(Locator.tagWithClass("span", "count").withText("0")));
        _test.waitForElement(CDSHelper.Locators.cdsButtonLocator("show empty"));
    }

    public void showEmpty()
    {
        applyAndWaitForBars(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.click(CDSHelper.Locators.cdsButtonLocator("show empty"));
                return null;
            }
        });

        _test.waitForElement(CDSHelper.Locators.cdsButtonLocator("hide empty"));
    }

    public void viewInfo(String barLabel)
    {
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

        Locator.XPathLocator headerContainer = Locator.tag("div").withClass("learn-selector");
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

    private void applyAndMaybeWaitForBars(Function<Void, Void> function)
    {
        if (_test.isElementPresent(Locator.id("single-axis-explorer")))
        {
            applyAndWaitForBars(function);
        }
        else
        {
            function.apply(null);
        }
    }

    private void applyAndWaitForBars(Function<Void, Void> function)
    {
        List<WebElement> bars = Locator.css("div.bar").findElements(_test.getDriver());

        function.apply(null);

        if (bars.size() > 0)
            _test.shortWait().until(ExpectedConditions.stalenessOf(bars.get(0)));
        if(!_test.isElementPresent(Locator.tagWithClass("div", "saeempty")))
            waitForBarAnimation();
    }

    private void waitForBarAnimation()
    {
        Locator animatingBar = Locator.tagWithClass("div", "bar").withPredicate(
                Locator.tagWithClass("span", "count").withoutText("0")).append(
                Locator.tagWithClass("span", "index"));
        _test.shortWait().until(LabKeyExpectedConditions.animationIsDone(animatingBar));
    }

    public enum NavigationLink
    {
        HOME("Home", Locator.tagContainingText("h1", "Welcome to the")),
        LEARN("Learn about studies, assays, ...", Locator.tagWithClass("div", "titlepanel").withDescendant(Locator.tag("span").withText("Learn about..."))),
        SUMMARY("Find subjects", Locator.tag("h1").containing("Find subjects of interest.")),
        PLOT("Plot data", Locator.tagWithClass("a", "yaxisbtn")),
        GRID("View data grid", DataGridVariableSelector.titleLocator);

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
        public static Locator.XPathLocator barLabel = Locator.tagWithClass("span", "barlabel");

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
            return Locator.tagWithClass("div", "memberloc");
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
            String strCount = NumberFormat.getIntegerInstance().format(count); //Need to format to allow for number greater than 999 (search looks for a number with a ',' in it).
            String path = "//li//span[text()='" + (count != 1 ? plural : singular) + "']";
            path = path + ((ValidateCounts) ?  "/../span[contains(@class, '" + (highlight ? "hl-" : "") + "status-count') and text()='" + strCount + "']" : "");
            return Locator.xpath(path);
        }

        public static Locator.XPathLocator getSelectionStatusLocator(int count, String match)
        {
            String strCount = NumberFormat.getIntegerInstance().format(count);
            String path = "//li//span[contains(text(), '" + match + "')]";
            path = path + ((ValidateCounts) ? "/../span[contains(@class, 'status-subcount') and text()='" + strCount + "']" : "");
            return Locator.xpath(path);
        }

        public static Locator.XPathLocator infoPaneSortButtonLocator()
        {
            return Locator.tagWithClass("button", "ipdropdown");
        }

        public static Locator.XPathLocator dimensionHeaderLocator(String dimension)
        {
            return Locator.tagWithClass("div", "dim-selector").append(Locator.tagWithClass("h1", "lhdv").withText(dimension));
        }

        public static Locator.XPathLocator activeDimensionHeaderLocator(String dimension)
        {
            return Locator.tagWithClass("div", "dim-selector").append(Locator.tagWithClass("h1", "active").withText(dimension));
        }
    }
}
