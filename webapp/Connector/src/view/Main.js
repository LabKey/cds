/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Main', {
    extend: 'Ext.container.Container',
    requires:[
        'Ext.tab.Panel',
        'Ext.layout.container.Border'
    ],
    
    xtype: 'app-main',

    layout: {
        type: 'border'
    },

    ui: 'custom',

    items: [{
        xtype: 'connectorheader',
        region: 'north'
    },{
        xtype: 'tabpanel',
        region: 'center',
        flex: 3.7,
        plain: true,
        id: 'primarytabpanel',
        ui: 'primary-view',
        minWidth: 719 // 1024 minus 'east' width
    },{
        xtype: 'tabpanel',
        itemId: 'eastview',
        region: 'east',
        ui: 'east-view',
        width : 305,
        hidden : !LABKEY.user.isSignedIn,
        plain : true,
        hideCollapseTool : true,
        defaults: {
            ui: 'custom'
        },
        items: [{
            xtype: 'panel',
            itemId: 'navfilter',
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'navigation',
                ui: 'navigation',
                itemId: 'primarynav',
                viewConfig: {
                    arrow: 'left',
                    mapping: [{
                        label: 'Home',
                        controller: 'home'
                    },{
                        label: 'Learn about studies, assays',
                        controller: 'learn'
                    },{
                        label: 'Find subjects',
                        controller: 'summary'
                    },{
                        label: 'Plot data',
                        controller: 'chart'
                    },{
                        label: 'View data grid',
                        controller: 'data'
                    }]
                }
            }]
        }]
    }],

    initComponent : function() {

        this.callParent();

        this.eastPanel = this.getComponent('eastview');
    },

    userChanged : function() {
        this.eastPanel && this.eastPanel.setVisible(LABKEY.user.isSignedIn);
    }
});