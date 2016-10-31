/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Study', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learnstudies learngrid',

    itemPluralName: "studies",

    columns : [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        minWidth: 400,
        maxWidth: 500,
        locked: true,
        resizable: false,
        dataIndex: 'label',
        filterConfigSet: [{
            filterField: 'label',
            valueType: 'string',
            title: 'Study'
        }],
        tpl: new Ext.XTemplate(
            '<div class="detail-description">',
                '<h2>{label:htmlEncode}</h2>',
                '<div class="detail-description-text">',
                    '{description}',
                '</div>', // allow html
            '</div>')
    },{
        text: 'Data Added',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'assays_added_count',
        filterConfigSet: [{
            filterField: 'assays_added_count',
            valueType: 'number',
            title: '# of Assays Added'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="data_availability">',
                        '<div class="detail-has-data"></div>',
                        '<div class="detail-gray-text">{[this.assayCountText(values.assays_added_count)]}</div>',
                    '<tpl else>',
                        'Not added',
                    '</tpl>',
                '</div>',
                {
                    assayCountText : function(assay_count) {
                        return assay_count == 1 ? assay_count + ' Assay' : assay_count + ' Assays';
                    }
                }
        )
    },{
        text: 'Type',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'type',
        filterConfigSet: [{
            filterField: 'type',
            valueType: 'string',
            title: 'Type'
        },{
            filterField: 'species',
            valueType: 'string',
            title: 'Species'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div class="detail-black-text">{type}</div>',
                    '<div class="detail-gray-text">{species}</div>',
                '</div>'
        )
    },{
        text: 'PI',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'grant_pi_name',
        filterConfigSet: [{
            filterField: 'grant_pi_name',
            valueType: 'string',
            title: 'PI'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div class="detail-black-text">{grant_pi_name}</div>',
                '</div>'
        )
    },{
        text: 'Strategy',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'strategy',
        filterConfigSet: [{
            filterField: 'strategy',
            valueType: 'string',
            title: 'Strategy'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="strategy != &quot;[blank]&quot;">',
                        '<div class="detail-black-text">{strategy}</div>',
                    '</tpl>',
                '</div>'
        )
    },{
        text: 'Products',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        filterConfigSet: [{
            filterField: 'product_names',
            valueType: 'string',
            title: 'Products'
        }],
        dataIndex: 'product_to_sort_on',
        tpl: new Ext.XTemplate(
                '<div class="detail-text study-summary-product">',
                    '<ul>',
                        '<tpl if="products.length &gt; 0">',
                            '<tpl for="products">',
                               '<li class="detail-gray-text">{product_name:htmlEncode}</li>',
                            '</tpl>',
                        '<tpl else>',
                            '<li class="detail-gray-text">No related products</li>',
                        '</tpl>',
                    '</ul>',
                '</div>'
        )
    },{
        text: 'Status',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'date_to_sort_on',
        filterConfigSet: [{
            filterField: 'start_year',
            valueType: 'string',
            title: 'Start Year'
        },{
            filterField: 'stage',
            valueType: 'string',
            title: 'Stage'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="stage">',
                        '<div class="detail-black-text">{stage}</div>',
                    '</tpl>',
                    '<tpl if="first_enr_date || followup_complete_date">',
                        '<table>',
                            '<tpl if="first_enr_date">',
                                '<tr class="detail-gray-text">',
                                    '<td>Start:</td><td>{first_enr_date:this.renderDate}</td>',
                                '</tr>',
                            '</tpl>',
                            '<tpl if="followup_complete_date">',
                                '<tr class="detail-gray-text">',
                                    '<td>End:</td><td>{followup_complete_date:this.renderDate}</td>',
                                '</tr>',
                            '</tpl>',
                        '</table>',
                    '<tpl elseif="start_date || public_date">',
                        '<table>',
                            '<tpl if="start_date">',
                                '<tr class="detail-gray-text">',
                                    '<td>Start:</td><td>{start_date:this.renderDate}</td>',
                                '</tr>',
                            '</tpl>',
                            '<tpl if="public_date">',
                                '<tr class="detail-gray-text">',
                                    '<td>End:</td><td>{public_date:this.renderDate}</td>',
                                '</tr>',
                            '</tpl>',
                        '</table>',
                    '</tpl>',
                '</div>',
                {
                    renderDate : function(date) {
                        return Connector.app.view.LearnSummary.dateRenderer(date);
                    },
                    monthDiff : function(date1, date2) {
                        return Connector.app.view.LearnSummary.monthDiff(new Date(date1), new Date(date2));
                    }
                }
        )
    }],

    statics: {
        searchFields: [
            'label', 'study_title', 'type', 'cavd_affiliation', 'description', 'objectives', 'rationale', 'findings', 'groups', 'methods',
            'conclusions', 'publications', 'context', 'population', 'data_availability',
            {field: 'products', value: 'product_name', emptyText: 'No related products'}
        ],
        filterFields: [
            'label',  'assays_added_count', 'type', 'species', 'grant_pi_name', 'strategy', 'stage', 'start_year',
            'product_names'
        ]
    },

    dataAvailabilityTooltipConfig : function() {
        return {
            title: 'Assays',
            recordField: 'assay_short_name'
        }
    }
});