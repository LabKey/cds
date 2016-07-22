/*
 * Copyright (c) 2014-2015 LabKey Corporation
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
        this.productProduct = undefined;
        this.idProductNameMap = undefined;

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'product',
            success: this.onLoadProducts,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'ds_studiesforproducts',
            success: this.onLoadStudies,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'subjectproductmap',
            success: this.onLoadSubjectProduct,
            scope: this
        });
    },

    onLoadSubjectProduct: function (subjectProductsData) {
        var all = subjectProductsData.rows;
        var subjectProductsMap = {};
        Ext.each(all, function (row) {
            if (!subjectProductsMap[row.participantid]) {
                subjectProductsMap[row.participantid] = new Set();
            }
            subjectProductsMap[row.participantid].add(row.product_id);
        });
        var allOtherProducts = {};
        Ext.iterate(subjectProductsMap, function(subject, products) {
            Ext.each(products, function(product) {
                if (!allOtherProducts[product]) {
                    allOtherProducts[product] = new Set();
                }
            });
        });

        Ext.iterate(subjectProductsMap, function(subject, productsSet) {
            var products = Array.from(productsSet);
            for (var i = 0; i < products.length; i++) {
                var currentProduct = products[i];
                if (!allOtherProducts[currentProduct]) {
                    allOtherProducts[currentProduct] = new Set();
                }
                Ext.each(products, function(prod) {
                    if (prod !== currentProduct) {
                        allOtherProducts[currentProduct].add(prod);
                    }
                });
            }
        });

        this.productProduct = allOtherProducts;
        this._onLoadComplete();
    },

    onLoadProducts : function(productData) {
        this.productData = productData.rows;var productNameMap = {};
        Ext.each(productData.rows, function(row){
            productNameMap[row.product_id] = row.product_name;
        });
        this.idProductNameMap = productNameMap;
        this._onLoadComplete();
    },

    onLoadStudies : function(studyData) {
        this.studyData = studyData.rows;
        this._onLoadComplete();
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.productData) && Ext.isDefined(this.studyData) && Ext.isDefined(this.productProduct)) {
            var products = [],
                studies,
                s,
                otherProducts,
                me = this;

            // join studies to product
            Ext.each(this.productData, function(product) {
                if (product.product_developer == undefined || product.product_developer == '')
                {
                    product.product_developer = '[blank]';
                }
                studies = [];
                for (s=0; s < this.studyData.length; s++) {
                    if (product.product_id === this.studyData[s].product_id) {
                        studies.push({
                            study_name: this.studyData[s].study_name,
                            label: this.studyData[s].study_label ?
                                    this.studyData[s].study_label + ' (' + this.studyData[s].study_short_name + ')'
                                    : '',
                            has_data: this.studyData[s].has_data
                        });
                    }
                }
                product.studies = studies;
                otherProducts = [];
                if (this.productProduct && this.productProduct[product.product_id]) {
                    var otherProductIds = Array.from(this.productProduct[product.product_id]);
                    Ext.each(otherProductIds, function(id) {
                        otherProducts.push({
                            product_id: id,
                            product_name: me.idProductNameMap[id]
                        });
                    });
                }
                product.other_products = otherProducts;
                products.push(product);
            }, this);

            products.sort(function(productA, productB) {
                return LABKEY.app.model.Filter.sorters.natural(productA.product_name, productB.product_name);
            });

            this.loadRawData(products);
            LABKEY.Utils.signalWebDriverTest("determinationLearnAboutStudyProductLoaded");

        }
    }
});
