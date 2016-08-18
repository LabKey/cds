/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Study', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learnstudies learngrid',

    columns : [{
        text: 'Name & Description',
        xtype: 'templatecolumn',
        width: 500,
        locked: true,
        resizable: false,
        dataIndex: 'label',
        filterConfigSet: [{
            filterField: 'label',
            valueType: 'string',
            title: 'Study'
        }],
        tpl: new Ext.XTemplate(
            '<div class="detail-description detail-row-text">',
                '<h2>{label:htmlEncode}</h2>',
                '<tpl if="species && species.length &gt; 0">',
                    '<span class="detail-type-text">{species:htmlEncode}</span>',
                '</tpl>',
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
                '<div class="detail-text detail-row-text">',
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
                '<div class="detail-text detail-row-text">',
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
                '<div class="detail-text detail-row-text">',
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
                '<div class="detail-text detail-row-text">',
                    '<tpl if="strategy != &quot;[blank]&quot;">',
                        '<div class="detail-black-text">{strategy}</div>',
                    '</tpl>',
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
                '<div class="detail-text detail-row-text">',
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
                        return Connector.app.view.Study.dateRenderer(date);
                    },
                    monthDiff : function(date1, date2) {
                        return Connector.app.view.Study.monthDiff(new Date(date1), new Date(date2));
                    }
                }
        )
    }, {
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
                '<div class="detail-text detail-row-text">',
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
    }],

    statics: {
        dateRenderer : Ext.util.Format.dateRenderer("M jS, Y"),
        monthDiff : function(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        },
        searchFields: [
            'label', 'title', 'type', 'cavd_affiliation', 'description', 'objectives', 'rationale', 'findings', 'groups', 'methods',
            'conclusions', 'publications', 'context', 'population', 'data_availability',
            {field: 'products', value: 'product_name', emptyText: 'No related products'}
        ],
        filterFields: [
            'label',  'assays_added_count', 'type', 'species', 'grant_pi_name', 'strategy', 'stage', 'start_year',
            'product_names'
        ]
    },

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.viewConfig.emptyText = new Ext.XTemplate(
            '<div class="detail-container"><div class="saeempty">None of the selected studies have data for this category.</div></div>'
        ).apply({});

        this.callParent();

        this.on({
            'itemmouseenter' : function(view, record, item) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]),
                        id = Ext.id();
                    if (checkmark) {
                        checkmark.on('mouseenter', this.showAssayDataTooltip, this, {
                            record: record,
                            id: id
                        });
                        checkmark.on('mouseleave', this.hideAssayDataTooltip, this, {
                            id: id
                        });
                        checkmark.on('click', this.hideAssayDataTooltip, this, {
                            id: id
                        })
                    }
                }
            },

            'itemmouseleave' : function(view, record, item) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]);
                    if (checkmark) {
                        checkmark.un('mouseenter', this.showAssayDataTooltip, this);
                        checkmark.un('mouseleave', this.hideAssayDataTooltip, this);
                        checkmark.un('click', this.hideAssayDataTooltip, this);
                    }
                }
            },

            scope: this
        })
    },

    showAssayDataTooltip : function(event, item, options) {
        var assayList = options.record.data.assays_added;
        var assayListHTML = "<ul>";
        for (var itr = 0; itr < assayList.length; ++itr) {
            assayListHTML += "<li>" + assayList[itr].assay_short_name + "</li>\n";
        }
        assayListHTML += "</ul>";

        var calloutMgr = hopscotch.getCalloutManager(),
            _id = options.id,
            displayTooltip = setTimeout(function() {
                calloutMgr.createCallout(Ext.apply({
                    id: _id,
                    xOffset: 10,
                    showCloseButton: false,
                    target: item,
                    placement: 'right',
                    title: "Assays with Data Available",
                    content: assayListHTML,
                    width: 190
                }, {}));
            }, 200);

        this.on('hide' + _id, function() {
            clearTimeout(displayTooltip);
            calloutMgr.removeCallout(_id);
        }, this);
    },

    hideAssayDataTooltip : function(event, item, options) {
        this.fireEvent('hide' + options.id);
    }
});