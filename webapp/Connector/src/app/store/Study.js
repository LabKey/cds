/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.Study', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.Study',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {
        this.studyData = undefined;
        this.productData = undefined;
        this.assayData = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'study',
            success: this.onLoadStudies,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'studyproductmap',
            success: this.onLoadProducts,
            requiredVersion: 13.2,
            scope: this
        });
        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: 'SELECT DISTINCT assay_identifier, label, study_name FROM ds_subjectassay',
            success: this.onLoadAssays,
            scope: this
        })
    },

    onLoadStudies : function(studyData) {
        this.studyData = studyData.rows;
        this._onLoadComplete();
    },

    onLoadProducts : function(productData) {
        this.productData = productData.rows;
        this._onLoadComplete();
    },

    onLoadAssays : function(assayData) {
        this.assayData = assayData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.studyData) && Ext.isDefined(this.productData) && Ext.isDefined(this.assayData)) {
            var studies = [], products;

            // join products to study
            Ext.each(this.studyData, function(study) {
                products = [];
                for (var p=0; p < this.productData.length; p++) {
                    if (study.study_name === this.productData[p].study_name.value) {
                        // Consider: These should probably be of type Connector.app.model.StudyProducts
                        // but it'd be good to then have a common sourcing mechanism for LA models
                        products.push({
                            product_id: this.productData[p].product_id.value,
                            product_name: this.productData[p].product_id.displayValue
                        });
                    }
                }
                var assays = [];
                for (var a=0; a < this.assayData.length; a++) {
                    if (study.study_name === this.assayData[a].study_name) {
                        assays.push({
                            assay_identifier: this.assayData[a].assay_identifier
                        });
                    }
                }
                study.products = products;
                study.assays = assays;
                studies.push(study);
            }, this);

            studies.sort(function(studyA, studyB) {
                return LABKEY.app.model.Filter.sorters.natural(studyA.label, studyB.label);
            });

            this.loadRawData(studies);
        }
    }
});
