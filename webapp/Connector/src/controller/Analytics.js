/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Analytics', {

    extend: 'Ext.app.Controller',

    debugMode: false,

    statics: {
        onMailRequest : function() {
            Connector.getApplication().getController('Analytics').onMailTo();
        }
    },

    init: function() {

        // protect against debugMode in production
        if (!LABKEY.devMode) {
            this.debugMode = false;
        }

        this._enabled = this.debugMode || (Connector.user.isAnalyticsUser && this.isGAUniversalEnabled());

        // setup inspectlet session
        if (Connector.user.isAnalyticsUser && this.isInspectletEnabled()) {
            __insp.push(['identify', LABKEY.user.email]);
        }

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
        Connector.getApplication().on('route', function() {
            this.setVariable('userId', LABKEY.user.id);
            this.trackPageview(document.URL.replace(window.location.origin, ''));
        }, this);

        var containsPlotCheck = function(filters) {
            var savedPlot = false;
            Ext.each(filters, function(filter) {
                if (filter.isPlot === true) {
                    savedPlot = true;
                    return false;
                }
            });
            return savedPlot;
        };

        // Scenarios
        // "Save"
        // "Save: Boolean for was there a plot?"
        Connector.getApplication().on('groupsaved', function(group, filters) {
            // TODO: Add event for mailto request
            this.trackEvent('Group', 'Save', 'Contains plot (' + containsPlotCheck(filters) + ')');
        }, this);

        // Scenarios
        // "Access saved group"
        Connector.getApplication().on('grouploaded', function(group, filters) {
            this.trackEvent('Group', 'Load', 'Contains plot (' + containsPlotCheck(filters) + ')');
        }, this);
    },

    _bindControls : function() {
        // Scenarios:
        // "Plot X, Plot Y, Plot Color"
        // "Plot button: source"
        // "Plot button: variable"
        this.control('plot', {
            userplotchange: this.onPlotMeasureSelected
        });

        this.control('connectorheader', {
            userLogout: function() {
                this.trackEvent('User', 'Logout', LABKEY.user.id);
            }
        });

        // Scenarios
        // "Export"
        // "Export: list of source names"
        // "Export: # of columns"
        this.control('groupdatagrid', {
            measureselected: this.onGridMeasureSelected,
            requestexport: function(view, exportParams) {
                var columns = exportParams.columnNames,
                    sources = this.getSourcesArray(columns);

                this.trackEvent('Grid', 'Export', 'Column count', columns.length);

                for (var i = 0; i < sources.length; i++) {
                    this.trackEvent('Grid', 'Export source', sources[i]);
                }

                for (i = 0; i < columns.length; i++) {
                    this.trackEvent('Grid', 'Export column', columns[i]);
                }
            },
            usergridfilter: this.filterEvent
        });
    },

    _bindState : function() {
        // Scenarios
        // "Add filter"
        // "Add filter: filter noun"
        Connector.getState().on('selectionToFilter', this.filterEvent, this);
    },

    onGridMeasureSelected : function(selectedMeasures) {
        var sources = {};

        Ext.each(selectedMeasures, function(measure) {
            if (measure) {
                if (measure.get('queryName')) {
                    sources[measure.get('queryName')] = true;
                }
                this.trackEvent('Grid', 'Change column', measure.get('alias'));
                this.trackEvent('Grid', 'Chose recommended', measure.get('isRecommendedVariable') === true);
            }
        }, this);

        Ext.iterate(sources, function(source) {
            this.trackEvent('Grid', 'Change column source', source);
        }, this);
    },

    onPlotMeasureSelected : function(window, axis) {
        if (axis.targetId == 'xvarselector') {
            if (Ext.isDefined(axis.x)) {
                this.trackEvent('Plot', 'Change X source', axis.x.queryName);
                this.trackEvent('Plot', 'Change X', axis.x.name);
                this.trackEvent('Plot', 'Chose recommended', axis.x.isRecommendedVariable === true);
            }
            else {
                this.trackEvent('Plot', 'Removed X');
            }
        }
        else if (axis.targetId == 'yvarselector') {
            if (Ext.isDefined(axis.y)) {
                this.trackEvent('Plot', 'Change Y source', axis.y.queryName);
                this.trackEvent('Plot', 'Change Y', axis.y.alias);
                this.trackEvent('Plot', 'Chose recommended', axis.y.isRecommendedVariable === true);
            }
            else {
                this.trackEvent('Plot', 'Removed Y');
            }
        }
        else if (axis.targetId == 'colorvarselector') {
            if (Ext.isDefined(axis.color)) {
                this.trackEvent('Plot', 'Change color source', axis.color.queryName);
                this.trackEvent('Plot', 'Change color', axis.color.alias);
                this.trackEvent('Plot', 'Chose recommended', axis.color.isRecommendedVariable === true);
            }
            else {
                this.trackEvent('Plot', 'Removed color');
            }
        }
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
                    if (members[i] && members[i] != '_null') {
                        measure = queryService.getMeasure(members[i].getColumnName());
                        if (measure) {
                            value = measure.alias;
                            values[value] = measure.isRecommendedVariable === true;
                        }
                    }
                }

                var keys = Object.keys(values);
                for (i = 0; i < keys.length; i++) {
                    value = (filter.isPlot() ? 'Plot' : 'Grid') + ': ' + keys[i];
                    this.trackEvent('Filter', 'Add', value);
                    this.trackEvent('Filter', 'Filter recommended', values[keys[i]]);
                }
            }
            else {
                // olap
                members = filter.get('members');
                for (i = 0; i < members.length; i++) {
                    value = 'Find Subjects: ' + members[i].uniqueName;
                    this.trackEvent('Filter', 'Add', value);
                }
            }
        }
    },

    isInspectletEnabled : function() {
        // This variable is defined in the inspectlet snippet
        return Ext.isDefined(window.__insp);
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
            console.log('Analytics -> trackPageview\npath:', path);
        }
        if (this.isGAUniversalEnabled()) {
            ga('send', 'pageview', path);
        }
    },

    setVariable : function(variable, value) {
        if (this.isGAUniversalEnabled()) {
            ga('set', variable, value);
        }
    },

    trackEvent : function(category, action, label, value) {
        if (this.debugMode) {
            console.log('Analytics -> trackEvent\ncategory: ' + category + '\naction: ' + action + '\nlabel: ' + label + '\nvalue: ' + value);
        }
        if (this.isGAUniversalEnabled()) {
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
    },

    onMailTo : function() {
        if (this.isEnabled()) {
            this.trackEvent('Support', 'Contact team', 'MailTo');
        }
    }
});