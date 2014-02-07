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
                autoEl: {
                    tag: 'div',
                    cls: 'titlepanel',
                    html: '<h1>Welcome to the HIV Vaccine Data Connector.</h1>'
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