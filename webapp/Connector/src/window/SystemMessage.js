Ext.define('Connector.window.SystemMessage', {

    extend : 'Ext.window.Window',

    cls : 'sysmsg',

    constructor : function(config) {

        Ext.applyIf(config, {
            autoShow : true,
            ui       : 'swmsg',
            closable : false,
            resizable: false,
            draggable: false
        });

        this.callParent([config]);
    },

    initComponent : function() {

        this.html = this.msg;

        this.callParent();
    }
});