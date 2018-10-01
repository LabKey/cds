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

    MAB_VIRUS_PAIRS_COLUMN: 'mab_virus_pairs',

    MAB_VIRUS_PAIRS_COUNT_COLUMN: 'mab_virus_pairs_count',

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
    BASE_EXPORT_COLUMN_LABLES : ['Study', 'Mab mix id', 'Mab mix label', 'Mab mix name std', 'Mab name source', 'Mab id', 'Mab name std',
        'Mab Lanl id', 'Mab Hxb2 location', 'Mab Ab binding type', 'Mab isotype', 'Mab donor id', 'Mab donor species', 'Mab donor clade'],

    MAB_META_VARIABLES: [
        {field: 'mab_mix_label', label: 'Mab mix label', description: 'A label (MAb name) assigned to an individual mAb or a mixture of mAbs to distinquish them from MAbs/mixtures with the same standardized name, e.g. when mAbs with the same standardized name are compared within a study.'},
        {field: 'mab_mix_name_std', label: 'Mab mix name std', description: 'A standardized name assigned to an individual mAb or a mixture of mAbs. '}
    ],

    logging: false,

    constructor: function(config) {
        this.callParent([config]);
        if (Ext.isDefined(LABKEY.ActionURL.getParameter('logQuery'))) {
            this.logging = true;
        }
    },

    log : function(message) {
        if (this.logging) {
            console.log(message);
        }
        return message;
    },

    getMetaData : function(config) {
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'mAbMetaGridBase',
            success: function(response) {
                config.success.call(config.scope, response);
            },
            failure: config.failure,
            scope: this
        });
    },

    _executeSql : function(config, sql) {
        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: this.log(sql),
            success: function(response) {
                config.success.call(config.scope, response, config);
            },
            failure: config.failure,
            scope: this
        });
    },

    getMabUniqueValues : function(config) {
        var sql;

        if (Ext.isFunction(config.sql)) {
            sql = config.sql(config.useFilter === true);
        }
        else {
            if (config.isMeta)
                sql = this._generateMabMetaUniqueValuesSql(config);
            else
                sql = this._generateMabAssayUniqueValuesSql(config);
        }

        this._executeSql(config, sql);
    },

    getData : function(config) {
        this._executeSql({
            success: function(response) {
                config.countsData = response;
                this._executeSql(config, this._generateGeoMeanIC50Sql());
            },
            failure: config.failure,
            scope: this
        }, this._generateMAbSql());
    },

    getMabViruses : function(config) {
        this._executeSql(config, this._generateVirusCountSql());
    },

    _generateVirusCountSql : function() {
        return '(' + this._generateActiveVirusCountSql() + ')\n\t UNION \n\t(' + this._generateAllVirusCountSql() + ')';
    },

    _generateActiveVirusCountSql : function() {
        var SELECT = ['SELECT '], sep = "\n\t";
        Ext.each(this.VIRUS_COLUMNS, function(col) {
            SELECT.push(col + ',' + sep);
        }, this);
        SELECT.push('COUNT(DISTINCT ' + this.MAB_MIX_ID + ') as subjectCount ' + sep);

        var WHERE = this._getMabStateFilterWhere(true);
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getVirusGroupBy();
    },

    _generateAllVirusCountSql : function() {
        var SELECT = ['SELECT '], sep = "\n\t";
        Ext.each(this.VIRUS_COLUMNS, function(col) {
            SELECT.push(col + ',' + sep);
        }, this);
        SELECT.push('0 as subjectCount ' + sep);

        return SELECT.join('') + "\n" + this._getAssayFrom() + this._getVirusGroupBy();
    },

    _getVirusGroupBy : function() {
        return "\n\t" + 'GROUP BY ' + this.VIRUS_COLUMNS.toString() + "\n\t";
    },

    _generateMabMetaUniqueValuesSql : function(config) {
        var WHERE = [];
        if (config.useFilter) {
            WHERE.push(this._getActiveMabMixIdWhere());
        }

        return [
            'SELECT DISTINCT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + config.fieldName,
            this._getMabMixMetaFrom(),
            this._buildWhere(WHERE),
            'ORDER BY ' + config.fieldName
        ].join('\n\t');
    },

    _getActiveMabMixIdWhere : function(includeSelection, isExport) {
        var sub = this._generateMabAssayUniqueValuesSql({
            useFilter: true,
            fieldName: this.MAB_MIX_ID
        }, includeSelection, isExport);
        return this.MAB_MIX_ID + ' IN (' + sub + ') ';
    },

    _buildFrom : function(table, alias /* optional */) {
        return 'FROM ' + table + (alias !== undefined ? ' as ' + alias : '') + '\n\t';
    },

    _buildWhere : function(WHERE) {
        if (Ext.isString(WHERE)) {
            WHERE = [WHERE];
        }

        return (WHERE.length === 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND ");
    },

    _generateMabAssayUniqueValuesSql : function(config, includeSelection, isExport) {
        var WHERE = [];
        if (config.useFilter) {
            WHERE = this._getMabStateFilterWhere(false, includeSelection, isExport)
        }

        return [
            'SELECT DISTINCT ' + this.MAB_GRID_BASE_ALIAS + '.' + config.fieldName,
            this._getAssayFrom(),
            this._buildWhere(WHERE),
            'ORDER BY ' + config.fieldName
        ].join('\n\t');
    },

    _getMabStateFilterWhere : function(excludeVirus, includeSelection, isExport) {
        var assayFilters = [],
            metaFilters = [],
            ic50Filter,
            WHERE = [];

        Ext.each(Connector.getState().getMabFilters(true), function(filter) {
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
            WHERE.push(this._getAssayDimensionalFilter(filter));
        }, this);

        if (ic50Filter) {
            WHERE.push(this._getAssayDimensionalFilter(ic50Filter));
        }

        if ((metaFilters && metaFilters.length > 0) || includeSelection) {
            WHERE.push(this._getMabMixMetadataWhere(metaFilters, includeSelection, isExport));
        }

        return WHERE;
    },

    _getAssayFrom : function() {
        return this._buildFrom(this.MAB_GRID_BASE, this.MAB_GRID_BASE_ALIAS);
    },

    _getAssayGroupBy : function() {
        return  "\n\t" + 'GROUP BY ' + this.MAB_MIX_NAME_STD + " \n\t";
    },

    _generateMAbSql : function() {
        var SELECT = ['SELECT '], sep = "\n\t";
        SELECT.push(this.MAB_MIX_NAME_STD + ', ' + sep);
        Ext.each(this.COUNT_COLUMNS, function(col) {
            SELECT.push('COUNT(DISTINCT ' + col + ") as " + col + 'Count, ' + sep);
        }, this);

        var WHERE = this._getMabStateFilterWhere(false);
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getAssayGroupBy();
    },

    _generateGeoMeanIC50Sql : function() {
        var SELECT = ['SELECT '], sep = "\n\t";
        SELECT.push(this.MAB_MIX_NAME_STD + ', ' + sep);
        SELECT.push('exp(AVG(log(' + this.IC50_COLUMN + '))) as IC50geomean');

        var WHERE = this._getMabStateFilterWhere(false);
        WHERE.push("titer_curve_ic50 > 0 AND titer_curve_ic50 != CAST('Infinity' AS DOUBLE) AND titer_curve_ic50 != CAST('-Infinity' AS DOUBLE) AND titer_curve_ic50 IS NOT NULL");
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getAssayGroupBy();
    },

    _getAssayDimensionalFilter : function(filter) {
        return this._getFilterWhereSub(this.MAB_GRID_BASE_ALIAS, filter);
    },

    _getMabMixMetadataWhere : function(metaFilters, includeSelection, isExport) {
        var outer = this.MAB_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, includeSelection, isExport) + ')';
    },

    _getMabMixMetadataFilter : function(metaFilters, includeSelection, isExport) {
        var sep = "\n\t";
        var SELECT = 'SELECT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + sep;
        var FROM = this._getMabMixMetaFrom();
        var WHERE = [];
        Ext.each(metaFilters, function(filter) {
            WHERE.push(this._getMetadataSubWhere(filter))
        }, this);

        if (includeSelection) {
            WHERE.push(this._generateMabSelectionFilterWhere(isExport));
        }

        return SELECT + sep + FROM + sep + this._buildWhere(WHERE);
    },

    _getMabMixMetaFrom : function() {
        return this._buildFrom(this.MAB_META_GRID_BASE, this.MAB_META_GRID_BASE_ALIAS);
    },

    _getMetadataSubWhere : function(filter) {
        return this._getFilterWhereSub(this.MAB_META_GRID_BASE_ALIAS, filter);
    },

    _getFilterWhereSub : function(tableAliasName, filter, isDataset) {
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
            noEmptyWhere = tableAliasName + '.' + columnName + this._getFilterOp(f) + QueryUtils._toSqlValuesList(values, LABKEY.Query.sqlStringLiteral, this.logging);

        if (emptyWhere && noEmptyWhere)
            return '(' + noEmptyWhere + ' OR ' + emptyWhere + ')';
        else if (emptyWhere)
            return emptyWhere;
        else if (noEmptyWhere)
            return noEmptyWhere;

        return '';
    },

    _getGridBaseDatasetColumnName : function(f) {
        var name = f.getColumnName();
        return name === 'study' ? 'prot' : name;
    },

    _getFilterOp : function(f) {
        return (f.getFilterType().getURLSuffix() === 'notin' ? ' NOT' : '') + ' IN ';
    },

    _getNULLFilterOp : function(f) {
        return f.getFilterType().getURLSuffix() === 'notin' ? '  IS NOT NULL ' : ' IS NULL ';
    },

    prepareMAbReportQueries : function(config) {
        this.getSelectedUniqueKeysQuery(config);
    },

    getSelectedUniqueKeysQuery : function(config) {
        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: this.log(this._generateSelectedUniqueKeysSql()),
            saveInSession: true,
            success: function(response) {
                this.log('Selected MAb unique keys query: ' + window.location.origin + LABKEY.ActionURL.buildURL('query', 'executeQuery', undefined, {
                    schemaName: 'cds',
                    queryName: response.queryName
                }));
                config.filteredKeysQuery = response.queryName;
                this.getSelectedDatasetQuery.call(this, config);
            },
            failure: config.failure,
            scope: this
        });
    },

    getSelectedDatasetQuery : function(config) {
        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: this.log(this._generateSelectedDatasetSql()),
            saveInSession: true,
            success: function(response) {
                this.log('Selected MAb dataset query: ' + window.location.origin + LABKEY.ActionURL.buildURL('query', 'executeQuery', undefined, {
                    schemaName: 'cds',
                    queryName: response.queryName
                }));
                config.filteredDatasetQuery = response.queryName;
                config.success.call(config.scope, config);
            },
            failure: config.failure,
            scope: this
        });
    },

    _generateSelectedUniqueKeysSql : function() {
        var SELECT = ['SELECT DISTINCT '];
        Ext.each(this.ASSAY_KEY_COLUMNS, function(col) {
            SELECT.push(col + ", ");
        }, this);

        var WHERE = this._getMabStateFilterWhere(false, true);
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE);
    },

    _generateMabSelectionFilterWhere : function(isExport) {
        var selected = Connector.getState().getSelectedMAbs(), where = '';
        if (selected && selected.length > 0) {
            where = this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_NAME_STD + ' IN '
                    + QueryUtils._toSqlValuesList(selected, LABKEY.Query.sqlStringLiteral, this.logging);
        }
        else {
            where = isExport ? ' 1 = 1 ' : ' 1 = 0';
        }
        return where;
    },

    _generateSelectedDatasetSql : function() {
        var WHERE = this._getDatasetMabStateFilterWhere(false, true, false);
        return 'SELECT * \n' + this._getDatasetAssayFrom() + this._buildWhere(WHERE);
    },

    _getDatasetAssayFrom : function() {
        return this._buildFrom(this.MAB_Dataset, this.MAB_Dataset_ALIAS);
    },

    _getDatasetMabStateFilterWhere : function(excludeVirus, includeSelection, isExport) {
        var assayFilters = [],
            metaFilters = [],
            ic50Filter = null,
            WHERE = [];

        Ext.each(Connector.getState().getMabFilters(true), function(filter) {
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
            WHERE.push(this._getDatasetAssayDimensionalFilter(filter));
        }, this);

        if (ic50Filter) {
            WHERE.push(this.getDatasetIC50Where(ic50Filter));
        }

        WHERE.push(this._getDatasetMabMixMetadataWhere(metaFilters, includeSelection, isExport));

        return WHERE;
    },

    _getDatasetMabMixMetadataWhere : function(metaFilters, includeSelection, isExport) {
        var outer = this.MAB_Dataset_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, includeSelection, isExport) + ')';
    },

    _getDatasetAssayDimensionalFilter : function(filter) {
        return this._getFilterWhereSub(this.MAB_Dataset_ALIAS, filter, true);
    },

    getDatasetIC50Where : function(filter) {
        var columnName = this.MAB_Dataset_ALIAS + "." + this. IC50_COLUMN;
        var WHERE = '', rangeStr = '';
        if (filter) {
            var f = filter.gridFilter[0];
            var ranges = this._getProcessedIC50Ranges(f), rangeFilters = [];
            Ext.each(ranges, function(range) {
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

            if (rangeFilters.length > 0) {
                rangeStr = rangeFilters.join(' OR ');
                WHERE = ' (' + rangeStr + ')';
            }
        }

        return WHERE;
    },

    _getProcessedIC50Ranges : function(f) {
        var value = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        var ranges = value.split(';');
        if (f.getFilterType().getURLSuffix() === 'notin') {
            var reversedRanges = [];
            Ext.iterate(this.IC50Ranges, function(key) {
               if (ranges.indexOf(key) === -1) {
                   reversedRanges.push(key);
               }
            });
            return reversedRanges;
        }
        return ranges;
    },

    prepareMAbExportQueries : function(config) {
        var exportParams = config.exportParams ? config.exportParams : {};
        var exportColumns = this.getNABMAbExportColumns(exportParams.excludedColumns);
        exportParams.columnNames = exportColumns.columnNames;
        exportParams.columnAliases = exportColumns.columnAliases;
        exportParams.variables = exportColumns.variables;
        exportParams.filterStrings = this.getExportableFilters();
        exportParams.dataTabNames = ['Study and MAbs', 'MAbs', 'NAB MAB'];
        exportParams.schemaNames = ['study', 'study', 'study'];
        exportParams.tableSqls = [this.getStudyAndMAbExportSql(), this.getMAbsExportSql(), this.getNAbMAbExportSql()];
        config.exportParams = exportParams;

        for (var i = 0; i < exportParams.tableSqls.length; i++) {
            this.log(exportParams.tableSqls[i]);
        }

        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: this.log(this.getStudyAssaysExportSql()),
            success: function(response) {
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
    },

    getStudyAndMAbExportSql : function() {
        var SELECT = 'SELECT DISTINCT prot, mab_mix_id,  mab_mix_label, mab_mix_name_std ';
        var WHERE = this._getDatasetMabStateFilterWhere(false, true, true);
        return SELECT + "\n" + this._getDatasetWithMetaFrom() + this._buildWhere(WHERE);
    },

    getMAbsExportSql : function() {
        var sep = "\n\t", WHERE = [], SELECT = 'SELECT * ';
        WHERE.push(this._getActiveMabMixIdWhere(true, true));
        return SELECT + sep + this._getMabMixMAbMetaFrom() + sep + this._buildWhere(WHERE);
    },

    _getMabMixMAbMetaFrom : function() {
        return this._buildFrom(this.MAB_MIX_MAB_FULL_META);
    },

    getNAbMAbExportSql : function() {
        var WHERE = this._getDatasetMabStateFilterWhere(false, true, true);
        return 'SELECT * \n' + this._getDatasetWithMetaFrom() + this._buildWhere(WHERE);
    },

    _getDatasetWithMetaFrom : function() {
        return this._buildFrom(this.MAB_DATASET_WITH_MIX_META, this.MAB_Dataset_ALIAS);
    },

    getStudyAssaysExportSql : function() {
        var SELECT = "SELECT DISTINCT prot || '|||' || assay_identifier AS studyassay";
        var WHERE = this._getDatasetMabStateFilterWhere(false, true, true);
        return SELECT + "\n" + this._getDatasetWithMetaFrom() + this._buildWhere(WHERE);
    },

    getNABMAbExportColumns : function(excludedColumns) {
        var allMeasures = Connector.getQueryService().MEASURE_STORE.data.items, mabMeasures = [];
        Ext.each(allMeasures, function(measure) {
            if (measure.get("queryName") === "NABMAb" && !measure.get("hidden")) {
                if (!excludedColumns || excludedColumns.indexOf(measure.get('lowerAlias')) === -1)
                    mabMeasures.push(measure);
            }
        });
        var sortedMAbMeasures = mabMeasures.sort(function(a, b) {
            return a.get('label').localeCompare(b.get('label'));
        });
        var orderedColumns = this.BASE_EXPORT_COLUMNS.slice(0); //clone
        var orderedColumnLabels = this.BASE_EXPORT_COLUMN_LABLES.slice(0);

        var datasetLabel = sortedMAbMeasures[0].get('queryLabel'), variables = [];
        Ext.each(sortedMAbMeasures, function(measure) {
            var measureLabel = measure.get('label'), measureDescription = measure.get('description');
            if (orderedColumns.indexOf(measure.get('name')) === -1) {
                orderedColumns.push(measure.get('name'));
                orderedColumnLabels.push(measureLabel);
            }
            variables.push(datasetLabel + ChartUtils.ANTIGEN_LEVEL_DELIMITER + measureLabel + ChartUtils.ANTIGEN_LEVEL_DELIMITER + measureDescription);
        });
        Ext.each(this.MAB_META_VARIABLES, function(metaVariable){
            variables.push(datasetLabel + ChartUtils.ANTIGEN_LEVEL_DELIMITER + metaVariable.label + ChartUtils.ANTIGEN_LEVEL_DELIMITER + metaVariable.description);
        }, this);
        variables = variables.sort();
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
            Ext.each(filterSubs, function(sub) {
                filterStrs.push(this._prepareExportFilterStr(mAbDatasetLabel, sub));
            }, this)
        }

        var selectedMabStr = this.getMAbSelectedFilterStr();
        if (selectedMabStr)
            filterStrs.push(this._prepareExportFilterStr("Selected MAb/Mixture(s)", selectedMabStr));

        return filterStrs;
    },

    _prepareExportFilterStr : function(title, content) {
        return title + ChartUtils.ANTIGEN_LEVEL_DELIMITER + content;
    },

    getMAbIC50FilterStr : function(filter) {
        var rangeFilterStrs = [];
        if (filter) {
            var f = filter.gridFilter[0], columnName = f.getColumnName();
            var ranges = this._getProcessedIC50Ranges(f);

            Ext.each(ranges, function(range) {
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

    getMAbSelectedFilterStr : function() {
        var selected = Connector.getState().getSelectedMAbs(), filterStr;
        if (selected && selected.length > 0) {
            filterStr = Connector.view.MabGrid.ColumnMap['mab_mix_name_std'].filterLabel + ": " + selected.join(', ');
        }
        return filterStr;
    },

    _getExportedFilterValuesStr : function(filter) {
        var f = filter.gridFilter[0], op = '';
        var valueStr = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        if (f.getColumnName() === this.VIRUS_FILTER_COLUMN)
            valueStr = valueStr.replace(ChartUtils.ANTIGEN_LEVEL_DELIMITER_REGEX, ' ');
        var columnName = Connector.view.MabGrid.ColumnMap[f.getColumnName()].filterLabel;
        if (f.getFilterType().getURLSuffix() === 'notin') {
            op = ' - exclude';
        }
        return columnName + op + ": " + valueStr;
    },

    getBaseCountSQL : function(useFilter) {
        return this.log([
            'SELECT',
            [
                'COUNT(DISTINCT mab_mix_name_std) as mixCount',
                'COUNT(DISTINCT study) as studyCount',
                'COUNT(DISTINCT virus) as virusCount'
            ].join(', '),
            this._getAssayFrom(),
            (useFilter ? this._buildWhere(this._getMabStateFilterWhere(false)) : '')
        ].join('\n'));
    },

    getMixTypeCountSQL : function(useFilter) {
        return this.log([
            'SELECT COUNT(DISTINCT mab_mix_type) as mixTypeCount',
            this._getMabMixMetaFrom(),
            (useFilter ? this._buildWhere(this._getActiveMabMixIdWhere(false, false)) : '')
        ].join('\n'));
    },

    getDonorSpeciesCountSQL : function(useFilter) {
        return this.log([
            'SELECT COUNT(DISTINCT mab_donor_species) as donorSpeciesCount',
            this._getMabMixMetaFrom(),
            (useFilter ? this._buildWhere(this._getActiveMabMixIdWhere(false, false)) : '')
        ].join('\n'));
    },

    getMabCountSQL : function(useFilter) {
        return this.log([
            'SELECT COUNT(DISTINCT mab_id) as mabCount',
            this._getMabMixMAbMetaFrom(),
            useFilter ? this._buildWhere(this._getActiveMabMixIdWhere(false, false)) : ''
        ].join('\n'));
    },

    getMabValuesSQL : function(useFilter) {
        return this.log([
            'SELECT DISTINCT mab_name_std',
            this._getMabMixMAbMetaFrom(),
            useFilter ? this._buildWhere(this._getActiveMabMixIdWhere(false, false)) : ''
        ].join('\n'));
    },

    getMAbVirusPairFrom : function(useFilter) {
        return [
            'FROM (SELECT ',
            [this.MAB_MIX_NAME_STD, 'virus', 'COUNT(*) as mabVirusCount'].join(', '),
            this._getAssayFrom(),
            (useFilter ? this._buildWhere(this._getMabStateFilterWhere(false)) : ''),
            'GROUP BY ',
            [this.MAB_MIX_NAME_STD, 'virus'].join(', '),
            ')'
        ].join('\n');
    },

    getMAbVirusPairCountSQL : function(useFilter) {
        return this.log([
            'SELECT COUNT(*) as ' + this.MAB_VIRUS_PAIRS_COUNT_COLUMN,
            this.getMAbVirusPairFrom(useFilter)
        ].join('\n'));
    },

    getMAbVirusPairValuesSQL : function(useFilter) {
        return this.log([
            'SELECT mab_mix_name_std || \' - \' || virus as ' + this.MAB_VIRUS_PAIRS_COLUMN,
            this.getMAbVirusPairFrom(useFilter)
        ].join('\n'));
    }
});