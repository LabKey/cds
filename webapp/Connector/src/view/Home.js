/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Home', {
    extend: 'Ext.container.Container',

    alias: 'widget.home',

    homeHeaderHeight: 180,

    ui: 'custom',

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
        if (!this.content)
        {
            this.resizeTask = new Ext.util.DelayedTask(function(c)
            {
                c.setHeight(this.getHeight() - this.homeHeaderHeight);
            }, this);

            var items = [{
                xtype: 'cds-news'
            }];

            if (Connector.getProperty(Connector.component.Started.DISMISS_PROPERTY) === true)
            {
                items.unshift({
                    xtype: 'cds-started',
                    cls: 'bottom-spacer-xlg'
                });
            }

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
                    items: items,
                    listeners: {
                        resize: function(c)
                        {
                            this.resizeTask.delay(200, undefined, undefined, [c]);
                        },
                        scope: this
                    }
                }]
            });
        }

        return this.content;
    }
});
