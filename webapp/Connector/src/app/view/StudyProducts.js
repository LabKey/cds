/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyProducts', {

    extend : 'Ext.view.View',

    itemSelector: 'div.study-detail',

    statics: {
        columnHeaderTpl: new Ext.XTemplate(
            '<div class="learncolumnheader">',
                '<div class="detail-container">',
                    '<div class="study-description detail-header">Product name</div>',
                    '<div class="study-date detail-header">Type</div>',
                    '<div class="study-treatments detail-header">Developer</div>',
                '</div>',
            '</div>'
        ),
        searchFields: ['product_name', 'product_description', 'product_type', 'product_class_label', 'product_subclass', 'product_developer']
    },

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.StudyProducts.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-wrapper">',
                '<div class="detail-container study-detail">',
                    '<div class="study-description">',
                        '<h2>{product_name:htmlEncode}</h2>',
                        '<div class="description-text">{product_description:htmlEncode}</div>',
                    '</div>',
                    '<div class="study-date">',
                        '<span class="startdate-text">{product_type:htmlEncode}</span>',
                        '<span class="enddate-text">Class: <span style="color: black;">{product_class_label:htmlEncode}</span></span>',
                        '<span class="enddate-text">Subclass: <span style="color: black;">{product_subclass:htmlEncode}</span></span>',
                    '</div>',
                    '<div class="study-treatments">{product_developer:htmlEncode}</div>',
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