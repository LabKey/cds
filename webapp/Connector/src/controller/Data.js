/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Data', {

    extend : 'Connector.controller.AbstractViewController',

    views: ['Grid'],

    createView : function(xtype, context) {

        var v;

        if (xtype == 'groupdatagrid') {
            v = Ext.create('Connector.view.Grid', {
                model: Ext.create('Connector.model.Grid', {})
            });

            this.getViewManager().on('afterchangeview', v.onViewChange, v);
        }

        return v;
    },

    updateView : function(xtype, context) { },

    getViewTitle : function(xtype, context) {
        if (xtype === 'groupdatagrid') {
            return 'Data Grid';
        }
    },

    getDefaultView : function() {
        return 'groupdatagrid';
    }
});
