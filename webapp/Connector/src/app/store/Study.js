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
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_assaysforstudies',
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
                if (study.groups || study.treatment_schema_link) {
                    study.groups_treatment_schema = '';
                    if (study.treatment_schema_link) {
                        study.groups_treatment_schema += '<div class="schema-link"><a href="';
                        study.groups_treatment_schema += study.treatment_schema_link;
                        study.groups_treatment_schema += '" target="_blank">Click for treatment schema</a></div>';
                    }
                    if (study.groups) {
                        study.groups_treatment_schema += study.groups;
                    }
                }
                if (study.methods || study.assay_schema_link) {
                    study.methods_assay_schema = '';
                    if (study.assay_schema_link) {
                        study.methods_assay_schema += '<div class="schema-link"><a href="';
                        study.methods_assay_schema += study.assay_schema_link;
                        study.methods_assay_schema += '" target="_blank">Click for assay schema</a></div>';
                    }
                    if (study.methods) {
                        study.methods_assay_schema += study.methods;
                    }
                }
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
                var assays = [], assaysAdded = [], assayAddedCount = 0;
                study.data_availability = false;
                for (var a=0; a < this.assayData.length; a++) {
                    if (study.study_name === this.assayData[a].prot) {
                        study.data_availability = study.data_availability || this.assayData[a].has_data;
                        var assay = {
                            assay_identifier: this.assayData[a].assay_identifier,
                            assay_full_name: this.assayData[a].assay_short_name
                            + ' (' + this.assayData[a].assay_label + ')',
                            has_data: this.assayData[a].has_data
                        };
                        assays.push(assay);
                        if (this.assayData[a].has_data) {
                            assaysAdded.push(assay);
                            assayAddedCount += 1;
                        }
                    }
                }
                study.products = products;
                study.assays = assays;
                study.assays_added = assaysAdded;
                study.assays_added_count = assaysAdded.length;
                studies.push(study);
            }, this);

            studies.sort(function(studyA, studyB) {
                return LABKEY.app.model.Filter.sorters.natural(studyA.label, studyB.label);
            });

            this.loadRawData(studies);
        }
    }
});
