Ext.define('Connector.controller.Analytics', {

    extend: 'Ext.app.Controller',

    statics: {
        isInspectletEnabled: function()
        {
            return typeof _insp !== 'undefined';
        },

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
            userplotchange: function(window, axis) {
                // see axis.x, axis.y, and axis.color
                if (Connector.controller.Analytics.isEnabled())
                {
                    if (axis.targetId == "xvarselector")
                    {
                        _gaq.push(['_trackEvent', 'Plot', 'Change X source', axis.x.queryName]);
                        _gaq.push(['_trackEvent', 'Plot', 'Change X', axis.x.name]);
                    }
                    else if (axis.targetId == 'yvarselector')
                    {
                        _gaq.push(['_trackEvent', 'Plot', 'Change Y source', axis.y.queryName]);
                        _gaq.push(['_trackEvent', 'Plot', 'Change Y', axis.y.alias]);
                    }
                    else if (axis.targetId == 'colorselector')
                    {
                        _gaq.push(['_trackEvent', 'Plot', 'Change color source', axis.color.queryName]);
                        _gaq.push(['_trackEvent', 'Plot', 'Change color', axis.color.alias]);
                    }
                }
            }
        });

        this.control('signinform', {
            userSignedIn: function() {
                if (Connector.controller.Analytics.isInspectletEnabled())
                    __insp.push(['identify', LABKEY.user.email]);

                if (Connector.controller.Analytics.isEnabled())
                {
                    _gaq.push(['_setCustomVar', 1, 'user', LABKEY.user.email, 2]);
                    _gaq.push(['_trackEvent', 'User', 'Login', LABKEY.user.email]);
                }
            }
        });

        this.control('connectorheader', {

            userLogout: function() {
                if (Connector.controller.Analytics.isEnabled()) {
                    _gaq.push(['_deleteCustomVar', 1]);
                    _gaq.push(['_trackEvent', 'User', 'Logout', LABKEY.user.email]);
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
                    var sources = this.getSourcesArray(exportParams.columnNames);
                    for (var i = 0; i < sources.length; i++)
                    {
                        _gaq.push(['_trackEvent', 'Grid', 'Export source', sources[i]]);
                    }
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


        // Scenarios
        // "Add filter"
        // "Add filter: filter noun"
        Connector.getState().on('filterchange', function(filters) {
            if (Connector.controller.Analytics.isEnabled())
            {
                _gaq.push(['_trackEvent', 'Filter', 'Change']);
                for (f = 0; f < filters.length; f++)
                {
                    var members = filters[f].get('members');
                    for (var i = 0; i < members.length; i++)
                    {
                        _gaq.push(['_trackEvent', 'Filter', 'Add', members[i].uniqueName]);
                    }
                }
            }
        });

        // Scenarios
        // "Save"
        // "Save: Boolean for was there a plot?" // TODO how do I determine that there is a plot
        Connector.getApplication().on('groupsaved', function(group, filters) {
            if (Connector.controller.Analytics.isEnabled())
            {
                _gaq.push(['_trackEvent', 'Group', 'Save']);
            }
        });
    },

    getSourcesStringForLabel : function(columnNames) {
        var sources = this.getSourcesArray(columnNames).toString();
        // maximum length for a label in GA is 500 bytes, so we trim before sending it along
        return sources.length > 500 ? sources.substring(0, 497) + "..." : sources.substring(0, 500);
    },

    getSourcesArray: function(columnNames) {
        var queryService = Connector.getService('Query'),
        sources = {};

        Ext.each(columnNames, function(columnAlias) {
            var measure = queryService.getMeasure(columnAlias);
            if (measure && measure.queryName) {
                sources[measure.queryName] = true;
            }
        });
        return Ext.Object.getKeys(sources);
    }

});