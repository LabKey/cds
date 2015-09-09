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
                    '<h1>Welcome to the HIV Vaccine Collaborative Dataspace.</h1>',
                    '<h1 class="middle">{nstudy:htmlEncode} studies connected together combining</h1>',
                    '<h1 class="bottom">{ndatapts:this.commaFormat} data points.</h1>',
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
