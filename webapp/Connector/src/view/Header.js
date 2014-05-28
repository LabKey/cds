/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define("Connector.view.Header", {
    extend: 'Ext.panel.Panel',

    alias: 'widget.connectorheader',

    layout: 'hbox',

    height: 87,

    cls: 'connectorheader',

    expand: true,

    collapseTime : 200,

    ui: 'custom',

    defaults: {
        ui: 'custom'
    },

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents(
            /**
             * @event headerclick
             * Fires when the header logo is clicked.
             * fired
             * @param {Ext.Component} panel The Component object
             */
            'headerclick'
        );
    },

    initComponent : function() {

        this.items = [{
            xtype: 'box',
            itemId: 'logo',
            cls: 'logo',
            autoEl: {
                tag: 'div',
                html  : '<h2 style="padding-top: 200px;">hiv vaccine <br>' +
                        '<span>collaborative dataspace</span>' +
                        '</h2>' +
                        '<img src="' + LABKEY.contextPath + '/Connector/images/logo_0' + (Math.floor(Math.random()*5)+1) +'.png">' // TODO: Get rid of hard coded context
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
            margin: '25 0 0 0',
            width: 100,
            items: [{
                xtype: 'box',
                margin: '2 15 0 0',
                hidden: !LABKEY.user.isSignedIn,
                autoEl: {
                    tag: 'a',
                    cls: 'logout',
                    href: LABKEY.ActionURL.buildURL('login', 'logout'),
                    html: 'Logout'
                }
            }]
        }];

        this.callParent();

        this.on('afterrender', function(p) {

            this.collapse(true);

        }, this, {single: true});
    },

    expand : function() {
        if(!this.expanded) {
            var h2logo = Ext.get(this.getComponent('logo').getEl().query('h2')[0]);
            h2logo.dom.innerHTML = 'hiv vaccine <br><span>collaborative dataspace</span>';
            h2logo.animate({ to : { fontSize: '13pt', paddingTop: 27 }, duration: this.collapseTime });
            Ext.get(this.getComponent('logo').getEl().query('img')[0]).animate({ to : { paddingTop: 23, width : 45 }, duration: this.collapseTime });
            Ext.get(this.getComponent('search').getEl().animate({ to : { marginTop: 0}, duration : this.collapseTime }));
            this.setHeight(87);
            this.expanded = true;
        }
    },

    collapse : function(force) {
        if (this.expanded || force === true) {
            var time = force ? 0 : this.collapseTime;
            var h2logo = Ext.get(this.getComponent('logo').getEl().query('h2')[0]);
            h2logo.dom.innerHTML = 'hiv vaccine <span>collaborative dataspace</span>';
            h2logo.animate({ to : { fontSize: '11pt', paddingTop: 8 }, duration: time });
            Ext.get(this.getComponent('logo').getEl().query('img')[0]).animate({ to : { paddingTop: 11 , width : 32}, duration: time });
            Ext.get(this.getComponent('search').getEl().animate({ to : { marginTop: -3}, duration : time }));
            this.setHeight(53);
            this.expanded = false;
        }
    }
});