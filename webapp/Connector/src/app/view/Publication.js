/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Publication', {

    extend: 'Connector.app.view.LearnSummary',

    cls: 'publicationlearngrid learngrid',

    lockedViewConfig: {
        cls: 'publicationlearngridlocked'
    },

    itemPluralName: 'publications',

    showLoadingMask : true,

    columns: [
        {
            text: 'publication',
            xtype: 'templatecolumn',
            minWidth: 400,
            maxWidth: 500,
            locked: false,
            resizable: false,
            dataIndex: 'publication_title',
            filterConfigSet: [{
                filterField: 'publication_title',
                valueType: 'String',
                title: 'publication'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-description">',
                    '<h2>{publication_label:htmlEncode}</h2>',
                    '<div class="detail-description-text">',
                    '<p class="block-with-text">{publication_title:htmlEncode}</p>',
                    '</div>',
                    '</div>')
        },{
            text: 'Data Added',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/7,
            resizable: false,
            dataIndex: 'publication_data',
            filterConfigSet: [{
                filterField: 'data_types_available',
                valueType: 'string',
                title: 'Data Types Available'
            }],
            tpl: new Ext.XTemplate(
                '<div class="detail-text">',
                    '<tpl if="publication_data.length &gt; 0">',
                        '<div class="detail-has-data detail-has-data-ni"></div>',
                    '<tpl else>',
                        'Data not added',
                    '</tpl>',
                '</div>'
            )
        },{
            text: 'Journal',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/7,
            resizable: false,
            dataIndex: 'journal_short',
            filterConfigSet: [{
                filterField: 'journal_short',
                valueType: 'string',
                title: 'Type'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{journal_short}</div>',
                    '</div>'
            )
        },{
            text: 'First Author',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/7,
            resizable: false,
            dataIndex: 'author_first',
            filterConfigSet: [{
                filterField: 'author_first',
                valueType: 'string',
                title: 'First Author'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{author_first}</div>',
                    '</div>'
            )
        },{
            text: 'Publication Date',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/7,
            resizable: false,
            dataIndex: 'date',
            filterConfigSet: [{
                filterField: 'year',
                valueType: 'string',
                title: 'Publication Year'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{date}</div>',
                    '</div>'
            )
        },{
            text: 'Studies',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/7,
            resizable: false,
            dataIndex: 'study_to_sort_on',
            filterConfigSet: [{
                filterField: 'study_names',
                valueType: 'string',
                title: 'Studies'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text study-summary-product publication-study-list">',
                    '<ul>',
                    '<tpl if="studies.length &gt; 0">',
                    '<tpl for="studies">',
                    '<tpl if="xindex <= 5">',
                    '<li class="detail-gray-text">{study_label:htmlEncode}</li>',
                    '<tpl elseif="xindex == 6">',
                    '<li class="detail-gray-text">...</li>',
                    '</tpl>',
                    '</tpl>',
                    '<tpl else>',
                    '<li class="detail-gray-text">No related studies</li>',
                    '</tpl>',
                    '</ul>',
                    '</div>')
        },{
            text: 'PubMed Id',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/7,
            resizable: false,
            dataIndex: 'pmid',
            filterConfigSet: [{
                filterField: 'pmid',
                valueType: 'string',
                title: 'PubMed Id'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text">',
                    '<div class="detail-black-text">{pmid}</div>',
                    '</div>'
            )
        }
    ],

    statics: {
        searchFields: [
            'publication_title', 'author_all', 'pmid', 'journal_short'
        ]
    },

    dataAvailabilityTooltipConfig : function() {
        return {
            title: 'Publications',
            labelField : 'label'
        }
    }
});