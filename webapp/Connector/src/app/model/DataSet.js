/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Dataset', {

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
    },

    // Query variables etc for an assay named assayName. data param can be an existing object to append to, or if omitted the
    // data variable will be created. The callback will receive the updated data object once queries are complete.
    dataForAssayByName : function(assayName, data, options, callback) {
        data = data || {};
        Ext.applyIf(data, {
            variables: {
                key: [],
                other: []
            }
        });

        if (options.antigens) {
            data.antigens = data.antigens || [];
        }

        var antigenColumns = [];
        var antigenColumnMeasures = [];

        // If querying antigens, this function will be called once their columns names are loaded
        function antigenColumnsLoaded() {
            // Count the number of antigen queries
            var waitingFor = antigenColumns.length;

            if (waitingFor) {
                Ext.each(antigenColumns, function(antigenColumn, index) {
                    var measure = antigenColumnMeasures[index];
                    var store = Ext.create('Connector.store.AssayDistinctValue', {
                        schemaName: measure.schemaName,
                        queryName: measure.queryName,
                        colName: antigenColumn
                    });
                    store.on('load', function() {
                        store.each(function(value) {
                            data.antigens.push(value);
                        });
                        if (--waitingFor == 0) {
                            callback(data);
                        }
                    });
                });       
            } else {
                callback(data);
            }
        }

        var name = this.get('Name').value;
        var label = this.get('Label').value;
        var store = this.store.datasetStores[name] || this.store.datasetStores[label];

        var countForAssay = 0;
        if (store)
        {
            store.each(function(record) {
                if (record.get("Assay") == assayName) {
                    ++countForAssay;
                }
            });
        }

        if (countForAssay > 0) {
            Ext.Ajax.request({
                url : LABKEY.ActionURL.buildURL("visualization", "getMeasures"),
                method : 'GET',
                params : {
                    allColumns: true,
                    filters: [LABKEY.Query.Visualization.Filter.create({schemaName: "study", queryName: name})]
                },
                success: function(response){
                    response = LABKEY.Utils.decode(response.response);
                    
                    var measureCount = 0;

                    Ext.each(response.measures, function(measure) {
                        if (measure.shownInDetailsView) {
                            ++measureCount;
                            if (measure.isKeyVariable) {
                                data.variables.key.push(measure);
                            } else {
                                data.variables.other.push(measure);
                            }
                        }
                    });

                    if (options.antigens && measureCount) {
                        var waitingFor = measureCount;

                        // Query antigen lookups for each measure
                        Ext.each(response.measures, function(measure) {
                            if (measure.shownInDetailsView) {
                                LABKEY.Query.getQueryDetails({
                                    schemaName: measure.schemaName,
                                    queryName: measure.queryName,
                                    scope: this,
                                    success: function(response){
                                        Ext.each(response.columns, function(col){

                                            if (Ext.isDefined(col.lookup) && col.lookup.schemaName == 'CDS' && col.lookup.queryName == 'Antigens') {
                                                if (antigenColumns.indexOf(col.name) < 0) {
                                                    antigenColumns.push(col.name);
                                                    antigenColumnMeasures.push(measure)
                                                }
                                            }
                                        });

                                        if (--waitingFor == 0) {
                                            // All antigen column names have been loaded
                                            antigenColumnsLoaded();
                                        }
                                    }
                                });
                            }
                        });

                    } else {
                        callback(data);
                    }
                }
            });
        } else {
            callback(data);
        }
    }
});
