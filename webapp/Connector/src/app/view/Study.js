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
        columnHeaderTpl : new Ext.XTemplate(
            '<div class="learncolumnheader">',
                '<div class="detail-left-column">Description</div>',
                '<div class="detail-middle-column">Start Date</div>',
                '<div class="detail-end-column">Products</div>',
            '</div>'
        ),
        searchFields: [
            'label', 'type', 'description',
            {field: 'products', value: 'product_name', emptyText: 'No related products'}
        ]
    },

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.Study.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-container">',
                '<div class="detail-wrapper">',
                    '<div class="detail-left-column detail-description">',
                        '<h2>{label:htmlEncode}</h2>',
                        '<tpl if="species && species.length &gt; 0">',
                            '<span class="detail-type-text">{species:htmlEncode}</span>',
                        '</tpl>',
                        '<div class="detail-description-text">{description:htmlEncode}</div>', //Issue 24016: Prioritizing Security...
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
                        '</tpl>',
                    '</div>',
                    '<div class="detail-right-column detail-text">',
                        '<ul>',
                            '<tpl if="products.length &gt; 0">',
                                '<tpl for="products">',
                                    '<li class="detail-gray-text">{product_name:htmlEncode}</li>',
                                '</tpl>',
                            '<tpl else>',
                                '<li class="detail-gray-text">No related products</li>',
                            '</tpl>',
                        '</ul>',
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
    }
});