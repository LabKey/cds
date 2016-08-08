Ext.define('Connector.app.view.LearnSummary', {
    extend : 'Ext.grid.Panel',
    viewConfig: {
        stripeRows: false,
        getRowClass: function(record) {
            var cls = 'detail-row';
            return record.data && record.data.data_availability ? cls + ' detail-row-has-data' : cls;
        }
    },
    listeners: {
        beforerender: function (grid)
        {
            var learnView = this.learnView;
            var header = grid.down('headercontainer'), dim = grid.dimension ? grid.dimension.name : undefined;
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
        }
    }
});
