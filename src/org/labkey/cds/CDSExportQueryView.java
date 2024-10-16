/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
package org.labkey.cds;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Row.MissingCellPolicy;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFHyperlink;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.*;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.StringUtilsLabKey;
import org.labkey.api.view.DataView;

import jakarta.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class CDSExportQueryView extends QueryView
{
    private static final ExcelWriter.ExcelDocumentType docType = ExcelWriter.ExcelDocumentType.xlsx;

    private static final String METADATA_SHEET = "Metadata";
    private static final String STUDY_SHEET = "Studies";
    private static final String ASSAY_SHEET = "Assays";
    private static final String VARIABLES_SHEET = "Variable definitions";
    private static final String ANTIGENS_SHEET = "Antigens";

    public static final String FILTER_DELIMITER = "|||";

    private static final String FILTERS_FOOTER = "For a list of studies and assays included in this data file, please refer to the Studies and Assays tabs.";
    private static final String FILTERS_FOOTER_TXT = "For a list of studies and assays included in the export, please refer to Studies and Assays files.";

    private static final String CAVD_LINK = "https://dataspace.cavd.org/CAVD/cds-app.view";
    private static final String TOC_TITLE = "IMPORTANT INFORMATION ABOUT THIS DATA:";
    private static final List<String> TOC_1 = Arrays.asList("", "By exporting data from the CAVD DataSpace, you agree to be bound by the Terms of Use available on the CAVD DataSpace sign-in page at " + CAVD_LINK + " .");
    private static final List<String> TOC_2 = Arrays.asList("", "Data included may have additional sharing restrictions; please refer to the Studies tab for details.");
    private static final List<String> TOC_3 = Arrays.asList("", "Please notify the DataSpace team of any presentations or publications resulting from this data and remember to cite the CAVD DataSpace, as well as the grant and study investigators. Thank you!");
    private static final List<List<String>> TOCS = Arrays.asList(Arrays.asList(TOC_TITLE), TOC_1, TOC_2, TOC_3);

    public static final String NETWORK = "network";
    public static final String LABEL = "label";
    public static final String STUDY_NAME = "study_name";
    public static final String GRANT_PI_NAME = "grant_pi_name";
    public static final String INVESTIGATOR_NAME = "investigator_name";
    public static final String PRIMARY_POC_NAME = "primary_poc_name";
    public static final String PRIMARY_POC_EMAIL = "primary_poc_email";
    public static final String DESCRIPTION = "description";
    public static final String TYPE = "type";
    public static final String SPECIES = "species";
    public static final List<String> STUDY_DB_COLUMNS = Arrays.asList(NETWORK, LABEL, STUDY_NAME, GRANT_PI_NAME, INVESTIGATOR_NAME, PRIMARY_POC_NAME, PRIMARY_POC_EMAIL, DESCRIPTION, TYPE, SPECIES);
    private static final List<String> STUDY_COLUMNS = Arrays.asList("Network", "Study", "Grant PI", "Study Investigator", "Primary Contact", "Description", "Study Type", "Species", "Sharing Restrictions");
    public static final String PUBLIC_STUDY = "Available to share with DataSpace members";
    public static final String PRIVATE_STUDY = "Restricted - contact DataSpace team prior to sharing data";

    public static final String PROT = "prot";
    public static final String ASSAY_IDENTIFIER = "assay_identifier";
    public static final String ASSAY_LABEL = "assay_label";
    public static final String PROVENANCE_SOURCE = "provenance_source";
    public static final String PROVENANCE_SUMMARY = "provenance_summary";
    public static final List<String> STUDY_ASSAY_DB_COLUMNS = Arrays.asList(PROT, ASSAY_IDENTIFIER, PROVENANCE_SOURCE, PROVENANCE_SUMMARY);
    public static final List<String> ASSAY_DB_COLUMNS = Arrays.asList(ASSAY_IDENTIFIER, ASSAY_LABEL);
    private static final List<String> ASSAY_COLUMNS = Arrays.asList("Study", "Assay Name", "Data provenance - source", "Data provenance - Notes");
    private static final List<String> VARIABLE_COLUMNS = Arrays.asList("Assay Name", "Field label", "Field description");
    private static final List<String> LEARN_MAB_VARIABLE_COLUMNS = Arrays.asList("Field label", "Field description");
    private static final List<String> BAMA_ASSAY_ANTIGEN_COLUMNS = Arrays.asList("antigen_short_name", "antigen_full_name", "antigen_plot_label",
            "antigen_name_other", "antigen_category", "isolate_species", "isolate_clade", "isolate_clone", "isolate_donor_id", "isolate_mutations",
            "isolate_differentiate", "antigen_type_region", "antigen_type_scaffold", "antigen_type_modifiers", "antigen_type_tags", "antigen_type_differentiate",
            "production_host_cell", "production_purification_method", "production_special_reagent", "production_manufacturer", "production_codon_optimization",
            "transfection_method", "transmitter_founder_status", "isolate_cloner_pi", "isolate_country_origin", "isolate_yr_isolated",
            "isolate_fiebig_stage", "isolate_accession_num", "antigen_control", "cds_ag_id");
    private static final List<String> NAB_ASSAY_ANTIGEN_COLUMNS = Arrays.asList("virus", "virus_full_name", "virus_type", "virus_species",
            "clade", "neutralization_tier", "virus_host_cell", "virus_backbone", "virus_name_other", "antigen_control", "cds_virus_id");

    private final List<String> _filterStrings;
    private final String[] _studies;
    private final String[] _assays;
    private final String[] _columnNamesOrdered;
    private final Map<String, String> _columnAliases;
    private final List<String> _studyassays;
    private final List<String> _variableStrs;
    private final Map<String, CDSController.CDSExportQueryForm> _tabQueryForms;
    private final List<String> _dataTabNames;
    private final String _exportInfoTitle;
    private final String _exportInfoContent;
    private final List<String> _fieldKeys;
    private final List<String> _learnGridFilterValues;
    private String _assayFilterString;
    private String _antigenQuery;

    public CDSExportQueryView(CDSController.ExportForm form, org.springframework.validation.Errors errors)
    {
        super(form, errors);
        _columnNamesOrdered = form.getColumnNamesOrdered();
        _columnAliases = form.getColumnAliases();
        _filterStrings = getFormValues(form.getFilterStrings(), true);
        _studies = form.getStudies().toArray(new String[0]);
        _assays = form.getAssays().toArray(new String[0]);
        _studyassays = getFormValues(form.getStudyAssays(), false);
        _variableStrs = getFormValues(form.getVariables(), false);
        _tabQueryForms = form.getTabQueryForms();
        _dataTabNames = getFormValues(form.getDataTabNames(), false);
        _exportInfoTitle = form.getExportInfoTitle();
        _exportInfoContent = form.getExportInfoContent();
        _fieldKeys = form.getFieldKeys() != null ? Arrays.asList(form.getFieldKeys()) : null;
        _learnGridFilterValues = form.getLearnGridFilterValues() != null ? Arrays.asList(form.getLearnGridFilterValues()) : null;
        _assayFilterString = form.getAssayFilterString();
        _antigenQuery = form.getAntigenQuery();
    }

    private List<String> getFormValues(String[] formValues, boolean sort)
    {
        if (formValues != null && formValues.length > 0)
        {
            List<String> sortedFilters = Arrays.asList(formValues);
            if (sort)
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
                if (col.getColumnInfo() != null && colName.equalsIgnoreCase(col.getColumnInfo().getName()))
                {
                    col.setCaption(_columnAliases.get(col.getColumnInfo().getName()));
                    exportColumns.add(col);
                    break;
                }
                else if (colName.equalsIgnoreCase(col.getName()))
                {
                    col.setCaption(_columnAliases.get(col.getName()));
                    exportColumns.add(col);
                    break;
                }
            }
        }
        return exportColumns;
    }

    public QueryView getQueryView(boolean isLearnGrid, boolean isLearnAssay, @Nullable CDSController.CDSExportQueryForm queryForm)
    {
        QueryView queryView;
        QuerySettings settings;

        if (isLearnGrid)
        {
            UserSchema schema = QueryService.get().getUserSchema(getViewContext().getUser(), getViewContext().getContainer(), "CDS");
            settings = schema.getSettings(getViewContext(), "query", _tabQueryForms.get(_dataTabNames.get(0)).getQueryName());
            if (_learnGridFilterValues != null && _learnGridFilterValues.size() > 0)
            {
                List<Integer> productIds;
                if (_dataTabNames.get(0).equalsIgnoreCase("products"))
                {
                    productIds = _learnGridFilterValues.stream().map(value -> Integer.parseInt(value)).collect(Collectors.toList());
                    settings.setBaseFilter(new SimpleFilter(FieldKey.fromParts(_fieldKeys.get(0)), productIds, CompareType.IN));
                }
                else
                {
                    settings.setBaseFilter(new SimpleFilter(FieldKey.fromParts(_fieldKeys.get(0)), _learnGridFilterValues, CompareType.IN));
                }
            }
            queryView = schema.createView(getViewContext(), settings, null);
        }
        else if (isLearnAssay)
        {
            UserSchema schema = QueryService.get().getUserSchema(getViewContext().getUser(), getViewContext().getContainer(), "CDS");
            settings = schema.getSettings(getViewContext(), "query", _tabQueryForms.get(_dataTabNames.get(0)).getQueryName());
            settings.setBaseFilter(new SimpleFilter(FieldKey.fromParts(_fieldKeys.get(0)), _assayFilterString, CompareType.IN));
            queryView = schema.createView(getViewContext(), settings, null);
        }
        else
        {
            queryView = new QueryView((null == queryForm) ? _tabQueryForms.get(_dataTabNames.get(0)) : queryForm, null);
        }
        return queryView;
    }

    public void writeExcelToResponse(HttpServletResponse response, boolean isLearnGrid, boolean isLearnAssay) throws IOException
    {
        ExcelWriter ew = getCDSExcelWriter(this, isLearnGrid, isLearnAssay);
        ew.renderWorkbook(response);
        logAuditEvent("Exported to Excel", ew.getDataRowCount());
    }

    private Results getStudies(List<ColumnInfo> studyColumns)
    {
        List<List<String>> exportableStudies = getExportableStudies(_studies, getViewContext().getContainer());
        return createResults(exportableStudies, studyColumns);
    }

    private Results getAssays(List<ColumnInfo> assayColumns)
    {
        List<List<String>> exportableAssays = getExportableStudyAssays(_studyassays, _studies, _assays);
        return createResults(exportableAssays, assayColumns);
    }

    private Results getVariables(List<ColumnInfo> variableColumns, boolean isLearnGrid)
    {
        List<List<String>> exportableVariables = new ArrayList<>();
        for (String variableStr : _variableStrs)
        {
            String[] parts = variableStr.split(Pattern.quote(FILTER_DELIMITER));
            if (parts.length != 3 && !isLearnGrid)
                continue;
            exportableVariables.add(Arrays.asList(parts));
        }
        return createResults(exportableVariables, variableColumns);
    }

    protected String getFileNamePrefix()
    {
        return "CDS Export";
    }

    protected String getFilterHeaderString()
    {
        return "Filters";
    }

    protected boolean hasExtraExportInfo()
    {
        return false;
    }

    /**
     * Note: Caller must close() the returned ExcelWriter (via try-with-resources, e.g.)
     */
    private ExcelWriter getCDSExcelWriter(CDSExportQueryView eqv, boolean isLearnGrid, boolean isLearnAssay) throws IOException
    {
        QueryView queryView = eqv.getQueryView(isLearnGrid, isLearnAssay, null);
        QuerySettings settings = queryView.getSettings();
        DataView view = queryView.createDataView();
        DataRegion rgn = view.getDataRegion();
        rgn.prepareDisplayColumns(view.getViewContext().getContainer());
        rgn.setAllowAsync(false);
        prepareQuerySettings(settings);

        RenderContext rc = view.getRenderContext();
        ExcelWriter ew = new ExcelWriter(() -> rgn.getResults(rc), getExportColumns(rgn.getDisplayColumns()), docType)
        {
            private XSSFCellStyle importantStyle = null;
            private XSSFCellStyle boldStyle = null;

            @Override
            public void renderGrid(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns) throws MaxRowsExceededException, SQLException, IOException
            {
                if (!sheet.getSheetName().equals(METADATA_SHEET))
                {
                    super.renderGrid(ctx, sheet, visibleColumns);
                    return;
                }

                XSSFFont importantFont = (XSSFFont) sheet.getWorkbook().createFont();
                importantFont.setFontHeightInPoints((short) 14);
                importantFont.setBold(true);

                XSSFFont boldFont = (XSSFFont) sheet.getWorkbook().createFont();
                boldFont.setBold(true);

                importantStyle = (XSSFCellStyle) sheet.getWorkbook().createCellStyle();
                importantStyle.setFont(importantFont);
                boldStyle = (XSSFCellStyle) sheet.getWorkbook().createCellStyle();
                boldStyle.setFont(boldFont);

                int currentRow = writeTOC(sheet, 0);
                currentRow = writeExportDate(sheet, currentRow);
                if (hasExtraExportInfo())
                    currentRow = writeExportInfo(sheet, currentRow);
                writeFilterSection(ctx, sheet, visibleColumns, currentRow);
            }

            private int writeTOC(Sheet sheet, int currentRow)
            {
                for (List<String> row : TOCS)
                {
                    for (int col = 0; col < row.size(); col++)
                    {
                        String value = row.get(col);
                        if (StringUtils.isEmpty(value))
                            continue;

                        Row rowObject = getRow(sheet, currentRow);
                        Cell cell = rowObject.getCell(col, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                        cell.setCellValue(value);

                        if (col == 0)
                        {
                            if (currentRow == 0)
                                cell.setCellStyle(importantStyle);
                            else
                                cell.setCellStyle(boldStyle);
                        }

                        // CAVD link
                        if (currentRow == 1)
                        {
                            CreationHelper createHelper = sheet.getWorkbook().getCreationHelper();
                            XSSFHyperlink link = (XSSFHyperlink) createHelper.createHyperlink(HyperlinkType.URL);
                            link.setAddress(CAVD_LINK);
                            cell.setHyperlink(link);
                        }
                    }
                    currentRow++;
                }

                return currentRow + 2;
            }

            private int writeExportDate(Sheet sheet, int currentRow)
            {
                Row rowObject = getRow(sheet, currentRow);
                Cell titleCell = rowObject.getCell(0, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                titleCell.setCellValue("Date Exported:");
                titleCell.setCellStyle(boldStyle);

                rowObject = getRow(sheet, ++currentRow);
                Cell valueCell = rowObject.getCell(1, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                Date date = new Date();
                valueCell.setCellValue(date.toString());

                return currentRow + 3;
            }

            private int writeExportInfo(Sheet sheet, int currentRow)
            {
                Row rowObject = getRow(sheet, currentRow);
                Cell titleCell = rowObject.getCell(0, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                titleCell.setCellValue(_exportInfoTitle);
                titleCell.setCellStyle(boldStyle);

                rowObject = getRow(sheet, ++currentRow);
                Cell valueCell = rowObject.getCell(1, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                valueCell.setCellValue(_exportInfoContent);

                return currentRow + 3;
            }

            private int writeFilterSection(RenderContext ctx, Sheet sheet, List<ExcelColumn> visibleColumns, int currentRow)
            {
                Row rowObject = getRow(sheet, currentRow);
                Cell titleCell = rowObject.getCell(0, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                titleCell.setCellValue(getFilterHeaderString());
                titleCell.setCellStyle(boldStyle);
                currentRow++;

                currentRow = writeFilterDetails(sheet, currentRow);

                rowObject = getRow(sheet, currentRow);
                Cell footerCell = rowObject.getCell(0, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                if (!isLearnGrid && !isLearnAssay)
                {
                    footerCell.setCellValue(FILTERS_FOOTER);
                }
                footerCell.setCellStyle(boldStyle);

                return currentRow;
            }

            private int writeFilterDetails(Sheet sheet, int currentRow)
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
                        cell = rowObject.getCell(1, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                        cell.setCellValue(currentCategory);
                        previousCategory = currentCategory;
                        currentRow++;
                    }

                    rowObject = getRow(sheet, currentRow++);
                    cell = rowObject.getCell(2, MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    cell.setCellValue(currentFilter);
                }
                return currentRow + 1;
            }

            private Row getRow(Sheet sheet, int rowNumber)
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

            @Override
            protected void renderSheets(Workbook workbook)
            {
                ColumnHeaderType headerType = ColumnHeaderType.Caption;

                setFilenamePrefix(eqv.getFileNamePrefix());
                setCaptionType(headerType);
                setShowInsertableColumnsOnly(false, null);
                setSheetName(_dataTabNames.get(0)); // the 1st data source sheet

                if (!isLearnGrid)
                {
                    if (_dataTabNames.size() > 1) // if multiple data sources, write the other data sheets
                    {
                        for (int i = 1; i < _dataTabNames.size(); i++)
                        {
                            String tabName = _dataTabNames.get(i);
                            CDSController.CDSExportQueryForm queryform = _tabQueryForms.get(tabName);
                            renderNewSheet(workbook);
                            QueryView qv = new QueryView(queryform, null);
                            DataView dv = qv.createDataView();
                            DataRegion dataRegion = dv.getDataRegion();
                            dataRegion.prepareDisplayColumns(dv.getViewContext().getContainer());
                            dataRegion.setAllowAsync(false);
                            prepareQuerySettings(qv.getSettings());

                            setResultsFactory(() -> dataRegion.getResults(dv.getRenderContext()));
                            setDisplayColumns(getExportColumns(dataRegion.getDisplayColumns()));
                            setSheetName(tabName);
                            setAutoSize(true);
                            logAuditEvent("Exported to Excel", getDataRowCount());
                        }
                    }
                }

                if (!isLearnGrid || (isLearnGrid && _dataTabNames.get(0).equalsIgnoreCase("mabs")))
                {
                    renderNewSheet(workbook);
                    ColumnInfo filterColumnInfo = new BaseColumnInfo(METADATA_SHEET, JdbcType.VARCHAR);
                    setColumns(Collections.singletonList(filterColumnInfo));
                    setSheetName(METADATA_SHEET);
                }

                if (!isLearnGrid && !isLearnAssay)
                {
                    renderNewSheet(workbook);
                    List<ColumnInfo> studyColumns = eqv.getColumns(STUDY_COLUMNS);
                    setColumns(studyColumns);
                    setResultsFactory(() -> getStudies(studyColumns));
                    setSheetName(STUDY_SHEET);
                    setCaptionRowFrozen(false);

                    renderNewSheet(workbook);
                    List<ColumnInfo> assayColumns = eqv.getColumns(ASSAY_COLUMNS);
                    setColumns(assayColumns);
                    setResultsFactory(() -> getAssays(assayColumns));
                    setSheetName(ASSAY_SHEET);
                    setCaptionRowFrozen(false);
                }

                if (!isLearnGrid || (isLearnGrid && _dataTabNames.get(0).equalsIgnoreCase("mabs")))
                {
                    renderNewSheet(workbook);
                    List<ColumnInfo> variableColumns;
                    if (isLearnGrid && _dataTabNames.get(0).equalsIgnoreCase("mabs"))
                    {
                        variableColumns = eqv.getColumns(LEARN_MAB_VARIABLE_COLUMNS);
                    }
                    else
                    {
                        variableColumns = eqv.getColumns(VARIABLE_COLUMNS);
                    }
                    setColumns(variableColumns);
                    setResultsFactory(() -> getVariables(variableColumns, isLearnGrid));
                    setSheetName(VARIABLES_SHEET);
                    setCaptionRowFrozen(false);
                }

                if (isLearnAssay && null != _antigenQuery)
                {
                    renderNewSheet(workbook);
                    setColumns(getAssayAntigenColumns());
                    setResultsFactory(() -> getAntigens());
                    setSheetName(ANTIGENS_SHEET);
                    setCaptionRowFrozen(false);
                }

                setCaptionType(getColumnHeaderType());
                renderNewSheet(workbook);

                workbook.setActiveSheet(0);
            }
        };

        ew.setFilenamePrefix(eqv.getFileNamePrefix());
        ew.setAutoSize(true);
        return ew;
    }

    private void prepareQuerySettings(QuerySettings settings)
    {
        settings.setShowRows(ShowRows.PAGINATED);
        settings.setMaxRows(docType.getMaxRows());
        settings.setOffset(Table.NO_OFFSET);
    }

    private Results createResults(List<List<String>> rowTexts, List<ColumnInfo> columnInfos)
    {
        List<Map<String, Object>> rows = new ArrayList<>();
        if (rowTexts != null)
        {
            for (List<String> rowText : rowTexts)
            {
                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                for (int i = 0; i < columnInfos.size(); i++)
                {
                    row.put(columnInfos.get(i).getAlias(), rowText.get(i));
                }
                rows.add(row);
            }
        }
        List<String> cols = columnInfos.stream().map(ColumnInfo::getAlias).collect(Collectors.toList());
        return new ResultsImpl(CachedResultSets.create(rows, cols), columnInfos);
    }

    private List<ColumnInfo> getColumns(List<String> columnNames)
    {
        return columnNames.stream().map(column -> {
            BaseColumnInfo columnInfo = new BaseColumnInfo(column, JdbcType.VARCHAR);
            columnInfo.setInputRows(1); // force single row to avoid text wrap
            return columnInfo;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudies(String[] studyNames)
    {
        List<Map<String, Object>> studies = new ArrayList<>();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromParts(getStudyWhereField()), Arrays.asList(studyNames), CompareType.IN);
        SchemaTableInfo table = CDSSchema.getInstance().getSchema().getTable("study");

        try (Results results = new TableSelector(table, getDBColumns(table, STUDY_DB_COLUMNS), filter, null).getResults())
        {
            while (results.next())
            {
                studies.add(results.getRowMap());
            }
        }
        catch (SQLException e)
        {
            return studies;
        }
        return studies;
    }

    protected String getStudyWhereField()
    {
        return LABEL;
    }

    public List<List<String>> getExportableStudies(String[] studyNames, Container container)
    {
        List<List<String>> allStudies = new ArrayList<>();
        List<String> studyFolders = new ArrayList<>();
        List<Map<String, Object>> studyMaps = getStudies(studyNames);
        for (Map<String, Object> studyMap : studyMaps)
            studyFolders.add((String) studyMap.get(STUDY_NAME));

        List<String> publicStudies = getPublicStudies(studyFolders, container);

        for (Map<String, Object> studyMap : studyMaps)
        {
            List<String> studyValues = new ArrayList<>();
            studyValues.add((String) studyMap.get(NETWORK));
            studyValues.add((String) studyMap.get(LABEL));
            studyValues.add((String) studyMap.get(GRANT_PI_NAME));
            studyValues.add((String) studyMap.get(INVESTIGATOR_NAME));
            studyValues.add((studyMap.get(PRIMARY_POC_NAME)) + " (" + (studyMap.get(PRIMARY_POC_EMAIL)) + ")");
            studyValues.add((String) studyMap.get(DESCRIPTION));
            studyValues.add((String) studyMap.get(TYPE));
            studyValues.add((String) studyMap.get(SPECIES));
            String accessLevel = publicStudies != null && publicStudies.contains(studyMap.get(STUDY_NAME)) ? PUBLIC_STUDY : PRIVATE_STUDY;
            studyValues.add(accessLevel);
            allStudies.add(studyValues);
        }

        // sort by network
        allStudies.sort(Comparator.comparing(study -> study.get(0)));

        return allStudies;
    }

    public Map<String, String> getAssayLabels(String[] assayIdentifiers)
    {
        Map<String, String> assays = new HashMap<>();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromParts(ASSAY_IDENTIFIER), Arrays.asList(assayIdentifiers), CompareType.IN);
        SchemaTableInfo table = CDSSchema.getInstance().getSchema().getTable("assay");
        try (Results results = new TableSelector(table, getDBColumns(table, ASSAY_DB_COLUMNS), filter, null).getResults())
        {
            while (results.next())
            {
                Map<String, Object> resultMap = results.getRowMap();
                assays.put((String) resultMap.get(ASSAY_IDENTIFIER), (String) resultMap.get(ASSAY_LABEL));
            }
        }
        catch (SQLException e)
        {
            return assays;
        }
        return assays;

    }

    public List<Map<String, Object>> getStudyAssays(List<String> studyFolders, String[] assayIdentifiers)
    {
        List<Map<String, Object>> studyassays = new ArrayList<>();
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromParts(PROT), studyFolders, CompareType.IN);
        filter.addCondition(FieldKey.fromParts(ASSAY_IDENTIFIER), Arrays.asList(assayIdentifiers), CompareType.IN);
        SchemaTableInfo table = CDSSchema.getInstance().getSchema().getTable("studyassay");

        try (Results results = new TableSelector(table, getDBColumns(table, STUDY_ASSAY_DB_COLUMNS), filter, null).getResults())
        {
            while (results.next())
                studyassays.add(results.getRowMap());
        }
        catch (SQLException e)
        {
            return studyassays;
        }
        return studyassays;
    }

    public List<List<String>> getExportableStudyAssays(List<String> studyAssayStrs, String[] studyNames, String[] assayIdentifiers)
    {
        List<List<String>> allStudyAssays = new ArrayList<>();
        Map<String, String> studyFolders = new HashMap<>();
        List<Map<String, Object>> studyMaps = getStudies(studyNames);
        for (Map<String, Object> studyMap : studyMaps)
            studyFolders.put((String) studyMap.get(STUDY_NAME), (String) studyMap.get(LABEL));

        List<Map<String, Object>> studyAssays = getStudyAssays(new ArrayList<>(studyFolders.keySet()), assayIdentifiers);
        Map<String, String> assayLabels = getAssayLabels(assayIdentifiers);

        for (Map<String, Object> studyAssay : studyAssays)
        {
            String studyFolder = (String) studyAssay.get(PROT);
            String studyLabel = studyFolders.get(studyFolder);
            String assayIdentifier = (String) studyAssay.get(ASSAY_IDENTIFIER);
            if (!isValidStudyAssayPair(studyAssayStrs, studyFolder, studyLabel, assayIdentifier))
                continue;

            List<String> studyAssayValues = new ArrayList<>();
            studyAssayValues.add(studyLabel);
            studyAssayValues.add(assayLabels.get(assayIdentifier));
            studyAssayValues.add((String) studyAssay.get(PROVENANCE_SOURCE));
            studyAssayValues.add((String) studyAssay.get(PROVENANCE_SUMMARY));
            allStudyAssays.add(studyAssayValues);
        }
        // sort by assay name, then by study
        allStudyAssays.sort((o1, o2) -> {
            if (!o1.get(1).equals(o2.get(1)))
                return o1.get(1).compareTo(o2.get(1));
            return o1.get(0).compareTo(o2.get(0));
        });
        return allStudyAssays;
    }

    private QueryView getAssayAntigenQueryView()
    {
        UserSchema schema = QueryService.get().getUserSchema(getViewContext().getUser(), getViewContext().getContainer(), "CDS");
        QuerySettings settings = schema.getSettings(getViewContext(), "query", _antigenQuery);
        settings.setBaseFilter(new SimpleFilter(FieldKey.fromParts(_fieldKeys.get(0)), _assayFilterString, CompareType.IN));
        QueryView queryView = schema.createView(getViewContext(), settings, null);
        queryView.setCustomView("AssayAntigenExportView");

        return queryView;
    }

    private List<ColumnInfo> getAssayAntigenColumns()
    {
        QueryView view = getAssayAntigenQueryView();
        return getAssayAntigenColumns(view);
    }

    private List<ColumnInfo> getAssayAntigenColumns(QueryView view)
    {
        List<ColumnInfo> columnInfos = new ArrayList<>();
        for (DisplayColumn dc : view.getDisplayColumns())
        {
            if (null == dc.getColumnInfo())
                continue;
            ColumnInfo colInfo = dc.getColumnInfo();
            columnInfos.add(colInfo);
        }
        return columnInfos;
    }

    private List<DisplayColumn> getAssayAntigenDisplayColumns()
    {
        QueryView view = getAssayAntigenQueryView();
        List<DisplayColumn> displayCols = new ArrayList<>();
        for (DisplayColumn dc : view.getDisplayColumns())
        {
            if (null == dc.getColumnInfo())
                continue;
            displayCols.add(dc);
        }
        return displayCols;
    }

    private Results getAntigens() throws IOException, SQLException
    {
        QueryView queryView = getAssayAntigenQueryView();
        return queryView.getResults();
    }

    protected boolean isValidStudyAssayPair(List<String> studyAssayStrs, String studyFolder, String studyLabel, String assayIdentifier)
    {
        return studyAssayStrs.contains(studyLabel + FILTER_DELIMITER + assayIdentifier);
    }

    public List<ColumnInfo> getDBColumns(TableInfo table, List<String> columnNames)
    {
        List<ColumnInfo> columnInfos = new ArrayList<>();
        for (String column : columnNames)
            columnInfos.add(table.getColumn(column));
        return columnInfos;
    }

    public List<String> getPublicStudies(List<String> studyFolders, Container project)
    {
        List<String> publicStudies = new ArrayList<>();
        for (Container c : project.getChildren())
        {
            if (!studyFolders.contains(c.getName()))
                continue;
            if (!c.getPolicy().getResourceId().equals(c.getResourceId()))
                publicStudies.add(c.getName());
        }
        return publicStudies;
    }

    private void copyFileToZip(File tmpFile, ZipOutputStream out) throws IOException
    {
        try (InputStream in = new FileInputStream(tmpFile))
        {
            FileUtil.copyData(in, out);
        }
        finally
        {
            tmpFile.delete();
        }
    }

    private TSVGridWriter getTSVGridWriter(boolean isLearnGrid, boolean isLearnAssay, @Nullable CDSController.CDSExportQueryForm queryForm)
    {
        QueryView queryView = getQueryView(isLearnGrid, isLearnAssay, queryForm);
        DataView view = queryView.createDataView();
        DataRegion rgn = view.getDataRegion();
        rgn.prepareDisplayColumns(view.getViewContext().getContainer());
        rgn.setAllowAsync(false);
        prepareQuerySettings(queryView.getSettings());

        return new TSVGridWriter(() -> rgn.getResults(view.getRenderContext()), getExportColumns(rgn.getDisplayColumns()));
    }

    private void writeCSVQueries(ZipOutputStream out, boolean isLearnGrid, boolean isLearnAssay) throws IOException
    {
        for (String tabName : _dataTabNames)
        {
            ZipEntry entry = new ZipEntry(tabName + ".csv");
            out.putNextEntry(entry);

            final File tmpFile;

            try (TSVGridWriter tsv = getTSVGridWriter(isLearnGrid, isLearnAssay, _tabQueryForms.get(tabName)))
            {
                tsv.setDelimiterCharacter(TSVWriter.DELIM.COMMA);
                tmpFile = FileUtil.createTempFile("tmp" + tabName + FileUtil.getTimestamp(), null);
                tmpFile.deleteOnExit();
                tsv.write(tmpFile);
                logAuditEvent("Exported to CSV", tsv.getDataRowCount());
            }

            copyFileToZip(tmpFile, out);
        }
    }

    private void writeGridCSV(String tabName, ResultsFactory factory, ZipOutputStream out) throws IOException
    {
        final File tmpFile;

        try (TSVGridWriter tsv = new TSVGridWriter(factory))
        {
            tsv.setDelimiterCharacter(TSVWriter.DELIM.COMMA);
            tmpFile = FileUtil.createTempFile("tmp" + tabName + FileUtil.getTimestamp(), null);
            tmpFile.deleteOnExit();
            tsv.write(tmpFile);
        }

        ZipEntry entry = new ZipEntry(tabName + ".csv");
        out.putNextEntry(entry);
        copyFileToZip(tmpFile, out);
    }

    private void writeGridCSV(String tabName, ResultsFactory factory, ZipOutputStream out, List<DisplayColumn> displayColumns) throws IOException
    {
        final File tmpFile;

        try (TSVGridWriter tsv = new TSVGridWriter(factory, displayColumns))
        {
            tsv.setDelimiterCharacter(TSVWriter.DELIM.COMMA);
            tmpFile = File.createTempFile("tmp" + tabName + FileUtil.getTimestamp(), null);
            tmpFile.deleteOnExit();
            tsv.write(tmpFile);
        }

        ZipEntry entry = new ZipEntry(tabName + ".csv");
        out.putNextEntry(entry);
        copyFileToZip(tmpFile, out);
    }

    private void writeExtraCSVs(ZipOutputStream out, boolean isLearnGrid, boolean isLearnAssay) throws IOException
    {
        if (!isLearnGrid & !isLearnAssay)
        {
            writeGridCSV(STUDY_SHEET, () -> getStudies(getColumns(STUDY_COLUMNS)), out);
            writeGridCSV(ASSAY_SHEET, () -> getAssays(getColumns(ASSAY_COLUMNS)), out);
        }
        List<ColumnInfo> variableColumns;
        if (!isLearnGrid || (isLearnGrid && _dataTabNames.get(0).equalsIgnoreCase("mabs")))
        {
            if (isLearnGrid && _dataTabNames.get(0).equalsIgnoreCase("mabs"))
            {
                variableColumns = getColumns(LEARN_MAB_VARIABLE_COLUMNS);
            }
            else
            {
                variableColumns = getColumns(VARIABLE_COLUMNS);
            }
            writeGridCSV(VARIABLES_SHEET, ()->getVariables(variableColumns, isLearnGrid), out);
        }
        if (isLearnAssay && null != _antigenQuery)
        {
            writeGridCSV(ANTIGENS_SHEET, ()-> getAntigens(), out, getAssayAntigenDisplayColumns());
        }
    }

    public void writeCSVToResponse(HttpServletResponse response, boolean isLearnGrid,boolean isLearnAssay) throws IOException
    {
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + getFileNamePrefix() + "_" + FileUtil.getTimestamp() + ".zip\"");

        try (ZipOutputStream out = new ZipOutputStream(response.getOutputStream()))
        {
            writeCSVQueries(out, isLearnGrid, isLearnAssay);
            writeMetadataTxt(out, isLearnGrid, isLearnAssay);
            writeExtraCSVs(out, isLearnGrid, isLearnAssay);
        }
    }

    private void writeMetadataTxt(ZipOutputStream out, boolean isLearnGrid, boolean isLearnAssay) throws IOException
    {
        if (!isLearnGrid || (isLearnGrid && _dataTabNames.get(0).equalsIgnoreCase("mabs")))
        {
            ZipEntry entry = new ZipEntry("Metadata.txt");
            out.putNextEntry(entry);

            StringBuilder builder = new StringBuilder();

            // term of use
            for (List<String> row : TOCS)
            {
                for (int col = 0; col < row.size(); col++)
                {
                    builder.append(row.get(col)).append(col == row.size() - 1 ? "\n" : "\t");
                }
            }

            // export date
            builder.append("\nDate Exported: \n");
            Date date = new Date();
            builder.append("\t").append(date.toString()).append("\n");

            if (hasExtraExportInfo())
            {
                builder.append("\n" + _exportInfoTitle + ": \n");
                builder.append("\t").append(_exportInfoContent).append("\n");
            }

            // filters
            builder.append("\n" + getFilterHeaderString() + "\n");
            String previousCategory = "", currentCategory, currentFilter;
            for (String filter : _filterStrings)
            {
                String[] parts = filter.split(Pattern.quote(FILTER_DELIMITER));
                if (parts.length < 2)
                    continue;
                currentCategory = parts[0];
                currentFilter = parts[1];

                if (!currentCategory.equals(previousCategory))
                {
                    builder.append("\t").append(currentCategory).append("\n");
                    previousCategory = currentCategory;
                }
                builder.append("\t\t").append(currentFilter).append("\n");
            }
            if (!isLearnGrid && !isLearnAssay)
            {
                builder.append("\n" + FILTERS_FOOTER_TXT + "\n");
            }

            File tmpFile = FileUtil.createTempFile("tmpMetadata" + FileUtil.getTimestamp(), null);
            tmpFile.deleteOnExit();

            FileUtils.writeStringToFile(tmpFile, builder.toString(), StringUtilsLabKey.DEFAULT_CHARSET);
            copyFileToZip(tmpFile, out);
        }
    }
}
