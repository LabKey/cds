/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.MabGrid', {

    extend : 'Connector.controller.AbstractGridController',

    stores: ['MabStatus'],

    views: ['DetailStatus', 'MabGrid', 'MabStatus'],

    controllerName: 'mabgrid',

    viewXtype: 'mabdatagrid',

    viewClazz: 'Connector.view.MabGrid',

    modelClazz: 'Connector.model.MabGrid',

    viewTitle: 'MAb Grid',

    dataSource: undefined,

    init : function() {

        this.control('app-main > #eastview > #navfilter', {
            afterrender : function(navfilter) {
                var container = Ext.create('Ext.container.Container', {
                    itemId: 'mabstatuscontainer',
                    hidden: true, // will display on view activation
                    style: 'overflow-y: auto; overflow-x: hidden;',
                    flex: 1,
                    items: [
                        this.createMabStatus(),
                        this.createMabDetail()
                    ],
                });
                navfilter.add(container);
            }
        });

        this.callParent();
    },

    onViewActivate : function() {
        this.hideContainer('filterstatuscontainer');
        this.showContainer('mabstatuscontainer');
    },

    onViewDeactivate : function() {
        this.hideContainer('mabstatuscontainer');
        this.showContainer('filterstatuscontainer');
    },

    createMabDetail : function() {
        var store = this.getStore('MabStatus');
        store.load();

        return Ext.create('Connector.view.DetailStatus', {
            store: store
        });
    },

    createMabStatus : function() {
        var view = Ext.create('Connector.view.MabStatus', { });

        this.getViewManager().register(view);

        return view;
    },

    hideContainer : function(id) {
        var status = Ext.ComponentQuery.query('#' + id);

        if (status && status.length > 0) {
            status[0].hide();
        }
    },

    showContainer : function(id) {
        var status = Ext.ComponentQuery.query('#' + id);

        if (status && status.length > 0) {
            status[0].show();
        }
    }
});
