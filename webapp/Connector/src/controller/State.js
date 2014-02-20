/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.State', {
    extend: 'LABKEY.app.controller.State',

    defaultTitle: 'HIV Vaccine Collaborative Dataspace',

    defaultView: 'summary',

    appVersion: '0.5',

    init : function() {
        this.callParent();

        Connector.STATE = this;
    },

    getTitle : function(viewname) {
        return 'Connector: ' + viewname;
    },

    getAction : function(appState) {
        return 'app.view?' + this.getURLParams() + '#' + appState;
    }
});