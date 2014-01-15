/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.view.Viewport', {
    extend : 'Ext.container.Viewport',

    requires : [
        'Connector.panel.GroupList',
        'Connector.panel.Header',
        'Connector.panel.FilterPanel',
        'Connector.view.search.Container',
        'Connector.window.SystemMessage'
    ],

    layout: 'border',

    initComponent : function() {

        if (!this.app)
        {
            Ext4.Msg.alert('Initialization Failure', 'Please provide the application to the viewport view config.app.');
            this.items = [];
            return;
        }

        this.state = this.app.getController('State');

        this.items = [{
            xtype    : 'connectorheader',
            region   : 'north',
            defaults : {
                ui    : 'custom'
            }
        },{
            xtype    : 'panel',
            region   : 'west',
            style : 'background-color: #F0F0F0;',
            width  : 250,
            hidden : true,
            hideCollapseTool : true,
            defaults : {
                ui : 'custom'
            },
            layout: {
                type  : 'vbox',
                align : 'stretch'
            },
            items: []
        },{
            xtype : 'tabpanel',
            region: 'center',
            flex  : 3.7,
            plain : true,
            id    : 'primarytabpanel',
            ui    : 'primary-view',
            defaults : {
                ui : 'custom'
            }
        },{
            xtype : 'tabpanel',
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
        }];

        this.callParent();

        // 10.4.2013 - Turn off feedback for now
//        if (!(Ext4.isIE && (Ext4.isIE6 || Ext4.isIE7 || Ext4.isIE8))) {
//            this.on('afterrender', function() {
//                Ext4.create('Connector.panel.Feedback', {});
//            }, this, {single: true});
//        }
    }
});