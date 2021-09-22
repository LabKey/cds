/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.store.StudyProducts', {

    extend : 'Ext.data.Store',

    mixins: {
        studyAccessHelper: 'Connector.app.store.PermissionedStudy'
    },

    model : 'Connector.app.model.StudyProducts',

    /**
     * Issue 28093 (See annotation on Connector.app.model.StudyProducts)
     * secretData is an additional data field that is populated on load. It maps from product_id to sets of parameters
     * from which a StudyProduct can be created. The getById function will check here when trying to return a record.
     * The use case is for studyProduct records that should not be displayed in the summary, but that we still want
     * to generate individual itemDetails pages for.
     */
    secretData : {},

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

        this.loadAccessibleStudies(this._onLoadComplete, this); // populate this.accessibleStudies

        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_product',
            success: this.onLoadProducts,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_studiesforproducts',
            success: this.onLoadStudies,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds',
            queryName: 'learn_assaysforstudies',
            success: this.onLoadAssays,
            scope: this
        });
        LABKEY.Query.selectRows({
            schemaName: 'cds.metadata',
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
            var products = Ext.Object.getKeys(productsObj);
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

    onLoadAssays : function(assayData) {
        this.studyAssayMap = {};
        Ext.each(assayData.rows, function(studyAssay){
            if (studyAssay.has_data) {
                if (!this.studyAssayMap[studyAssay.prot])
                    this.studyAssayMap[studyAssay.prot] = [];
                this.studyAssayMap[studyAssay.prot].push(studyAssay);
            }
        }, this);
        this._onLoadComplete();
    },

    getById : function(id) {
        if (this.secretData[id]) {
            return Ext.create(this.model, this.secretData[id])
        }
        return this.callParent(arguments);
        // return this.secretData[id] || this.callParent(id);
    },

    hiddenProduct : function(productName) {
        var markerProducts = Connector.app.model.StudyProducts.markerProducts, hidden = false;
        var formattedProductName = productName.toLowerCase().trim();
        Ext4.iterate(markerProducts, function(key, value){
           if (formattedProductName == value) {
               hidden = true;
               return false;
           }
        });
        return hidden;
    },

    _onLoadComplete : function() {
        if (Ext.isDefined(this.productData) && Ext.isDefined(this.studyData) && Ext.isDefined(this.productProduct)
                && Ext.isDefined(this.accessibleStudies) && Ext.isDefined(this.studyAssayMap)) {
            var products = [],
                studies,
                studiesWithData,
                s,
                otherProducts,
                me = this;

            // join studies to product
            Ext.each(this.productData, function(product) {
                studies = [];
                studiesWithData = [];
                product.data_availability = false;
                product.data_accessible = false;
                for (s=0; s < this.studyData.length; s++) {
                    if (product.product_id === this.studyData[s].product_id) {
                        var dataStatus = 'Data not added', studyName = this.studyData[s].study_name;
                        var hasAccess = this.accessibleStudies[studyName] === true;
                        var assays = this.studyAssayMap[studyName];
                        if (assays) {
                            var dataStatus = '<p class="data-availability-tooltip-header">Assays ' + (hasAccess ? 'with' : 'without') + ' data accessible</p>';
                            Ext.each(assays, function(assay){
                                dataStatus += assay.assay_short_name + '<br>';
                            });
                        }
                        var study = {
                            data_label: this.studyData[s].study_label ? this.studyData[s].study_label : '',
                            data_id: studyName,
                            data_link_id: studyName,
                            has_data: this.studyData[s].has_data,
                            has_access:  hasAccess,
                            data_status: dataStatus,
                            data_description: this.studyData[s].description
                        };
                        studies.push(study);
                    }
                }
                studies.sort(Connector.view.module.DataAvailabilityModule.dataAddedSortFn);
                Ext.each(studies, function(study, index){
                    if (study.has_data) {
                        if (!product.data_accessible && study.has_access)
                            product.data_accessible = true;
                        product.data_availability = true;
                        studiesWithData.push(study);
                    }
                    study.data_index = index; //for show all/show less on display
                    study.data_show = index < 10; //for show all/show less on display
                });
                product.studies = studies;
                product.studies_with_data = studiesWithData;
                product.studies_with_data_count = studiesWithData.length;
                otherProducts = [];
                if (this.productProduct && this.productProduct[product.product_id]) {
                    var otherProductIds = Ext.Object.getKeys(this.productProduct[product.product_id]);
                    Ext.each(otherProductIds, function(id) {
                        otherProducts.push({
                            product_id: id,
                            product_name: me.idProductNameMap[id]
                        });
                    });
                }
                product.other_products = otherProducts;

                if (!this.hiddenProduct(product.product_name)) {
                    products.push(product);
                }
                else{
                    if (product.product_name.toLowerCase().trim() != Connector.app.model.StudyProducts.markerProducts.NONE)
                        this.secretData[product.product_id] = product;
                }
            }, this);

            products.sort(function(productA, productB) {
                return Connector.model.Filter.sorters.natural(productA.product_name, productB.product_name);
            });

            this.productData = undefined;
            this.studyData = undefined;
            this.productProduct = undefined;

            this.loadRawData(products);
            LABKEY.Utils.signalWebDriverTest("determinationLearnAboutStudyProductLoaded");

        }
    }
});
