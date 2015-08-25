/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define("Connector.view.Header", {
    extend: 'Ext.panel.Panel',

    alias: 'widget.connectorheader',

    layout: 'hbox',

    height: 48,

    cls: 'connectorheader',

    ui: 'custom',

    defaults: {
        ui: 'custom'
    },

    initComponent : function() {

        this.items = [{
            xtype: 'box',
            itemId: 'logo',
            cls: 'logo',
            flex: 4,
            tpl: [
                '<img src="{imgSrc}">',
                '<h2>HIV VACCINE <span>Collaborative DataSpace</span></h2>'
            ],
            data: {
                imgSrc: LABKEY.contextPath + '/Connector/images/logo_0' + (Math.floor(Math.random()*5)+1) + '.png'
            }
        },{
            xtype: 'panel',
            layout: 'hbox',
            itemId: 'search',
            margin: '18 14 0 0',
            width: 100,
            items: [{
                xtype: 'box',
                itemId: 'about',
                margin: '2 15 0 0',
                autoEl: {
                    tag: 'a',
                    cls: 'logout',
                    html: 'About',
                    href: '#home/about'
                }
            },{
                xtype: 'box',
                itemId: 'logout',
                margin: '2 15 0 0',
                autoEl: {
                    tag: 'a',
                    cls: 'logout',
                    html: 'Logout'
                },
                listeners: {
                    click : function() {
                        Ext.Ajax.request({
                            url : LABKEY.ActionURL.buildURL('login', 'logoutAPI.api'),
                            method: 'POST',
                            success: function(response) {
                                this.fireEvent('userLogout');
                                if (Ext.decode(response.responseText).success) {
                                    LABKEY.user.isSignedIn = false;
                                    window.location.reload();
                                }

                            },
                            failure: Ext.emptyFn,
                            scope: this
                        });
                    },
                    element: 'el',
                    scope: this
                }
            }]
        }];

        this.callParent();
    }
});