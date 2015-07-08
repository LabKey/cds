/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.StudyProducts', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.StudyProducts',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'product',
            success: this.onLoadProducts,
            scope: this
        });
    },

    onLoadProducts : function(productData) {
        this.loadRawData(productData.rows);
    }
});
