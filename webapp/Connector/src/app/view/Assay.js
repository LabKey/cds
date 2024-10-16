/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Assay', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learnassays learngrid',

    itemPluralName: 'assays',

    showLoadingMask : true,

    statics: {
       searchFields: ['assay_short_name', 'assay_label', 'assay_detection_platform', 'assay_method_description',
            'assay_body_system_type', 'assay_body_system_target', 'assay_general_specimen_type']
    },

    columns : [{
        text: 'Description & Methodology',
        xtype: 'templatecolumn',
        minWidth: 500,
        locked: false,
        resizable: false,
        dataIndex: 'assay_short_name',
        filterConfigSet: [{
            filterField: 'assay_short_name',
            valueType: 'string',
            title: 'Assay Name'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-description">',
                    '<h2>{assay_short_name:htmlEncode} ({assay_label:htmlEncode})</h2>',
                    '<div class="detail-description-text"><p class="block-with-text">{assay_description:htmlEncode}</p></div>',
                '</div>'
        )
    },{
        text: 'Data Added',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'studies_with_data_count',
        filterConfigSet: [{
            filterField: 'data_types_available',
            valueType: 'string',
            title: 'Data Types Available'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="data_availability">',
                        '<div class="detail-has-data ',
                            '<tpl if="data_accessible">',
                            'detail-has-data-green',
                            '<tpl else>',
                            'detail-has-data-gray',
                            '</tpl>',
                        '"></div>',
                        '<div class="detail-gray-text">{[this.studyCountText(values.studies_with_data)]}</div>',
                    '<tpl else>',
                        'Data not added',
                    '</tpl>',
                '</div>',
                {
                    studyCountText : function(studies) {
                        return Connector.app.view.LearnSummary.studyCountText(studies);
                    }
                }
        )
    },{
        text: 'Target Area',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 20/100,
        resizable: false,
        dataIndex: 'assay_body_system_target',
        filterConfigSet: [{
            filterField: 'assay_body_system_target',
            valueType: 'string',
            title: 'Target Area'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<div class="detail-gray-text">{assay_body_system_type:htmlEncode}: {assay_body_system_target:htmlEncode} and {assay_general_specimen_type:htmlEncode}</div>',
                '</div>'
        )
    }],

    dataAvailabilityTooltipConfig : function() {
        return {
            title: 'Studies'
        }
    }
});