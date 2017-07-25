package org.labkey.cds;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.labkey.api.data.ColumnHeaderType;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataRegion;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.ExcelColumn;
import org.labkey.api.data.ExcelWriter;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryView;
import org.labkey.api.view.DataView;
import org.labkey.remoteapi.query.jdbc.LabKeyResultSet;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public class CDSExportQueryView extends QueryView
{
    private static final String FILE_NAME_PREFIX = "DataSpace Data Grid";

    private static final String METADATA_SHEET = "Metadata";
    private static final String DATA = "Data";
    private static final String STUDY_SHEET = "Studies";
    private static final String ASSAY_SHEET = "Assays";
    private static final String VARIABLES_SHEET = "Variable definitions";

    public static final String FILTER_DELIMITER = "|||";
    private static final String FILTERS_HEADING = "Subject filters applied to exported data:";
    private static final String FILTERS_FOOTER = "For a list of studies and assays included in this data file, please refer to the Studies and Assays tabs.";

    private static final String TOC_TITLE = "IMPORTANT INFORMATION ABOUT THIS DATA:";
    private static final List<String> TOC_1 = Arrays.asList("", "By exporting data from the CAVD DataSpace, you agree to be bound by the Terms of Use available on the CAVD DataSpace sign-in page at https://dataspace.cavd.org/cds/CAVD/app.view? .");
    private static final List<String> TOC_2 = Arrays.asList("", "Data included may have additional sharing restrictions; please refer to the Studies tab for details.");
    private static final List<String> TOC_3 = Arrays.asList("", "Please notify the DataSpace team of any presentations or publications resulting from this data and remember to cite the CAVD DataSpace, as well as the grant and study investigators. Thank you!");
    private static final List<List<String>> TOCS = Arrays.asList(Arrays.asList(TOC_TITLE), TOC_1, TOC_2, TOC_3);

    public static final List<String> STUDY_DB_COLUMNS = Arrays.asList("network", "label", "study_name", "grant_pi_name", "investigator_name", "primary_poc_name", "primary_poc_email", "description", "type", "species");
    private static final List<String> STUDY_COLUMNS = Arrays.asList("Network", "Study", "Grant PI", "Study Investigator", "Primary Contact", "Description", "Study Type", "Species", "Sharing Restrictions");
    public static final String PUBLIC_STUDY = "Available to share with network members";
    public static final String PRIVATE_STUDY = "Restricted - contact DataSpace team prior to sharing data";

    private static final List<String> ASSAY_COLUMNS = Arrays.asList("Study", "Assay Name", "Lab ID", "Data provenance - source", "Data provenance - Notes");
    private static final List<String> VARIABLE_COLUMNS = Arrays.asList("Assay Name", "Field label", "Field description");

    private final List<String> _filterStrings;
    private final String[] _studies;
    private final String[] _assays;
    private String[] _columnNamesOrdered;
    private Map<String, String> _columnAliases;

    public CDSExportQueryView(CDSController.ExportForm form, org.springframework.validation.Errors errors)
    {
        super(form, errors);
        _columnNamesOrdered = form.getColumnNamesOrdered();
        _columnAliases = form.getColumnAliases();
        _filterStrings = getFormValues(form.getFilterStrings());
        _studies = form.getStudies().toArray(new String[0]);
        _assays = form.getAssays().toArray(new String[0]);
    }

    private List<String> getFormValues(String[] formValues)
    {
        if (formValues != null && formValues.length > 0)
        {
            List<String> sortedFilters = Arrays.asList(formValues);
            Collections.sort(sortedFilters);
            return sortedFilters;
        }
        else
            return new ArrayList<>();
    }

    @Override
    public List<DisplayColumn> getExportColumns(List<DisplayColumn> list)
    {
        List<DisplayColumn> retColumns = super.getExportColumns(list);
        List<DisplayColumn> exportColumns = new ArrayList<>();

        // issue 20850: set export column headers to be "Dataset - Variable"
        for (String colName : _columnNamesOrdered)
        {
            for (DisplayColumn col : retColumns)
            {
                if (col.getColumnInfo() != null && colName.equals(col.getColumnInfo().getName()))
                {
                    col.setCaption(_columnAliases.get(col.getColumnInfo().getName()));
                    exportColumns.add(col);
                    break;
                }
                else if (colName.equals(col.getName()))
                {
                    col.setCaption(_columnAliases.get(col.getName()));
                    exportColumns.add(col);
                    break;
                }
            }
        }
        return exportColumns;
    }

    public void writeExcelToResponse(HttpServletResponse response, ColumnHeaderType headerType) throws IOException
    {
        ExcelWriter ew = getExcelWriter();
        if (headerType == null)
            headerType = getColumnHeaderType();
        ew.setCaptionType(headerType);
        ew.write(response);
        logAuditEvent("Exported to Excel", ew.getDataRowCount());
    }

    private ExcelWriter getExcelWriter() throws IOException
    {
        TableInfo table = getTable();
        if (table == null)
        {
            throw new IOException("Could not find table to write.");
        }
        ColumnHeaderType headerType = ColumnHeaderType.Caption;

        ExcelWriter ew = getCDSExcelWriter();
        ew.setFilenamePrefix(FILE_NAME_PREFIX);
        ew.setCaptionType(headerType);
        ew.setShowInsertableColumnsOnly(false);
        ew.setSheetName(DATA);

        ew.renderNewSheet();
        ColumnInfo filterColumnInfo = new ColumnInfo(FieldKey.fromParts(METADATA_SHEET));
        ew.setColumns(Collections.singletonList(filterColumnInfo));
        ew.setSheetName(METADATA_SHEET);

        ew.renderNewSheet();
        ew.getWorkbook().setSheetOrder(METADATA_SHEET, 0); // move metadata sheet to first tab

        List<ColumnInfo> studyColumns = getColumns(STUDY_COLUMNS);
        ew.setColumns(studyColumns);
        List<List<String>> exportableStudies = CDSManager.get().getExportableStudies(_studies, getContainer());
        ew.setResults(createResults(exportableStudies, studyColumns));
        ew.setSheetName(STUDY_SHEET);
        ew.setCaptionRowFrozen(false);

        ew.renderNewSheet();
        List<ColumnInfo> assayColumns = getColumns(ASSAY_COLUMNS);
        ew.setColumns(assayColumns);
        List<List<String>> exportableAssays = CDSManager.get().getExportableAssays(_assays, getContainer());
        ew.setResults(createResults(exportableAssays, assayColumns));
        ew.setSheetName(ASSAY_SHEET);
        ew.setCaptionRowFrozen(false);
//
//        List<ColumnInfo> assayColumns = CDSManager.get().getColumns(ASSAY_COLUMNS);
//        ew.setColumns(assayColumns);
//        ew.setResults(createResults(_assays, assayColumnInfo));
//        ew.setSheetName(ASSAY_SHEET);
//        ew.setCaptionRowFrozen(false);

        ew.getWorkbook().setActiveSheet(0);
        return ew;
    }

    private ExcelWriter getCDSExcelWriter() throws IOException
    {
        ExcelWriter.ExcelDocumentType docType = ExcelWriter.ExcelDocumentType.xlsx;

        DataView view = createDataView();
        DataRegion rgn = view.getDataRegion();

        RenderContext rc = configureForExcelExport(docType, view, rgn);

        try
        {
            ResultSet rs = rgn.getResultSet(rc);
            Map<FieldKey, ColumnInfo> map = rc.getFieldMap();
            ExcelWriter ew = new ExcelWriter(rs, map, getExportColumns(rgn.getDisplayColumns()), docType){
                private XSSFCellStyle importantStyle = null;
                private XSSFCellStyle boldStyle = null;
                @Override
                public void renderGrid(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns) throws SQLException, MaxRowsExceededException
                {
                    if (!sheet.getSheetName().equals(METADATA_SHEET))
                    {
                        super.renderGrid(ctx, sheet, visibleColumns);
                        return;
                    }

                    XSSFFont importantFont= (XSSFFont) getWorkbook().createFont();
                    importantFont.setFontHeightInPoints((short)14);
                    importantFont.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD);
                    importantFont.setBold(true);

                    XSSFFont boldFont= (XSSFFont) getWorkbook().createFont();
                    boldFont.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD);
                    boldFont.setBold(true);

                    importantStyle = (XSSFCellStyle) getWorkbook().createCellStyle();
                    importantStyle.setFont(importantFont);
                    boldStyle = (XSSFCellStyle) getWorkbook().createCellStyle();
                    boldStyle.setFont(boldFont);

                    int currentRow = currentRow = writeTOC(ctx, sheet, visibleColumns, 0);
                    currentRow = writeExportDate(ctx, sheet, visibleColumns, currentRow);
                    writeFilterSection(ctx, sheet, visibleColumns, currentRow);
                }

                private int writeTOC(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns, int currentRow)
                {
                   for (List<String> row : TOCS)
                   {
                       for (int col = 0; col < row.size(); col++)
                       {
                           String value = row.get(col);
                           if (StringUtils.isEmpty(value))
                               continue;

                           Row rowObject = getRow(sheet, currentRow);
                           Cell cell = rowObject.getCell(col, Row.CREATE_NULL_AS_BLANK);
                           cell.setCellValue(value);

                           if (col == 0)
                           {
                               if (currentRow == 0)
                                   cell.setCellStyle(importantStyle);
                               else
                                   cell.setCellStyle(boldStyle);
                           }
                       }
                       currentRow++;
                   }

                   return currentRow + 2;
                }

                private int writeExportDate(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns, int currentRow)
                {
                    Row rowObject = getRow(sheet, currentRow);
                    Cell titleCell = rowObject.getCell(0, Row.CREATE_NULL_AS_BLANK);
                    titleCell.setCellValue("Date Exported:");
                    titleCell.setCellStyle(boldStyle);

                    rowObject = getRow(sheet, ++currentRow);
                    Cell valueCell = rowObject.getCell(1, Row.CREATE_NULL_AS_BLANK);
                    Date date = new Date();
                    valueCell.setCellValue(date.toString());

                    return currentRow + 3;
                }

                private int writeFilterSection(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns, int currentRow)
                {
                    Row rowObject = getRow(sheet, currentRow);
                    Cell titleCell = rowObject.getCell(0, Row.CREATE_NULL_AS_BLANK);
                    titleCell.setCellValue(FILTERS_HEADING);
                    titleCell.setCellStyle(boldStyle);
                    currentRow++;

                    currentRow = writeFilterDetails(ctx, sheet, visibleColumns, currentRow);

                    rowObject = getRow(sheet, currentRow);
                    Cell footerCell = rowObject.getCell(0, Row.CREATE_NULL_AS_BLANK);
                    footerCell.setCellValue(FILTERS_FOOTER);
                    footerCell.setCellStyle(boldStyle);

                    return currentRow;
                }

                private int writeFilterDetails(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns, int currentRow)
                {
                    String previousCategory = "", currentCategory, currentFilter;
                    for (String filter : _filterStrings)
                    {
                        String[] parts = filter.split(Pattern.quote(FILTER_DELIMITER));
                        if (parts.length < 2)
                            continue;
                        currentCategory = parts[0];
                        currentFilter = parts[1];

                        Row rowObject;
                        Cell cell;
                        if (!currentCategory.equals(previousCategory))
                        {
                            currentRow++;
                            rowObject = getRow(sheet, currentRow);
                            cell = rowObject.getCell(1, Row.CREATE_NULL_AS_BLANK);
                            cell.setCellValue(currentCategory);
                            previousCategory = currentCategory;
                            currentRow++;
                        }

                        rowObject = getRow(sheet, currentRow++);
                        cell = rowObject.getCell(2, Row.CREATE_NULL_AS_BLANK);
                        cell.setCellValue(currentFilter);
                    }
                    return currentRow + 1;
                }

                protected Row getRow(Sheet sheet, int rowNumber)
                {
                    Row row = sheet.getRow(rowNumber);
                    if (row == null)
                    {
                        row = sheet.createRow(rowNumber);
                    }
                    return row;
                }

                @Override
                public void renderColumnCaptions(Sheet sheet, List<ExcelColumn> visibleColumns) throws MaxRowsExceededException
                {
                    if (!sheet.getSheetName().equals(METADATA_SHEET))
                        super.renderColumnCaptions(sheet, visibleColumns);
                }
            };
            ew.setFilenamePrefix(getSettings().getQueryName());
            ew.setAutoSize(true);
            return ew;
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    private Results createResults(List<List<String>> rowTexts, List<ColumnInfo> columnInfos)
    {
        List<Map<String, Object>> rows = new ArrayList<>();
        if (rowTexts != null)
        {
            for (List<String> rowText : rowTexts)
            {
                Map<String, Object> row = new HashMap<>();
                for (int i = 0 ; i < columnInfos.size(); i++)
                {
                    row.put(columnInfos.get(i).getAlias(), rowText.get(i));
                }
                rows.add(row);
            }
        }

        List<LabKeyResultSet.Column> cols = new ArrayList<>();
        for (ColumnInfo info : columnInfos)
            cols.add(new LabKeyResultSet.Column(info.getAlias(), String.class));

        ResultSet resultSet = new LabKeyResultSet(rows, cols, null);
        return new ResultsImpl(resultSet, columnInfos);
    }

    private List<ColumnInfo> getColumns(List<String> columnNames)
    {

        List<ColumnInfo> columnInfos = new ArrayList<>();
        for (String column: columnNames)
            columnInfos.add(new ColumnInfo(FieldKey.fromParts(column)));
        return columnInfos;
    }



}
