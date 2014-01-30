Ext.define('Connector.controller.Navigation', {

    extend : 'Connector.controller.AbstractViewController',

    views : ['Navigation'],

    init : function() {

        this.control('app-main > #eastview > #navfilter > navigation > dataview', {
            itemclick : function(v, rec) {
                var xtype = rec.data.value;
                if (this.getViewManager().isRegistered(xtype)) {
                    this.getViewManager().changeView(xtype);
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
                return;
            }
            console.warn('Active view not available to navigation. Ensure that Connector.changeView is used to see view.');
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

    onViewChange : function(xtype) {
        this.active = xtype;
        this.markActiveSelection();
    }
});
