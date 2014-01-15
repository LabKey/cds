/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.controller.Chart', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['Compare', 'Scatter', 'Time'],

    createView : function(xtype, config, context) {

        if (xtype == 'plot')
        {
            var state = this.getStateManager();
            var v = Ext4.create('Connector.view.Scatter', {
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
            var v = Ext4.create('Connector.view.Time', {
                ui  : 'custom',
                state : state
            });

            return v;
        }
        else if (xtype == 'compareview')
        {
            var state = this.getStateManager();
            var v = Ext4.create('Connector.view.Compare', {
                ui  : 'custom',
                state : state
            });

            return v;
        }
    },

    updateView : function(xtype, context) {}
});
