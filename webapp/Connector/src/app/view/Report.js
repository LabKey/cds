/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Report', {

    extend: 'Connector.app.view.LearnSummary',

    cls: 'reportlearngrid learngrid',

    lockedViewConfig: {
        cls: 'reportlearngridlocked'
    },

    itemPluralName: 'reports',

    columns: [
        {
            text: 'Preview',
            xtype: 'templatecolumn',
            minWidth: 200,
            flex: 2 / 7,
            locked: false,
            resizable: false,
            menuDisabled: true,
            tpl: new Ext.XTemplate(
                    '<div class="detail-row-thumbnail">',
                    '<div>',
                    '<tpl if="thumbnail">',
                    '<img src=\"{thumbnail}\" height="95">',
                    '</tpl>',
                    '</div>')
        },
        {
            text: 'Name & Description',
            xtype: 'templatecolumn',
            minWidth: 500,
            flex: 5 / 7,
            locked: true,
            resizable: false,
            dataIndex: 'name',
            filterConfigSet: [{
                filterField: 'name',
                valueType: 'string',
                title: 'Report Name'
            }],

            tpl: new Ext.XTemplate(
                    '<div class="detail-description detail-row-text">',
                    '<h2>{name:htmlEncode}</h2>',
                    '<div class="detail-description-text">',
                    '<p class="block-with-text">{description:htmlEncode}</p>',
                    '</div>',
                    '</div>')
        },
        {
            text: 'Report Type',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1 / 2,
            resizable: false,
            dataIndex: 'categorylabel',
            filterConfigSet: [{
                filterField: 'categorylabel',
                valueType: 'string',
                title: 'Report Type'
            }],
            tpl: new Ext.XTemplate(
                    '<tpl if="categorylabel">',
                    '<div class="detail-text detail-row-text">',
                    '<div class="detail-gray-text">{categorylabel:htmlEncode}</div>',
                    '</div>',
                    '</tpl>'
            )
        },
        {
            text: 'Date Created',
            xtype: 'templatecolumn',
            minWidth: 150,
            flex: 1 / 2,
            resizable: false,
            dataIndex: 'created',
            filterConfigSet: [{
                filterField: 'created_display',
                valueType: 'date_display',
                title: 'Date Created'
            }],
            tpl: new Ext.XTemplate(
                    '<tpl if="created">',
                    '<div class="detail-text detail-row-text">',
                    '<div class="detail-gray-text">{created:this.renderDate}</div>',
                    '</div>',
                    '</tpl>',
                    {
                        renderDate: function (date)
                        {
                            return Connector.app.view.LearnSummary.dateRenderer(date);
                        }
                    }
            )
        }],

    statics: {
        searchFields: [
            'name', 'description', 'categorylabel'
        ]
    }
});