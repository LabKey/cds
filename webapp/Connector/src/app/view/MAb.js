/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.MAb', {

    extend: 'Connector.app.view.LearnSummary',

    cls: 'mablearngrid learngrid',

    lockedViewConfig: {
        cls: 'mablearngridlocked'
    },

    itemPluralName: 'monoclonal antibodies',

    emptySearchSubtext: 'Also try searching for mAb in Studies section.',

    columns: [
        {
            text: 'MAb/Mixture',
            xtype: 'templatecolumn',
            minWidth: 200,
            maxWidth: 300,
            locked: false,
            resizable: false,
            dataIndex: 'mab_mix_name_std',
            filterConfigSet: [{
                filterField: 'mab_mix_name_std',
                valueType: 'String',
                title: 'MAb/Mixture'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-description detail-row-text">',
                    '<h2>{mab_mix_name_std:htmlEncode}</h2>',
                    '</div>')

        },{
            text: 'Data Added',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
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
            text: 'Type',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
            resizable: false,
            dataIndex: 'mab_mix_type',
            filterConfigSet: [{
                filterField: 'mab_mix_type',
                valueType: 'string',
                title: 'Type'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{mab_mix_type}</div>',
                    '</div>'
            )
        },{
            text: 'Donor Species',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
            resizable: false,
            dataIndex: 'donors_str',
            filterConfigSet: [{
                filterField: 'donors',
                valueType: 'string',
                title: 'Donor Species'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{donors_str}</div>',
                    '</div>'
            )
        },{
            text: 'Isotype',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
            resizable: false,
            dataIndex: 'isotypes_str',
            filterConfigSet: [{
                filterField: 'isotypes',
                valueType: 'string',
                title: 'Isotype'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{isotypes_str}</div>',
                    '</div>'
            )
        },{
            text: 'HXB2 Location',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
            resizable: false,
            dataIndex: 'hxb2Locs_str',
            filterConfigSet: [{
                filterField: 'hxb2Locs',
                valueType: 'string',
                title: 'HXB2 Location'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{hxb2Locs_str}</div>',
                    '</div>'
            )
        },{
            text: 'Antibody binding type',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
            resizable: false,
            dataIndex: 'abBindings_str',
            filterConfigSet: [{
                filterField: 'abBindings',
                valueType: 'string',
                title: 'Antibody binding type'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{abBindings_str}</div>',
                    '</div>'
            )
        }
    ],

    statics: {
        searchFields: [
            'mab_mix_id', 'mab_mix_name_std', 'mab_mix_label', 'mab_mix_name_other', 'mab_mix_type', 'other_labels',
            'donors_str', 'isotypes_str', 'hxb2Locs_str', 'abBindings_str', 'mabnames_str'
        ]
    },

    dataAvailabilityTooltipConfig : function() {
        return {
            title: 'Studies'
        }
    }

});