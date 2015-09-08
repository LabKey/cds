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

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assay',
            success: this.onLoadAssays,
            scope: this
        });

    },

    loadAntigens : function(assayName, callback, scope) {
        if (assayName === 'ICS' || assayName === 'ELISPOT') {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: 'learn_' + assayName + '_antigens',
                success: function(result) {
                    var ret = [],
                        idx = 0;
                    Ext.each(result.rows, function(row) {
                        if(ret[idx-1] && ret[idx-1].antigen_name === row.antigen_name) {
                            ret[idx-1].protienAndPools.push({
                                protein: row.protein,
                                pools: row.pools
                            });
                        }
                        else {
                            ret[idx] = {
                                antigen_name: row.antigen_name,
                                antigen_description: row.antigen_description,
                                antigen_control: row.antigen_control,
                                clades: row.clades,
                                protienAndPools: [{
                                    protein: row.protein,
                                    pools: row.pools
                                }]
                            };
                            idx++;
                        }
                    });
                    callback.call(scope, ret);
                },
                scope: scope
            })
        }
        else {
            LABKEY.Query.selectRows({
                schemaName: 'cds',
                queryName: assayName + 'antigen',
                success: function (result) {
                    callback.call(scope, result.rows);
                },
                scope: scope
            })
        }
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

            this.assayData.sort(function(assayA, assayB) {
                return LABKEY.app.model.Filter.sorters.natural(assayA.assay_short_name, assayB.assay_short_name);
            });

            this.loadRawData(this.assayData);
        }
    }
});
