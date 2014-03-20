/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.Navigation', {

    extend : 'Connector.controller.AbstractViewController',

    views : ['Navigation'],

    init : function() {

        // Since the Connector.panel.Header does not have its own controller this controller is provided.
        this.control('connectorheader', {
            // See Connector.panel.Header event 'headerclick'.
            headerclick : function() {
                this.getViewManager()._changeView('summary');
            }
        });

        this.control('app-main > #eastview > #navfilter > navigation > dataview', {
            itemclick : function(v, rec) {
                var controller = rec.get('controller');
                if (controller) {
                    this.getViewManager()._changeView(controller);
                }
            }
        });

        this.control('app-main > panel > #summarynav > dataview', {
            afterrender : function(nav) {
                if (!this.summaryFilters)
                    this.summaryFilters = [];
                this.nav = nav;
                this.nav.on('selectionchange', this.onSelectionChange, this);
            }
        });

        this.control('#primarynav', {
            afterrender : function(n) {
                this.primaryNav = n;
                this.markActiveSelection();
            }
        });

        this.getViewManager().on('afterchangeview', this.onViewChange, this);
        this.getStateManager().on('filterchange', this.onFilterChange, this);
    },

    createView : function(xtype, context) { },

    updateView : function(xtype, context) { },

    markActiveSelection : function() {
        if (this.primaryNav) {
            if (this.active) {
                this.primaryNav.getNavigationView().selectByView(this.active, 2);
            }
        }
    },

    onFilterChange : function(filters) {
        this.summaryFilters = filters;
    },

    onSelectionChange : function(view, recs) {
        if (recs.length > 0) {

            var sview = this.getViewManager().getViewInstance('summary');
            if (sview) {
                var state = this.getStateManager();
                state.removePrivateSelection('groupselection');

                if (recs[0].data.value == 1) // All Subjects -- reset to default
                {
                    sview.getSummaryDataView().getStore().setFilterSet(['statefilter']);
                    var f = state.getFilters();
                    if (f && f.length > 0)
                        this.summaryFilters = state.getFilters();
                    state.clearFilters();
                }
                else if (this.summaryFilters.length > 0)// Active Filters
                {
                    state.setFilters(this.summaryFilters);
                }
                else // Active Filters -- without summaryFilters initialized, default to 'statefilter'
                {
                    var s = sview.getSummaryDataView().getStore();
                    s.setFilterSet(['statefilter']);
                    s.load();
                }
            }
        }
    },

    onViewChange : function(controller, view, viewContext, title, skipState) {
        this.active = controller;
        this.markActiveSelection();
    }
});
