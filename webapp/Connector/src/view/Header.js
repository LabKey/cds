/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define("Connector.view.Header", {
    extend: 'Ext.panel.Panel',

    alias: 'widget.connectorheader',

    layout: 'hbox',

    height: 65,

    cls: 'connectorheader',

    expand: true,

    collapseTime : 0,

    ui: 'custom',

    defaults: {
        ui: 'custom'
    },

    logoText: 'HIV VACCINE <span>Collaborative DataSpace</span>',

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents(
            /**
             * @event headerclick
             * Fires when the header logo is clicked.
             * fired
             * @param {Ext.Component} panel The Component object
             */
            'headerclick',
            /**
             * @event userSignedOut
             * Fires when the header's logout button is clicked.
             */
            'userSignedOut'
        );
    },

    initComponent : function() {

        this.items = [{
            xtype: 'box',
            itemId: 'logo',
            cls: 'logo',
            autoEl: {
                tag: 'div',
                html: '<img src="' + LABKEY.contextPath + '/Connector/images/logo_0' + (Math.floor(Math.random()*5)+1) +'.png">' + // TODO: Get rid of hard coded context
                      '<h2 style="padding-top: 200px;">' + this.logoText + '</h2>'
            },
            flex: 4,
            listeners: {
                afterrender : function(b) {
                    b.getEl().on('click', function() {
                        this.fireEvent('headerclick', this);
                    }, this);
                },
                scope: this
            }
        }, {
            xtype: 'panel',
            layout: 'hbox',
            itemId: 'search',
            margin: '25 14 0 0',
            width: 50,
            items: [{
                xtype: 'box',
                margin: '2 15 0 0',
                itemId: 'logout',
                autoEl: {
                    tag: 'a',
                    cls: 'logout',
                    //href: LABKEY.ActionURL.buildURL('login', 'logout'),
                    html: 'Logout'
                },
                listeners: {
                    click : function() {
                        Ext.Ajax.request({
                            url : LABKEY.ActionURL.buildURL("login", "logoutAPI.api"),
                            method: 'POST',
                            success: LABKEY.Utils.getCallbackWrapper(function(response) {
                                if (response.success) {
                                    this.fireEvent('userSignedOut');
                                }
                            }, this),
                            failure: LABKEY.Utils.getCallbackWrapper(function(response) {
                            }, this)
                        });
                    },
                    element: 'el',
                    scope: this
                }
            }]
        }];

        this.callParent();

        this.on('afterrender', function(p) {

            this.collapse(true);
            this.logout = this.getComponent('search').queryById('logout');

        }, this, {single: true});
    },

    expand : function() {
        if (!this.expanded) {
            var time = this.collapseTime;
            var h2logo = Ext.get(this.getComponent('logo').getEl().query('h2')[0]);
            h2logo.dom.innerHTML = this.logoText;
            h2logo.animate({ to : { fontSize: '12px', paddingTop: 24 }, duration: time });
            Ext.get(this.getComponent('logo').getEl().query('img')[0]).animate({ to : { paddingTop: 20 , width : 20}, duration: time });
            Ext.get(this.getComponent('search').getEl().animate({ to : { marginTop: -3}, duration : time }));
            this.setHeight(64);
            this.expanded = false;
        }
    },

    collapse : function(force) {
        if (this.expanded || force === true) {
            var time = force ? 0 : this.collapseTime;
            var h2logo = Ext.get(this.getComponent('logo').getEl().query('h2')[0]);
            h2logo.dom.innerHTML = this.logoText;
            h2logo.animate({ to : { fontSize: '12px', paddingTop: 24 }, duration: time });
            Ext.get(this.getComponent('logo').getEl().query('img')[0]).animate({ to : { paddingTop: 20 , width : 20}, duration: time });
            Ext.get(this.getComponent('search').getEl().animate({ to : { marginTop: -3}, duration : time }));
            this.setHeight(64);
            this.expanded = false;
        }
    }
});