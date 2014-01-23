Ext.define('Connector.controller.State', {
    extend: 'LABKEY.app.controller.State',

    defaultTitle: 'HIV Vaccine Collaborative Dataspace',

    defaultView: 'summary',

    appVersion: '0.5',

    getTitle : function(viewname) {
        return 'Connector: ' + viewname;
    },

    getAction : function(appState) {
        return 'app.view?' + this.getURLParams() + '#' + appState;
    }
});