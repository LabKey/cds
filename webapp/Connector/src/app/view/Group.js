/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Group', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learngrid',

    itemPluralName: 'Groups',

    showLoadingMask: true,

    features: [{
        groupHeaderTpl: '{name:htmlEncode}',
        ftype: 'grouping',
        // collapsible: true,
        // startcollapsed: true,
    }],

    //TODO: config for the group header, set the collapsible arrow to the right
    // viewConfig: {
    //     getRowClass: function(record, rowIndex, rowParams, store) {
    //         // Apply custom CSS class to the group headers
    //         if (record.isGroupHeader) {
    //             return 'group-header-custom-style';
    //         }
    //     }
    // },
    statics: {
        // searchFields: ['learn_group', 'learn_study', 'species', 'product_name', 'assay_identifier']
        searchFields: ['group_name']
    },

    columns: [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'group_name',
        filterConfigSet: [{
            filterField: 'group_name',
            valueType: 'string',
            title: 'Group Name'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{group_name:htmlEncode}</div>',
                '</div>'
        ),
    }]
});