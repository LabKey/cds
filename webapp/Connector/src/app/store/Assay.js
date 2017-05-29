/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Assay', {

    extend : 'Ext.data.Store',

    mixins: {
        studyAccessHelper: 'Connector.app.store.PermissionedStudy'
    },

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

        this.loadAccessibleStudies(this._onLoadComplete, this); // populate this.accessibleStudies

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assay',
            success: this.onLoadAssays,
            scope: this
        });
        
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_studiesforassays',
            success: this.onLoadStudies,
            scope: this
        })
    },

    onLoadAssays: function (assayData) {
        this.assayData = assayData.rows;
        this._onLoadComplete();
    },

    onLoadStudies: function (assayStudies) {
        this.assayStudies = assayStudies.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.assayData) && Ext.isDefined(this.assayStudies) && Ext.isDefined(this.accessibleStudies)) {

            this.assayData.sort(function(assayA, assayB) {
                return LABKEY.app.model.Filter.sorters.natural(assayA.assay_short_name, assayB.assay_short_name);
            });

            var assays = [];

            Ext.each(this.assayData, function(assay) {
                var studies = [];
                var studiesWithData = [];
                assay.data_availability = false;
                assay.data_accessible = false;
                for (var s = 0; s < this.assayStudies.length; s++) {
                    if (assay.assay_identifier === this.assayStudies[s].assay_identifier) {
                        var id = this.assayStudies[s].study_name || this.assayStudies[s].prot;
                        var study = {
                            data_label: this.assayStudies[s].label ? this.assayStudies[s].label : '',
                            data_id: id,
                            data_link_id: id,
                            has_data: this.assayStudies[s].has_data,
                            has_access: this.accessibleStudies[this.assayStudies[s].study_name] === true,
                            data_status: this.assayStudies[s].assay_status
                        };
                        studies.push(study);
                    }
                }
                studies.sort(Connector.view.module.DataAvailabilityModule.dataAddedSortFn);
                Ext.each(studies, function(study) {
                    if (study.has_data) {
                        assay.data_availability = true;
                        studiesWithData.push(study);
                        if (!study.data_accessible && study.has_access)
                            assay.data_accessible = true;
                    }
                });
                assay.studies = studies;
                assay.studies_with_data = studiesWithData;
                assay.studies_with_data_count = studiesWithData.length;
                assay.antigen_store = Ext.create('Connector.app.store.AssayAntigen', {
                    model: 'Connector.app.model.AssayAntigen',
                    storeId: 'assayantigen_' + assay.assay_type,
                    assayType: assay.assay_type
                });
                assays.push(assay);
            }, this);

            this.assayData = undefined;
            this.assayStudies = undefined;

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
                + "CAST(" + columns[i].name + " AS VARCHAR) as Analyte FROM study." + assayName.toLowerCase();
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
