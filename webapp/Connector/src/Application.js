/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.Application', {
    name: 'Connector',

    extend: 'LABKEY.app.Application',

    requires: [
        'Connector.app.model.Assay',
        'Connector.app.model.Labs',
        'Connector.app.model.Study',
        'Connector.app.model.StudyProducts',
        'Connector.app.model.VariableList',

        'Connector.app.store.Assay',
        'Connector.app.store.Labs',
        'Connector.app.store.StudyProducts',
        'Connector.app.store.VariableList',

        'Connector.app.view.Assay',
        'Connector.app.view.Labs',
        'Connector.app.view.Study',
        'Connector.app.view.StudyProducts'
    ],

    controllers: [
        'Connector', // View Manager must be registered first to properly initialize
        'HttpInterceptor',
        'Messaging',
        'State',
        'Query',
        'Filter',
        'Analytics',
        'Group',
        'Main',
        'Router',
        'Chart',
        'Explorer',
        'FilterStatus',
        'Home',
        'Learn',
        'Navigation',
        'Data',
        'Summary'
    ],

    defaultController: 'Home',

    views: [],

    stores: [],

    initNamespace : function() {
        this.callParent(arguments);

        var me = this;
        var ns = Ext.namespace(me.name);

        if (ns) {
            ns.getService = function() {
                return this.getService.apply(me, arguments);
            };
            ns.getState = function() {
                return this.getState.apply(me, arguments);
            };
            ns.getFilterService = function() {
                return this.getFilterService.apply(me, arguments);
            };
            ns.getQueryService = function() {
                return this.getQueryService.apply(me, arguments);
            };
        }
    },

    getState : function() {
        return this.getService('State');
    },

    getFilterService : function() {
        return this.getService('Filter');
    },

    getQueryService : function() {
        return this.getService('Query');
    },

    setDataSource : function(datasource) {
        this.getState().setDataSource(datasource);
    }
});
