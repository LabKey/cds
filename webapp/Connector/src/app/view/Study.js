/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Study', {

    extend : 'Ext.view.View',

    itemSelector: 'div.study-detail',

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
                '<div class="detail-container">',
                    '<div class="study-description detail-header">Description</div>',
                    '<div class="study-date detail-header">Start Date</div>',
                    '<div class="study-treatments detail-header">Treatments</div>',
                '</div>',
            '</div>'
        )
    },

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.Study.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-wrapper">',
                '<div class="detail-container study-detail">',
                    '<div class="study-description">',
                        '<h2 class="name-text">{StudyName:htmlEncode}</h2>',
                        '<tpl if="Phase && Phase.length &gt; 0">',
                            '<span class="phase-text">Phase {Phase:htmlEncode}</span>',
                        '</tpl>',
                        '<div class="description-text">{Description:htmlEncode}</div>',
                    '</div>',
                    '<div class="study-date">',
                        '<span class="startdate-text">{StartDate:this.renderDate}</span>',
                        '<tpl if="EndDate">',
                            '<span class="enddate-text">to {EndDate:this.renderDate}</span>',
                            '<span class="date-diff-text">{[this.monthDiff(values.StartDate, values.EndDate)]} months in duration</span>',
                        '</tpl>',
                    '</div>',
                    '<div class="study-treatments">{Treatments}</div>',
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