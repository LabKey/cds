/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Chart', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['Chart'],

    init : function() {

        var queryService = Connector.getService('Query');

        this.control('#yvarselector', {
            requestvariable: function(view, model) {
                var plot = view.up('plot');
                if (plot) {
                    queryService.onQueryReady(function(query) {
                        plot.showYMeasureSelection();
                    });
                }
            }
        });

        this.control('#xvarselector', {
            requestvariable: function(view, model) {
                var plot = view.up('plot');
                if (plot) {
                    queryService.onQueryReady(function(query) {
                        plot.showXMeasureSelection();
                    });
                }
            }
        });

        this.control('#colorvarselector', {
            requestvariable: function(view, model) {
                var plot = view.up('plot');
                if (plot) {
                    queryService.onQueryReady(function(query) {
                        plot.showColorSelection();
                    });
                }
            }
        });

        this.control('#plotshowdata', {
            click: function(btn) {
                var plot = btn.up('plot');
                if (plot) {
                    plot.showPlotDataGrid();
                }
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {

        var state = Connector.getState();
        var v, plotType = 'plot';

        if (xtype == plotType)
        {
            v = Ext.create('Connector.view.Chart', {
                visitTagStore : this.getStore('VisitTagSingleUse')
            });

            state.clearSelections();
            state.on('filterchange', v.onFilterChange, v);
            state.on('plotselectionremoved', v.onPlotSelectionRemoved, v);
            state.on('selectionchange', v.onSelectionChange, v);

            var vm = this.getViewManager();

            vm.on('beforechangeview', function(controller, view, currentContext) {
                // If a chart view is being activated, ensure it is not
                // a view of plotType so to not deactivate the view unintentionally
                if (controller == 'chart') {
                    if (Ext4.isDefined(view) && view != plotType) {
                        v.onDeactivate.call(v);
                    }
                }
                if (currentContext.view == plotType) {
                    v.onDeactivate.call(v);
                }
            });
            vm.on('afterchangeview', function(c, view) {
                if (view == plotType) {
                    v.onActivate.call(v);
                }
            });
        }

        return v;
    },

    updateView : function(xtype, context) {
        if (xtype === 'plot') {
            Connector.getState().clearSelections();
        }
    },

    getViewTitle : function(xtype, context) {
        if (xtype === 'plot') {
            return 'Plot';
        }
    },

    getDefaultView : function() {
        return 'plot';
    }
});
