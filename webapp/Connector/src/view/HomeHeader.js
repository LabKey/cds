Ext.define('Connector.view.HomeHeader', {

    extend : 'Ext.container.Container',

    alias: 'widget.homeheader',

    layout: {
        type : 'hbox',
        align: 'stretch'
    },

    height: 160,

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
                    '<div class="educational-titlepanel">',
                        '<h1>Welcome to the HIV Vaccine Collaborative Dataspace.</h1>',
                        '<h1 style="opacity: 0.66;">{nstudy:htmlEncode} studies connected together combining</h1>',
                        '<h1 style="opacity: 0.33; width: 50%;">{ndatapts:this.commaFormat} data points.</h1>',
                    '</div>',
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