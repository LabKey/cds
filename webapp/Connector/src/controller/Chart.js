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

        this.control('plot', {
            axisselect: function(plot, axis, selection) {
                var type;
                if (axis === 'y') {
                    type = 'yvarselector';
                }
                else if (axis === 'x') {
                    type = 'xvarselector';
                }
                else if (axis === 'color') {
                    type = 'colorvarselector';
                }
                if (type) {
                    Ext.getCmp(type).getModel().updateVariable(selection);
                }
            }
        });

        this.control('axisselectdisplay > panel > panel > button#gotoassaypage', {
            click: function(btn) {
                var win = btn.up('window');
                if (win) {
                    win.hideLock = true;
                    win.hide();
                }

                // issue 20664: find the assay label from the first dataset row
                if (btn.source && btn.source.assaysLookup) {
                    LABKEY.Query.selectRows({
                        schemaName: Connector.studyContext.schemaName,
                        queryName: btn.source.get('queryName'),
                        columns: btn.source.assaysLookup.name + '/Label',
                        maxRows: 1,
                        scope: this,
                        success: function(data) {
                            if (data.rows.length == 1) {
                                this.getViewManager().changeView('learn', 'learn', ['assay', data.rows[0][btn.source.assaysLookup.name + '/Label']]);
                            }
                        }
                    });
                }
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {

        var state = this.getStateManager();
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
            this.getStateManager().clearSelections();
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
