/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Dataset', {

    extend : 'Ext.data.Model',

    fields: [
        {name: 'Label'},
        {name: 'Name'},
        {name: 'KeyPropertyName'},
        {name: 'CategoryId'}
    ],

    countsByStudy : undefined,

    constructor: function() {
    	this.callParent(arguments);

    	this.countsByStudy = {};
    },

    hasDataFromStudy : function(study) {
    	return this.countsByStudy[study] > 0;
    },

    queryDataFromStudy: function(id, callback) {
		LABKEY.Query.executeSql({
			schemaName: Connector.studyContext.schemaName,
			sql: "SELECT COUNT(*) AS n FROM \""+this.get('Name').value+"\" WHERE " + Connector.studyContext.subjectColumn + ".Study.Label = '"+id+"'",
			success: function(data) {
				var count = data.rows[0].n;
				this.countsByStudy[id] = count;
				callback && callback(count > 0);
			},
			scope: this
		});
    },

    getAssayName : function() {
        var name = this.get('Name').value;
        var label = this.get('Label').value;
        var store = this.store.datasetStores[name] || this.store.datasetStores[label];
        var assay;

        if (store)
        {
            store.each(function(record) {
                assay = assay || record.get("Assay");
            });
        }

        return assay;
    }
});
