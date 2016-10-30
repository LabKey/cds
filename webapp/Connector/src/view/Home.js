/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Home', {
    extend: 'Ext.container.Container',

    alias: 'widget.home',

    homeHeaderHeight: 180,

    ui: 'custom',

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
                this.getBody().setHeight(this.getHeight() - this.homeHeaderHeight);
            }, this);
            this.body = Ext.create('Ext.container.Container', {
                plugins: ['messaging'],
                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    pack: 'start'
                },
                overflowY: 'auto',
                overflowX: 'hidden',
                items: [this.getMiddle(), this.getBottom()],
                height: '300px',
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
                xtype: 'cds-news'
            }];
            this.content = Ext.create('Ext.container.Container', {
                plugins: ['messaging'],
                cls: 'left-spacer',
                layout: {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'start'
                },
                items: [{
                    xtype: 'grouplist'
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
