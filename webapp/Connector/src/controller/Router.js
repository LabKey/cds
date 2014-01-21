Ext.define('Connector.controller.Router', {
    extend: 'LABKEY.app.controller.Route',

    init : function() {
        /* This control is responsible for loading the application */
        this.control(
                'app-main', {
                    afterrender: this.onAppReady
                }
        );

        this.callParent();
    }
});
