/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Home', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.home',

    homeHeaderHeight: 160,

    initComponent : function() {

        this.items = [
            this.getHeader(),
            this.getBody()
        ];

        this.callParent();

        this.on('resize', this.onViewResize, this);
    },

    onViewResize : function() {
        if (Ext.isDefined(this.content)) {
            this.content.getEl().setHeight(this.getBox().height - this.homeHeaderHeight);
        }
    },

    getHeader : function() {
        return Ext.create('Connector.view.HomeHeader', {
            height: this.homeHeaderHeight
        });
    },

    getBody : function() {
        if (!this.content) {

            var DateFormat = Ext.util.Format.dateRenderer('d M Y');

            this.content = Ext.create('Ext.container.Container', {
                plugins: ['messaging'],
                cls: 'left-spacer',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'start'
                },
                overflowX: 'hidden',
                overflowY: 'auto',
                items: [{
                    xtype: 'grouplist'
                },{
                    xtype: 'dataview',
                    flex: 10,
                    cls: 'top-spacer-xlg left-spacer-lg',
                    itemSelector: 'div.entry',
                    loadMask: false,
                    border: false,
                    tpl: new Ext.XTemplate(
                        '<h2 class="section-title bottom-spacer">News</h2>',
                        '<tpl if="this.isEmpty(values)">',
                            '<div class="grouplist-empty" style="font-size: 13pt; font-family: Arial;">Feeds not available</div>',
                        '</tpl>',
                        '<table style="font-size: 11pt;">',
                            '<tpl for=".">',
                                '<tr class="entry" style="margin-top: 10px;">',
                                    '<td style="width: 110px; vertical-align: text-top; color: #a09c9c;">{pubDate:this.renderDate}</td>',
                                    '<td style="padding-right: 15px;">',
                                        '<div><a href="{link}" target="_blank">{title:htmlEncode}</a></div>',
                                        '<div>{description:htmlEncode}</div>',
                                    '</td>',
                                '</tr>',
                            '</tpl>',
                        '</table>',
                            {
                                isEmpty : function(v) {
                                    return (!Ext.isArray(v) || v.length === 0);
                                },
                                renderDate : function(date) {
                                    return DateFormat(date);
                                }
                            }
                    ),
                    store: Ext.create('Ext.data.Store', {
                        model: 'Connector.model.RSSItem',
                        autoLoad: true
                    })
                }]
            });
        }

        return this.content;
    }
});

Ext.define('Connector.view.HomeHeader', {

    extend : 'Ext.container.Container',

    alias: 'widget.homeheader',

    layout: {
        type : 'hbox',
        align: 'stretch'
    },

    height: 160,

    cls: 'dimensionview',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    initComponent : function() {

        this.items = [
            {
                xtype: 'box',
                itemId: 'statdisplay',
                tpl: new Ext.XTemplate(
                    '<div class="educational-titlepanel">',
                        '<h1>Welcome to the HIV Vaccine Collaborative Dataspace.</h1>',
                        '<h1 style="opacity: 0.66;">{nstudy:htmlEncode} studies connected together combining</h1>',
                        '<h1 style="opacity: 0.33; width: 50%;">{ndatapts:this.commaFormat} data points.</h1>',
                    '</div>',
                    '<a href="#home/about" style="font-size: 12px; margin: 0 0; position: absolute; right: 33px; top: 48px!important;">About the Collaborative DataSpace...</a>',
                    {
                        commaFormat : function(v) {
                            return Ext.util.Format.number(v, '0,000');
                        }
                    }
                ),
                data: {
                    nstudy: 0,
                    ndatapts: 0
                }
            }
        ];

        this.callParent();
    }
});