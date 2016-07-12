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
            var header = grid.down('headercontainer');
            header.on('headertriggerclick', function onTriggerClick(headerCt, column)
            {
                // TODO
                //Ext.create('Connector.window.LearnFacet', {
                //    col: column,
                //    columnMetadata: {caption : 'test'},
                //    dataView: this,
                //    listeners: {
                //        filter: function (win, boundColumn, oldFilters, newFilters)
                //        {
                //            this.fireEvent('applyfilter', this, boundColumn, oldFilters, newFilters);
                //        },
                //        clearfilter: function (win, fieldKeyPath)
                //        {
                //            this.fireEvent('removefilter', this, fieldKeyPath);
                //        },
                //        scope: this
                //    },
                //    scope: this
                //});
                return false;
            }, this);
        }
    }

});
