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

        return SELECT + sep + this._getFromGroupBy() + sep +
                this._buildWhere(WHERE) + sep + 'ORDER BY ' + config.fieldName;

    },

    _getMabStateFilterWhere: function() {
        var assayFilters = [], metaFilters = [], WHERE = [];

        // process filters on the measures
        Ext.each(assayFilters, function(filter) {
            WHERE.push(this._getAssayDimensionalFilter(filter, this.logging));
        }, this);

        if (metaFilters && metaFilters.length > 0)
            WHERE.push(this._getMabMixMetadataWhere(metaFilters, this.logging));

        return WHERE;
    },

    _getFromGroupBy: function(group) {
        var sep = "\n\t";
        var fromGroupBy = "FROM " + this.MAB_GRID_BASE + " " + this.MAB_GRID_BASE_ALIAS + sep;
        if (group)
            fromGroupBy += 'GROUP BY mab_mix_name_std ' + sep;
        return fromGroupBy;
    },

    _generateMAbSql: function()
    {
        var SELECT = ['SELECT '], sep = "\n\t";
        SELECT.push('mab_mix_name_std, ' + sep);
        Ext.each(this.COUNT_COLUMNS, function(col) {
            SELECT.push('COUNT(DISTINCT ' + col + ") as " + col + 'Count, ' + sep);
        }, this);
        SELECT.push('exp(AVG(log(titer_ic50))) as IC50geomean');

        var WHERE = this._getMabStateFilterWhere();
        return SELECT.join('') + "\n" + this._getFromGroupBy(true) + this._buildWhere(WHERE)
    },

    _getAssayDimensionalFilter: function(f, forDebugging)
    {
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        return this.MAB_GRID_BASE_ALIAS + '.' + f.columnName + " IN " + QueryUtils._toSqlValuesList(v.split(';'), LABKEY.Query.sqlStringLiteral, forDebugging);
    },

    _getIC50Filter: function(f, forDebugging)
    {
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        var values = v.split(';');
        Ext.each(values, function(value){
            //TODO
        }, this);
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

        return SELECT.join('') + "\n" + FROM + "\nWHERE " + WHERE.join("\n\tAND ");
    },

    _getMabMixMetaFrom: function() {
        var sep = "\n\t";
        return "FROM " + this.MAB_META_GRID_BASE + " " + this.MAB_META_GRID_BASE_ALIAS + sep;
    },

    _getMetadataSubWhere: function(f, forDebugging)
    {
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        return this.MAB_META_GRID_BASE_ALIAS + '.' + f.columnName + " IN " + QueryUtils._toSqlValuesList(v.split(';'), LABKEY.Query.sqlStringLiteral, forDebugging);
    }

});