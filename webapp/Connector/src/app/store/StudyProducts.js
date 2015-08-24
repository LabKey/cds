/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.StudyProducts', {

    extend : 'Ext.data.Store',

    model : 'Connector.app.model.StudyProducts',

    constructor: function(config) {
        Ext.applyIf(config, {
            cache: []
        });
        this.callParent([config]);
    },

    loadSlice : function(slice) {
        this.productData = undefined;
        this.studyData = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'product',
            success: this.onLoadProducts,
            scope: this
        });
        LABKEY.Query.executeSql({
            schemaName: 'cds',
            sql: 'SELECT *, study_name.label AS study_label, FROM cds.studyproductmap',
            success: this.onLoadStudies,
            requiredVersion: 13.2,
            scope: this
        });
    },

    onLoadProducts : function(productData) {
        this.productData = productData.rows;
        this._onLoadComplete();
    },

    onLoadStudies : function(studyData) {
        this.studyData = studyData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.productData) && Ext.isDefined(this.studyData)) {
            var products = [],
                studies,
                s;

            // join studies to product
            Ext.each(this.productData, function(product) {
                studies = [];
                for (s=0; s < this.studyData.length; s++) {
                    if (product.product_id === this.studyData[s].product_id.value) {
                        studies.push({
                            study_name: this.studyData[s].study_name.value,
                            label: this.studyData[s].study_label.value
                        });
                    }
                }
                product.studies = studies;
                products.push(product);
            }, this);

            products.sort(function(productA, productB) {
                return LABKEY.app.model.Filter.sorters.natural(productA.product_name, productB.product_name);
            });

            this.loadRawData(products);
        }
    }
});
