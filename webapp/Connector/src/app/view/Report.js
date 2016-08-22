/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.Report', {

    extend : 'Connector.app.view.LearnSummary',

    cls: 'learngrid',

    columns : [
        {
        text: 'Preview',
        xtype: 'templatecolumn',
        minWidth: 200,
        resizable: false,
        dataIndex: 'label',
        filterConfig: {
            filterField: 'label',
            valueType: 'string',
            title: 'Preview' //TODO
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-row-thumbnail">',
                '<tpl if="thumbnail">',
                '<img src=\"{thumbnail:htmlEncode}\" height="130">',
                '</tpl>',
                '</div>')
    },
        {
        text: 'Name & Description',
        xtype: 'templatecolumn',
        minWidth: 400,
        flex: 60/100,
        resizable: false,
        dataIndex: 'name',
        filterConfig: {
            filterField: 'name',
            valueType: 'string',
            title: 'Report Name'
        },
        tpl: new Ext.XTemplate(
                '<div class="detail-description detail-row-text">',
                '<h2>{name:htmlEncode}</h2>',
                '<div class="detail-description-text">',
                '{description}',
                '</div>',
                '</div>')
    },
        {
            text: 'Report Type',
            xtype: 'templatecolumn',
            minWidth: 200,
            //flex: 60/100,
            resizable: false,
            dataIndex: 'categorylabel',
            filterConfig: {
                filterField: 'categorylabel',
                valueType: 'string',
                title: 'Report Type'
            },
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
        //flex: 15/100,
        resizable: false,
        dataIndex: 'created',
        filterConfig: {
            filterField: 'created',
            valueType: 'date',
            title: 'Date Created'
        },
        tpl: new Ext.XTemplate(
                '<tpl if="created">',
                '<div class="detail-text detail-row-text">',
                '<div class="detail-gray-text">{created:this.renderDate}</div>',
                '</div>',
                '</tpl>',
                {
                    renderDate : function(date) {
                        return Connector.app.view.Study.dateRenderer(date);
                    }
                }
        )
    }],

    statics: {
        searchFields: [
            'name', 'description', 'categorylabel'
        ],
        filterFields: [
            'name', 'description' //TODO
        ]
    },

    initComponent : function() {

        //
        // Continue to show the column headers even when no data is present
        //
        this.emptyText = new Ext.XTemplate(
                '<div class="detail-container"><div class="saeempty">None of the selected reports have data for this category.</div></div>'
        ).apply({});

        this.callParent();
    }
});