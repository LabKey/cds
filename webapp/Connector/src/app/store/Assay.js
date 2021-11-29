/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Assay', {

    extend : 'Connector.app.store.SavedReports',

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
        this.callParent();

        this.assayData = undefined;
        this.assayStudies = undefined;
        this.assayDocuments = undefined;
        this.assayReportsData = undefined;

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
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assaydocuments',
            success: this.onLoadAssayDocuments,
            scope: this
        });

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'assayReport',
            success: this.onLoadAssayReport,
            scope: this
        });
    },

    onLoadAssays: function (assayData) {
        this.assayData = assayData.rows;
        this._onLoadComplete();
    },

    onLoadStudies: function (assayStudies) {
        this.assayStudies = assayStudies.rows;
        this._onLoadComplete();
    },

    onLoadAssayDocuments: function (assayDocuments) {
        this.assayDocuments = assayDocuments.rows;
        this._onLoadComplete();
    },

    onLoadAssayReport : function(assayReports) {
        this.assayReportsData = assayReports.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.assayData)
               && Ext.isDefined(this.assayStudies)
               && Ext.isDefined(this.accessibleStudies)
               && Ext.isDefined(this.assayDocuments)
               && Ext.isDefined(this.assayReportsData)
               && Ext.isDefined(this.savedReportsData)) {

            this.assayData.sort(function(assayA, assayB) {
                return Connector.model.Filter.sorters.natural(assayA.assay_short_name, assayB.assay_short_name);
            });

            // interactive reports
            var allInteractiveReports = [];
            Ext.each(this.assayReportsData, function(report){
                var id = report.cds_report_id ? report.cds_report_id.toString() : undefined;
                var reportObj = this.savedReportsData.filter(function(val) { return val.reportId === id;}, this);

                if (reportObj && reportObj.length > 0) {
                    allInteractiveReports.push({
                        report_id: id,
                        assay_identifier: report.assay_identifier,
                        label: reportObj && reportObj[0] ? reportObj[0].reportName : undefined,
                    });
                }
            }, this);

            // assay data
            var assays = [];
            Ext.each(this.assayData, function(assay) {
                var studies = [];
                var studiesWithData = [];
                var assayTutorialLinks = []; //tutorial video links
                var assayTutorialDocuments = []; //tutorial doc links

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
                            data_status: this.assayStudies[s].assay_status,
                            data_description: this.assayStudies[s].description
                        };
                        studies.push(study);
                    }
                }

                Ext.each(this.assayDocuments, function(assayDoc) {
                    if (assayDoc.assay_identifier === assay.assay_identifier) {
                        var doc = {
                            label: assayDoc.label,
                            filePath: Connector.plugin.DocumentValidation.getAssayTutorialDocumentUrl(assayDoc.filename, assayDoc.document_id),
                            assay_tutorial_link: assayDoc.video_link,
                            assay_tutorial_type: assayDoc.document_type,
                            assay_tutorial_id: assayDoc.document_id,
                            video_thumbnail_label: assayDoc.video_thumbnail_label,
                            hasPermission: true,
                            suffix: '(' + Connector.utility.FileExtension.fileDisplayType(assayDoc.filename) +')',
                        }
                        if (assayDoc.document_type === "Assay Tutorial Document") {
                            assayTutorialDocuments.push(doc);
                        }
                        else if (assayDoc.document_type === "Assay Tutorial Link") {
                            assayTutorialLinks.push(doc);
                        }
                    }
                });
                assay.assayTutorialDocuments = assayTutorialDocuments;
                assay.assayTutorialLinks = assayTutorialLinks;

                studies.sort(Connector.view.module.DataAvailabilityModule.dataAddedSortFn);
                Ext.each(studies, function(study, index) {
                    if (study.has_data) {
                        assay.data_availability = true;
                        studiesWithData.push(study);
                        if (!study.data_accessible && study.has_access)
                            assay.data_accessible = true;
                    }
                    study.data_index = index; //for show all/show less on display
                    study.data_show = index < 10; //for show all/show less on display
                });
                assay.studies = studies;
                assay.studies_with_data = studiesWithData;
                assay.studies_with_data_count = studiesWithData.length;
                assay.antigen_store = Ext.create('Connector.app.store.AssayAntigen', {
                    model: 'Connector.app.model.AssayAntigen',
                    storeId: 'assayantigen_' + assay.assay_type,
                    assayType: assay.assay_type,
                    assayId: assay.assay_identifier
                });
                assay.variable_store = Ext.create('Connector.app.store.VariableList', {
                    storeId: 'assayvariable_' + assay.assay_type,
                    assayType: assay.assay_type
                });

                var interactiveReports = allInteractiveReports.filter(function (report) {
                    return report.assay_identifier.toString() === assay.assay_identifier;
                });

                if (interactiveReports && interactiveReports.length > 0) {
                    assay.interactive_reports = interactiveReports;
                }
                assay.data_types_available = this.getDataTypesAvailable(assay);

                assays.push(assay);
            }, this);

            this.assayData = undefined;
            this.assayStudies = undefined;
            this.assayDocuments = undefined;
            this.assayReportsData = undefined;
            this.savedReportsData = [];

            this.loadRawData(assays);
            this.dataLoaded = true;
            this.fireEvent('dataloaded');
        }
    },

    loadAnalytes : function(assayName, dimensions, callback, scope) {
        var sql = dimensions.map(function(dim){
            return "SELECT DISTINCT '"
                    + assayName + "' as Assay, '"
                    + dim.label + "' as columnName, "
                    + "CAST(" + dim.name + " AS VARCHAR) as Analyte FROM study." + assayName.toLowerCase();
        }).join("\n UNION \n");

        sql = "SELECT * FROM(" + sql + ") AS source_table ORDER BY source_table.Assay, source_table.columnName";


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
});
