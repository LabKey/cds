/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Antigen', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learngrid',

    itemPluralName: 'antigens',

    showLoadingMask : true,

    statics: {
        searchFields: ['antigen_cds_id', 'antigen_short_name', 'antigen_full_name', 'antigen_name_other', 'antigen_category',
            'isolate_species', 'isolate_clade', 'isolate_donor_id', 'isolate_mutations', 'antigen_type_modifiers', 'antigen_type_control',
            {field: 'antigen_panel', value: 'panel_name'}]
    },

    columns : [{
        text: 'Antigen',
        xtype: 'templatecolumn',
        minWidth: 500,
        maxWidth: 600,
        locked: false,
        resizable: false,
        dataIndex: 'antigen_short_name',
        filterConfigSet: [{
            filterField: 'antigen_short_name',
            valueType: 'string',
            title: 'Antigen Name'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-description">',
                    '<h3 class="detail-description">{antigen_short_name:htmlEncode}</h3>',
                    '<br>',
                    '<div class="detail-black-text">{antigen_full_name:htmlEncode}</div>',
                    '<br>',
                    '<div class="detail-black-text">Aliases: {antigen_name_other:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Category',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'antigen_category',
        filterConfigSet: [{
            filterField: 'antigen_category',
            valueType: 'string',
            title: 'Category'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{antigen_category:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Isolate Species',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'isolate_species',
        filterConfigSet: [{
            filterField: 'isolate_species',
            valueType: 'string',
            title: 'Isolate Species'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{isolate_species:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Clade',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'isolate_clade',
        filterConfigSet: [{
            filterField: 'isolate_clade',
            valueType: 'string',
            title: 'Clade'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{isolate_clade:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Donor ID',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'isolate_donor_id',
        filterConfigSet: [{
            filterField: 'isolate_donor_id',
            valueType: 'string',
            title: 'Donor ID'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{isolate_donor_id:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Mutation',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'isolate_mutations',
        filterConfigSet: [{
            filterField: 'isolate_mutations',
            valueType: 'string',
            title: 'Mutation'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{isolate_mutations:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Modifier',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'antigen_type_modifiers',
        filterConfigSet: [{
            filterField: 'antigen_type_modifiers',
            valueType: 'string',
            title: 'Modifier'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{antigen_type_modifiers:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: 'Panels',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'antigen_panel',
        filterConfigSet: [{
            filterField: 'antigen_panel',
            valueType: 'string',
            title: 'Panel'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<ul>',
                        '<tpl if="antigen_panel && antigen_panel.length &gt; 0">',
                            '<tpl for="antigen_panel">',
                                '<tpl if="xindex <= 5">',
                                    '<li class="detail-black-text">{panel_name:htmlEncode}</li>',
                                '<tpl elseif="xindex == 6">',
                                    '<li class="detail-black-text">...</li>',
                                '</tpl>',
                            '</tpl>',
                        '</tpl>',
                    '</ul>',
                '</div>'
        )
    },{
        text: 'Control',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'antigen_type_control',
        filterConfigSet: [{
            filterField: 'antigen_type_control',
            valueType: 'string',
            title: 'Control'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                '<div class="detail-black-text">{antigen_type_control:htmlEncode}</div>',
                '</div>'
        )
    }]
});