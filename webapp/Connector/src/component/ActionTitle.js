/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.component.ActionTitle', {
    extend: 'Ext.container.Container',

    alias: 'widget.actiontitle',

    text: 'Action Title!',

    cls: 'titlepanel',

    layout: {
        type: 'hbox'
    },

    colorCls: 'secondary',

    back: false,

    initComponent : function() {

        this.items = [{
            xtype: 'box',
            cls: 'title',
            autoEl: {
                tag: 'div',
                html: this.text
            }
        },{
            // This allows for the following items to be right aligned
            xtype: 'box',
            flex: 1,
            autoEl: {
                tag: 'div'
            }
        }, this.includeButtons()
        ];

        this.addCls(this.colorCls);

        this.callParent();
    },

    includeButtons : function() {
        if (Ext.isDefined(this.buttons)) {
            return {
                xtype: 'container',
                cls: 'buttons',
                layout: {
                    type: 'hbox'
                },
                items : this.buttons
            };
        }
    }
});
