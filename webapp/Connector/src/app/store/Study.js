/*
 * Copyright (c) 2014 LabKey Corporation
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
    },

    onLoadStudies : function(studyData) {
        this.studyData = studyData.rows;
        this._onLoadComplete();
    },

    onLoadProducts : function(productData) {
        this.productData = productData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.studyData) && Ext.isDefined(this.productData)) {
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
                study.products = products;
                studies.push(study);
            }, this);

            this.loadRawData(studies);
        }
    }
});
