/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.StudyProducts', {

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
                    '<div class="study-description detail-header">Product name</div>',
                    '<div class="study-date detail-header">Type</div>',
                    '<div class="study-treatments detail-header">Developer</div>',
                '</div>',
            '</div>'
        ),
        searchFields : ['Label', 'Description', 'Type', 'Class', 'ProductSubclass', 'Developer']
    },

    tpl: new Ext.XTemplate(
            '<tpl if="values.length &gt; 0">',
                '{[ Connector.app.view.StudyProducts.columnHeaderTpl.apply(values) ]}',
            '</tpl>',
            '<tpl for=".">',
                '<div class="detail-wrapper">',
                    '<div class="detail-container study-detail">',
                        '<div class="study-description">',
                            '<h2>{Label}</h2>',
                            '<div class="description-text">{Description}</div>',
                        '</div>',
                        '<div class="study-date">',
                            '<span class="startdate-text">{Type}</span>',
                            '<span class="enddate-text">Class: <span style="color: black;">{Class}</span></span>',
                            '<span class="enddate-text">Subclass: <span style="color: black;">{ProductSubclass}</span></span>',
                        '</div>',
                        '<div class="study-treatments">{Developer}</div>',
                    '</div>',
                '</div>',
            '</tpl>',
            {
                renderDate : function(date) {
                    return Connector.app.view.StudyProducts.dateRenderer(date);
                },
                monthDiff : function(date1, date2) {
                    return Connector.app.view.StudyProducts.monthDiff(new Date(date1), new Date(date2));
                }
            }
    ),

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
                Connector.app.view.StudyProducts.columnHeaderTpl.apply({}),
                '<div class="detail-container"><div class="saeempty">None of the selected study products have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});