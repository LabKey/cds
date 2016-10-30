/*
 * Copyright (c) 2014-2016 LabKey Corporation
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
            queryName: 'studypartgrouparmproduct',
            success: this.onLoadStudyArmProduct,
            scope: this
        });
    },

    onLoadStudyArmProduct: function (armProductsData) {
        var all = armProductsData.rows;
        var armProductsMap = {};
        Ext.each(all, function (row) {
            var studyArm = row.prot + row.study_arm;
            if (!armProductsMap[studyArm]) {
                armProductsMap[studyArm] = {};
            }
            armProductsMap[studyArm][row.product_id] = true;
        });
        var allOtherProducts = {};
        Ext.iterate(armProductsMap, function(arm, products) {
            Ext.each(products, function(product) {
                if (!allOtherProducts[product]) {
                    allOtherProducts[product] = {};
                }
            });
        });

        Ext.iterate(armProductsMap, function(arm, productsObj) {
            var products = Object.keys(productsObj);
            for (var i = 0; i < products.length; i++) {
                var currentProduct = products[i];
                if (!allOtherProducts[currentProduct]) {
                    allOtherProducts[currentProduct] = {};
                }
                Ext.each(products, function(prod) {
                    if (prod !== currentProduct) {
                        allOtherProducts[currentProduct][prod] = true;
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
                studiesWithData,
                s,
                otherProducts,
                me = this;

            // join studies to product
            Ext.each(this.productData, function(product) {
                if (product.product_developer == undefined || product.product_developer == '') {
                    product.product_developer = '[blank]';
                }
                studies = [];
                studiesWithData = [];
                product.data_availability = false;
                for (s=0; s < this.studyData.length; s++) {
                    if (product.product_id === this.studyData[s].product_id) {
                        var study = {
                            study_name: this.studyData[s].study_name,
                            label: this.studyData[s].study_label ? this.studyData[s].study_label : '',
                            has_data: this.studyData[s].has_data
                        };
                        studies.push(study);
                        if (study.has_data) {
                            product.data_availability = true;
                            studiesWithData.push(study);
                        }
                    }
                }
                studies.sort(function(a, b) {
                    var val1 = a.label ? a.label : a.study_name;
                    var val2 = b.label ? b.label : b.study_name;
                    return val1.localeCompare(val2);
                });
                product.studies = studies;
                product.studies_with_data = studiesWithData;
                product.studies_with_data_count = studiesWithData.length;
                otherProducts = [];
                if (this.productProduct && this.productProduct[product.product_id]) {
                    var otherProductIds = Object.keys(this.productProduct[product.product_id]);
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

            this.productData = undefined;
            this.studyData = undefined;
            this.productProduct = undefined;

            this.loadRawData(products);
            LABKEY.Utils.signalWebDriverTest("determinationLearnAboutStudyProductLoaded");

        }
    }
});
