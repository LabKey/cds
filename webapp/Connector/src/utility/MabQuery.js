/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
// This is a singleton for cds getMabData query utilities
Ext.define('Connector.utility.MabQuery', {

    alternateClassName: ['MabQueryUtils'],

    singleton: true,

    MAB_GRID_BASE: 'cds.mAbGridBase',

    MAB_GRID_BASE_ALIAS: 'CDS_MabGridBase',

    MAB_Dataset: 'study.NABMAb',

    MAB_Dataset_ALIAS: 'STUDY_NABMAb',

    MAB_META_GRID_BASE: 'cds.mAbMetaGridBase',

    MAB_META_GRID_BASE_ALIAS: 'CDS_mAbMetaGridBase',

    MAB_MIX_MAB_FULL_META: 'cds.MAbMixMAbMeta', // user defined query

    MAB_DATASET_WITH_MIX_META: 'study.NAbMAbWithMixMeta', // user defined query

    MAB_CHARACTERISTICS: "Mab characteristics",

    MAB_MIX_ID: 'mab_mix_id',

    MAB_MIX_NAME_STD: 'mab_mix_name_std',

    COUNT_COLUMNS: ['study', 'virus', 'clade', 'neutralization_tier'],

    ASSAY_KEY_COLUMNS: ['mab_mix_id', 'study', 'virus', 'target_cell', 'lab_code', 'summary_level', 'curve_id'],

    ASSAY_FILTER_COLUMNS: ['study', 'tier_clade_virus'],

    IC50_COLUMN: 'titer_curve_ic50',

    VIRUS_FILTER_COLUMN: 'tier_clade_virus',

    IC50_GROUP_COLUMN: 'titer_curve_ic50_group',

    VIRUS_COLUMNS: ['neutralization_tier', 'clade', 'virus'],

    BLANK_VALUE: '[blank]',

    IC50Ranges: {
        'G0.1' : [null, '< 0.1'],
        'G1' : ['>= 0.1', '< 1'],
        'G10' : ['>= 1', '< 10'],
        'G50' : ['>= 10', '<= 50'],
        'G50+' : ['> 50', null]
    },

    BASE_EXPORT_COLUMNS : ['prot', 'mab_mix_id', 'mab_mix_label', 'mab_mix_name_std', 'mab_name_source', 'mab_id', 'mab_name_std',
        'mab_lanlid', 'mab_hxb2_location', 'mab_ab_binding_type', 'mab_isotype', 'mab_donorid', 'mab_donor_species', 'mab_donor_clade'],
    BASE_EXPORT_COLUMN_LABLES : ['Study', 'Mab Mix Id', 'Mab Mix Label', 'Mab Mix Name Std', 'Mab Name Source', 'Mab Id', 'Mab Name Std',
        'Mab Lanl Id', 'Mab Hxb2 Location', 'Mab Ab Binding Type', 'Mab Isotype', 'Mab Donor Id', 'Mab Donor Species', 'Mab Donor Clade'],

    logging: false,

    constructor: function (config) {
        this.callParent([config]);
        if (Ext.isDefined(LABKEY.ActionURL.getParameters()['logQuery'])) {
            this.logging = true;
        }
    },

    getMetaData: function (config) {
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'mAbMetaGridBase',
            success: function (response) {
                config.success.call(config.scope, response);
            },
            failure: config.failure,
            scope: this
        });
    },

    _executeSql: function(config, sql) {
        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: sql,
            success: function (response) {
                config.success.call(config.scope, response, config);
            },
            failure: config.failure,
            scope: this
        });
    },

    getMabUniqueValues: function(config) {
        var sql = null;
        if (config.isMeta)
            sql = this._generateMabMetaUniqueValuesSql(config);
        else
            sql = this._generateMabAssayUniqueValuesSql(config);

        if (this.logging) {
            if (config.isMeta)
                console.log(this._generateMabMetaUniqueValuesSql(config, true));
            else
                console.log(this._generateMabAssayUniqueValuesSql(config, true));
        }

        this._executeSql(config, sql);
    },

    getData: function (config) {
        if (this.logging) {
            console.log(this._generateMAbSql(true));
        }
        this._executeSql(config, this._generateMAbSql());
    },

    getMabViruses: function(config) {
        if (this.logging) {
            console.log(this._generateVirusCountSql(config, true));
        }
        this._executeSql(config, this._generateVirusCountSql(config));
    },

    _generateVirusCountSql: function(config, forDebugging) {
        return '(' + this._generateActiveVirusCountSql(forDebugging) + ')\n\t UNION \n\t(' + this._generateAllVirusCountSql() + ')';
    },

    _generateActiveVirusCountSql: function(forDebugging) {
        var SELECT = ['SELECT '], sep = "\n\t";
        Ext.each(this.VIRUS_COLUMNS, function(col) {
            SELECT.push(col + ',' + sep);
        }, this);
        SELECT.push('COUNT(DISTINCT ' + this.MAB_MIX_ID + ') as subjectCount ' + sep);

        var WHERE = this._getMabStateFilterWhere(true, forDebugging);
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getVirusGroupBy();
    },

    _generateAllVirusCountSql: function() {
        var SELECT = ['SELECT '], sep = "\n\t";
        Ext.each(this.VIRUS_COLUMNS, function(col) {
            SELECT.push(col + ',' + sep);
        }, this);
        SELECT.push('0 as subjectCount ' + sep);

        var WHERE = [];
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getVirusGroupBy();
    },

    _getVirusGroupBy: function() {
        return  "\n\t" + 'GROUP BY ' + this.VIRUS_COLUMNS.toString() + "\n\t";
    },

    _generateMabMetaUniqueValuesSql: function(config, forDebugging) {
        var sep = "\n\t", WHERE = [];
        var SELECT = 'SELECT DISTINCT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + config.fieldName;
        if (config.useFilter) {
            WHERE.push(this._getActiveMabMixIdWhere(forDebugging));
        }

        return SELECT + sep + this._getMabMixMetaFrom() + sep +
                this._buildWhere(WHERE) + sep + 'ORDER BY ' + config.fieldName;
    },

    _getActiveMabMixIdWhere: function(forDebugging, includeSelection, isExport) {
        var sub = this._generateMabAssayUniqueValuesSql({
            useFilter: true,
            fieldName: this.MAB_MIX_ID
        }, forDebugging, includeSelection, isExport);
        return this.MAB_MIX_ID + ' IN (' + sub + ') ';
    },

    _buildWhere: function(WHERE) {
        return (WHERE.length === 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND ");
    },

    _generateMabAssayUniqueValuesSql: function(config, forDebugging, includeSelection, isExport) {
        var sep = "\n\t", WHERE = [];
        var SELECT = 'SELECT DISTINCT ' + this.MAB_GRID_BASE_ALIAS + '.' + config.fieldName;
        if (config.useFilter) {
            WHERE = this._getMabStateFilterWhere(false, forDebugging, includeSelection, isExport)
        }

        return SELECT + sep + this._getAssayFrom() + sep +
                this._buildWhere(WHERE) + sep + 'ORDER BY ' + config.fieldName;
    },

    _getMabStateFilterWhere: function(excludeVirus, forDebugging, includeSelection, isExport) {
        var assayFilters = [], metaFilters = [], ic50Filter, WHERE = [];
        var stateFilters = Connector.getState().getMabFilters(true);
        Ext.each(stateFilters, function(filter)
        {
            var f = filter.gridFilter[0], columnName = f.getColumnName();
            if (this.ASSAY_FILTER_COLUMNS.indexOf(columnName) > -1) {
                if (!(excludeVirus && this.VIRUS_FILTER_COLUMN === columnName))
                    assayFilters.push(filter);
            }
            else if (columnName === this.IC50_GROUP_COLUMN)
                ic50Filter = filter;
            else
                metaFilters.push(filter);
        }, this);

        Ext.each(assayFilters, function(filter) {
            WHERE.push(this._getAssayDimensionalFilter(filter, forDebugging));
        }, this);

        if (ic50Filter)
            WHERE.push(this._getAssayDimensionalFilter(ic50Filter, forDebugging));

        if ((metaFilters && metaFilters.length > 0) || includeSelection)
            WHERE.push(this._getMabMixMetadataWhere(metaFilters, forDebugging, includeSelection, isExport));

        return WHERE;
    },

    _getAssayFrom: function() {
        return  "FROM " + this.MAB_GRID_BASE + " " + this.MAB_GRID_BASE_ALIAS + "\n\t";
    },

    _getAssayGroupBy: function() {
        return  "\n\t" + 'GROUP BY ' + this.MAB_MIX_NAME_STD + " \n\t";
    },

    _generateMAbSql: function(forDebugging)
    {
        var SELECT = ['SELECT '], sep = "\n\t";
        SELECT.push(this.MAB_MIX_NAME_STD + ', ' + sep);
        Ext.each(this.COUNT_COLUMNS, function(col) {
            SELECT.push('COUNT(DISTINCT ' + col + ") as " + col + 'Count, ' + sep);
        }, this);
        SELECT.push('exp(AVG(log(' + this.IC50_COLUMN + '))) as IC50geomean');

        var WHERE = this._getMabStateFilterWhere(false, forDebugging);
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getAssayGroupBy();
    },

    _getAssayDimensionalFilter: function(filter, forDebugging)
    {
        return this._getFilterWhereSub(this.MAB_GRID_BASE_ALIAS, filter, forDebugging);
    },

    _getMabMixMetadataWhere: function(metaFilters, forDebugging, includeSelection, isExport)
    {
        var outer = this.MAB_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, forDebugging, includeSelection, isExport) + ')';
    },

    _getMabMixMetadataFilter: function(metaFilters, forDebugging, includeSelection, isExport)
    {
        var sep = "\n\t";
        var SELECT = 'SELECT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + sep;
        var FROM = this._getMabMixMetaFrom();
        var WHERE = [];
        Ext.each(metaFilters, function(filter) {
            WHERE.push(this._getMetadataSubWhere(filter, forDebugging))
        }, this);

        if (includeSelection)
            WHERE.push(this._generateMabSelectionFilterWhere(forDebugging, isExport));

        return SELECT + "\n" + FROM + "\nWHERE " + WHERE.join("\n\tAND ");
    },

    _getMabMixMetaFrom: function() {
        var sep = "\n\t";
        return "FROM " + this.MAB_META_GRID_BASE + " " + this.MAB_META_GRID_BASE_ALIAS + sep;
    },

    _getMetadataSubWhere: function(filter, forDebugging)
    {
        return this._getFilterWhereSub(this.MAB_META_GRID_BASE_ALIAS, filter, forDebugging);
    },

    _getFilterWhereSub: function(tableAliasName, filter, forDebugging, isDataset) {
        var f = filter.gridFilter[0];
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        var values = v.split(';'), noEmptyWhere, emptyWhere;
        var nullInd = values.indexOf(this.BLANK_VALUE);
        var columnName = isDataset ? this._getGridBaseDatasetColumnName(f) : f.getColumnName();
        if (nullInd > -1) {
            values.splice(nullInd, 1);
            emptyWhere = tableAliasName + '.' + columnName + this._getNULLFilterOp(f);
        }
        else if (f.getFilterType().getURLSuffix() === 'notin') {
            emptyWhere = tableAliasName + '.' + columnName + ' IS NULL';
        }

        if (values.length > 0)
            noEmptyWhere = tableAliasName + '.' + columnName + this._getFilterOp(f) + QueryUtils._toSqlValuesList(values, LABKEY.Query.sqlStringLiteral, forDebugging);

        if (emptyWhere && noEmptyWhere)
            return '(' + noEmptyWhere + ' OR ' + emptyWhere + ')';
        else if (emptyWhere)
            return emptyWhere;
        else if (noEmptyWhere)
            return noEmptyWhere;

        return ''
    },

    _getGridBaseDatasetColumnName : function(f)
    {
        var name = f.getColumnName();
        return name === 'study' ? 'prot' : name;
    },

    _getFilterOp: function(f) {
        return (f.getFilterType().getURLSuffix() === 'notin' ? ' NOT' : '') + ' IN ';
    },

    _getNULLFilterOp: function(f) {
        return f.getFilterType().getURLSuffix() === 'notin' ? '  IS NOT NULL ' : ' IS NULL ';
    },

    prepareMAbReportQueries: function (config) {
        this.getSelectedUniqueKeysQuery(config);
    },

    getSelectedUniqueKeysQuery: function(config) {
        var sql = this._generateSelectedUniqueKeysSql();

        if (this.logging)
            console.log(this._generateSelectedUniqueKeysSql(true));

        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: sql,
            saveInSession: true,
            success: function (response) {
                if (this.logging)
                {
                    console.log('Selected MAb unique keys query:', window.location.origin + LABKEY.ActionURL.buildURL('query', 'executeQuery', undefined, {
                        schemaName: 'cds',
                        queryName: response.queryName
                    }));
                }
                config.filteredKeysQuery = response.queryName;
                this.getSelectedDatasetQuery.call(this, config);
            },
            failure: config.failure,
            scope: this
        });
    },

    getSelectedDatasetQuery: function(config) {
        var sql = this._generateSelectedDatasetSql(config);

        if (this.logging)
            console.log(this._generateSelectedDatasetSql(config, true));

        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: sql,
            saveInSession: true,
            success: function (response) {
                if (this.logging)
                {
                    console.log('Selected MAb dataset query:', window.location.origin + LABKEY.ActionURL.buildURL('query', 'executeQuery', undefined, {
                        schemaName: 'cds',
                        queryName: response.queryName
                    }));
                }
                config.filteredDatasetQuery = response.queryName;
                config.success.call(config.scope, config);
            },
            failure: config.failure,
            scope: this
        });
    },

    _generateSelectedUniqueKeysSql: function(forDebugging) {
        var SELECT = ['SELECT DISTINCT '];
        Ext.each(this.ASSAY_KEY_COLUMNS, function(col) {
            SELECT.push(col + ", ");
        }, this);

        var WHERE = this._getMabStateFilterWhere(false, forDebugging, true);
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE);
    },

    _generateMabSelectionFilterWhere: function(forDebugging, isExport) {
        var selected = Connector.getState().getSelectedMAbs(), where = '';
        if (selected && selected.length > 0)
            where = this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_NAME_STD + ' IN '
                    + QueryUtils._toSqlValuesList(selected, LABKEY.Query.sqlStringLiteral, forDebugging);
        else {
            where = isExport ? ' 1 = 1 ' : ' 1 = 0';
        }
        return where;
    },

    _generateSelectedDatasetSql: function(forDebugging) {
        var SELECT = 'SELECT * ';
        var WHERE = this._getDatasetMabStateFilterWhere(false, forDebugging, true, false);
        return SELECT + "\n" + this._getDatasetAssayFrom() + this._buildWhere(WHERE);
    },

    _getDatasetAssayFrom: function() {
        return  "FROM " + this.MAB_Dataset + " " + this.MAB_Dataset_ALIAS + "\n\t";
    },

    _getDatasetMabStateFilterWhere: function(excludeVirus, forDebugging, includeSelection, isExport) {
        var assayFilters = [], metaFilters = [], ic50Filter = null, WHERE = [];
        var stateFilters = Connector.getState().getMabFilters(true);
        Ext.each(stateFilters, function(filter)
        {
            var f = filter.gridFilter[0], columnName = f.getColumnName();
            if (this.ASSAY_FILTER_COLUMNS.indexOf(columnName) > -1) {
                if (!(excludeVirus && this.VIRUS_FILTER_COLUMN === columnName))
                    assayFilters.push(filter);
            }
            else if (columnName === this.IC50_GROUP_COLUMN)
                ic50Filter = filter;
            else
                metaFilters.push(filter);
        }, this);

        Ext.each(assayFilters, function(filter) {
            WHERE.push(this._getDatasetAssayDimensionalFilter(filter, forDebugging));
        }, this);

        WHERE.push(this.getDatasetIC50Where(ic50Filter));

        WHERE.push(this._getDatasetMabMixMetadataWhere(metaFilters, forDebugging, includeSelection, isExport));

        return WHERE;
    },

    _getDatasetMabMixMetadataWhere: function(metaFilters, forDebugging, includeSelection, isExport)
    {
        var outer = this.MAB_Dataset_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, forDebugging, includeSelection, isExport) + ')';
    },

    _getDatasetAssayDimensionalFilter: function(filter, forDebugging)
    {
        return this._getFilterWhereSub(this.MAB_Dataset_ALIAS, filter, forDebugging, true);
    },

    getDatasetIC50Where: function(filter) {
        var columnName = this.MAB_Dataset_ALIAS + "." + this. IC50_COLUMN;
        var WHERE = columnName + " > 0 AND " + columnName + " IS NOT NULL ", rangeStr = '';
        if (filter) {
            var f = filter.gridFilter[0];
            var ranges = this._getProcessedIC50Ranges(f), rangeFilters = [];
            Ext.each(ranges, function(range){
                var filters = this.IC50Ranges[range];
                if (!filters)
                    return;
                var rangeFilter = '', AND = '';
                if (filters[0]) {
                    rangeFilter += (columnName + filters[0]);
                    AND = ' AND ';
                }

                if (filters[1]) {
                    rangeFilter += AND;
                    rangeFilter += (columnName + filters[1]);
                }

                rangeFilters.push('(' + rangeFilter + ')');
            }, this);

            if (rangeFilters.length > 0)
                rangeStr = rangeFilters.join(' OR ');
            return WHERE + ' AND (' + rangeStr + ')';
        }

        return WHERE;
    },

    _getProcessedIC50Ranges: function(f)
    {
        var value = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        var ranges = value.split(';');
        if (f.getFilterType().getURLSuffix() === 'notin')
        {
            var reversedRanges = [];
            Ext.iterate(this.IC50Ranges, function(key, val){
               if (ranges.indexOf(key) === -1)
                   reversedRanges.push(key);
            });
            return reversedRanges;
        }
        return ranges;
    },

    prepareMAbExportQueries: function(config) {
        var exportParams = config.exportParams ? config.exportParams : {};
        var exportColumns = this.getNABMAbExportColumns(config.excludedColumns);
        exportParams.columnNames = exportColumns.columnNames;
        exportParams.columnAliases = exportColumns.columnAliases;
        exportParams.variables = exportColumns.variables;
        exportParams.filterStrings = this.getExportableFilters();
        exportParams.dataTabNames = ['Study and MAbs', 'MAbs', 'NAB MAB'];
        exportParams.schemaNames = ['study', 'study', 'study'];
        exportParams.tableSqls = [this.getStudyAndMAbExportSql(), this.getMAbsExportSql(), this.getNAbMAbExportSql()];
        config.exportParams = exportParams;

        var studyAssaysSql = this.getStudyAssaysExportSql();

        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: studyAssaysSql,
            success: function (response) {
                var results = response.rows, studyassays = [];
                if (results && results.length > 0) {
                    Ext.each(results, function(result) {
                        studyassays.push(result.studyassay);
                    });
                }
                config.exportParams.studyassays = studyassays;
                config.success.call(config.scope, config);
            },
            failure: config.failure,
            scope: this
        });

        if (this.logging) {
            console.log(this.getStudyAndMAbExportSql(true));
            console.log(this.getMAbsExportSql(true));
            console.log(this.getNAbMAbExportSql(true));
            console.log(this.getStudyAssaysExportSql(true));
        }
    },

    getStudyAndMAbExportSql: function(forDebugging) {
        var SELECT = 'SELECT DISTINCT prot as Study, mab_mix_id,  mab_mix_label, mab_mix_name_std ';
        var WHERE = this._getDatasetMabStateFilterWhere(false, forDebugging, true, true);
        return SELECT + "\n" + this._getDatasetWithMetaFrom() + this._buildWhere(WHERE);
    },

    getMAbsExportSql: function(forDebugging) {
        var sep = "\n\t", WHERE = [], SELECT = 'SELECT * ';
        WHERE.push(this._getActiveMabMixIdWhere(forDebugging, true, true));

        return SELECT + sep + this._getMabMixMAbMetaFrom() + sep +
                this._buildWhere(WHERE);
    },

    _getMabMixMAbMetaFrom: function() {
        return "FROM " + this.MAB_MIX_MAB_FULL_META + "\n\t";
    },

    getNAbMAbExportSql: function(forDebugging) {
        var SELECT = 'SELECT * ';
        var WHERE = this._getDatasetMabStateFilterWhere(false, forDebugging, true, true);
        return SELECT + "\n" + this._getDatasetWithMetaFrom() + this._buildWhere(WHERE);
    },

    _getDatasetWithMetaFrom: function() {
        return "FROM " + this.MAB_DATASET_WITH_MIX_META + " " + this.MAB_Dataset_ALIAS + "\n\t";
    },

    getStudyAssaysExportSql: function(forDebugging) {
        var SELECT = "SELECT DISTINCT prot || '|||' || assay_identifier AS studyassay";
        var WHERE = this._getDatasetMabStateFilterWhere(false, forDebugging, true, true);
        return SELECT + "\n" + this._getDatasetWithMetaFrom() + this._buildWhere(WHERE);
    },

    getNABMAbExportColumns: function(excludedColumns) {
        var allMeasures = Connector.getQueryService().MEASURE_STORE.data.items, mabMeasures = [];
        Ext.each(allMeasures, function(measure) {
            if (measure.get("queryName") === "NABMAb" && !measure.get("hidden")) {
                if (!excludedColumns || excludedColumns.indexOf(measure.get('name')) === -1)
                    mabMeasures.push(measure);
            }
        });
        var sortedMAbMeasures = mabMeasures.sort(function(a, b) {
            return a.get('label').localeCompare(b.get('label'));
        });
        var orderedColumns = this.BASE_EXPORT_COLUMNS.slice(0); //clone
        var orderedColumnLabels = this.BASE_EXPORT_COLUMN_LABLES.slice(0);

        var datasetLabel = sortedMAbMeasures[0].get("queryLabel"), variables = [];
        Ext.each(sortedMAbMeasures, function(measure) {
            var measureLabel = measure.get("label"), measureDescription = measure.get("description");
            if (orderedColumns.indexOf(measure.get('name')) === -1) {
                orderedColumns.push(measure.get('name'));
                orderedColumnLabels.push(measureLabel);
            }
            variables.push(datasetLabel + ChartUtils.ANTIGEN_LEVEL_DELIMITER + measureLabel + ChartUtils.ANTIGEN_LEVEL_DELIMITER + measureDescription);
        });
        return {
            columnNames : orderedColumns,
            columnAliases: orderedColumnLabels,
            variables: variables
        }
    },

    getNABMAbDatasetLabel: function() {
        var label = "NAB MAb";
        Ext.each(Connector.getQueryService().MEASURE_STORE.data.items, function(measure) {
            if (measure.get("queryName") === "NABMAb" && !measure.get("hidden")) {
                label = measure.get('queryLabel');
            }
        });
        return label;
    },

    getExportableFilters: function() {
        var assayFilters = [], metaFilters = [], ic50Filter, filterStrs = [];
        var stateFilters = Connector.getState().getMabFilters(true);
        Ext.each(stateFilters, function(filter)
        {
            var f = filter.gridFilter[0], columnName = f.getColumnName();
            if (this.ASSAY_FILTER_COLUMNS.indexOf(columnName) > -1)
                assayFilters.push(filter);
            else if (columnName === this.IC50_GROUP_COLUMN)
                ic50Filter = filter;
            else
                metaFilters.push(filter);
        }, this);

        Ext.each(metaFilters, function(filter) {
            filterStrs.push(this._prepareExportFilterStr(this.MAB_CHARACTERISTICS, this._getExportedFilterValuesStr(filter)));
        }, this);

        var mAbDatasetLabel = this.getNABMAbDatasetLabel();
        Ext.each(assayFilters, function(filter) {
            filterStrs.push(this._prepareExportFilterStr(mAbDatasetLabel, this._getExportedFilterValuesStr(filter)));
        }, this);

        if (ic50Filter) {
            var filterSubs = this.getMAbIC50FilterStr(ic50Filter);
            Ext.each(filterSubs, function (sub) {
                filterStrs.push(this._prepareExportFilterStr(mAbDatasetLabel, sub));
            }, this)
        }

        var selectedMabStr = this.getMAbSelectedFilterStr();
        if (selectedMabStr)
            filterStrs.push(this._prepareExportFilterStr("Selected MAb/Mixture(s)", selectedMabStr));

        return filterStrs;
    },

    _prepareExportFilterStr: function(title, content)
    {
        return title + ChartUtils.ANTIGEN_LEVEL_DELIMITER + content;
    },

    getMAbIC50FilterStr: function(filter) {
        var rangeFilterStrs = [];
        if (filter) {
            var f = filter.gridFilter[0], columnName = f.getColumnName();
            var ranges = this._getProcessedIC50Ranges(f);

            Ext.each(ranges, function(range){
                var filters = this.IC50Ranges[range];
                if (!filters)
                    return;
                var rangeFilter = '', AND = '';
                if (filters[0]) {
                    rangeFilter += filters[0];
                    AND = ' AND ';
                }

                if (filters[1]) {
                    rangeFilter += AND;
                    rangeFilter += filters[1];
                }

                rangeFilterStrs.push(Connector.view.MabGrid.ColumnMap[columnName].filterLabel + ': ' + rangeFilter);
            }, this);
        }
        return rangeFilterStrs;
    },

    getMAbSelectedFilterStr: function() {
        var selected = Connector.getState().getSelectedMAbs(), filterStr;
        if (selected && selected.length > 0) {
            filterStr = Connector.view.MabGrid.ColumnMap['mab_mix_name_std'].filterLabel + ": " + selected.join(', ');
        }
        return filterStr;
    },

    _getExportedFilterValuesStr: function(filter) {
        var f = filter.gridFilter[0], op = '';
        var valueStr = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        if (f.getColumnName() === this.VIRUS_FILTER_COLUMN)
            valueStr = valueStr.replace(ChartUtils.ANTIGEN_LEVEL_DELIMITER_REGEX, ' ');
        var columnName = Connector.view.MabGrid.ColumnMap[f.getColumnName()].filterLabel;
        if (f.getFilterType().getURLSuffix() === 'notin') {
            op = ' - exclude';
        }
        return columnName + op + ": " + valueStr;
    }

});