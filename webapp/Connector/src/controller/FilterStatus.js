/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.FilterStatus', {

    extend: 'Connector.controller.AbstractViewController',

    requires: ['Ext.panel.Panel'],

    stores: ['FilterStatus', 'MabStatus'],

    views: ['DetailStatus', 'FilterStatus', 'InfoPane', 'MabPane', 'MabStatus', 'PlotPane'],

    isService: true,

    activeContainer: 'filterstatuscontainer',

    containers: {},

    hasActivePane: false,

    init : function() {

        this.control('app-main > #eastview > #navfilter', {
            afterrender : function(navfilter) {
                this._registerContainers('filterstatuscontainer', 'mabstatuscontainer');

                navfilter.add({
                    xtype: 'container',
                    itemId: 'filterstatuscontainer',
                    style: 'overflow-y: auto; overflow-x: hidden;',
                    flex: 1,
                    items: [
                        this.createFilterStatus(),
                        this.createDetail()
                    ]
                },{
                    xtype: 'container',
                    itemId: 'mabstatuscontainer',
                    hidden: true, // will display on view activation
                    style: 'overflow-y: auto; overflow-x: hidden;',
                    flex: 1,
                    items: [
                        this.createMabStatus(),
                        this.createMabDetail()
                    ]
                });
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

        this.control('mabstatus', {
            requestundo : function() {
                Connector.getState().requestFilterUndo(true);
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

        this.control('selectionview', {
            itemselect : function(view, filter) {
                this.showPane(filter);
            }
        });

        this.control('plot', {
            maskplotrecords: this.onMaskPlotRecords,
            unmaskplotrecords: this.onUnmaskPlotRecords,
            updateplotrecord: this.onUpdatePlotRecord
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

    activateContainer : function(id) {
        this.activeContainer = id;

        if (!this.hasActivePane) {

            this.hideContainers();

            var status = Ext.ComponentQuery.query('#' + id);

            if (status && status.length > 0) {
                status[0].show();
            }
        }
    },

    activatePane : function(pane) {

        var parent = Ext.ComponentQuery.query('app-main > #eastview > #navfilter');
        if (Ext.isArray(parent)) {
            parent = parent[0];
        }

        if (parent) {

            this.hasActivePane = true;

            this.hideContainers();

            parent.add(pane);
        }
    },

    createMabDetail : function() {
        var store = this.getStore('MabStatus');
        store.load();

        return Ext.create('Connector.view.DetailStatus', {
            isMab: true,
            store: store,
            filterChange : function() {
                // skip subject filter change
            }
        });
    },

    createMabStatus : function() {
        var view = Ext.create('Connector.view.MabStatus', { });
        var state = Connector.getState();
        state.on('mabfilterchange', view.onMabFilterChange, view);
        state.on('mabselectionchange', view.onMabSelectionChange, view);
        state.on('mabfilterclear', view.onFilterRemove, view);
        this.getViewManager().register(view);
        this.getViewManager().on('afterchangeview', view.onAfterViewChange, view);

        return view;
    },

    hideContainers : function() {

        var parent = Ext.ComponentQuery.query('app-main > #eastview > #navfilter');
        if (Ext.isArray(parent)) {
            parent = parent[0];
        }

        if (parent) {
            Ext.iterate(this.containers, function(itemId) {
                var cmp = parent.getComponent(itemId);
                if (cmp) {
                    cmp.hide();
                }
            });
        }
    },

    onDetailSelect : function(view, detail) {
        if (detail.get('activeCountLink') === true && detail.get('count') !== -1) {
            if (Ext.isString(detail.get('activeCountEvent'))) {
                this.application.fireEvent(detail.get('activeCountEvent'), detail);
            }
            else {
                this.showPane(detail);
            }
        }
    },

    showPane : function(filterOrDetail) {

        //
        // configure info pane view
        //

        var viewClazz = 'Connector.view.InfoPane',
            modelClazz = 'Connector.model.InfoPane',
            config = filterOrDetail.getData(),
            storeRecord;

        if (filterOrDetail.$className === 'Connector.model.Filter') {
            if (filterOrDetail.isTime() && !filterOrDetail.isPlot()) {
                // Time point filter, not study axis plot time range filter

                viewClazz = 'Connector.view.TimepointPane';
                modelClazz = 'Connector.model.TimepointPane';

                // we will want to get the Time point info pane members from the store record,
                // so we will need to include the measureSet and membersWithData
                storeRecord = this.getStore('FilterStatus').getById('Time points');
                if (storeRecord != null) {
                    config.measureSet = storeRecord.get('measureSet');
                    config.membersWithData = storeRecord.get('membersWithData');
                }

                // if we don't have the defined measuresSet or this is an alignment column,
                // we don't want to show the TimepointPane since we won't know how to get the distinct timepoint members
                var filterTimeMeasure = filterOrDetail.get('timeMeasure') || filterOrDetail.timeMeasure;
                if (!Ext.isArray(config.measureSet) || (filterTimeMeasure.dateOptions && filterTimeMeasure.dateOptions.zeroDayVisitTag)) {
                    return;
                }
            }
            else if (filterOrDetail.isGrid() || filterOrDetail.isAggregated()) {
                viewClazz = 'Connector.view.GridPane';
            }
            else if (filterOrDetail.isPlot()) {
                viewClazz = 'Connector.view.PlotPane';
            }

            config.filter = filterOrDetail;
        }
        else if (Ext.isString(filterOrDetail.get('viewClass'))) {
            viewClazz = filterOrDetail.get('viewClass');
        }

        // allow the detail model object to define an alternate model class
        if (Ext.isString(filterOrDetail.get('modelClass'))) {
            modelClazz = filterOrDetail.get('modelClass');
        }

        var infoPane = Ext.create(viewClazz, {
            model: Ext.create(modelClazz, config),
            listeners: {
                hide: {
                    fn: this.onClosePane,
                    scope: this,
                    single: true
                }
            }
        });

        this.activatePane(infoPane);
    },

    onClosePane : function(pane) {

        if (pane) {
            pane.hide();
            if (pane.up()) {
                pane.up().remove(pane);
            }
        }

        this.hasActivePane = false;

        this.activateContainer(this.activeContainer);
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

        if (xtype === 'filterstatus') {
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

    onMaskPlotRecords : function() {
        this.getStore('FilterStatus').fireEvent('showplotmask');
    },

    onUnmaskPlotRecords : function() {
        this.getStore('FilterStatus').fireEvent('hideplotmask');
    },

    onUpdatePlotRecord : function(view, label, forSubcount, countValue, measureSet, membersWithData) {
        this.getStore('FilterStatus').updatePlotRecordCount(label, forSubcount, countValue, measureSet, membersWithData);
    },

    _registerContainers : function() {
        for (var i=0; i < arguments.length; i++) {
            this.containers[arguments[i]] = true;
        }
    }
});
