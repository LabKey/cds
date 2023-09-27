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

    id: 'learn-group-grid-id',

    features: [{
        ftype: 'grouping',
        groupHeaderTpl: [
            '<div>{name:this.formatName}</div>',
            {
                formatName: function(name) {
                    if (name.indexOf('1_my_saved_groups') > -1) {
                        return 'My saved groups';
                    }
                    else if (name.indexOf('2_curated_groups') > -1) {
                        return 'Curated groups';
                    }
                }
            }
        ],

        groupCls: 'learn-grid-group-hd',
        eventSelector: '.learn-grid-group-hd',

        collapsedCls: 'learn-grid-group-collapsed',
        hdCollapsedCls: 'learn-grid-group-hd-collapsed',
        collapsibleCls: 'learn-grid-group-hd-collapsible',
        collapsible: true
    }],

    viewConfig: {
        listeners : {
            render : function(view) {
                var x = view;
                var src = view.getSelectionModel().view.features[0].dataSource;

                // replace the ext css classes with customized css classes using replace() since 'groupTpl' have these
                // hardcoded instead of using the property values. See ext-all-dev.js, line 158286 or (ext-all-debug.js, line 111454 when debugging)
                var newHtml = src.groupTpl.html.replace(/x-grid-group-title/g, 'learn-grid-group-title'); //replace all occurrences
                newHtml = newHtml.replace(/x-grid-group-hd/g, 'learn-grid-group-hd'); //replace all occurrences
                newHtml = newHtml.replace(/{collapsibleCls}/g, 'learn-grid-group-hd-collapsible'); //replace all occurrences
                src.groupTpl.html = newHtml;
            }
        },
        getRowClass: function(record, rowIndex, rowParams, store) {
            return 'detail-row';
        }
    },
    statics: {
        searchFields: ['group_name', 'description',
            {field: 'studies', value: 'study_label', emptyText: 'No related products'},
            {field: 'species', value: 'species', emptyText: 'No related species'},
            {field: 'products', value: 'product_name', emptyText: 'No related products'},
            {field: 'assays', value: 'assay_identifier', emptyText: 'No related assays'}
        ]
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
                    '<div class="detail-description-text">',
                    '<p class="block-with-text">{description:htmlEncode}</p>',
                '</div>',
        ),
    }, {
        text: 'Studies',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'study_names_to_sort_on',
        filterConfigSet: [{
            filterField: 'study_names',
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
        dataIndex: 'species_to_sort_on',
        filterConfigSet: [{
            filterField: 'species_names',
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
    }, {
        text: 'Products',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'product_to_sort_on',
        filterConfigSet: [{
            filterField: 'product_names',
            valueType: 'string',
            title: 'Products'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="products.length &gt; 0">',
                            '<tpl for="products">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{product_name:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '<tpl else>',
                        '<li class="detail-gray-text">No related products</li>',
                        '</tpl>',
                    '</ul>',
                '</div>')
    }, {
        text: 'Assays',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'assay_to_sort_on',
        filterConfigSet: [{
            filterField: 'assay_names',
            valueType: 'string',
            title: 'Assays'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="assays.length &gt; 0">',
                            '<tpl for="assays">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-gray-text">{assay_identifier:htmlEncode}</li>',
                                        '<tpl elseif="xindex == 6">',
                                    '<li class="detail-gray-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '</tpl>',
                    '</ul>',
                '</div>')
    }]
});