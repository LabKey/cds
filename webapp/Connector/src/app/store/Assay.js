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

    loadAnalytes : function(assayName, callback, scope) {
        var queryService = Connector.getService('Query'),
            dimensions = queryService.getDimensions('study', assayName),
            columns = [],
            sql = "SELECT * FROM(";

        if (dimensions.length > 0) {
            Ext.each(dimensions, function(dimension) {
                columns.push({
                    name:dimension.name,
                    label:dimension.label
                });
            }, this);

            for (var i = 0; i<columns.length; i++) {
                sql = sql + "SELECT DISTINCT '"
                + assayName + "' as Assay, '"
                + columns[i].label + "' as columnName, "
                + "CAST(" + columns[i].name + " AS VARCHAR) as Analyte FROM ds_" + assayName.toLowerCase();
                if (i < columns.length - 1) {
                    sql = sql + "\n UNION \n";
                }
            }
            sql = sql + ") AS source_table ORDER BY source_table.Assay, source_table.columnName";


            LABKEY.Query.executeSql({
                schemaName: 'cds',
                sql: sql,
                success: function(result) {
                    var analytes = {};
                    Ext.each(result.rows, function(row) {
                        var key = row.columnName;

                        if (key in analytes) {
                            analytes[key] = analytes[key] + ", " + row.Analyte;
                        }
                        else {
                            analytes[key] = row.Analyte;
                        }
                    });

                    var analyteRows = [];
                    Ext.iterate(analytes, function(prop, value) {
                        analyteRows.push({
                            col: prop,
                            value: value
                        });
                    });

                    callback.call(scope, analyteRows);
                },
                scope: scope
            });
        }
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
