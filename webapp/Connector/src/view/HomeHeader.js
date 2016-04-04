/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.HomeHeader', {

    extend : 'Ext.container.Container',

    alias: 'widget.homeheader',

    layout: {
        type : 'hbox',
        align: 'stretch'
    },

    height: 180,

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
                cls: 'cascade-header',
                tpl: new Ext.XTemplate(
                    '<h1>Welcome to the CAVD DataSpace.</h1>',
                    '<h1 class="middle">{nstudy:htmlEncode} studies to <a href="#learn">learn about </a></h1>',
                    '<h1 class="bottom">{ndatapts:this.commaFormat} data points from {nsubjectstudy:htmlEncode} studies to <a href="#chart">plot</a></h1>',
                    {
                        commaFormat : function(v) {
                            return Ext.util.Format.number(v, '0,000');
                        }
                    }
                ),
                data: {
                    nstudy: 0,
                    ndatapts: 0,
                    nsubjectstudy: 0
                }
            }
        ];

        this.callParent();
    }
});
