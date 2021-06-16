/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyProducts', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learnstudyproducts learngrid',

    itemPluralName: 'products',

    emptySearchSubtext: 'Also try searching for product in Studies section.',

    statics: {
        searchFields: ['product_name', 'product_description', 'product_type', 'product_class', 'product_class_label', 'product_subclass', 'product_developer']
    },

    columns: [{
        text: 'Product name',
        xtype: 'templatecolumn',
        minWidth: 500,
        locked: true,
        resizable: false,
        dataIndex: 'product_name',
        filterConfigSet: [{
            filterField: 'product_name',
            valueType: 'string',
            title: 'Product Name'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-description">',
                    '<h2>{product_name:htmlEncode}</h2>',
                    '<div class="detail-description-text"><p class="block-with-text">{product_description:htmlEncode}</p></div>',
                '</div>'
        )
    },{
        text: 'Data Added',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'studies_with_data_count',
        filterConfigSet: [{
            filterField: 'studies_with_data_count',
            valueType: 'number',
            title: '# of Studies Added'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="data_availability">',
                        '<div class="detail-has-data ',
                            '<tpl if="data_accessible">',
                            'detail-has-data-green',
                            '<tpl else>',
                            'detail-has-data-gray',
                            '</tpl>',
                        '"></div>',
                        '<div class="detail-gray-text">{[this.studyCountText(values.studies_with_data)]}</div>',
                    '<tpl else>',
                        'Data not added',
                    '</tpl>',
                '</div>',
                {
                    studyCountText : function(studies) {
                        return Connector.app.view.LearnSummary.studyCountText(studies);
                    }
                }
        )
    },{
        text: 'Type',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'product_type',
        filterConfigSet: [{
            filterField: 'product_type',
            valueType: 'string',
            title: 'Type'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div class="detail-black-text">{product_type:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Class',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'product_class',
        filterConfigSet: [{
            filterField: 'product_class',
            valueType: 'string',
            title: 'Class'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div>',
                        '<span class="detail-gray-text">Class: <span class="detail-black-text">{product_class:htmlEncode}</span></span>',
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
        filterConfigSet: [{
            filterField: 'product_developer',
            valueType: 'string',
            title: 'Developer'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div class="detail-gray-text"">',
                        '{product_developer:htmlEncode}',
                    '</div>',
                '</div>'
        )
    }],

    dataAvailabilityTooltipConfig : function() {
        return {
            title: 'Studies'
        }
    }
});