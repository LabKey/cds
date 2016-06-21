/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Study', {

    extend : 'Ext.view.View',

    itemSelector: 'div.detail-wrapper',

    cls: 'learnstudies',

    statics: {
        dateRenderer : Ext.util.Format.dateRenderer("M jS, Y"),
        monthDiff : function(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        },
        assaysWithData : function(assays) {
            var ret = [];
            for (var itr = 0; itr < assays.length; ++itr) {
                var assay = assays[itr];
                if (assay.has_data) {
                    ret = ret.concat(assay);
                }
            }
            return ret;
        },
        columnHeaderTpl : new Ext.XTemplate(
            '<div class="learncolumnheader">',
                '<div class="detail-left-column">Description</div>',
                '<div class="detail-middle-column">Start Date</div>',
                '<div class="detail-small-column">Products</div>',
                '<div class="detail-small-column">Data Added</div>',
            '</div>'
        ),
        searchFields: [
            'label', 'type', 'cavd_affiliation', 'description', 'objectives', 'rationale', 'findings', 'groups', 'methods',
            'conclusions', 'publications', 'context', 'population', 'data_availability',
            {field: 'products', value: 'product_name', emptyText: 'No related products'}
        ]
    },

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.Study.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-container">',
                '<div class="detail-wrapper {[values.data_availability ? "has-data" : ""]}">',
                    '<div class="detail-left-column detail-description">',
                        '<h2>{label:htmlEncode}</h2>',
                        '<tpl if="species && species.length &gt; 0">',
                            '<span class="detail-type-text">{species:htmlEncode}</span>',
                        '</tpl>',
                        '<div class="detail-description-text">',
                            '<tpl if="data_availability">',
                                '<div class="data-availability-text">{data_availability}</div>',
                            '</tpl>',
                            '{description}',
                        '</div>', // allow html
                    '</div>',
                    '<div class="detail-middle-column detail-text">',
                        '<tpl if="first_enr_date || followup_complete_date">',
                            '<tpl if="first_enr_date && followup_complete_date">',
                                '<div class="detail-black-text">{first_enr_date:this.renderDate}</div>',
                                '<div class="detail-gray-text">to {followup_complete_date:this.renderDate}</div>',
                                '<div class="detail-gray-text">{[this.monthDiff(values.first_enr_date, values.followup_complete_date)]} months in duration</div>',
                            '<tpl elseif="first_enr_date">',
                                '<div class="detail-black-text">Began {first_enr_date:this.renderDate}</div>',
                            '<tpl elseif="followup_complete_date">',
                                '<div class="detail-gray-text">Ended {followup_complete_date:this.renderDate}</div>',
                            '</tpl>',
                        '<tpl elseif="start_date || public_date">',
                            '<tpl if="start_date && public_date">',
                                '<div class="detail-black-text">{start_date:this.renderDate}</div>',
                                '<div class="detail-gray-text">to {public_date:this.renderDate}</div>',
                                '<div class="detail-gray-text">{[this.monthDiff(values.start_date, values.public_date)]} months in duration</div>',
                            '<tpl elseif="start_date">',
                                '<div class="detail-black-text">Began {start_date:this.renderDate}</div>',
                            '<tpl elseif="public_date">',
                                '<div class="detail-gray-text">Ended {public_date:this.renderDate}</div>',
                            '</tpl>',
                        '<tpl else>',
                            '<div>&nbsp</div>', //preserves spacing
                        '</tpl>',
                    '</div>',
                    '<div class="detail-small-column detail-text">',
                        '<ul>',
                            '<tpl if="products.length &gt; 0">',
                                '<tpl for="products">',
                                    '<li class="detail-gray-text">bar{product_name:htmlEncode}</li>',
                                '</tpl>',
                            '<tpl else>',
                                '<li class="detail-gray-text">No related products</li>',
                            '</tpl>',
                        '</ul>',
                    '</div>',
                    '<div class="detail-small-column detail-text">',
                        '<tpl if="data_availability">',
                            '<div class="detail-has-data"></div>',
                            '<div class="detail-gray-text">{[this.numAssaysWithData(values.assays)]}</div>',
                        '<tpl else>',
                            'No data found',
                        '</tpl>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>',
        {
            renderDate : function(date) {
                return Connector.app.view.Study.dateRenderer(date);
            },
            monthDiff : function(date1, date2) {
                return Connector.app.view.Study.monthDiff(new Date(date1), new Date(date2));
            },
            numAssaysWithData : function(assays) {
                var num = Connector.app.view.Study.assaysWithData(assays).length;
                return num == 1 ? num + ' Assay' : num + ' Assays';
            }
        }
    ),

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
            Connector.app.view.Study.columnHeaderTpl.apply({}),
            '<div class="detail-container"><div class="saeempty">None of the selected studies have data for this category.</div></div>'
        ).apply({});

        this.callParent();

        this.on({
            'itemmouseenter' : function(view, record, item) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]),
                        id = Ext.id();

                    checkmark.on('mouseenter', this.showAssayDataTooltip, this, {
                        record: record,
                        id: id
                    });
                    checkmark.on('mouseleave', this.hideAssayDataTooltip, this, {
                        id: id
                    });
                }
            },

            'itemmouseleave' : function(view, record, item) {
                if (record.data.data_availability) {
                    var checkmark = Ext.get(Ext.query(".detail-has-data", item)[0]);
                    checkmark.un('mouseenter', this.showAssayDataTooltip, this);
                    checkmark.un('mouseleave', this.hideAssayDataTooltip, this);
                }
            },

            scope: this
        })
    },

    showAssayDataTooltip : function(event, item, options) {
        var assays = options.record.data.assays;
        var assayList = Connector.app.view.Study.assaysWithData(assays);
        var assayListHTML = "<ul>";
        for (var itr = 0; itr < assayList.length; ++itr) {
            assayListHTML += "<li>" + assayList[itr].assay_label + "</li>\n";
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
                    content: assayListHTML
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