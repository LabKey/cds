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

    getData: function (config) {
        var sql = this._generateMAbSql();

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

    _generateMAbSql: function()
    {
       /**SELECT
        mab_mix_name_std,

        COUNT(DISTINCT study) as StudyCount,
        COUNT(DISTINCT virus) as VirusCount,
        COUNT(DISTINCT clade) as CladeCount,
        COUNT(DISTINCT neutralization_tier) as Tier,

        exp(AVG(log(titer_ic50))) as IC50

        FROM cds.mAbGridBase

        WHERE study in () AND mab_mix_id in (sub select)

        GROUP BY mab_mix_name_std

        ORDER BY IC50 DESC; **/

        var SELECT = ['SELECT '], sep = "\n\t";
        SELECT.push('mab_mix_name_std, ' + sep);
        Ext.each(MabQueryUtils.COUNT_COLUMNS, function(col) {
            SELECT.push('COUNT(DISTINCT ' + col + ") as " + col + 'Count, ' + sep);
        }, this);
        SELECT.push('exp(AVG(log(titer_ic50))) as IC50geomean');

        var FROM = "FROM " + MabQueryUtils.MAB_GRID_BASE + " " + MabQueryUtils.MAB_GRID_BASE_ALIAS + sep;

        var WHERE = [];
        var assayFilters = [], metaFilters = [];

        // process filters on the measures
        Ext.each(assayFilters, function(filter) {
            WHERE.push(this._getAssayDimensionalFilter(filter, this.logging));
        }, this);

        if (metaFilters && metaFilters.length > 0)
            WHERE.push(this._getMabMixMetadataWhere(metaFilters, this.logging));

        var GROUPBY = 'GROUP BY mab_mix_name_std ' + sep;
        return SELECT.join('') + "\n" + FROM + GROUPBY + (WHERE.length == 0 ? "" : "\nWHERE ") + WHERE.join("\n\tAND ")
        //TODO order by
    },

    _getAssayDimensionalFilter: function(f, forDebugging)
    {
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        return MabQueryUtils.MAB_GRID_BASE_ALIAS + '.' + f.columnName + " IN " + QueryUtils._toSqlValuesList(v.split(';'), LABKEY.Query.sqlStringLiteral, forDebugging);
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
        var outer = MabQueryUtils.MAB_GRID_BASE_ALIAS + '.' + MabQueryUtils.MAB_MIX_ID + " IN ";
        return outer + '(' + this._getMabMixMetadataFilter(metaFilters, forDebugging) + ')';
    },

    _getMabMixMetadataFilter: function(metaFilters, forDebugging)
    {
        var sep = "\n\t";
        var SELECT = 'SELECT ' + MabQueryUtils.MAB_META_GRID_BASE_ALIAS + '.' + MabQueryUtils.MAB_MIX_ID + sep;
        var FROM = "FROM " + MabQueryUtils.MAB_META_GRID_BASE + " " + MabQueryUtils.MAB_META_GRID_BASE_ALIAS + sep;
        var WHERE = [];
        Ext.each(metaFilters, function(filter) {
            WHERE.push(this._getMetadataSubWhere(filter, forDebugging))
        }, this);

        return SELECT.join('') + "\n" + FROM + "\nWHERE " + WHERE.join("\n\tAND ");
    },

    _getMetadataSubWhere: function(f, forDebugging)
    {
        var v = Ext.isArray(f.getValue()) ? f.getValue()[0] : f.getValue();
        return MabQueryUtils.MAB_META_GRID_BASE_ALIAS + '.' + f.columnName + " IN " + QueryUtils._toSqlValuesList(v.split(';'), LABKEY.Query.sqlStringLiteral, forDebugging);
    }

});