/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.DataSet', {

    extend : 'Ext.data.Model',

    // idProperty: 'Label',

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

    	//console.log("Checking for table",this.get('Name'),"with Study ==",id);

    	// For some reason this doesn't work
        // LABKEY.Query.selectRows({
        //     schemaName: 'study',
        //     queryName: this.get('Name'),
        //     columns: "Study",
        //     filterArray: [LABKEY.Filter.create('Study.Label', id, LABKEY.Filter.Types.IN)],
        //     success: function(data) {
        //     	console.log(this.get('Name'),data.rows.length);
        //     	callback && callback(data.rows.length > 0);
        //     },
        //     scope : this
        // });
//console.log('QDFS',this.get('Name').value);
		LABKEY.Query.executeSql({
			schemaName: 'study',
			sql: "SELECT COUNT(*) AS n FROM \""+this.get('Name').value+"\" WHERE " + Connector.studyContext.subjectColumn + ".Study.Label = '"+id+"'",
			success: function(data) {
				var count = data.rows[0].n;
				this.countsByStudy[id] = count;
				callback && callback(count > 0);
			},
			scope: this
		});
    },

    hasDataForAssayByName : function(assayName) {
        var id = this.get('Label');

        var store = this.store.dataSetStores[id.value];

        var count = store.count();
        var countForAssay = 0;
        store.each(function(record) {
            console.log("RECORD IS ",record);
        })

        console.log("HDFABN",count,countForAssay);
    },

    getVariables: function(id, callback) {
        LABKEY.Ajax.request({
            url : LABKEY.ActionURL.buildURL("visualization", "getMeasures"),
            method : 'GET',
            params : {
                allColumns: true,
                filters: [LABKEY.Query.Visualization.Filter.create({schemaName: "study", queryName: this.get('Name')})]
            },
            success: function(data){
                //console.log(LABKEY.Utils.decode(data.response));
            }
        });

    }
});
