/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Labs', {

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
                    '<div class="study-description detail-header">Lab</div>',
                    '<div class="study-date detail-header">Investigator</div>',
                    '<div class="study-treatments detail-header">Institution</div>',
//                    '<div class="study-treatments detail-header">Assays</div>',
                '</div>',
            '</div>'
        ),
        searchFields : ['Name', 'Description', 'PI', 'Institution', 'Location']
    },

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.Labs.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-wrapper">',
                '<div class="detail-container study-detail">',
                    '<div class="study-description">',
                        '<h2>{Name}</h2>',
                        '<div class="description-text">{Description:htmlEncode}</div>',
                    '</div>',
                    '<div class="study-date">',
                        '<span class="startdate-text">{PI:htmlEncode}</span>',
                    '</div>',
                    '<div class="study-date">',
                        '<span class="startdate-text">{Institution:htmlEncode}</span>',
                        '<span class="enddate-text">{Location:htmlEncode}</span>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>',
        {
            renderDate : function(date) {
                return Connector.app.view.Labs.dateRenderer(date);
            },
            monthDiff : function(date1, date2) {
                return Connector.app.view.Labs.monthDiff(new Date(date1), new Date(date2));
            }
        }
    ),

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
                Connector.app.view.Labs.columnHeaderTpl.apply({}),
                '<div class="detail-container"><div class="saeempty">None of the selected labs have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});