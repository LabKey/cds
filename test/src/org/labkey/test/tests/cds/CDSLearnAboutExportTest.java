package org.labkey.test.tests.cds;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.NumberToTextConverter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.pages.cds.LearnGrid;
import org.labkey.test.util.cds.CDSHelper;

import javax.annotation.Nullable;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Category({})
@BaseWebDriverTest.ClassTimeout(minutes = 13)
public class CDSLearnAboutExportTest extends CDSReadOnlyTest
{
    public static final String XPATH_SEARCH_BOX = "//table[contains(@class, 'learn-search-input')]//tbody//tr//td//input";
    private final CDSHelper cds = new CDSHelper(this);

    @Before
    public void preTest()
    {

        cds.enterApplication();
        cds.ensureNoFilter();
        cds.ensureNoSelection();

        // go back to app starting location
        cds.goToAppHome();
    }

    @Test
    public void testExportExcelDownload() throws IOException
    {
        File assaysExcelFile = clickExportExcel("Assays", null);
        String fileContents = TestFileUtils.getFileContents(assaysExcelFile);
        assertTrue("Empty file", fileContents.length() > 0);
        assertEquals("Incorrect downloaded columns for Assays ", Arrays.asList("Assay ID", "Assay Long Name", "Assay Short Name", "Assay Category",
                        "Assay Detection Platform", "Assay Body System Type", "Assay Body System Target", "Assay General Specimen Type",
                        "Assay Description", "Assay Method Description", "Assay Endpoint Description"),
                getRowFromExcel(assaysExcelFile, 0));

        File productsExcelFile = clickExportExcel("Products", null);
        fileContents = TestFileUtils.getFileContents(productsExcelFile);
        assertTrue("Empty file", fileContents.length() > 0);
        assertEquals("Incorrect downloaded columns for Products ", Arrays.asList("Product Id", "Product Name", "Product Type", "Product Class",
                        "Product Subclass", "Product Class Label", "Product Description", "Product Developer", "Product Manufacturer", "MAb Mixture ID"),
                getRowFromExcel(productsExcelFile, 0));

        File mabsExcelFile = clickExportExcel("MAbs", null);
        fileContents = TestFileUtils.getFileContents(mabsExcelFile);
        assertTrue("Empty file", fileContents.length() > 0);
        assertEquals("Incorrect downloaded columns for MAbs ", Arrays.asList("MAb Mixture ID", "MAb or Mixture Standardized Name", "MAb Label", "MAb ID", "MAb Name",
                        "LANL ID", "HXB2 Location", "MAb Binding Type", "MAb Isotype", "MAb Donor ID", "MAb Donor Species", "MAb Donor Clade"),
                getRowFromExcel(mabsExcelFile, 0));

        File publicationExcelFile = clickExportExcel("Publications", null);
        fileContents = TestFileUtils.getFileContents(publicationExcelFile);
        assertTrue("Empty file", fileContents.length() > 0);
        assertEquals("Incorrect downloaded columns for Publications ", Arrays.asList("Publication Id", "Title", "Authors", "Journal",
                        "Publication Date", "Volume", "Issue", "Pages", "PubMed ID", "Link", "Abstract"),
                getRowFromExcel(publicationExcelFile, 0));

        File studiesExcelFile = clickExportExcel("Studies", null);
        fileContents = TestFileUtils.getFileContents(studiesExcelFile);
        assertTrue("Empty file", fileContents.length() > 0);
        assertEquals("Incorrect downloaded columns for Studies ", Arrays.asList("Study ID", "Network",
                        "Study Name", "Study Short Name", "Title", "Study Type", "Study Status", "Stage", "Study Species", "Study Population",
                        "Description", "Rationale", "Objectives", "Groups", "Methods", "Findings", "Conclusions", "Date of Study Start",
                        "Date First Subject Enrolled", "Date Follow-Up Complete", "Date Study Made Public", "CAVD Grantee", "Grant Principal Investigator",
                        "Grant Project Manager", "Study Investigator", "Primary Point of Contact", "Vaccine Strategy", "Clinical Trials.gov ID"),
                getRowFromExcel(studiesExcelFile, 0));

        log("Verifying only filtered rows are downloaded\n");
        this.setFormElement(Locator.xpath(XPATH_SEARCH_BOX), "RED 1");
        sleep(CDSHelper.CDS_WAIT);
        LearnGrid learnGrid = new LearnGrid(this);
        assertEquals("Incorrect number of rows after filter", 1, learnGrid.getRowCount());
        File filteredStudies = clickExportExcel("Studies", null);
        assertEquals("Incorrect number of rows imported", 1, getRowCount(filteredStudies));
        assertEquals("Incorrect study name", "RED 1", getRowFromExcel(filteredStudies, 1).get(2));
    }

    @Test
    public void testExportCSVDownload() throws IOException
    {
        File studiesCSVFile = clickExportCSV("Studies", null);
        assertEquals("Incorrect file downloaded by CSV for Studies", Arrays.asList("Studies.csv"),
                TestFileUtils.getFilesInZipArchive(studiesCSVFile));

        File assaysCSVFile = clickExportCSV("Assays", null);
        assertEquals("Incorrect file downloaded by CSV for Assays", Arrays.asList("Assays.csv"),
                TestFileUtils.getFilesInZipArchive(assaysCSVFile));

        File productsCSVFile = clickExportCSV("Products", null);
        assertEquals("Incorrect file downloaded by CSV for Products", Arrays.asList("Products.csv"),
                TestFileUtils.getFilesInZipArchive(productsCSVFile));

        File mabsCSVFile = clickExportCSV("MAbs", null);
        assertEquals("Incorrect file downloaded by CSV for MAbs", Arrays.asList("MAbs.csv", "Metadata.txt", "Variable definitions.csv"),
                TestFileUtils.getFilesInZipArchive(mabsCSVFile));

        File publicationsCSVFile = clickExportCSV("Publications", null);
        assertEquals("Incorrect file downloaded by CSV for Publications", Arrays.asList("Publications.csv"),
                TestFileUtils.getFilesInZipArchive(publicationsCSVFile));
    }

