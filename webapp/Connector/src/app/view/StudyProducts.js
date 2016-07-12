/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyProducts', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learnstudyproducts learngrid',

    statics: {
        searchFields: ['product_name', 'product_description', 'product_type', 'product_class', 'product_class_label', 'product_subclass', 'product_developer']
    },

    columns: [{
        text: 'Product name',
        xtype: 'templatecolumn',
        minWidth: 600,
        flex: 60/100,
        resizable: false,
        dataIndex: 'product_name',
        filterConfig: {
            filterField: 'product_name',
            valueType: 'string',
            title: 'Product Name'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-description detail-row-text">',
                    '<h2>{product_name:htmlEncode}</h2>',
                    '<div class="detail-description-text">{product_description:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Type',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'product_type',
        filterConfig: {
            filterField: 'product_type',
            valueType: 'string',
            title: 'Type'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-text detail-row-text">',
                    '<div class="detail-black-text">{product_type:htmlEncode}</div>',
                    '<div>',
                        '<span class="detail-gray-text">Class: <span class="detail-black-text">{product_class:htmlEncode}</span></span>',
                    '</div>',
                    '<div>',
                        '<span class="detail-gray-text">Subclass: <span class="detail-black-text">{product_subclass:htmlEncode}</span></span>',
                    '</div>',
                '</div>'
        )
    },{
        text: 'Developer',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'product_developer',
        filterConfig: {
            filterField: 'product_developer',
            valueType: 'string',
            title: 'Developer'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-text detail-row-text">',
                    '<div class="detail-gray-text"">{product_developer:htmlEncode}</div>',
                '</div>'
        )
    }],

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
            '<div class="detail-container"><div class="saeempty">None of the selected study products have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});