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
                    },
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
                        '<h1>Welcome to the HIV Vaccine Data Connector.</h1>',
                        '<h1 style="color: #7a7a7a;">{nstudy:htmlEncode} studies connected together combining</h1>',
                        '<h1 style="color: #b5b5b5;">{ndatapts:this.commaFormat} data points.</h1>',
                    '</div>',
                    '<a href="#about" style="font-size: 11pt; margin: -25px 60px 0 0; float: right;">About the Data Connector...</a>',
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
        type: 'vbox'
    }
});