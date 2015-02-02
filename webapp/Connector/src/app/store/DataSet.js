/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Dataset', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Dataset',

    datasetStores : {},

    // Start loading from another store
    startLoad : function() {
        this.loadCounter = this.loadCounter || 0;
        ++this.loadCounter;
    },

    // End loading from another store
    endLoad : function() {
        if (--this.loadCounter <= 0) {
            this.loadComplete();
        }
    },

    // Loading from other stores is complete
    loadComplete : function() {
        this.loadRawData(this.rawData);
    },

    loadDatasets : function(data) {
        this.rawData = data.rows;

        this.datasetStores = {};

        this.startLoad();

        Ext.each(data.rows, function(row) {
            var label = row.Label.value;
            var storeName = 'Connector.app.store.'+label;
            Ext.define(storeName, {
                extend: 'Connector.app.store.DatasetData',
                tableName: label
            });
            store = Ext.create(storeName);
            store.on('load', function() {
                this.endLoad();
            }, this, {
                single: true
            });
            this.startLoad();
            store.load();
            this.datasetStores[label] = store;
        }, this);

        this.endLoad();
    },

    load : function() {
        LABKEY.Query.selectRows({
            schemaName: Connector.studyContext.schemaName,
            queryName: 'DataSets',
            requiredVersion: 9.1,
            columns: Ext.Array.pluck(Connector.app.model.Dataset.getFields(), "name").join(','),
            success: this.loadDatasets,
            scope : this
        });
    }
});
