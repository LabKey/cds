/*
 * Copyright (c) 2015 LabKey Corporation
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

import org.jetbrains.annotations.NotNull;
import org.json.old.JSONArray;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.util.Pair;
import org.labkey.api.visualization.IVisualizationSourceQuery;
import org.labkey.api.visualization.VisualizationIntervalColumn;
import org.labkey.api.visualization.VisualizationProvider;
import org.labkey.api.visualization.VisualizationSourceColumn;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by cnathe on 5/28/2015.
 */
public class CDSVisualizationProvider extends VisualizationProvider<CDSUserSchema>
{
    // TODO: for now, this is just a placeholder VisualizationProvider for the uniqueKey information below.
    // The rest of the implementation for this class will be done as part of the CDS getData implementation story.
    // This class will either need to extend the DataspaceVisualizationProvider or implement the pieces that it needs.

    // base key columns
    private static final String URI_PROT = "http://cpas.labkey.com/CDS#Prot";
    private static final String URI_SUBJECT = "http://cpas.labkey.com/CDS#Subject";
    private static final String URI_VISIT = "http://cpas.labkey.com/CDS#Visit";
    // shared by all assay datasets
    private static final String URI_SPECIMEN_TYPE = "http://cpas.labkey.com/CDS#SpecimenType";
    private static final String URI_LAB = "http://cpas.labkey.com/CDS#Lab";
    // shared by some assay datasets
    private static final String URI_ANTIGEN_PANEL = "http://cpas.labkey.com/CDS#AntigenPanel";
    private static final String URI_ANTIGEN_SUB_PANEL = "http://cpas.labkey.com/CDS#AntigenSubPanel";
    private static final String URI_DATA_SUMMARY_LEVEL = "http://cpas.labkey.com/CDS#DataSummaryLevel";
    private static final String URI_FUNCTIONAL_MARKER_NAME = "http://cpas.labkey.com/CDS#FunctionalMarkerName";
    // per assay dataset keys
    private static final String URI_CELL_TYPE = "http://cpas.labkey.com/CDS#CellType";
    private static final String URI_ISOTYPE = "http://cpas.labkey.com/CDS#Isotype";
    private static final String URI_DILUTION = "http://cpas.labkey.com/CDS#Dilution";
    private static final String URI_INSTRUMENT_TYPE = "http://cpas.labkey.com/CDS#InstrumentType";
    private static final String URI_DETECTION_TYPE = "http://cpas.labkey.com/CDS#DetectionType";
    private static final String URI_TARGET_CELL = "http://cpas.labkey.com/CDS#TargetCell";
    private static final String URI_ANTIGEN_CLADE = "http://cpas.labkey.com/CDS#AntigenClade";
    private static final String URI_ENVELOPE_NEUTRALIZATION_TIER = "http://cpas.labkey.com/CDS#EnvelopeNeutralizationTier";


    private static final Map<String, List<String>> CDS_QUERY_KEYS;
    static
    {
        CDS_QUERY_KEYS = new HashMap<>();

        CDS_QUERY_KEYS.put("Demographic", Arrays.asList(
                URI_PROT,
                URI_SUBJECT
        ));

        CDS_QUERY_KEYS.put("ICS", Arrays.asList(
                URI_PROT,
                URI_SUBJECT,
                URI_VISIT,
                URI_SPECIMEN_TYPE,
                URI_LAB,
                URI_ANTIGEN_PANEL,
                URI_ANTIGEN_SUB_PANEL,
                URI_DATA_SUMMARY_LEVEL,
                URI_FUNCTIONAL_MARKER_NAME,
                URI_CELL_TYPE
        ));

        CDS_QUERY_KEYS.put("ELISpot", Arrays.asList(
                URI_PROT,
                URI_SUBJECT,
                URI_VISIT,
                URI_SPECIMEN_TYPE,
                URI_LAB,
                URI_ANTIGEN_PANEL,
                URI_ANTIGEN_SUB_PANEL,
                URI_DATA_SUMMARY_LEVEL,
                URI_FUNCTIONAL_MARKER_NAME
        ));

        CDS_QUERY_KEYS.put("BAMA", Arrays.asList(
                URI_PROT,
                URI_SUBJECT,
                URI_VISIT,
                URI_SPECIMEN_TYPE,
                URI_LAB,
                URI_ISOTYPE,
                URI_DILUTION,
                URI_INSTRUMENT_TYPE,
                URI_DETECTION_TYPE
        ));

        CDS_QUERY_KEYS.put("NAb", Arrays.asList(
                URI_PROT,
                URI_SUBJECT,
                URI_VISIT,
                URI_SPECIMEN_TYPE,
                URI_LAB,
                URI_TARGET_CELL,
                URI_ANTIGEN_CLADE,
                URI_ENVELOPE_NEUTRALIZATION_TIER
        ));
    }

    public CDSVisualizationProvider(CDSUserSchema schema)
    {
        super(schema);
    }

    @Override
    public boolean isJoinColumn(VisualizationSourceColumn column, Container container)
    {
        return false;
    }

    @Override
    public List<Pair<VisualizationSourceColumn, VisualizationSourceColumn>> getJoinColumns(VisualizationSourceColumn.Factory factory, IVisualizationSourceQuery first, IVisualizationSourceQuery second, boolean isGroupByQuery)
    {
        return null;
    }

    @Override
    public String getSourceCountSql(@NotNull JSONArray sources, JSONArray members, String colName)
    {
        return null;
    }

    @Override
    public void appendAggregates(StringBuilder sql, Map<String, Set<VisualizationSourceColumn>> columnAliases, Map<String, VisualizationIntervalColumn> intervals, String queryAlias, IVisualizationSourceQuery joinQuery, boolean forSelect)
    {}

    @Override
    public void addExtraSelectColumns(VisualizationSourceColumn.Factory factory, IVisualizationSourceQuery query)
    {}

    @Override
    public void addExtraResponseProperties(Map<String, Object> extraProperties)
    {}

    @Override
    public void addExtraColumnProperties(ColumnInfo column, TableInfo table, Map<String, Object> props)
    {
        if (CDS_QUERY_KEYS.containsKey(table.getName()))
        {
            props.put("uniqueKeys", CDS_QUERY_KEYS.get(table.getName()));
        }
    }
}
