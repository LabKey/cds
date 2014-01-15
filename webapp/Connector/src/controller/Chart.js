Ext.define('Connector.controller.Chart', {

    extend : 'Connector.controller.AbstractViewController',

    views  : ['Compare', 'Scatter', 'Time'],

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

    updateView : function(xtype, context) {}
});
