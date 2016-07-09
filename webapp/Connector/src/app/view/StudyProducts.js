/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyProducts', {

    extend : 'Ext.grid.Panel',

    viewConfig: {
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data.data_availability ? cls + ' detail-row-has-data' : cls;
        }
    },

    cls: 'learnstudyproducts learngrid',

    statics: {
        columnHeaderTpl: new Ext.XTemplate(
            '<div class="learncolumnheader">',
                '<div class="detail-left-column">Product name</div>',
                '<div class="detail-middle-column">Type</div>',
                '<div class="detail-right-column">Developer</div>',
            '</div>'
        ),
        searchFields: ['product_name', 'product_description', 'product_type', 'product_class', 'product_class_label', 'product_subclass', 'product_developer']
    },

    columns: [{
        text: 'Product name',
        xtype: 'templatecolumn',
        minWidth: 600,
        resizable: false,
        dataIndex: 'product_name',
        filter: {
            type: 'string'
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
        minWidth: 600,
        resizable: false,
        dataIndex: 'product_type',
        filter: {
            type: 'string'
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
        minWidth: 600,
        resizable: false,
        dataIndex: 'product_developer',
        filter: {
            type: 'string'
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
            // Connector.app.view.StudyProducts.columnHeaderTpl.apply({}),
            '<div class="detail-container"><div class="saeempty">None of the selected study products have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});