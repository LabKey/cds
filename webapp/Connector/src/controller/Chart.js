/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Chart', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['Compare', 'Scatter', 'Time'],

    init : function() {

        this.control('#yaxisselector', {
            requestvariable: function(view, model) {
                var plot = view.up('plot');
                if (plot) {
                    plot.showYMeasureSelection(view.getEl());
                }
            }
        });

        this.control('#xaxisselector', {
            requestvariable: function(view, model) {
                var plot = view.up('plot');
                if (plot) {
                    plot.showXMeasureSelection(view.getEl());
                }
            }
        });

        this.control('plot', {
            axisselect: function(plot, axis, selection) {
                if (axis === 'y') {
                    Ext.getCmp('yaxisselector').getModel().updateVariable(selection);
                    Ext.getCmp('xaxisselector').enable();
                }
                else if (axis === 'x') {
                    Ext.getCmp('xaxisselector').getModel().updateVariable(selection);
                    Ext.getCmp('yaxisselector').enable();
                }
            }
        });

        this.callParent();
    },

    createView : function(xtype, config, context) {

        if (xtype == 'plot')
        {
            var state = this.getStateManager();
            var v = Ext.create('Connector.view.Scatter', {
                control : this.getController('RawData'),
                ui  : 'custom',
                state : state
            });

            state.on('filterchange', v.onFilterChange, v);
            this.getViewManager().on('afterchangeview', v.onViewChange, v);

            return v;
        }
        else if (xtype == 'timeview')
        {
            var state = this.getStateManager();
            var v = Ext.create('Connector.view.Time', {
                ui  : 'custom',
                state : state
            });

            return v;
        }
        else if (xtype == 'compareview')
        {
            var state = this.getStateManager();
            var v = Ext.create('Connector.view.Compare', {
                ui  : 'custom',
                state : state
            });

            return v;
        }
    },

    updateView : function(xtype, context) {},

    getDefaultView : function() {
        return 'plot';
    }
});
