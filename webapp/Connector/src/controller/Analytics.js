Ext.define('Connector.controller.Analytics', {

    extend: 'Ext.app.Controller',

    init: function () {

        // Scenarios:
        // "Plot X, Plot Y, Plot Color"
        // "Plot button: source"
        // "Plot button: variable"
        this.control('plot', {
            userplotchange: function(axis) {
                // see axis.x, axis.y, and axis.color
                console.log('Analytics: User configured a new plot.');
            }
        });

        // Scenarios
        // "Export"
        // "Export: list of source names"
        // "Export: # of columns"
        this.control('groupdatagrid', {
            requestexport: function(view, exportParams) {
                console.log('Analytics: grid export occurred.');
            }
        });

        this.callParent();

        // Scenarios
        // "Add filter"
        // "Add filter: filter noun"
        Connector.getState().on('filterchange', function(filters) {
            // TODO: We'll probably want to make this more granular for 'add' but
            // TODO: that can get tricky with the way we merge filters.
            console.log('Analytics: filters changed.');
        });

        // Scenarios
        // "Save"
        // "Save: Boolean for was there a plot?"
        Connector.getApplication().on('groupsaved', function(group, filters) {
            console.log('Analytics: A group was saved.');
        });
    }
});