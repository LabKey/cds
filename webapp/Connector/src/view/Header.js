/*
 * Copyright (c) 2014-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define("Connector.view.Header", {
    extend: 'Ext.panel.Panel',

    alias: 'widget.connectorheader',

    layout: 'hbox',

    height: 56,

    cls: 'connectorheader',

    ui: 'custom',

    defaults: {
        ui: 'custom'
    },

    initComponent : function() {

        var toolBarItems = [];

        if (LABKEY.user.isSignedIn) {
            toolBarItems = [{
                xtype: 'box',
                itemId: 'contact',
                margin: '2 40 0 0',
                autoEl: {
                    cls: 'logout',
                    html: '<a href="mailto:dataspace.support@scharp.org?Subject=CAVD%20DataSpace%20request%20for%20information">Contact Us</a>'
                }
            },{
                xtype: 'box',
                itemId: 'links',
                margin: '2 40 0 0',
                autoEl: {
                    tag: 'a',
                    cls: 'logout',
                    html: 'Tools & links'
                },
                listeners: {
                    click: function(evt, el) {
                        Connector.panel.ToolsAndLinks.displayWindow(el);
                    },
                    element: 'el',
                    scope: this
                }
            },{
                xtype: 'box',
                itemId: 'help',
                margin: '2 40 0 0',
                autoEl: {
                    tag: 'a',
                    cls: 'logout',
                    html: 'Help'
                },
                listeners: {
                    click: function(evt, el) {
                        Connector.panel.HelpCenter.displayWindow(el);
                    },
                    element: 'el',
                    scope: this
                }
            },{
                xtype: 'box',
                itemId: 'logout',
                margin: '2 40 0 0',
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
            }];
        }

        this.items = [{
            xtype: 'box',
            itemId: 'logo',
            cls: 'logo',
            flex: 4,
            tpl: [
                '<img src="{imgSrc}" width="56" height="56">',
                '<h2>CAVD <span>DataSpace</span></h2>'
            ],
            data: {
                imgSrc: LABKEY.contextPath + '/Connector/images/logo.png'
            }
        },{
            xtype: 'panel',
            layout: 'hbox',
            itemId: 'search',
            margin: '18 5 0 0',
            items: toolBarItems
        }];

        this.callParent();
    }
});

Ext.define('Connector.view.AnnouncementHeader', {

    extend : 'Ext.panel.Panel',

    layout : {
        type : 'hbox',
        align : 'middle'
    },

    alias : 'widget.announcementheader',

    hidden : true,

    cls: 'announcementheader',

    initComponent : function() {

        this.dismissBtnId = Ext4.id();
        this.msg = this.getMessages();
        this.items = [
            {
                xtype: 'box',
                tpl: ['<img src="{imgSrc}" width="20" height="20">'],
                data: {imgSrc: Connector.resourceContext.imgPath + '/' + 'warning_indicator.svg'},
                margin : 15
            },
            this.msg,
            {
                xtype: 'box',
                id : this.dismissBtnId,
                tpl: ['<img class="dismiss-btn" src="{imgSrc}" width="20" height="20">'],
                data: {imgSrc: Connector.resourceContext.imgPath + '/' + 'dismiss.svg'},
                margin : 15
            }
        ];

        this.listeners = {
            scope : this,
            render : function(){
                this.renderMessages()
            }
        };

        this.callParent();
    },

    renderMessages : function(){

        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("cds", "getDismissableWarnings.api"),
            method: 'GET',
            scope : this,
            success: function (response){
                var o = Ext.decode(response.responseText);
                if (o.messages) {
                    this.setVisible(true);
                    this.msg.update(o.messages);
                }
                else
                    this.setVisible(false);
            }
        }, this);

        // wire up an event listener to the dismiss button
        const btnEl = Ext4.get(this.dismissBtnId);
        if (btnEl){
            Ext4.EventManager.on(btnEl, 'click', function(){
                LABKEY.Ajax.request({
                    url : LABKEY.ActionURL.buildURL("core", "dismissCoreWarnings.api"),
                    method : 'POST',
                    scope : this,
                    success : function (){
                        this.setVisible(false);
                    },
                    failure : function(){
                        Ext.Msg.alert('Failed to dismiss warnings');
                    }
                });
            }, this);
        }
    },

    getMessages : function(){
        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
            '<div class="notification-messages">',
            '<span>{.}</span><br>',
            '</div>',
            '</tpl>'
        );

        return new Ext.Component({
            tpl : tpl,
            flex : 2,
            margin : '15px 5px'
        });
    }
});