    @Test
    public void testExportLearnAssaysExcel() throws IOException
    {
        log("Verify Export button is not available for ICS");
        cds.viewLearnAboutPage("Assays");
        goToAssayPage("ICS");
        assertFalse("Export button should not be present",
                isElementPresent(Locator.tagWithAttributeContaining("span", "id", "learn-grid-assay-export-button-id")));

        File BAMAExcelFile = clickExportExcel("Assays", "BAMA");
        assertEquals("Missing sheets from downloaded excel for BAMA", Arrays.asList("BAMA Biotin LX", "Metadata", "Variable definitions", "Antigens")
                , getSheetNamesFromExcel(BAMAExcelFile));

        File PKMABExcelFile = clickExportExcel("Assays", "PKMAB");
        assertEquals("Missing sheets from downloaded excel for PKMAB", Arrays.asList("PK MAB", "Metadata", "Variable definitions")
                , getSheetNamesFromExcel(PKMABExcelFile));
    }

    @Test
    public void testExportLearnAssaysCSV() throws IOException
    {
        log("Verify Export button is not available IFN");
        cds.viewLearnAboutPage("Assays");
        goToAssayPage("IFN");
        assertFalse("Export button should not be present",
                isElementPresent(Locator.tagWithAttributeContaining("span", "id", "learn-grid-assay-export-button-id")));

        File NABCSVFile = clickExportCSV("Assays", "NAB");
        assertEquals("Missing files from downloaded CSV for NAB", Arrays.asList("NAB A3R5.csv", "Metadata.txt", "Variable definitions.csv", "Antigens.csv"),
                TestFileUtils.getFilesInZipArchive(NABCSVFile));

        File NAbMABCSVFile = clickExportCSV("Assays", "NABMAB");
        assertEquals("Missing files from downloaded CSV for NABMAB", Arrays.asList("NAB MAB.csv", "Metadata.txt", "Variable definitions.csv", "Antigens.csv"),
                TestFileUtils.getFilesInZipArchive(NAbMABCSVFile));
    }

    private List<String> getRowFromExcel(File downloadedFile, int row) throws IOException
    {
        List<String> listOfExportColumn = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(new FileInputStream(downloadedFile));
        Sheet firstSheet = workbook.getSheetAt(0);
        Row labelRow = firstSheet.getRow(row);
        Iterator iterator = labelRow.cellIterator();

        while (iterator.hasNext())
        {
            Cell cell = (Cell) iterator.next();
            if (cell.getCellType() == CellType.STRING)
                listOfExportColumn.add(cell.getStringCellValue());
            else
                listOfExportColumn.add(NumberToTextConverter.toText(cell.getNumericCellValue()));

        }
        return listOfExportColumn;
    }

    private List<String> getSheetNamesFromExcel(File excelFile) throws IOException
    {
        Workbook workbook = new XSSFWorkbook(new FileInputStream(excelFile));
        int sheetCount = workbook.getNumberOfSheets();
        List<String> sheetNames = new ArrayList<>();
        for (int i = 0; i < sheetCount; i++)
            sheetNames.add(workbook.getSheetName(i));
        return sheetNames;
    }

    private int getRowCount(File excelFile) throws IOException
    {
        Workbook workbook = new XSSFWorkbook(new FileInputStream(excelFile));
        Sheet firstSheet = workbook.getSheetAt(0);
        return firstSheet.getLastRowNum();
    }

    private File clickExportExcel(String learnTab, @Nullable String assayName)
    {
        log("Verify 'Excel Export' button downloads excel file " + learnTab);
        cds.viewLearnAboutPage(learnTab);
        Locator.XPathLocator exportBtn;
        if (assayName != null)
        {
            goToAssayPage(assayName);
            exportBtn = Locator.tagWithAttributeContaining("span", "id", "learn-grid-assay-export-button-id");
        }
        else
            exportBtn = Locator.tagWithId("span", "learn-grid-export-button-id-btnIconEl");

        click(exportBtn);
        return clickAndWaitForDownload(Locator.linkWithText("Excel (*.XLS)"));
    }

    private File clickExportCSV(String learnTab, @Nullable String assayName) throws IOException
    {
        log("Verify 'CSV Export' button downloads the zip " + learnTab);
        Locator.XPathLocator exportBtn;
        cds.viewLearnAboutPage(learnTab);
        if (assayName != null)
        {
            goToAssayPage(assayName);
            exportBtn = Locator.tagWithAttributeContaining("span", "id", "learn-grid-assay-export-button-id");
        }
        else
            exportBtn = Locator.tagWithId("span", "learn-grid-export-button-id-btnIconEl");

        click(exportBtn);
        return clickAndWaitForDownload(Locator.linkWithText("Comma separated values (*.CSV)"));
    }

    private void goToAssayPage(String name)
    {
        LearnGrid learnGrid = new LearnGrid(this);
        learnGrid.setSearch(name).clickFirstItem();
    }
}

