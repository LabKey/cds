/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.DataSetData', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.DataSetData',

    loadData : function(data) {
//        console.log("data.rows =",data.rows);
        this.loadRawData(data.rows);
    },

    load : function() {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: this.tableName,
            success: this.loadData,
            scope : this
        });
    }
});
