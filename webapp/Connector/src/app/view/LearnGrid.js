/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.view.LearnGrid', {
    extend : 'Ext.grid.Panel',
    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data && record.data.data_availability ? cls + ' detail-row-has-data' : cls;
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

    listeners: {
        afterrender: function (cmp)
        {
            if (!this.isDetailLearnGrid)
                return;

            var detailGridPanel = cmp;

            if (detailGridPanel)
            {
                var dimension = detailGridPanel.tabDimension, id = detailGridPanel.tabId, params = detailGridPanel.tabParams;
                this.learnView.activeListingDetailGrid = detailGridPanel;
                this.learnView.activeListingDetailGrid.dimension = dimension;
                this.learnView.activeListingDetailGrid.store.sorters.clear();
                this.learnView.sorterArray = [];
                this.learnView.sortAndFilterStore(this.learnView.activeListingDetailGrid.store);
                this.learnView.getHeader().filterStoreFromUrlParams(id, dimension, params);
            }
        },
        beforerender: function (grid)
        {
            var learnView = this.learnView;
            var headers = grid.query('headercontainer'),
                    dim = grid.dimension ? grid.dimension.name : undefined;
            Ext.each(headers, function(header) {
                header.on('headertriggerclick', function onTriggerClick(headerCt, column)
                {
                    var filterConfigSet = column.filterConfigSet
                            .map(function(config) {
                                config.filterValues = learnView.columnFilters[config.filterField] || [];
                                return config;
                            });
                    Ext.create('Connector.window.LearnFacet', {
                        dim: dim,
                        filterConfigSet: filterConfigSet,
                        col: column, //used to position facet window
                        columnMetadata: column.filterConfigSet.length > 1 ?
                        {caption : 'Search By'} : {caption : column.filterConfigSet[0].title},
                        learnStore: this.store,
                        dataView: this,
                        listeners: {
                            filter: function (columnName, filterValues)
                            {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', columnName, filterValues, this.isDetailLearnGrid);
                            },
                            clearfilter: function (columnName)
                            {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', columnName, [], this.isDetailLearnGrid);
                            },
                            scope: this
                        },
                        scope: this
                    });
                    return false;
                }, this);
                header.on('sortchange', function (headerCt, column, direction)
                {
                    this.learnView.getHeader().fireEvent('updateLearnSort', column.dataIndex, direction, this.isDetailLearnGrid);
                }, this);
            }, this);
        },

        learnGridResizeHeight : function (viewHeight)
        {
            this.setHeight(viewHeight - this.learnView.headerViews.main.height);
            this.setTitleColumnWidth();
        },

        boxready: function(grid)
        {
            if (this.isDetailLearnGrid)
                return;
            this.height = grid.container.getHeight() - this.learnView.headerViews.main.height;
            this.setTitleColumnWidth();
        }
    }
});
