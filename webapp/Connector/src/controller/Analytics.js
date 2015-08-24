Ext.define('Connector.controller.Analytics', {

    extend: 'Ext.app.Controller',

    statics: {
        isEnabled: function ()
        {
            return typeof _gaq !== 'undefined';
        }
    },

    init: function () {

        // Scenarios:
        // "Plot X, Plot Y, Plot Color"
        // "Plot button: source"
        // "Plot button: variable"
        this.control('plot', {
            userplotchange: function(axis) {
                // see axis.x, axis.y, and axis.color
                if (Connector.controller.Analytics.isEnabled())
                {
                    _gaq.push(['_trackEvent', 'Plot', 'Change']);
                }
            }
        });

        this.control('signinform', {
            userSignedIn: function() {
                if (Connector.controller.Analytics.isEnabled())
                {
                    _gaq.push(['_setCustomVar', 1, 'user', LABKEY.user.email, 2]);
                    _gaq.push(['_trackEvent', 'User', 'Login', LABKEY.user.email]);
                }
            }
        });

        // Scenarios
        // "Export"
        // "Export: list of source names"
        // "Export: # of columns"
        this.control('groupdatagrid', {
            requestexport: function(view, exportParams) {
                if (Connector.controller.Analytics.isEnabled()) {
                    _gaq.push(['_trackEvent', 'Grid', 'Export', 'Column count', exportParams.columnNames.length]);
                }
            }
        });

        this.callParent();

        // tracking page views
        this.application.on('route', function(controller, view, viewContext) {
           if (Connector.controller.Analytics.isEnabled()) {
               _gaq.push(['_trackPageview', LABKEY.contextPath + LABKEY.container.path + "/app.view#" + controller ])
           }
        });


        //Connector.getState().on('selectionchange', function(filters) {
        //    if (Connector.controller.Analytics.isEnabled())
        //    {
        //        for (f = 0; f < filters.length; f++)
        //        {
        //            var members = filters[f].get('members');
        //            for (var i = 0; i < members.length; i++)
        //            {
        //                _gaq.push(['_trackEvent', 'Filter', 'Add', members[i].uniqueName]);
        //            }
        //        }
        //    }
        //});

        // Scenarios
        // "Add filter"
        // "Add filter: filter noun"
        Connector.getState().on('filterchange', function(filters) {
            // TODO: We'll probably want to make this more granular for 'add' but
            // TODO: that can get tricky with the way we merge filters.
            if (Connector.controller.Analytics.isEnabled())
            {
                _gaq.push(['_trackEvent', 'Filter', 'Change']);
            }
        });

        // Scenarios
        // "Save"
        // "Save: Boolean for was there a plot?"
        Connector.getApplication().on('groupsaved', function(group, filters) {
            if (Connector.controller.Analytics.isEnabled())
            {
                _gaq.push(['_trackEvent', 'Group', 'Save']);
            }
        });
    }

});