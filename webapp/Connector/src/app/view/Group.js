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
                '<div class="detail-description">',
                '<h2>{group_name:htmlEncode}</h2>',
                //TODO: add description to the group
                // '<div class="detail-description-text">',
                // '<p class="block-with-text">{description}</p>',
                '</div>',
        ),
    }, {
        text: 'Studies',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'study_label',
        filterConfigSet: [{
            filterField: 'study_label',
            valueType: 'string',
            title: 'Studies'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="studies.length &gt; 0">',
                            '<tpl for="studies">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{study_label:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                            '<li class="detail-gray-text">No related studies</li>',
                        '</tpl>',
                    '</ul>',
                '</div>'
        )
    }, {
        text: 'Species',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'species',
        filterConfigSet: [{
            filterField: 'species',
            valueType: 'string',
            title: 'Species'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="studySpecies.length &gt; 0">',
                            '<tpl for="studySpecies">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{species:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                            '<li class="detail-gray-text">No related species</li>',
                        '</tpl>',
                    '</ul>',
                '</div>')
    }]
});