/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Study', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learnstudies learngrid',

    itemPluralName: "studies",

    showLoadingMask : true,

    columns : [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        minWidth: 400,
        maxWidth: 500,
        locked: false,
        resizable: false,
        dataIndex: 'label',
        filterConfigSet: [{
            filterField: 'label',
            valueType: 'string',
            title: 'Study'
        },{
            filterField: 'network',
            valueType: 'string',
            title: 'Network'
        }],
        tpl: new Ext.XTemplate(
            '<div class="detail-description">',
                '<h2>{label:htmlEncode}</h2>',
                '<div class="detail-description-text">',
                    '<p class="block-with-text">{description}</p>',
                '</div>',
            '</div>')
    },{
        text: 'Data Added',
        xtype: 'templatecolumn',
        minWidth: 175,
        flex: 15/100,
        resizable: false,
        dataIndex: 'assays_added_count',
        filterConfigSet: [{
            filterField: 'data_types_available',
            valueType: 'string',
            title: 'Data Types Available'
        },{
            filterField: 'data_available',
            valueType: 'string',
            title: 'Data Available'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="assays_added_count &gt; 0">',
                        '<div class="detail-has-data ',
                            '<tpl if="data_accessible">',
                            'detail-has-data-green',
                            '<tpl else>',
                            'detail-has-data-gray',
                            '</tpl>',
                        '"></div>',
                    '<tpl elseif="ni_assays_added_count &gt; 0">',
                        '<div class="detail-has-data ',
                            '<tpl if="data_accessible">',
                            'detail-has-data-ni',
                            '<tpl else>',
                            'detail-has-data-ni-gray',
                            '</tpl>',
                        '"></div>',
                    '<tpl elseif="pub_available_data_count &gt; 0">',
                        '<div class="detail-has-data detail-has-data-ni"></div>',
                    '<tpl else>',
                        '<div class="detail-gray-text">',
                            'Data not added',
                        '</div>',
                    '</tpl>',
                    '<tpl if="assays_added_count &gt; 0">',
                        '<div class="detail-gray-text">{[this.assayCountText(values.assays_added, values.data_accessible)]}</div>',
                    '</tpl>',
                    '<tpl if="ni_assays_added_count &gt; 0">',
                        '<div class="detail-gray-text">{[this.niAssayCountText(values)]}</div>',
                    '</tpl>',
                    '<tpl if="pub_available_data_count &gt; 0">',
                        '<div class="detail-gray-text">{[this.publicationCountText(values)]}</div>',
                    '</tpl>',
                '</div>',
                {
                    assayCountText : function(assays_added, accessible) {
                        var totalCount = assays_added.length;
                        var description = "";
                        if (accessible)
                            description += totalCount;
                        else
                            description += ('0/' + totalCount);
                        description += " Integrated Assay";
                        description += (totalCount == 1 ? '' : 's');
                        return description;
                    },
                    niAssayCountText : function(values) {
                        var niCount = values.ni_assays_added_count;
                        var description = "";
                        if (values.data_accessible)
                            description += niCount;
                        else
                            description += ('0/' + niCount);

                        description += " Non-integrated Assay";
                        description += (niCount == 1 ? '' : 's');

                        return description;
                    },
                    publicationCountText : function(values) {
                        var totalCount = values.pub_available_data_count;
                        var description = "";
                        if (totalCount > 0) {
                            description = totalCount + " Publication";
                            description += (totalCount == 1 ? '' : 's');
                        }
                        return description;
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
        },{
            filterField: 'cavd_affiliation',
            valueType: 'string',
            title: 'Grant Affiliation'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div class="detail-black-text">{grant_pi_name}</div>',
                    '<div class="detail-gray-text">{cavd_affiliation}</div>',
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
                    '<div class="detail-black-text">{strategy}</div>',
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
        },{
            filterField: 'product_classes',
            valueType: 'string',
            title: 'Product Class'
        }],
        dataIndex: 'product_to_sort_on',
        tpl: new Ext.XTemplate(
                '<div class="detail-text study-summary-product">',
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
            filterField: 'stage',
            valueType: 'string',
            title: 'Stage'
        },{
            filterField: 'start_year',
            valueType: 'string',
            title: 'Start Year'
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
            'conclusions', 'publications', 'context', 'population', 'data_availability', 'ni_data_availability',
            {field: 'products', value: 'product_name', emptyText: 'No related products'}
        ]
    },

    dataAvailabilityTooltipConfig : function() {
        return {
            title: 'Integrated Assays'
        }
    }
});