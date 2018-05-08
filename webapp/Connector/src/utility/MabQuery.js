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

    MAB_META_GRID_BASE: 'cds.mAbMetaGridBase',

    MAB_META_GRID_BASE_ALIAS: 'CDS_mAbMetaGridBase',

    MAB_MIX_ID: 'mab_mix_id',

    COUNT_COLUMNS: ['study', 'virus', 'clade', 'neutralization_tier'],

    IC50_COLUMN: 'titer_curve_ic50',

    IC50_GROUP_COLUMN: 'titer_curve_ic50_group',

    BLANK_VALUE: '[blank]',

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
                config.success.call(config.scope, response);
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

        this._executeSql(config, sql);
    },

    getData: function (config) {
        this._executeSql(config, this._generateMAbSql());
    },

    _generateMabMetaUniqueValuesSql: function(config) {
        var sep = "\n\t", WHERE = [];
        var SELECT = 'SELECT DISTINCT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + config.fieldName;
        if (config.useFilter) {
            WHERE.push(this._getActiveMabMixIdWhere());
        }

        return SELECT + sep + this._getMabMixMetaFrom() + sep +
                this._buildWhere(WHERE) + sep + 'ORDER BY ' + config.fieldName;

    },

    _getActiveMabMixIdWhere: function() {
        var sub = this._generateMabAssayUniqueValuesSql({
            useFilter: true,
            fieldName: this.MAB_MIX_ID
        });
        return this.MAB_MIX_ID + ' IN (' + sub + ') ';
    },

    _buildWhere: function(WHERE) {
        return (WHERE.length === 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND ");
    },

    _generateMabAssayUniqueValuesSql: function(config) {
        var sep = "\n\t", WHERE = [];
        var SELECT = 'SELECT DISTINCT ' + this.MAB_GRID_BASE_ALIAS + '.' + config.fieldName;
        if (config.useFilter) {
            WHERE = this._getMabStateFilterWhere()
        }

        return SELECT + sep + this._getAssayFrom() + sep +
                this._buildWhere(WHERE) + sep + 'ORDER BY ' + config.fieldName;

    },

    _getMabStateFilterWhere: function() {
        var assayFilters = [], metaFilters = [], ic50Filter, WHERE = [];
        var stateFilters = Connector.getState().getMabFilters(true);
        Ext.each(stateFilters, function(filter)
        {
            var f = filter.gridFilter[0], columnName = f.getColumnName();
            if (this.COUNT_COLUMNS.indexOf(columnName) > -1) {
                assayFilters.push(filter);
            }
            else if (columnName === this.IC50_GROUP_COLUMN)
                ic50Filter = filter;
            else
                metaFilters.push(filter);
        }, this);

        Ext.each(assayFilters, function(filter) {
            WHERE.push(this._getAssayDimensionalFilter(filter, this.logging));
        }, this);

        if (ic50Filter)
            WHERE.push(this._getAssayDimensionalFilter(ic50Filter, this.logging));

        if (metaFilters && metaFilters.length > 0)
            WHERE.push(this._getMabMixMetadataWhere(metaFilters, this.logging));

        return WHERE;
    },

    _getAssayFrom: function() {
        return  "FROM " + this.MAB_GRID_BASE + " " + this.MAB_GRID_BASE_ALIAS + "\n\t";
    },

    _getAssayGroupBy: function() {
        return  "\n\t" + 'GROUP BY mab_mix_name_std ' + "\n\t";
    },

    _generateMAbSql: function()
    {
        var SELECT = ['SELECT '], sep = "\n\t";
        SELECT.push('mab_mix_name_std, ' + sep);
        Ext.each(this.COUNT_COLUMNS, function(col) {
            SELECT.push('COUNT(DISTINCT ' + col + ") as " + col + 'Count, ' + sep);
        }, this);
        SELECT.push('exp(AVG(log(' + this.IC50_COLUMN + '))) as IC50geomean');

        var WHERE = this._getMabStateFilterWhere();
        return SELECT.join('') + "\n" + this._getAssayFrom() + this._buildWhere(WHERE) + this._getAssayGroupBy();
    },

    _getAssayDimensionalFilter: function(filter, forDebugging)
    {
        return this._getFilterWhereSub(this.MAB_GRID_BASE_ALIAS, filter, forDebugging);
    },

    _getMabMixMetadataWhere: function(metaFilters, forDebugging)
    {
        var outer = this.MAB_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, forDebugging) + ')';
    },

    _getMabMixMetadataFilter: function(metaFilters, forDebugging)
    {
        var sep = "\n\t";
        var SELECT = 'SELECT ' + this.MAB_META_GRID_BASE_ALIAS + '.' + this.MAB_MIX_ID + sep;
        var FROM = this._getMabMixMetaFrom();
        var WHERE = [];
        Ext.each(metaFilters, function(filter) {
            WHERE.push(this._getMetadataSubWhere(filter, forDebugging))
        }, this);

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

    _getFilterWhereSub: function(tableAliasName, filter, forDebugging) {
        var f = filter.gridFilter[0];
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        var values = v.split(';'), noEmptyWhere, emptyWhere;
        var nullInd = values.indexOf(this.BLANK_VALUE);
        if (nullInd > -1) {
            values.splice(nullInd, 1);
            emptyWhere = tableAliasName + '.' + f.getColumnName() + this._getNULLFilterOp(f);
        }

        if (values.length > 0)
            noEmptyWhere = tableAliasName + '.' + f.getColumnName() + this._getFilterOp(f) + QueryUtils._toSqlValuesList(values, LABKEY.Query.sqlStringLiteral, forDebugging);

        if (emptyWhere && noEmptyWhere)
            return '(' + noEmptyWhere + ' OR ' + emptyWhere + ')';
        else if (emptyWhere)
            return emptyWhere;
        else if (noEmptyWhere)
            return noEmptyWhere;

        return ''
    },

    _getFilterOp: function(f) {
        return (f.getFilterType().getURLSuffix() === 'notin' ? ' NOT' : '') + ' IN ';
    },

    _getNULLFilterOp: function(f) {
        return f.getFilterType().getURLSuffix() === 'notin' ? '  IS NOT NULL ' : ' IS NULL ';
    }
});