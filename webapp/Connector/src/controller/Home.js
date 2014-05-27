/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Home', {

    extend : 'Connector.controller.AbstractViewController',

    stores : [],

    views : ['Home'],

    models : ['RSSItem'],

    init : function() {

        this.control('home > homeheader', {
            boxready: this.resolveStatistics
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

    updateView : function(xtype, context) {},

    getDefaultView : function() {
        return 'home';
    },

    resolveStatistics : function(view) {
        var statDisplay = view.getComponent('statdisplay');
        if (statDisplay) {

            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('cds', 'properties'),
                method: 'GET',
                success: function(response) {
                    var json = Ext.decode(response.responseText);
                    statDisplay.update({
                        nstudy: json.primaryCount,
                        ndatapts: json.dataCount
                    });
                }
            });

        }
    }
});
