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
        return Ext.create('Connector.view.HomeBody', {
            items: [{
                xtype: 'grouplist'
            }]
        });
    }
});

Ext.define('Connector.view.HomeHeader', {

    extend : 'Ext.container.Container',

    alias: 'widget.homeheader',

    layout: {
        type : 'hbox',
        align: 'stretch'
    },

    height: 161,

    cls: 'dimensionview',

    defaults: {
        ui: 'custom',
        flex: 1
    },

    initComponent : function() {

        this.items = [
            {
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'titlepanel',
                    children: [{
                        tag: 'h1',
                        html: 'Welcome to the HIV Vaccine Data Connector.'
                    },{
                        tag: 'h1',
                        html: '# studies connected together combining',
                        style: 'opacity: 0.7;'
                    },{
                        tag: 'h1',
                        html: '# data points.',
                        style: 'opacity: 0.4;'
                    }]
                }
            }
        ];

        this.callParent();
    }
});

Ext.define('Connector.view.HomeBody', {
    extend: 'Ext.container.Container',

    margin: '0 0 0 27',

    layout: {
        type: 'vbox'
    }
});