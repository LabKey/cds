/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Assay', {

    extend : 'Ext.grid.Panel',

    cls: 'learngrid',
    
    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            return 'detail-row';
        }
    },

    statics: {
       searchFields: ['assay_short_name', 'assay_label', 'assay_detection_platform', 'assay_method_description',
            'assay_body_system_type', 'assay_body_system_target', 'assay_general_specimen_type']
    },

    columns : [{
        text: 'Description & Methodology',
        xtype: 'templatecolumn',
        minWidth: 500,
        flex: 60/100,
        resizable: false,
        //todo: this probably needs to be a composite pre-computed column
        dataIndex: 'assay_short_name',
        filter: {
            type: 'string'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-description detail-row-text">',
                    '<h2>{assay_short_name:htmlEncode} ({assay_label:htmlEncode})</h2>',
                    '<div class="detail-description-text">{assay_description:htmlEncode}</div>',
                '</div>'
        )
    },{
        text: '# of Studies',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'study_count',
        filter: {
            type: 'string'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-text detail-row-text">',
                    '<div class="detail-gray-text">{study_count}</div>',
                '</div>'
        )
    },{
        text: 'Target Area',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        //todo: this probably needs to be a composite pre-computed column
        dataIndex: 'assay_body_system_target',
        filter: {
            type: 'string'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-text detail-row-text">',
                    '<div class="detail-gray-text">{assay_body_system_type:htmlEncode}: {assay_body_system_target:htmlEncode} and {assay_general_specimen_type:htmlEncode}</div>',
                '</div>'
        )
    }],

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
                // Connector.app.view.Assay.columnHeaderTpl.apply({}),
                '<div class="detail-container"><div class="saeempty">None of the selected assays have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});