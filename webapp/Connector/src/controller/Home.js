/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Home', {

    extend : 'Connector.controller.AbstractViewController',

    stores : [],

    views : ['Home'],

    init : function() {

        this.control('grouplistview', {
            itemclick: function(v, grp) {
                var filters = grp.get('filters');
                if (Ext.isString(filters)) {
                    var strFilterArray = LABKEY.app.model.Filter.fromJSON(filters);
                    filters = [];
                    for (var f=0; f < strFilterArray.length; f++) {
                        filters.push(Ext.create('Connector.model.Filter', strFilterArray[f]));
                    }
                }
                else {
                    filters = filters.filters;
                }

                this.getStateManager().setFilters(filters);
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {
        var v;

        if (xtype == 'home') {
            v = Ext.create('Connector.view.Home', {});
        }

        return v;
    },

    updateView : function(xtype, context) {}
});
