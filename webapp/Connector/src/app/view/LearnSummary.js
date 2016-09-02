Ext.define('Connector.app.view.LearnSummary', {
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

    lockedViewConfig: {
        overflowY: 'hidden',
        emptyText: ''
    },

    normalViewConfig: {
        overflowY: 'scroll'
    },

    statics: {
        dateRenderer : Ext.util.Format.dateRenderer("M jS, Y"),
        monthDiff : function(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }
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
            this.setTitleColumnWidth();
        },

        boxready: function(grid)
        {
            this.height = grid.container.getHeight() - this.learnView.headerViews.main.height;
            this.setTitleColumnWidth();
        }
    },

    initComponent : function() {
        this.addEvents("learnGridResizeHeight");

        this.lockedViewConfig.emptyText = new Ext.XTemplate(
                '<div class="detail-empty-text">None of the selected {itemPluralName} have data for this category.</div>'
        ).apply({itemPluralName: this.itemPluralName});

        this.callParent(arguments);
    },

    setTitleColumnWidth : function () {
        var col = this.columns[0];
        col.setWidth(Math.max(this.getWidth() / 2, col.minWidth));
    }
});
