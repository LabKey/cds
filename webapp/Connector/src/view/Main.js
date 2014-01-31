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
        maxWidth : 305,
        hidden : false,
        plain : true,
        hideCollapseTool : true,
        defaults: {
            ui: 'custom'
        },
        items: [{
            xtype: 'panel',
            itemId: 'navfilter',
            items: [{
                xtype: 'navigation',
                ui: 'navigation',
                itemId: 'primarynav',
                viewConfig: {
                    height: 170,
                    arrow: 'left',
                    mapping: [{
                        label: 'Home',
                        disabled: true
                    },{
                        label: 'Learn about studies, assays',
                        value: 'learn'
                    },{
                        label: 'Find subjects',
                        value: 'summary'
                    },{
                        label: 'Plot data',
                        value: 'plot'
                    },{
                        label: 'View data grid',
                        value: 'datagrid'
                    }]
                }
            }]
        }]
    }]
});