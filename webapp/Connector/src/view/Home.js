/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Home', {
    extend: 'Ext.container.Container',

    alias: 'widget.home',

    homeHeaderHeight: 200,

    ui: 'custom',

    id : 'homeviewid',

    listeners: {
        resize: function(c)
        {
            c.getBody().fireEvent('resize');
        },
        scope: this
    },

    initComponent : function()
    {
        this.items = [
            { xtype: 'homeheader' },
            this.getBody()
        ];

        this.callParent();
    },

    getBody : function()
    {
        if (!this.body)
        {
            this.resizeTask = new Ext.util.DelayedTask(function(c)
            {
                this.body.setHeight(this.getHeight() - this.homeHeaderHeight);
                var container = Ext.get('homebody-id');
                container.setHeight(this.body.getBox().height);

            }, this);
            this.body = Ext.create('Ext.container.Container', {
                id : 'homebody-id',
                plugins: ['messaging'],
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },
                overflowY: 'auto',
                overflowX: 'hidden',
                items: [this.getMiddle(), this.getBottom()],
                height: '200px',
                listeners: {
                    resize: function(c)
                    {
                        this.resizeTask.delay(200, undefined, undefined, [c]);
                    },
                    scope: this
                }
            });
        }
        return this.body;
    },

    getMiddle : function()
    {
        if (!this.middle)
        {
            this.middle = Ext.create('Ext.container.Container', {
                plugins: ['messaging'],
                //cls: 'left-spacer',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'start'
                },
                items: [{
                    xtype: 'cds-started',
                    cls: 'bottom-spacer-xlg cds-started'
                }]
            });
        }
        return this.middle;
    },

    getBottom : function()
    {
        if (!this.content)
        {
            var items = [{
                xtype: 'cds-news',
                id: 'cds-news-id',
            }];
            this.content = Ext.create('Ext.container.Container', {
                id: 'home-content-bottom',
                plugins: ['messaging'],
                cls: 'left-spacer',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'start'
                },
                items: [{
                    xtype: 'grouplist',
                    id: 'grouplist-id',
                },{
                    xtype: 'container',
                    cls: 'left-spacer-lg',
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    items: items
                }]
            });
        }

        return this.content;
    }
});
