/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.controller.FilterStatus', {

    extend: 'Connector.controller.AbstractViewController',

    requires: ['Ext.panel.Panel'],

    stores: ['FilterStatus'],

    views: ['DetailStatus', 'FilterSave', 'FilterStatus', 'InfoPane'],

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

        this.control('selectionstatus > dataview', {
            itemclick : this.onSelectionClick
        });

        this.control('selectionview', {
            operatorchange : function(config) {
                this.getStateManager().setFilterOperator(config.filterId, config.value);
            }
        });

        this.control('#selection-panel > container > selectionview', {
            removefilter : function(filterId, hName, uniqueName) {
                this.getStateManager().removeSelection(filterId, hName, uniqueName);
            },

            removeplotselection : function(filterId, measureIdx) {
                this.getStateManager().fireEvent('plotselectionremoved', filterId, measureIdx);
            }
        });

        this.control('#filter-panel > container > selectionview', {
            removefilter : function(filterId, hName, uniqueName) {
                this.getStateManager().removeFilter(filterId, hName, uniqueName);
            },

            removeplotselection : function(filterId, measureIdx) {
                this.getStateManager().removeFilter(filterId);
            }
        });

        this.control('filterstatus', {
            requestundo : function() {
                this.getStateManager().requestFilterUndo();
            }
        });

        this.control('filtersave > form > toolbar > #cancelsave', {
            click : this.onFilterCancel
        });

        this.control('filterpanel > container > #clear', {
            click : this.onFilterClear
        });

        this.control('filterpanel > toolbar > #sClear', {
            click : this.onSelectionClear
        });

        this.control('#overlap', {
            click : this.runSelectToFilterAnimation
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

        this.callParent();
    },

    getStateStore : function() {
        var store = this.getStore('FilterStatus');
        store.state = this.getStateManager();
        return store;
    },

    createDetail : function() {
        var store = this.getStateStore();
        store.load();

        var view = Ext.create('Connector.view.DetailStatus', {
            store: store
        });

        this.getViewManager().on('afterchangeview', function(controller, view) {
            store.clearFilter();
            if (view !== 'plot' && view !== 'datagrid') {
                store.filter('dataBasedCount', false);
            }
        }, this);

        return view;
    },

    onDetailSelect : function(view, detail) {
        this.showFilterEditor(detail);
    },

    showFilterEditor : function(filterOrDetail) {
        var container = Ext.ComponentQuery.query('app-main > #eastview > #navfilter > #filterstatuscontainer');
        if (Ext.isArray(container)) {
            container = container[0];
        }

        if (container) {

            var config = {
                olapProvider: this.getStateManager()
            };

            if (filterOrDetail.$className === "Connector.model.Detail") {
                config.dimensionUniqueName = filterOrDetail.get('dimension');
                config.hierarchyUniqueName = filterOrDetail.get('hierarchy');
            }
            else if (filterOrDetail.$className === "Connector.model.Filter") {
                var filter = filterOrDetail;
                if (filter.isGrid() || filter.isPlot() || filter.isGroup()) {
                    console.log('Plot/Grid/Group filters not yet supported.');
                    return;
                }
                else {
                    config.filter = filter;
                }
            }

            var hidden = [];
            Ext.iterate(container.items.map, function(componentId, component) {
                if (component.$className === 'Connector.view.InfoPane') {
                    container.remove(component, true);
                }
                else {
                    component.hide();
                    hidden.push(componentId);
                }
            });

            container.add({
                xtype: 'infopane',
                model: Ext.create('Connector.model.InfoPane', config),
                listeners: {
                    hide: {
                        fn: function(ip) {
                            Ext.each(hidden, function(cid) {
                                var h = Ext.getCmp(cid);
                                if (h) {
                                    h.show();
                                }
                            });
                            ip.hide();
                        },
                        scope: this,
                        single: true
                    }
                }
            });
        }
    },

    createFilterStatus : function() {
        var store = this.getStateStore();
        var state = this.getStateManager();
        store.load();

        var view = Ext.create('Connector.view.FilterStatus', {
            store: store,
            selections: state.getSelections(),
            filters: state.getFilters()
        });

        state.on('filtercount', view.onFilterChange, view);
        state.on('filterchange', view.onFilterChange, view);
        state.on('filterremove', view.onFilterRemove, view);
        state.on('selectionchange', view.onSelectionChange, view);

        this.getViewManager().register(view);
        this.getViewManager().getEast().on('tabchange', function() { view.hideMessage(false); }, this);
        this.getViewManager().on('afterchangeview', function() { view.hideMessage(false); }, this);

        return view;
    },

    runSelectToFilterAnimation : function(b) {
        this.getStateManager().moveSelectionToFilter();
//        var p = b.up('panel');
//        var me = this;
//        p.dockedItems.items[0].getEl().fadeOut();
//        Ext.get(Ext.query('.header', p.getEl().id)[0]).fadeOut({
//            listeners : {
//                afteranimate : function(){
//                    p.getEl().slideOut('t', {
//                        duration  : 250,
//                        listeners : {
//                            afteranimate : function() {
//                                p.dockedItems.items[0].getEl().fadeIn();
//                                me.getStateManager().moveSelectionToFilter();
//                            },
//                            scope : p
//                        }
//                    });
//                },
//                scope: p
//            }
//        });
    },

    createView : function(xtype, context) {

        var v; // the view instance to be created

        if (xtype == 'filterstatus') {
            v = this.createFilterStatus();
        }

        if (xtype == 'filtersave') {
            v = Ext.create('Connector.view.FilterSave', {
                flex : 1
            });
        }

        return v;
    },

    updateView : function(xtype, context) { },

    onFilterCancel : function() {
        this.getViewManager().hideView('filtersave');
    },

    onFilterClear : function() {
        var state = this.getStateManager();
        if (state.hasFilters()) {
            state.clearFilters();

            // want to show the message on the view
            var view = this.getViewManager().getViewInstance('filterstatus');
            if (view) {
                view.showUndoMessage();
            }
        }
    },

    onFilterSave : function() {
        this.getViewManager().showView('filtersave');
    },

    onSelectionClick : function() {
        this.getStateManager().clearSelections();
    },

    onSelectionClear : function() {
        this.getStateManager().clearSelections();
    }
});
