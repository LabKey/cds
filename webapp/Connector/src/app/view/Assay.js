/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Assay', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learngrid',

    itemPluralName: 'assays',

    statics: {
       searchFields: ['assay_short_name', 'assay_label', 'assay_detection_platform', 'assay_method_description',
            'assay_body_system_type', 'assay_body_system_target', 'assay_general_specimen_type']
    },

    columns : [{
        text: 'Description & Methodology',
        xtype: 'templatecolumn',
        minWidth: 500,
        locked: true,
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
                    '<div class="detail-description-text"><p>{assay_description:htmlEncode}</p></div>',
                '</div>',
                '{[Connector.app.view.LearnSummary.overflowFadeOut()]}'
        )
    },{
        text: 'Data Added',
        xtype: 'templatecolumn',
        minWidth: 150,
        flex: 15/100,
        resizable: false,
        dataIndex: 'studies_with_data_count',
        filterConfigSet: [{
            filterField: 'studies_with_data_count',
            valueType: 'number',
            title: '# of Studies Added'
        }],
        tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="data_availability">',
                        '<div class="detail-has-data"></div>',
                        '<div class="detail-gray-text">{[this.studyCountText(values.studies_with_data_count)]}</div>',
                    '<tpl else>',
                        'Not added',
                    '</tpl>',
                '</div>',
                {
                    studyCountText : function(assay_count) {
                        return assay_count == 1 ? assay_count + ' Study' : assay_count + ' Studies';
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
            title: 'Studies',
            recordField: 'label'
        }
    }
});