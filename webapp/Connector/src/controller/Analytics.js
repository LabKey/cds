/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Analytics', {

    extend: 'Ext.app.Controller',

    debugMode: false,

    init: function() {

        // protect against debugMode in production
        if (!LABKEY.devMode) {
            this.debugMode = false;
        }

        this._enabled = this.debugMode || (Connector.user.isAnalyticsUser && (this.isGAClassicEnabled() || this.isGAUniversalEnabled()));

        if (this.isEnabled()) {
            if (this.debugMode) {
                console.log('Analytics -> debug mode enabled');
            }
            this._bindControls();
        }

        this.callParent();

        if (this.isEnabled()) {
            this._bindApplication();
            this._bindState();
        }
    },

    _bindApplication : function() {
        // tracking page views
        Connector.getApplication().on('route', function(/* controller, view, viewContext */) {
            this.setVariable('userId', LABKEY.user.userId);
            this.trackPageview(document.URL.replace(window.location.origin, ''));
        }, this);

        // Scenarios
        // "Save"
        // "Save: Boolean for was there a plot?" // TODO how do I determine that there is a plot
        Connector.getApplication().on('groupsaved', function(group, filters) {
            this.trackEvent('Group', 'Save');
        }, this);
    },

    _bindControls : function() {
        // Scenarios:
        // "Plot X, Plot Y, Plot Color"
        // "Plot button: source"
        // "Plot button: variable"
        this.control('plot', {
            userplotchange: function(window, axis) {
                if (axis.targetId == 'xvarselector') {
                    if (Ext.isDefined(axis.x)) {
                        this.trackEvent('Plot', 'Change X source', axis.x.queryName);
                        this.trackEvent('Plot', 'Change X', axis.x.name);
                    }
                    else {
                        this.trackEvent('Plot', 'Removed X');
                    }
                }
                else if (axis.targetId == 'yvarselector') {
                    this.trackEvent('Plot', 'Change Y source', axis.y.queryName);
                    this.trackEvent('Plot', 'Change Y', axis.y.alias);
                }
                else if (axis.targetId == 'colorvarselector') {
                    if (Ext.isDefined(axis.color)) {
                        this.trackEvent('Plot', 'Change color source', axis.color.queryName);
                        this.trackEvent('Plot', 'Change color', axis.color.alias);
                    }
                    else {
                        this.trackEvent('Plot', 'Removed color');
                    }
                }
            }
        });

        this.control('signinform', {
            userSignedIn: function() {
                if (this.isInspectletEnabled()) {
                    __insp.push(['identify', LABKEY.user.email]);
                }

                if (this.isGAClassicEnabled()) {
                    this.setIndexedVariable(1, 'user', LABKEY.user.userId, 2);
                }
                else if (this.isGAUniversalEnabled()) {
                    this.setVariable('userId', LABKEY.user.userId);
                }
                this.trackEvent('User', 'Login', LABKEY.user.userId);
            }
        });

        this.control('connectorheader', {
            userLogout: function() {
                this.deleteVariable(1);
                this.trackEvent('User', 'Logout', LABKEY.user.userId);
            }
        });

        // Scenarios
        // "Export"
        // "Export: list of source names"
        // "Export: # of columns"
        this.control('groupdatagrid', {
            usergridfilter: this.filterEvent,
            requestexport: function(view, exportParams) {
                this.trackEvent('Grid', 'Export', 'Column count', exportParams.columnNames.length);
                var sources = this.getSourcesArray(exportParams.columnNames);
                for (var i = 0; i < sources.length; i++) {
                    this.trackEvent('Grid', 'Export source', sources[i]);
                }
            }
        });
    },

    _bindState : function() {
        // Scenarios
        // "Add filter"
        // "Add filter: filter noun"
        Connector.getState().on('selectionToFilter', this.filterEvent, this);
    },

    filterEvent : function(filters) {
        var filter,
            members,
            measure,
            values,
            value,
            queryService = Connector.getService('Query'),
            f, i;

        // normally, this is one filter
        for (f = 0; f < filters.length; f++) {
            filter = filters[f];
            if (filter.isGrid() || filter.isPlot()) {
                // plot / grid
                members = filter.get('gridFilter');
                values = {};

                for (i = 0; i < members.length; i++) {
                    measure = queryService.getMeasure(members[i].getColumnName());
                    if (measure) {
                        value = (Ext.isDefined(measure.sourceTitle) ? measure.sourceTitle : measure.queryName);
                        value += '.' + (Ext.isDefined(measure.label) ? measure.label : measure.name);
                        values[value] = true;
                    }
                }

                var keys = Object.keys(values);
                for (i = 0; i < keys.length; i++) {
                    this.trackEvent('Filter', 'Add', filter.isPlot() ? 'Plot' : 'Grid', keys[i]);
                }
            }
            else {
                // olap
                members = filter.get('members');
                for (i = 0; i < members.length; i++) {
                    this.trackEvent('Filter', 'Add', 'Find Subjects', members[i].uniqueName);
                }
            }
        }
    },

    isInspectletEnabled : function() {
        // This variable is defined in the inspectlet snippet
        return Ext.isDefined(window.__insp);
    },

    isGAClassicEnabled : function() {
        // This variable is defined in the GA snippet
        return Ext.isDefined(window._gaq);
    },

    isGAUniversalEnabled : function() {
        // This variable is defined in the GA snippet
        return Ext.isDefined(window.ga);
    },

    isEnabled : function() {
        return this._enabled;
    },

    trackPageview : function(path) {
        if (this.debugMode) {
            console.log('Analytics -> trackPageview:', path);
        }
        if (this.isGAClassicEnabled()) {
            _gaq.push(['_trackPageview', path]);
        }
        else if (this.isGAUniversalEnabled()) {
            ga('send', 'pageview', path);
        }
    },

    setIndexedVariable : function(index, value, key, scope) {
        if (this.isGAClassicEnabled()) {
            _gaq.push(['_setCustomVar', index, key, value, scope]);
        }
        //else if (this.isGAUniversalEnabled())
        //    ga('set', 'dimension' + index, value);
    },

    setVariable : function(variable, value) {
        if (this.isGAUniversalEnabled()) {
            ga('set', variable, value);
        }
    },

    deleteVariable : function(index) {
        if (this.isGAClassicEnabled()) {
            _gaq.push(['_deleteCustomVar', index]);
        }
    },

    trackEvent : function(category, action, label, value) {
        if (this.debugMode) {
            console.log('Analytics -> trackEvent (' + category + ':' + action + ')', label, value);
        }
        if (this.isGAClassicEnabled()) {
            _gaq.push(['_trackEvent', category, action, label, value]);
        }
        else if (this.isGAUniversalEnabled()) {
            ga('send', 'event', category, action, label, value);
        }
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