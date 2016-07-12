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
            var header = grid.down('headercontainer'), dim = grid.dimension ? grid.dimension.name : undefined;
            //TODO
            //header.on('headertriggerclick', function onTriggerClick(headerCt, column)
            //{
            //    Ext.create('Connector.window.LearnFacet', {
            //        dim: dim,
            //        filterConfig: column.filterConfig,
            //        col: column,
            //        columnMetadata: {caption : column.filterConfig.title},
            //        learnStore: this.store,
            //        dataView: this,
            //        listeners: {
            //            filter: function (filterValues)
            //            {
            //                this.learnView.getHeader().fireEvent('updateLearnFilter', dim, column.filterConfig.filterField, filterValues);
            //            },
            //            clearfilter: function ()
            //            {
            //                this.learnView.getHeader().fireEvent('removeLearnFilter', dim, column.filterConfig.filterField);
            //            },
            //            scope: this
            //        },
            //        scope: this
            //    });
            //    return false;
            //}, this);
            header.on('sortchange', function (headerCt, column, direction)
            {
                this.learnView.getHeader().fireEvent('updateLearnSort', dim, column.filterConfig.filterField, direction);
            }, this);
        }
    }
});
