/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyProducts', {

    extend : 'Ext.view.View',

    itemSelector: 'div.detail-wrapper',

    cls: 'learnstudyproducts',

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

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.StudyProducts.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-container">',
                '<div class="detail-wrapper">',
                    '<div class="detail-left-column detail-description">',
                        '<h2>{product_name:htmlEncode}</h2>',
                        '<div class="detail-description-text">{product_description:htmlEncode}</div>',
                    '</div>',
                    '<div class="detail-middle-column detail-text">',
                        '<div class="detail-black-text">{product_type:htmlEncode}</div>',
                        '<div>',
                            '<span class="detail-gray-text">Class: <span class="detail-black-text">{product_class:htmlEncode}</span></span>',
                        '</div>',
                        '<div>',
                            '<span class="detail-gray-text">Subclass: <span class="detail-black-text">{product_subclass:htmlEncode}</span></span>',
                        '</div>',
                    '</div>',
                    '<div class="detail-right-column detail-text">',
                        '<div class="detail-gray-text"">{product_developer:htmlEncode}</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>'
    ),

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
            Connector.app.view.StudyProducts.columnHeaderTpl.apply({}),
            '<div class="detail-container"><div class="saeempty">None of the selected study products have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});