/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.DatasetData', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.DatasetData',

    loadData : function(data) {
//        console.log("data.rows =",data.rows);
        this.loadRawData(data.rows);
    },

    load : function() {
        LABKEY.Query.selectRows({
            schemaName: Connector.studyContext.schemaName,
            queryName: this.tableName,
            success: this.loadData,
            scope : this
        });
    }
});
