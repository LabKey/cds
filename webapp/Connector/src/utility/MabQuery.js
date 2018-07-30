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

    _getActiveMabMixIdWhere: function(forDebugging) {
        var sub = this._generateMabAssayUniqueValuesSql({
            useFilter: true,
            fieldName: this.MAB_MIX_ID
        }, forDebugging);
        return this.MAB_MIX_ID + ' IN (' + sub + ') ';
    },

    _buildWhere: function(WHERE) {
        return (WHERE.length === 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND ");
    },

    _generateMabAssayUniqueValuesSql: function(config, forDebugging) {
        var sep = "\n\t", WHERE = [];
        var SELECT = 'SELECT DISTINCT ' + this.MAB_GRID_BASE_ALIAS + '.' + config.fieldName;
        if (config.useFilter) {
            WHERE = this._getMabStateFilterWhere(false, forDebugging)
        }

        return SELECT + sep + this._getAssayFrom() + sep +
                this._buildWhere(WHERE) + sep + 'ORDER BY ' + config.fieldName;
    },

    _getMabStateFilterWhere: function(excludeVirus, forDebugging, includeSelection) {
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
            WHERE.push(this._getMabMixMetadataWhere(metaFilters, forDebugging, includeSelection));

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

    _getMabMixMetadataWhere: function(metaFilters, forDebugging, includeSelection)
    {
        var outer = this.MAB_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, forDebugging, includeSelection) + ')';
    },

    _getMabMixMetadataFilter: function(metaFilters, forDebugging, includeSelection)
    {
        var sep = "\n\t";
        var SELECT = 'SELECT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + sep;
        var FROM = this._getMabMixMetaFrom();
        var WHERE = [];
        Ext.each(metaFilters, function(filter) {
            WHERE.push(this._getMetadataSubWhere(filter, forDebugging))
        }, this);

        if (includeSelection)
            WHERE.push(this._generateMabSelectionFilterWhere());

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

    _generateMabSelectionFilterWhere: function(forDebugging) {
        var selected = Connector.getState().getSelectedMAbs(), where;
        if (selected.length > 0)
            where = this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_NAME_STD + ' IN '
                    + QueryUtils._toSqlValuesList(selected, LABKEY.Query.sqlStringLiteral, forDebugging);
        else
            where = ' 1 = 0 ';

        return where;
    },

    _generateSelectedDatasetSql: function(forDebugging) {
        var SELECT = 'SELECT * ';
        var WHERE = this._getDatasetMabStateFilterWhere(false, forDebugging);
        return SELECT + "\n" + this._getDatasetAssayFrom() + this._buildWhere(WHERE);
    },

    _getDatasetAssayFrom: function() {
        return  "FROM " + this.MAB_Dataset + " " + this.MAB_Dataset_ALIAS + "\n\t";
    },

    _getDatasetMabStateFilterWhere: function(excludeVirus, forDebugging) {
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
            WHERE.push(this._getDatasetAssayDimensionalFilter(filter, forDebugging));
        }, this);

        WHERE.push(this.getDatasetIC50Where(ic50Filter));

        WHERE.push(this._getDatasetMabMixMetadataWhere(metaFilters, forDebugging));

        return WHERE;
    },

    _getDatasetMabMixMetadataWhere: function(metaFilters, forDebugging)
    {
        var outer = this.MAB_Dataset_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, forDebugging, true) + ')';
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
    }

});