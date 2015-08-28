/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Assay', {

    extend : 'Ext.view.View',

    itemSelector: 'div.detail-wrapper',

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
                '<div class="detail-left-column">Description & Methodology</div>',
                '<div class="detail-middle-column"># of Studies</div>',
                '<div class="detail-end-column">Target Area</div>',
            '</div>'
        ),
        searchFields: ['assay_short_name', 'assay_label', 'assay_detection_platform', 'assay_method_description',
            'assay_body_system_type', 'assay_body_system_target', 'assay_general_specimen_type']
    },

    tpl: new Ext.XTemplate(
        '<tpl if="values.length &gt; 0">',
            '{[ Connector.app.view.Assay.columnHeaderTpl.apply(values) ]}',
        '</tpl>',
        '<tpl for=".">',
            '<div class="detail-container">',
                '<div class="detail-wrapper">',
                    '<div class="detail-left-column detail-description">',
                        '<h2>{assay_short_name:htmlEncode} ({assay_label:htmlEncode}): {assay_detection_platform:htmlEncode}</h2>',
                        '<div class="detail-description-text">{assay_method_description:htmlEncode}</div>',
                    '</div>',
                    '<div class="detail-middle-column detail-text">',
                        '<div class="detail-gray-text">{study_count}</div>',
                    '</div>',
                   '<div class="detail-right-column detail-text">',
                        '<div class="detail-gray-text">{assay_body_system_type:htmlEncode}: {assay_body_system_target:htmlEncode} and {assay_general_specimen_type:htmlEncode}</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>',
        {
            renderDate : function(date) {
                return Connector.app.view.Assay.dateRenderer(date);
            },
            monthDiff : function(date1, date2) {
                return Connector.app.view.Assay.monthDiff(new Date(date1), new Date(date2));
            }
        }
    ),

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
                Connector.app.view.Assay.columnHeaderTpl.apply({}),
                '<div class="detail-container"><div class="saeempty">None of the selected assays have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});