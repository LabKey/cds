/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Publication', {

    extend: 'Connector.app.view.LearnSummary',

    cls: 'publicationlearngrid learngrid',

    lockedViewConfig: {
        cls: 'publicationlearngridlocked'
    },

    itemPluralName: 'Publications',

    columns: [
        {
            text: 'publication',
            xtype: 'templatecolumn',
            tdCls: 'publication-title-col',
            minWidth: 500,
            locked: true,
            resizable: false,
            dataIndex: 'publication_title',
            filterConfigSet: [{
                filterField: 'publication_title',
                valueType: 'String',
                title: 'publication'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-description">',
                    '<p style="font: 16px Georgia,serif;">{publication_title:htmlEncode}</p>',
                    '</div>'
                )

        },{
            text: 'Journal',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1/6,
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
            flex: 1/6,
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
            flex: 1/6,
            resizable: false,
            dataIndex: 'date',
            filterConfigSet: [{
                filterField: 'year',
                valueType: 'string',
                title: 'Publication Date'
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
            flex: 1/6,
            resizable: false,
            dataIndex: 'study_to_sort_on',
            filterConfigSet: [{
                filterField: 'study_names',
                valueType: 'string',
                title: 'Studies'
            }],
            tpl: new Ext.XTemplate(
                    '<div class="detail-text study-summary-product">',
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
            flex: 1/6,
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
            'title', 'author_all', 'pmid', 'journal_short'
        ]
    }

});