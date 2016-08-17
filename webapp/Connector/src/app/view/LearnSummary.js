Ext.define('Connector.app.view.LearnSummary', {
    extend : 'Ext.grid.Panel',
    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data && record.data.data_availability ? cls + ' detail-row-has-data' : cls;
        }
    },

    lockedViewConfig: {
        emptyText: '' //Explicitly set to blank, otherwise emptyText is set for both locked and unlocked portions.
    },

    listeners: {
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
                                this.learnView.getHeader().fireEvent('updateLearnFilter', columnName, filterValues);
                            },
                            clearfilter: function (columnName)
                            {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', columnName, []);
                            },
                            scope: this
                        },
                        scope: this
                    });
                    return false;
                }, this);
                header.on('sortchange', function (headerCt, column, direction)
                {
                    this.learnView.getHeader().fireEvent('updateLearnSort', column.dataIndex, direction);
                }, this);
            }, this);
        },

        learnGridResizeHeight : function (viewHeight)
        {
            this.setHeight(viewHeight - this.learnView.headerViews.main.height);
        },

        boxready: function(grid)
        {
            this.height = grid.container.getHeight() - this.learnView.headerViews.main.height;
        }
    },

    initComponent : function() {
        this.addEvents("learnGridResizeHeight");

        this.callParent(arguments);
    }
});
