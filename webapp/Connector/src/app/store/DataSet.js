/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.DataSet', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.DataSet',

    loadDataSets : function(data) {
        this.loadRawData(data.rows);
    },

    load : function() {
        LABKEY.Query.selectRows({
            schemaName: 'study',
            queryName: 'DataSets',
            columns: Ext.Array.pluck(Connector.app.model.DataSet.getFields(), "name").join(','),
            success: this.loadDataSets,
            scope : this
        });
    }
});