/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.FilterStatus', {

    extend: 'Connector.controller.AbstractViewController',

    requires: ['Ext.panel.Panel'],

    stores: ['FilterStatus'],

    views: ['DetailStatus', 'FilterStatus', 'InfoPane', 'PlotPane'],

    init : function() {

        this.control('app-main > #eastview > #navfilter', {
            afterrender : function(navfilter) {
                var container = Ext.create('Ext.container.Container', {
                    itemId: 'filterstatuscontainer',
                    style: 'overflow-y: auto; overflow-x: hidden;',
                    flex: 1,
                    items: [
                        this.createFilterStatus(),
                        this.createDetail()
                    ]
                });
                navfilter.add(container);
            }
        });

        this.control('selectionview', {
            operatorchange : function(config) {
                Connector.getState().setFilterOperator(config.filterId, config.value);
            }
        });

        this.control('#selection-panel > container > selectionview', {
            removefilter : function(filterId, hName, uniqueName) {
                Connector.getState().removeSelection(filterId, hName, uniqueName);
            },

            removeplotselection : function(filterId, measureIdx) {
                Connector.getState().fireEvent('plotselectionremoved', filterId, measureIdx);
            }
        });

        this.control('#filter-panel > container > selectionview', {
            removefilter : function(filterId, hName, uniqueName) {
                Connector.getState().removeFilter(filterId, hName, uniqueName);
            },

            removeplotselection : function(filterId, measureIdx) {
                Connector.getState().removeFilter(filterId);
            }
        });

        this.control('filterstatus', {
            requestundo : function() {
                Connector.getState().requestFilterUndo();
            }
        });

        this.control('filterstatus > container > #clear', {
            click : this.onFilterClear
        });

        this.control('#overlap', {
            click : this.runSelectToFilterAnimation
        });

        this.control('#inverse', {
            click : this.runInverseSelectToFilterAnimation
        });

        this.control('detailstatus', {
            itemclick: this.onDetailSelect
        });

        this.control('#infosortdropdown', {
            click: function(btn) { btn.showMenu(); }
        });

        this.control('selectionview', {
            itemselect : function(view, filter) {
                this.showFilterEditor(filter);
            }
        });

        this.control('plot', {
            plotdatarequest: this.onPlotDataRequest
    });

        this.callParent();
    },

    createDetail : function() {
        var store = this.getStore('FilterStatus');
        store.load();

        var view = Ext.create('Connector.view.DetailStatus', {
            store: store
        });

        this.getViewManager().on('afterchangeview', function(controller, view)
        {
            store.clearFilter();

            // if we are not on the plot view, hide the plot based counts from the info pane
            if (view !== 'plot')
            {
                store.filter('plotBasedCount', false);
            }
        }, this);

        return view;
    },

    onDetailSelect : function(view, detail) {
        if (detail.get('activeCountLink') === true) {
            this.showFilterEditor(detail);
        }
    },

    showFilterEditor : function(filterOrDetail) {

        var parent = Ext.ComponentQuery.query('app-main > #eastview > #navfilter');
        if (Ext.isArray(parent)) {
            parent = parent[0];
        }

        if (parent) {

            //
            // configure info pane view
            //

            var clazz = 'Connector.view.InfoPane',
                config = {
                    dimension: filterOrDetail.get('dimension'),
                    hierarchy: filterOrDetail.get('hierarchy'),
                    level: filterOrDetail.get('level')
                },
                params = {
                    data: filterOrDetail.get('dataRows')
                };

            if (filterOrDetail.$className === 'Connector.model.Filter')
            {

                if (filterOrDetail.isGrid() || filterOrDetail.isAggregated()) {
                    clazz = 'Connector.view.GridPane';
                }
                else if (filterOrDetail.isPlot()) {
                    clazz = 'Connector.view.PlotPane';
                }

                config.filter = filterOrDetail;
            }
            else if (filterOrDetail.get('infoPaneViewClass'))
            {
                clazz = filterOrDetail.get('infoPaneViewClass');
            }

            //
            // prepare layout
            //
            var statusContainer = parent.getComponent('filterstatuscontainer');
            if (statusContainer) {
                statusContainer.hide();
            }

            var infoPane = Ext.create(clazz, {
                model: Ext.create('Connector.model.InfoPane', config),
                params: params,
                listeners: {
                    hide: {
                        fn: this.resetInfoPane,
                        scope: this,
                        single: true
                    }
                }
            });

            parent.add(infoPane);
        }
    },

    resetInfoPane : function(infoPane) {

        if (infoPane) {
            infoPane.hide();
            if (infoPane.up())
                infoPane.up().remove(infoPane);
        }

        var parent = Ext.ComponentQuery.query('app-main > #eastview > #navfilter > #filterstatuscontainer');
        if (parent && parent.length > 0) {
            parent[0].show();
        }
    },

    createFilterStatus : function() {
        var store = this.getStore('FilterStatus');
        var state = Connector.getState();
        store.load();

        var view = Ext.create('Connector.view.FilterStatus', {
            store: store,
            selections: state.getSelections(),
            filters: state.getFilters()
        });

        state.on('filtercount', view.onFilterCount, view);
        state.on('filterchange', view.onFilterChange, view);
        state.on('filterremove', view.onFilterRemove, view);
        state.on('selectionchange', view.onSelectionChange, view);

        this.getViewManager().register(view);
        this.getViewManager().getEast().on('tabchange', view.onAfterViewChange, view);
        this.getViewManager().on('beforechangeview', view.onBeforeViewChange, view);
        this.getViewManager().on('afterchangeview', view.onAfterViewChange, view);

        return view;
    },

    runSelectToFilterAnimation : function() {
        Connector.getState().moveSelectionToFilter();
    },

    runInverseSelectToFilterAnimation : function() {
        Connector.getState().inverseSelection();
        Connector.getState().moveSelectionToFilter();
    },

    createView : function(xtype, context) {

        var v; // the view instance to be created

        if (xtype == 'filterstatus') {
            v = this.createFilterStatus();
        }

        return v;
    },

    updateView : function(xtype, context) { },

    onFilterClear : function() {
        var state = Connector.getState(),
            hasFilters = state.hasFilters();

        if (state.hasSelections()) {
            // if we have both selections and filters, roll-up into one state update
            state.clearSelections(hasFilters /* skipState */);
        }
        if (hasFilters) {
            state.clearFilters();

            // only show undo if clear filters
            var view = this.getViewManager().getViewInstance('filterstatus');
            if (view) {
                view.showUndoMessage();
            }
        }
    },

    onPlotDataRequest : function(view, measures, includesSelections)
    {
        var store = this.getStore('FilterStatus');

        if (Ext.isArray(measures))
        {
            // Request distinct timepoint information for info pane plot counts or subcounts
            LABKEY.Query.executeSql({
                schemaName: 'study',
                sql: QueryUtils.getDistinctTimepointSQL({measures: measures}),
                scope: this,
                success: function(data)
                {
                    store.updatePlotRecordCount('Timepoints', data.rows, includesSelections);
                }
            });
        }
        else
        {
            store.updatePlotRecordCount('Timepoints',  undefined, includesSelections);
        }
    }
});
