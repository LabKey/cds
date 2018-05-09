/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.MabGrid', {

    extend: 'Ext.container.Container',

    alias: 'widget.mabdatagrid',

    requires: ['Connector.window.*'],

    cls: 'connector-grid-container',

    columnWidth: 125,

    countColumnWidth: 90,

    headerHeight: 120,

    titleHeight: 56,

    id: 'connector-view-mabgrid',

    paging: false,

    blankValue: '[blank]',

    statics: {
        getDefaultSort : function () {
            return [{
                property: 'mab_mix_name_std',
                direction: 'ASC'
            }];
        },

        ColumnMap : {
            'mab_mix_name_std' : [1],
            'mab_donor_species' : [2],
            'mab_isotype' : [3],
            'mab_hxb2_location' : [4],
            'tier_clade_virus' : [5, 6, 7],
            'titer_curve_ic50_group' : [8],
            'study' : [9]
        }
    },

    constructor : function(config)
    {
        this.callParent([config]);
        this.addEvents('updateMabFilter');
        // this.addEvents('updateMabSelection');
    },

    initComponent : function()
    {
        this.sorters = [];

        this.gridSorters = {}; // hold on to client side sorts for each grid

        this.items = [{
            xtype: 'container',
            height: this.headerHeight,
            ui: 'custom',
            cls: 'header-container',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'actiontitle',
                flex: 1,
                text: 'Explore monoclonal antibody (MAb) screening data',
                // buttons: [
                //     this.getExportCSVButton(),
                //     this.getExportExcelButton()
                // ]
            }]
        }];

        this.callParent();
        var model = this.getModel();

        this.on('updateMabFilter', this.onMabGridFilterChange, this);
        this.on('boxready', model.onViewReady, model, {single: true});

        // bind view to model
        model.on('initmabgrid', this.onInitMabGrid, this, {buffer: 200});
        model.on('mabdataloaded', this.onMabDataLoaded, this, {buffer: 200});

        // propagate event from model
        this.relayEvents(model, ['usergridfilter']);

        // bind view to view
        this.on('resize', this.onViewResize, this);

        // plugin to handle loading mask for the grid
        this.addPlugin({
            ptype: 'loadingmask',
            configs: [{
                element: this,
                loadingDelay: 250, // show this loading mask quickly since the grid render itself takes most of the time
                beginEvent: 'showload',
                endEvent: 'hideload'
            }]
        });

        this.on('beforehide', this.hideVisibleWindow);

        this.fireEvent('showload', this);
    },

    onInitMabGrid: function() {
        this.add(this.getGrid());
    },

    hideVisibleWindow : function() {
        if (Ext.isObject(this.visibleWindow)) {
            this.visibleWindow.hide();
        }
    },

    getExportCSVButton : function() {
        if (!this.exportCSVButton) {
            this.exportCSVButton = Ext.create('Ext.button.Button', {
                cls: 'gridexportcsvbtn',
                ui: 'rounded-inverted-accent-text',
                text: 'Export CSV',
                margin: '0 15 0 0',
                handler: this.requestExportCSV,
                scope: this
            });
        }

        return this.exportCSVButton;
    },

    getExportExcelButton : function() {
        if (!this.exportExcelButton) {
            this.exportExcelButton = Ext.create('Ext.button.Button', {
                cls: 'gridexportexcelbtn',
                ui: 'rounded-inverted-accent-text',
                text: 'Export Excel',
                margin: '0 15 0 0',
                handler: this.requestExportExcel,
                scope: this
            });
        }

        return this.exportExcelButton;
    },

    getGridColumnsConfig: function() {
        var ind = 1;
        return [
            this._getMabMixColumnConfig('Mab/Mixture', 'mab_mix_name_std', ind++),
            this._getMetaColumnConfig('Donor Species', 'mab_donor_species', ind++),
            this._getMetaColumnConfig('Isotype', 'mab_isotype', ind++),
            this._getMetaColumnConfig('HXB2 Location', 'mab_hxb2_location', ind++),
            this._getVirusColumnConfig('Viruses', 'virusCount', ind++),
            this._getVirusColumnConfig('Clades', 'cladeCount', ind++),
            this._getVirusColumnConfig('Tiers', 'neutralization_tierCount', ind++),
            this._getIC50MeanColumnConfig('Geometric mean Curve IC50', 'IC50geomean', ind++, 'titer_curve_ic50_group'),
            this._getCountColumnConfig('Studies', 'studyCount', ind, 'study')
        ];
    },

    _getMabMixColumnConfig: function(title, dataIndex, colInd) {
        var config = this._getBaseColumnConfig(title, dataIndex, colInd);
        config = Ext.apply(config, {
            width: 250,
            filterConfig: {
                isMeta: true,
                fieldName: dataIndex,
                caption: title
            }
        });
        return config;
    },

    _getMetaColumnConfig: function(title, dataIndex, colInd) {
        var config = this._getBaseColumnConfig(title, dataIndex, colInd);
        config = Ext.apply(config, {
            filterConfig: {
                isMeta: true,
                fieldName: dataIndex,
                caption: title
            }
        });
        return config;
    },

    _getCountColumnConfig: function(title, dataIndex, colInd, fieldName) {
        var config = this._getBaseColumnConfig(title, dataIndex, colInd);
        config = Ext.apply(config, {
            width: this.countColumnWidth,
            filterConfig: {
                isMeta: false,
                fieldName: fieldName,
                caption: title
            }
        });
        return config;
    },

    _getVirusColumnConfig: function(title, dataIndex, colInd) {
        var config = this._getBaseColumnConfig(title, dataIndex, colInd);
        config = Ext.apply(config, {
            width: this.countColumnWidth,
            filterConfig: {
                isMeta: false,
                isVirus: true,
                fieldName: 'tier_clade_virus'
            }
        });
        return config;
    },

    _getIC50MeanColumnConfig: function(title, dataIndex, colInd, fieldName) {
        var config = this._getBaseColumnConfig(title, dataIndex, colInd);
        config = Ext.apply(config, {
            width: 105,
            filterConfig: {
                isIC50: true,
                fieldName: fieldName,
                caption: 'Curve IC50'
            }
        });
        return config;
    },

    _getBaseColumnConfig: function(title, dataIndex, colInd) {
        return {
            text: title,
            dataIndex: dataIndex,
            cls: 'mabcolheader' + colInd,
            tdCls: 'mabcol' + colInd
        }
    },

    getGrid : function() {

        if (!this.grid) {
            if (!this.gridStore) {
                this.gridStore = this.getModel().getGridStore(Connector.view.MabGrid.getDefaultSort());
            }
            this.grid = Ext.create('Ext.grid.Panel', {
                store: this.gridStore,
                selModel: {
                    selType: 'checkboxmodel',
                    showHeaderCheckbox: true
                },
                columns: this.getGridColumnsConfig(),
                cls: 'connector-grid',
                border: false,
                columnWidth: this.columnWidth,
                forceFit: false,
                height: this.getWidthHeight().height,
                margin: '-56 24 0 24',
                ui: 'custom',
                viewConfig: {
                    emptyText: '<div style="width: 300px;">No mab data with current filters</div>',
                    deferEmptyText: true,
                    loadMask: false
                },
                listeners: {
                    beforerender: function(grid) {
                        var header = grid.down('headercontainer');
                        header.on('headertriggerclick', this.onTriggerClick, this);
                    },
                    viewready: function(grid) {
                        // reapply filters to the column UI
                        this.applyFilterColumnState(grid);
                        this.fireEvent('hideload', this);
                    },
                    itemmouseenter : function(view, record, item, index, evt) {
                        var me = this;
                        // on column cell hover, show filter icon
                        for (var i = 1; i < 10; i++) {
                            var cell = Ext.get(Ext.query(".mabcol" + i, item)[0]);
                            if (cell) {
                                (function (cell, colInd) {
                                    cell.on('mouseenter', me.triggerColumnHeaderOver, me, {colInd: colInd, isEnter: true});
                                    cell.on('mouseleave', me.triggerColumnHeaderOver, me, {colInd: colInd, isEnter: false});

                                    // the first time a row and a cell is entered, events aren't bound to cell yet
                                    var textRect = cell.dom.getBoundingClientRect();
                                    var cursorX = evt.browserEvent.clientX;
                                    var cursorY = evt.browserEvent.clientY;
                                    if (textRect.top <= cursorY && cursorY <= textRect.bottom
                                            && textRect.left <= cursorX && cursorX <= textRect.right) {
                                        me.triggerColumnHeaderOver(event, item, {colInd: colInd, isEnter: true});
                                    }

                                })(cell, i);
                            }
                        }
                    },
                    scope: this
                }
            });
        }

        return this.grid;
    },

    openFilterPanel: function(filterConfig) {
        var allValues = this.getModel().getUniqueFieldValues(filterConfig.fieldName);
        if (!allValues || allValues.length === 0) {
            var params = {
                isMeta: filterConfig.isMeta,
                fieldName: filterConfig.fieldName,
                useFilter: false,
                filterConfig: filterConfig,
                success: this.getActiveFacetValues,
                scope: this
            };
            this.getModel().getAllFacetValues(params);
        }
        else
            this.getActiveFacetValues(null, {filterConfig: filterConfig});
    },

    getActiveFacetValues: function(response, config) {
        var filterConfig = config.filterConfig;
        if (response && response.rows) {
            var key = filterConfig.fieldName + '_values';
            var values = [];
            Ext.each(response.rows, function(row) {
                values.push(row[filterConfig.fieldName] ? row[filterConfig.fieldName] : this.blankValue);
            }, this);
            this.getModel()[key] = values;
        }
        if (filterConfig.isVirus) {
            this.createFilterPopup(null, config);
            return;
        }

        var params = {
            isMeta: filterConfig.isMeta,
            fieldName: filterConfig.fieldName,
            useFilter: true,
            filterConfig: filterConfig,
            success: this.createFilterPopup,
            scope: this
        };
        this.getModel().getActiveFacetValues(params);
    },

    createFilterPopup : function(response, config) {
        var filterConfig = config.filterConfig;
        filterConfig.isVirus ? this.createVirusSelectionPanel() : this.createFacetFilterPanel(response, filterConfig);
    },

    createFacetFilterPanel: function(response, filterConfig) {
        var activeValues = [];
        if (response && response.rows) {
            Ext.each(response.rows, function(row) {
                activeValues.push(row[filterConfig.fieldName] ? row[filterConfig.fieldName] : this.blankValue);
            }, this);
        }
        Ext.create('Connector.window.MabGridFacet', {
            filterConfig: filterConfig,
            columnMetadata: filterConfig,
            col: filterConfig.column, //used to position facet window
            mabModel: this.getModel(),
            activeValues: activeValues,
            listeners: {
                mabfilter: function (columnName, filter)
                {
                    this.fireEvent('updateMabFilter', columnName, filter);
                },
                scope: this
            },
            scope: this
        });
    },

    createVirusSelectionPanel: function() {
        var virusPanel = Ext.create('Connector.panel.MabVirusSelection', {
            initSelection: null,
            mabModel: this.getModel()
        });

        this.virusFilterPanel = Ext.create('Ext.window.Window', {
            ui: 'filterwindow',
            cls: 'variable-selector',
            height: 660,
            width: 520,
            modal: true,
            draggable: false,
            header: false,
            resizable: false,
            border: false,
            style: 'padding: 0',
            items: [this.getVirusFilterHeader(),
                {
                    xtype: 'panel',
                    cls: 'hierarchy-pane',
                    border: false,
                    height: 553,
                    items : [virusPanel]
                },
                this.getVirusFilterFooter(virusPanel)]
        });
        this.virusFilterPanel.show();
    },

    getVirusFilterHeader: function() {
        return {
            xtype: 'box',
            html: '<div class="header">' +
            '<div style="font-size: 13.5pt; font-weight: bold;">Viruses tested against MAbs</div>' +
            '</div>'
        }
    },

    getVirusFilterFooter : function(filterPanel) {
        return {
            itemId: 'bottombar',
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: ['->',
                {
                    itemId: 'docancel',
                    text : 'Cancel',
                    cls: 'filter-btn',
                    handler : function(){
                        this.virusFilterPanel.close();
                    },
                    scope : this
                },
                {
                    itemId: 'dofilter',
                    text: 'Done',
                    cls: 'filter-btn',
                    handler: function() {
                        var filter = filterPanel.constructFilter();
                        this.fireEvent('updateMabFilter', 'tier_clade_virus', filter);
                        this.virusFilterPanel.close();
                    },
                    scope: this
                }
            ]
        };
    },

    onTriggerClick: function(headerCt, column) {
        var filterConfig = column.filterConfig, me = this;
        filterConfig.column = column;
        this.openFilterPanel(filterConfig);
        return false;
    },

    onMabGridFilterChange: function(columnName, filter) {
        if (filter === null)
            Connector.getState().removeMabFilter(columnName);
        else
            Connector.getState().updateMabFilter(columnName, {
                gridFilter: [filter],
                filterSource: 'GETDATA'
            });
        this.getModel().updateData();
    },

    onMabDataLoaded: function() {
        this.applyFilterColumnState();
    },

    /**
     * This method can be called to refresh the state of the grid column headers to determine if they
     * should show a filter being present or not on that column.
     */
    applyFilterColumnState : function()
    {
        var grid = this.getGrid();
        // remove all filter classes
        Ext.each(grid.headerCt.getGridColumns(), function(column)
        {
            if (Ext.isDefined(column.getEl()))
            {
                column.getEl().removeCls('filtered-column');
                column.getEl().removeCls('x-column-header-over');
            }
        });

        var filters = Connector.getState().getMabFilters(true);
        Ext.each(filters, function(filter)
        {
            var f = filter.gridFilter[0];
            var fieldName = f.getColumnName();
            var colIndexes = Connector.view.MabGrid.ColumnMap[fieldName];
            if (colIndexes && Ext.isArray(colIndexes)) {
                Ext.each(colIndexes, function(colIndex) {
                    var col = grid.headerCt.getHeaderAtIndex(colIndex);
                    if (col)
                    {
                        col.getEl().addCls('filtered-column');
                    }
                })
            }
        }, this);
    },


    triggerColumnHeaderOver: function(event, item, options) {
        var colInd = options.colInd;
        var isEnter = options.isEnter;
        var colHeader = Ext.DomQuery.select("div.x-column-header.mabcolheader" + colInd)[0];
        var highlightCls = 'x-column-header-over';
        if (colHeader) {
            if (isEnter) {
                if (colHeader.className.indexOf(highlightCls) === -1) {
                    colHeader.className += ' ' + highlightCls;
                }
            }
            else {
                colHeader.className = colHeader.className.replace(' ' + highlightCls, '');
            }
        }
    },

    onViewResize : function() {
        Ext.defer(function() {
            if (this.getModel().isActive())
            {
                if (this.grid)
                {
                    var size = this.getWidthHeight();
                    this.getGrid().setSize(size.width, size.height);
                }
            }
        }, 50, this);
    },

    onActivate : function()
    {
        this.getModel().setActive(true);
        var infopane = Ext.ComponentQuery.query('app-main > #eastview > #navfilter > #filterstatuscontainer');
        if (infopane && infopane.length > 0)
            infopane[0].hide();
    },

    onDeactivate : function()
    {
        this.getModel().setActive(false);
        var infopane = Ext.ComponentQuery.query('app-main > #eastview > #navfilter > #filterstatuscontainer');
        if (infopane && infopane.length > 0)
            infopane[0].show();
    },

    getModel : function() {
        return this.model;
    },

    getWidthHeight : function() {
        var box = this.getBox();

        return {
            width: box.width - 27,
            height: box.height - this.headerHeight + this.titleHeight
        };
    },

    cellRenderer : function(v, meta, record, measure) {
        return v;
    },

    requestExportCSV: function() {
        this.requestExport(false);
    },

    requestExportExcel: function() {
        this.requestExport(true);
    },

    requestExport : function(isExcel) {
        //
    },

    onExport : function(isExcel) {
        //
    }
});
