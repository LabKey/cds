/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Analytics', {

    extend: 'Ext.app.Controller',

    statics: {
        isInspectletEnabled: function()
        {
            // This variable is defined in the inspectlet snippet
            return typeof _insp !== 'undefined';
        },

        isGAClassicEnabled: function()
        {
            // This variable is defined in the GA snippet
            return typeof _gaq !== 'undefined';
        },

        isGAUniversalEnabled: function()
        {
            // This variable is defined in the GA snippet
            return typeof ga !== 'undefined';
        },

        isEnabled: function()
        {
            return Connector.controller.Analytics.isGAClassicEnabled() || Connector.controller.Analytics.isGAUniversalEnabled();
        },

        trackPageview : function(path)
        {
            if (Connector.controller.Analytics.isGAClassicEnabled())
                _gaq.push(['_trackPageview', path]);
            else if (Connector.controller.Analytics.isGAUniversalEnabled())
                ga('send', 'pageview', path);
        },

        setIndexedVariable: function(index, value, key, scope) {
            if (Connector.controller.Analytics.isGAClassicEnabled())
                _gaq.push(['_setCustomVar', index, key, value, scope]);
            //else if (Connector.controller.Analytics.isGAUniversalEnabled())
            //    ga('set', 'dimension' + index, value);
        },

        setVariable : function(variable, value)
        {
            if (Connector.controller.Analytics.isGAUniversalEnabled())
                ga('set', variable, value);
        },

        deleteVariable: function(index) {
            if (Connector.controller.Analytics.isGAClassicEnabled())
                _gaq.push(['_deleteCustomVar', index]);
        },

        trackEvent : function(category, action, label, value) {
            if (Connector.controller.Analytics.isGAClassicEnabled())
                _gaq.push(['_trackEvent', category, action, label, value]);
            else if (Connector.controller.Analytics.isGAUniversalEnabled())
                ga('send', 'event', category, action, label, value);
        }
    },

    init: function() {

        // Scenarios:
        // "Plot X, Plot Y, Plot Color"
        // "Plot button: source"
        // "Plot button: variable"
        this.control('plot', {
            userplotchange: function(window, axis) {
                if (axis.targetId == "xvarselector")
                {
                    if (Ext.isDefined(axis.x)) {
                        Connector.controller.Analytics.trackEvent('Plot', 'Change X source', axis.x.queryName);
                        Connector.controller.Analytics.trackEvent('Plot', 'Change X', axis.x.name);
                    }
                    else {
                        Connector.controller.Analytics.trackEvent('Plot', 'Removed X');
                    }
                }
                else if (axis.targetId == 'yvarselector')
                {
                    Connector.controller.Analytics.trackEvent('Plot', 'Change Y source', axis.y.queryName);
                    Connector.controller.Analytics.trackEvent('Plot', 'Change Y', axis.y.alias);
                }
                else if (axis.targetId == 'colorvarselector')
                {
                    if (Ext.isDefined(axis.color)) {
                        Connector.controller.Analytics.trackEvent('Plot', 'Change color source', axis.color.queryName);
                        Connector.controller.Analytics.trackEvent('Plot', 'Change color', axis.color.alias);
                    }
                    else {
                        Connector.controller.Analytics.trackEvent('Plot', 'Removed color');
                    }
                }
            }
        });

        this.control('signinform', {
            userSignedIn: function() {
                if (Connector.controller.Analytics.isInspectletEnabled())
                    __insp.push(['identify', LABKEY.user.email]);

                if (Connector.controller.Analytics.isGAClassicEnabled())
                {
                    Connector.controller.Analytics.setIndexedVariable(1, 'user', LABKEY.user.userId, 2);
                }
                else if (Connector.controller.Analytics.isGAUniversalEnabled())
                {
                    Connector.controller.Analytics.setVariable('userId', LABKEY.user.userId);
                }
                Connector.controller.Analytics.trackEvent('User', 'Login', LABKEY.user.userId);
            }
        });

        this.control('connectorheader', {
            userLogout: function() {
                Connector.controller.Analytics.deleteVariable(1);
                Connector.controller.Analytics.trackEvent('User', 'Logout', LABKEY.user.userId);
            }
        });

        // Scenarios
        // "Export"
        // "Export: list of source names"
        // "Export: # of columns"
        this.control('groupdatagrid', {
            requestexport: function(view, exportParams) {
                Connector.controller.Analytics.trackEvent('Grid', 'Export', 'Column count', exportParams.columnNames.length);
                var sources = this.getSourcesArray(exportParams.columnNames);
                for (var i = 0; i < sources.length; i++)
                {
                    Connector.controller.Analytics.trackEvent('Grid', 'Export source', sources[i]);
                }
            }
        });

        this.callParent();

        // tracking page views
        this.application.on('route', function(controller, view, viewContext) {
            Connector.controller.Analytics.setVariable('userId', LABKEY.user.userId);
            Connector.controller.Analytics.trackPageview(LABKEY.contextPath + LABKEY.container.path + "/app.view#" + controller);
        });


        // Scenarios
        // "Add filter"
        // "Add filter: filter noun"
        Connector.getState().on('filterchange', function(filters) {
            if (Connector.controller.Analytics.isEnabled())
            {
                Connector.controller.Analytics.trackEvent('Filter', 'Change');
                for (var f = 0; f < filters.length; f++)
                {
                    var members = filters[f].get('members');
                    for (var i = 0; i < members.length; i++)
                    {
                        Connector.controller.Analytics.trackEvent('Filter', 'Add', members[i].uniqueName);
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
                Connector.controller.Analytics.trackEvent('Group', 'Save');
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