/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Data', {

    extend : 'Connector.controller.AbstractViewController',

    views: ['Grid'],

    createView : function(xtype, context) {

        var v, gridType = 'groupdatagrid';

        if (xtype === gridType) {
            v = Ext.create('Connector.view.Grid', {
                model: Ext.create('Connector.model.Grid', {})
            });

            var vm = this.getViewManager();

            vm.on('beforechangeview', function(controller, view, currentContext)
            {
                // If a chart view is being activated, ensure it is not
                // a view of plotType so to not deactivate the view unintentionally
                if (controller == 'data')
                {
                    if (Ext.isDefined(view) && view != gridType)
                    {
                        v.onDeactivate.call(v);
                    }
                }
                if (currentContext.view == gridType)
                {
                    v.onDeactivate.call(v);
                }
            });
            vm.on('afterchangeview', function(c, view)
            {
                if (view == gridType)
                {
                    v.onActivate.call(v);
                }
            });
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
