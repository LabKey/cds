Ext.define('Connector.app.view.LearnSummary', {
    extend : 'Ext.grid.Panel',
    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data && record.data.data_availability ? cls + ' detail-row-has-data' : cls;
        }
    },
    forceFit: true,

    listeners: {
        beforerender: function (grid)
        {
            var learnView = this.learnView;
            var headers = grid.query('headercontainer'),
                dim = grid.dimension ? grid.dimension.name : undefined;
            Ext.each(headers, function(header) {
                header.on('headertriggerclick', function onTriggerClick(headerCt, column)
                {
                    var field = column.filterConfig.filterField;
                    Ext.create('Connector.window.LearnFacet', {
                        dim: dim,
                        filterConfig: column.filterConfig,
                        col: column,
                        columnMetadata: {caption : column.filterConfig.title},
                        learnStore: this.store,
                        dataView: this,
                        filterValues: learnView.columnFilters[field] ? learnView.columnFilters[field] : [],
                        listeners: {
                            filter: function (filterValues)
                            {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', field, filterValues);
                            },
                            clearfilter: function ()
                            {
                                this.learnView.getHeader().fireEvent('updateLearnFilter', field, []);
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
