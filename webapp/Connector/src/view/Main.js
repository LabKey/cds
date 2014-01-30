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

    defaults: {
        ui: 'custom'
    },

    items: [{
        xtype: 'connectorheader',
        region: 'north',
        defaults: {
            ui: 'custom'
        }
    },{
        xtype: 'tabpanel',
        region: 'center',
        flex: 3.7,
        plain: true,
        id: 'primarytabpanel',
        ui: 'primary-view',
        defaults: {
            ui: 'custom'
        },
        minWidth: 734 // 1024 minus 'east' width
    },{
        xtype: 'tabpanel',
        region: 'east',
        ui: 'east-view',
        width : 290,
        maxWidth : 290,
        hidden : false,
        plain : true,
        hideCollapseTool : true,
        defaults: {
            ui: 'custom'
        }
    }]
});