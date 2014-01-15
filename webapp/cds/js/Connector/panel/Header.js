/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.panel.Header', {

    extend : 'Ext.Panel',

    alias  : 'widget.connectorheader',

    collapseTime : 200,

    constructor : function(config) {

        Ext4.applyIf(config, {
            layout : 'hbox',
            height : 87,
            cls    : 'connectorheader',
            expanded : true
        });

        this.callParent([config]);

        this.addEvents(

                /**
                 * @event headerclick
                 * Fires when the header logo is clicked.
                 * fired
                 * @param {Ext.Component} panel The Panel object
                 */
                'headerclick'
        );
    },

    initComponent : function() {

        this.items = [{
            xtype  : 'box',
            itemId : 'logo',
            cls    : 'logo',
            autoEl : {
                tag   : 'div',
                html  : '<h2>hiv vaccine <br>' +
                            '<span>collaborative dataspace</span>' +
                        '</h2>' +
                        '<img src="' + LABKEY.contextPath + '/cds/images/logo_0' + (Math.floor(Math.random()*5)+1) +'.png">' // TODO: Get rid of hard coded context
            },
            flex   : 4,
            listeners : {
                afterrender : function(b) {
                    b.getEl().on('click', function() {
                        this.fireEvent('headerclick', this);
                    }, this);
                },
                scope : this
            }
        },{
            xtype  : 'panel',
            layout : 'hbox',
            itemId : 'search',
            margin : '25 0 0 0',
//            width  : 300, with search
            width  : 100,
            items  : [{
                xtype  : 'box',
                margin : '2 15 0 0',
                autoEl : {
                    tag  : 'a',
                    cls  : 'logout',
                    href : LABKEY.ActionURL.buildURL('login', 'logout'),
                    html : 'Logout'
                }
            }]
//            },{
//                xtype : 'searchcontainer',
//                id    : 'search-container',
//                disabled : true,
//                flex  : 1
//            }]
        }];

        this.callParent();

//        if (!this.expanded) {
        this.on('afterrender', function() { this.collapse(true); }, this, {single: true});
//        }

        this.on('afterrender', function(p) {
            var cmp = Ext4.getCmp('search-container');
            if (cmp && cmp.getEl()) {
                Ext4.create('Ext.tip.ToolTip', {
                    target : cmp.getEl(),
                    anchor : 'left',
                    autoHide: true,
                    contentEl : 'searchtip',
                    maxWidth : 500,
                    minWidth : 200,
                    bodyPadding: 0,
                    padding: 0
                });
            }
        }, this, {single: true});
    },

    expand : function() {
        if(!this.expanded) {
            var h2logo = Ext4.get(this.getComponent('logo').getEl().query('h2')[0]);
            h2logo.dom.innerHTML = 'hiv vaccine <br><span>collaborative dataspace</span>';
            h2logo.animate({ to : { fontSize: '13pt', paddingTop: 27 }, duration: this.collapseTime });
            Ext4.get(this.getComponent('logo').getEl().query('img')[0]).animate({ to : { paddingTop: 23, width : 45 }, duration: this.collapseTime });
            Ext4.get(this.getComponent('search').getEl().animate({ to : { marginTop: 0}, duration : this.collapseTime }));
            this.setHeight(87);
            this.expanded = true;
        }
    },

    collapse : function(force) {
        if (this.expanded || force === true) {
            var time = force ? 0 : this.collapseTime;
            var h2logo = Ext4.get(this.getComponent('logo').getEl().query('h2')[0]);
            h2logo.dom.innerHTML = 'hiv vaccine <span>collaborative dataspace</span>';
            h2logo.animate({ to : { fontSize: '11pt', paddingTop: 20 }, duration: time });
            Ext4.get(this.getComponent('logo').getEl().query('img')[0]).animate({ to : { paddingTop: 11 , width : 32}, duration: time });
            Ext4.get(this.getComponent('search').getEl().animate({ to : { marginTop: -30}, duration : time }));
            this.setHeight(53);
            this.expanded = false;
        }
    }
});
