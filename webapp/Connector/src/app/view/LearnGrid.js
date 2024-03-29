/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.LearnGrid', {
    extend : 'Ext.grid.Panel',
    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data && (record.data.data_availability || record.data.ni_data_availability || record.data.pub_available_data_count > 0) ? cls + ' detail-row-has-data' : cls;
        },
        overItemCls: 'detail-row-hover',
        selectedItemCls: ''
    },

    normalGridConfig: {},

    lockedViewConfig: {
        overflowY: 'hidden',
        emptyText: ''
    },

    normalViewConfig: {
        overflowY: 'scroll'
    },

    listeners : {},

    initComponent: function () {
        // add additional listeners
        this.listeners.scope = this;
        this.listeners.afterrender = function (cmp) {
            if (!this.isDetailLearnGrid)
                return;

            var detailGridPanel = cmp;

            if (detailGridPanel && cmp.isVisible()) {
                var dimension = detailGridPanel.tabDimension, id = detailGridPanel.tabId,
                        params = detailGridPanel.tabParams;
                this.learnView.activeListingDetailGrid = detailGridPanel;
                this.learnView.activeListingDetailGrid.dimension = dimension;
                this.learnView.activeListingDetailGrid.store.sorters.clear();
                this.learnView.sorterArray = [];
                this.learnView.sortAndFilterStoreDelayed(this.learnView.activeListingDetailGrid.store);
                this.learnView.getHeader().filterStoreFromUrlParams(id, dimension, params);
            }
        };

        this.listeners.beforerender = function (grid) {
            var learnView = this.learnView, tabId = this.tabId;
            var headers = grid.query('headercontainer'),
                    dim = grid.dimension ? grid.dimension.name : undefined;
            Ext.each(headers, function (header) {
                header.on('headertriggerclick', function onTriggerClick(headerCt, column) {
                    var filterConfigSet = column.filterConfigSet
                            .map(function (config) {
                                config.columnFilter = learnView.columnFilters[config.filterField] || {
                                    filterValues: [],
                                    negated: false
                                };
                                return config;
                            });
                    Ext.create('Connector.window.LearnFacet', {
                        dim: dim,
                        tabId: tabId,
                        filterConfigSet: filterConfigSet,
                        col: column, //used to position facet window
                        columnMetadata: column.filterConfigSet.length > 1 ?
                                {caption: 'Search By'} : {caption: column.filterConfigSet[0].title},
                        learnStore: this.store,
                        dataView: this,
                        listeners: {
                            filter: function (columnName, filterValues, negated) {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', columnName, filterValues, negated, this.isDetailLearnGrid);
                            },
                            clearfilter: function (columnName) {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', columnName, [], false, this.isDetailLearnGrid);
                            },
                            scope: this
                        },
                        scope: this
                    });
                    return false;
                }, this);
                header.on('sortchange', function (headerCt, column, direction) {
                    this.learnView.getHeader().fireEvent('updateLearnSort', column.dataIndex, direction, this.isDetailLearnGrid);
                }, this);
            }, this);
        };

        this.listeners.learnGridResizeHeight = function (viewHeight) {
            this.setHeight(viewHeight - this.learnView.headerViews.main.getHeight());
            this.setTitleColumnWidth();
        };

        this.listeners.learnDetailsGridResizeHeight = function (viewHeight) {
            this.setHeight(viewHeight - this.learnView.headerViews.main.getHeight());
        };

        this.listeners.boxready = function (grid) {
            if (!this.isDetailLearnGrid) {
                this.height = grid.container.getHeight() - this.learnView.headerViews.main.getHeight();
                this.setTitleColumnWidth();
            }
        };

        this.listeners.render = function (grid) {
            if (this.isDetailLearnGrid) {
                if (grid.learnView && grid.learnView.detailPageView) {
                    var headerPadding = 28; //.modulecontainercolumn padding top 28
                    this.height = grid.learnView.container.getHeight() - grid.learnView.detailPageView.header.getEl().dom.clientHeight - headerPadding;
                    grid.doLayout();
                }
            }
        };

        this.callParent();
    }
});
