/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
        this.assayStudies = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assay',
            success: this.onLoadAssays,
            scope: this
        });
        // LABKEY.Query.executeSql({
        //     schemaName: 'cds',
        //     sql: 'SELECT DISTINCT assay_identifier, label, study_name FROM ds_subjectassay',
        //     success: this.onLoadStudies,
        //     scope: this
        // });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'studyassay',
            success: this.onLoadStudies,
            scope: this
        })
    },

    onLoadAssays: function (assayData) {
        this.assayData = assayData.rows;
        this._onLoadComplete();
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
                            if (!Ext.Array.contains(ret[idx-1].antigen_description, row.antigen_description[0])) {
                                ret[idx-1].antigen_description.push(', ' + row.antigen_description[0]);
                            }
                        }
                        else {
                            ret[idx] = {
                                antigen_name: row.antigen_name,
                                antigen_description: [row.antigen_description[0]],
                                antigen_control: row.antigen_control, //this assumes the control status is the same for all peptide pools of a protein panel
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

    onLoadStudies: function (assayStudies) {
        this.assayStudies = assayStudies.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.assayData) && Ext.isDefined(this.assayStudies)) {

            this.assayData.sort(function(assayA, assayB) {
                return LABKEY.app.model.Filter.sorters.natural(assayA.assay_short_name, assayB.assay_short_name);
            });

            var assays = [];

            Ext.each(this.assayData, function(assay) {
                var studies = [];
                for (var s = 0; s < this.assayStudies.length; s++) {
                    if (assay.assay_identifier === this.assayStudies[s].assay_identifier) {
                        studies.push({
                            id: this.assayStudies[s].prot,
                            label: this.assayStudies[s].study_label,
                            has_data: this.assayStudies[s].has_data
                        });
                    }
                }
                studies.sort(function(a, b) {
                   return a.label.localeCompare(b.label);
                });
                assay.studies = studies;
                assays.push(assay);
            }, this);

            this.loadRawData(assays);
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
    }
});
