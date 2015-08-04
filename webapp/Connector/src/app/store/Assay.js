/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Assay', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Assay',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function() {
        this.assayData = undefined;

        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: 'SELECT * FROM cds.assay AS AA LEFT JOIN (SELECT assay_identifier as id, count(assay_identifier) as "study_count" FROM(SELECT DISTINCT assay_identifier, study_name, FROM ds_subjectassay) GROUP by assay_identifier) AS BB ON AA.assay_identifier=BB.id',
            success: this.onLoadAssays,
            scope: this
        });

    },

    onLoadAssays: function (assayData) {
        this.assayData = assayData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.assayData)) {
            this.loadRawData(this.assayData);
        }
    }
});
