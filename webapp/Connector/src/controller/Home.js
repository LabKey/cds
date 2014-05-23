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

            var data = {
                nstudy: 0,
                ndatapts: 0
            };

            var check = function() {
                if (data.nstudy > 0 && data.ndatapts > 0) {
                    statDisplay.update(data);
                }
            };

            LABKEY.Query.selectRows({
                schemaName: 'study',
                queryName: 'StudyData',
                requiredVersion: 9.1,
                maxRows: 1,
                success: function(_data) {
                    data.ndatapts = _data.rowCount;
                    check();
                }
            });

            this.getStateManager().onMDXReady(function(mdx) {
                mdx.query({
                    onRows: [{ level: "[Study].[Name]"}],
                    success: function(cellset) {
                        data.nstudy = cellset.cells.length;
                        check();
                    }
                });
            }, this);
        }
    }
});
