/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Home', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.home',

    homeHeaderHeight: 161,

    initComponent : function() {

        this.items = [
            this.getHeader(),
            this.getBody()
        ];

        this.callParent();
    },

    getHeader : function() {
        return Ext.create('Connector.view.HomeHeader', {
            height: this.homeHeaderHeight
        });
    },

    getBody : function() {
        if (!this.content) {

            Ext.define('Connector.model.News', {
                extend: 'Ext.data.Model',

                fields: [
                    {name: 'title'},
                    {name: 'description'},
                    {name: 'pubDate', type: 'date'},
                    {name: 'link'}
                ]
            });

            var DateFormat = Ext.util.Format.dateRenderer('d M Y');

            this.content = Ext.create('Connector.view.HomeBody', {
                items: [{
                    xtype: 'grouplist',
                    listeners: {
                        deletegroup: function(group) {
                            var content = this.content;
                            if (content && content.showMessage) {
                                content.hideMessage(true);
                                var id = Ext.id();
                                var cancelId = Ext.id();
                                content.showMessage('Are you sure you want to delete "' + group.get('label') + '"? <a id="' + id + '">Delete</a>&nbsp;<a id="' + cancelId + '">Cancel</a>', true, false, true);
                                var deleteLink = Ext.get(id);
                                if (deleteLink) {
                                    deleteLink.on('click', function() {
                                        content.hideMessage(true);
                                        this.fireEvent('requestgroupdelete', group.get('id'));
                                    }, this, {single: true});
                                }
                                var cancelLink = Ext.get(cancelId);
                                if (cancelLink) {
                                    cancelLink.on('click', function() { content.hideMessage(true); }, this, {single: true});
                                }
                            }
                        },
                        scope: this
                    }
                },{
                    xtype: 'dataview',
                    flex: 10,
                    margin: '32 0 0 27',
                    itemSelector: 'div.entry',
                    autoScroll: true,
                    tpl: new Ext.XTemplate(
                        '<div class="grouplist-header">News</div>',
                        '<tpl if="this.isEmpty(values)">',
                            '<div class="grouplist-empty" style="font-size: 13pt; font-family: Arial;">Feeds not available</div>',
                        '</tpl>',
                        '<table style="font-size: 11pt;">',
                            '<tpl for=".">',
                                '<tr class="entry" style="margin-top: 10px;">',
                                    '<td style="width: 110px; vertical-align: text-top; color: #a09c9c;">{pubDate:this.renderDate}</td>',
                                    '<td style="padding-right: 10px;">',
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
                        model: 'Connector.model.News',
                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: LABKEY.ActionURL.buildURL('cds', 'news.api'),
                            reader: {
                                type: 'xml',
                                record: 'item',
                                root: 'channel'
                            }
                        }
                    }),
                    listeners: {
                        resize: function(dv) {
                            Ext.defer(function() {
                                var component = Ext.getCmp(this.id);
                                if (component) {
                                    var box = component.getBox();
                                    var trueHeight = box.height - 161 - 32;
                                    dv.setHeight(trueHeight);
                                }
                            }, 50, this);
                        },
                        scope: this
                    }
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
                    '<div class="titlepanel">',
                        '<h1>Welcome to the HIV Vaccine Collaborative Dataspace.</h1>',
                        '<h1 style="color: #7a7a7a;">{nstudy:htmlEncode} studies connected together combining</h1>',
                        '<h1 style="color: #b5b5b5;">{ndatapts:this.commaFormat} data points.</h1>',
                    '</div>',
                    '<a href="#about" style="font-size: 11pt; margin: -25px 60px 0 0; float: right;">About the Collaborative Dataspace...</a>',
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

Ext.define('Connector.view.HomeBody', {
    extend: 'Ext.container.Container',

    plugins: ['messaging'],

    margin: '0 0 0 27',

    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'start'
    }
});