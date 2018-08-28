/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.AbstractGridController', {

    extend : 'Connector.controller.AbstractViewController',

    controllerName: undefined,

    viewXtype: undefined, 
    
    viewClazz: undefined,
    
    modelClazz: undefined,

    viewTitle: undefined,

    createView : function(xtype, context) {

        var v, me = this;

        if (xtype === this.viewXtype) {
            v = Ext.create(this.viewClazz, {
                model: Ext.create(this.modelClazz, {})
            });

            var vm = this.getViewManager();

            vm.on('beforechangeview', function(controller, view, currentContext) {
                // If a chart view is being activated, ensure it is not
                // a view of plotType so to not deactivate the view unintentionally
                if (controller === me.controllerName) {
                    if (Ext.isDefined(view) && view !== me.viewXtype) {
                        me.onViewDeactivate();
                        v.onDeactivate.call(v);
                    }
                }
                else if (currentContext.view === me.viewXtype) {
                    me.onViewDeactivate();
                    v.onDeactivate.call(v);
                }
            });
            vm.on('afterchangeview', function(c, view) {
                if (view === me.viewXtype) {
                    me.onViewActivate();
                    v.onActivate.call(v);
                }
            });
        }

        return v;
    },

    updateView : function(xtype, context) { },

    getViewTitle : function(xtype, context) {
        if (xtype === this.viewXtype) {
            return this.viewTitle;
        }
    },

    getDefaultView : function() {
        return this.viewXtype;
    },

    onViewActivate : function() {},

    onViewDeactivate : function() {},
});
