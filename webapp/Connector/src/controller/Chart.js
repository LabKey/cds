/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Chart', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['Chart'],

    init : function()
    {
        this.control('#yvarselector', {
            requestvariable: this.showYVariableSelector
        });

        this.control('#xvarselector', {
            requestvariable: this.showXVariableSelector
        });

        this.control('#colorvarselector', {
            requestvariable: this.showColorVariableSelector
        });

        this.control('#plotshowdata', {
            click: function(btn) {
                var plot = btn.up('plot');
                if (plot) {
                    plot.showPlotDataGrid();
                }
            }
        });

        this.application.on('showplotantigensx', function()
        {
            var plot = Ext.ComponentQuery.query('plot');
            if (Ext.isArray(plot) && plot.length == 1)
            {
                this.showXVariableSelector(null, null, plot[0], true);
            }
        }, this);

        this.application.on('showplotantigensy', function()
        {
            var plot = Ext.ComponentQuery.query('plot');
            if (Ext.isArray(plot) && plot.length == 1)
            {
                this.showYVariableSelector(null, null, plot[0], true);
            }
        }, this);

        this._filtersChanged = false;
        Connector.getState().on('filterchange', this._filterChangeHook, this);

        this.callParent();
    },

    createView : function(xtype /*, config, context */)
    {
        var v, plotType = 'plot';

        if (xtype == plotType)
        {
            v = Ext.create('Connector.view.Chart', {
                visitTagStore: this.getStore('VisitTagSingleUse'),
                filtersActivated: this._filtersChanged === true
            });

            Connector.getState().un('filterchange', this._filterChangeHook, this);

            Connector.getState().clearSelections();

            var vm = this.getViewManager();

            vm.on('beforechangeview', function(controller, view, currentContext)
            {
                // If a chart view is being activated, ensure it is not
                // a view of plotType so to not deactivate the view unintentionally
                if (controller == 'chart')
                {
                    if (Ext.isDefined(view) && view != plotType)
                    {
                        v.onDeactivate.call(v);
                    }
                }
                if (currentContext.view == plotType)
                {
                    v.onDeactivate.call(v);
                }
            });
            vm.on('afterchangeview', function(c, view)
            {
                if (view == plotType)
                {
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
    },

    _filterChangeHook : function()
    {
        this._filtersChanged = true;
    },

    showYVariableSelector : function(view, model, plot, showAntigenSelection)
    {
        plot = plot || view.up('plot');
        if (plot)
        {
            Connector.getService('Query').onQueryReady(function()
            {
                plot.showYMeasureSelection(showAntigenSelection);
            });
        }
    },

    showXVariableSelector : function(view, model, plot, showAntigenSelection)
    {
        plot = plot || view.up('plot');
        if (plot)
        {
            Connector.getService('Query').onQueryReady(function()
            {
                plot.showXMeasureSelection(showAntigenSelection);
            });
        }
    },

    showColorVariableSelector : function(view, model, plot)
    {
        plot = plot || view.up('plot');
        if (plot)
        {
            Connector.getService('Query').onQueryReady(function()
            {
                plot.showColorSelection();
            });
        }
    }
});
