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

    countColumnWidth: 60,

    headerHeight: 120,

    titleHeight: 56,

    id: 'connector-view-mabgrid',

    paging: false,

    statics: {
        getDefaultSort : function () {
            return [{
                property: 'mab_mix_name_std',
                direction: 'ASC'
            }];
        }
    },

    constructor : function(config)
    {
        this.callParent([config]);
        this.addEvents('updateMabFilter');
        // this.addEvents('applyfilter', 'removefilter', 'requestexport', 'measureselected', 'usergridfilter', 'datasourceupdate', 'sheetselected');
    },

    initComponent : function()
    {
        this.sorters = [];

        this.columnMap = {};

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
                buttons: [
                    this.getExportCSVButton(),
                    this.getExportExcelButton()
                ]
            }]
        }];

        this.callParent();
        var model = this.getModel();

        this.on('updateMabFilter', model.onGridFilterChange, model);
        this.on('boxready', model.onViewReady, model, {single: true});

        // bind view to model
        model.on('initmabgrid', this.onInitMabGrid, this, {buffer: 200});
        model.on('mabfilterchange', this.onFilterChange, this);

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
            this._getCountColumnConfig('Viruses', 'virusCount', ind++, 'virus'),
            this._getCountColumnConfig('Clades', 'cladeCount', ind++, 'clade'),
            this._getCountColumnConfig('Tiers', 'neutralization_tierCount', ind++, 'neutralization_tier'),
            this._getIC50MeanColumnConfig('Geometric mean IC50', 'IC50geomean', ind++),
            this._getCountColumnConfig('Studies', 'studyCount', ind++, 'study')
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

    _getIC50MeanColumnConfig: function(title, dataIndex, colInd) {
        var config = this._getBaseColumnConfig(title, dataIndex, colInd);
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
                        //TODO only bind once?
                        var me = this;
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

    onTriggerClick: function(headerCt, column) {
        var filterConfig = column.filterConfig, me = this;
        // query for all values
        Ext.create('Connector.window.MabGridFacet', {
            filterConfig: filterConfig,
            columnMetadata: filterConfig,
            col: column, //used to position facet window
            mabModel: this.getModel(),
            // columnMetadata: {caption : filterConfig.title},
            listeners: {
                mabfilter: function (columnName, filter)
                {
                    console.log('filtered');
                    this.fireEvent('updateMabFilter', columnName, filter);
                },
                scope: this
            },
            scope: this
        });
        return false;
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

    onFilterChange : function()
    {
        //
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

    /**
     * This method can be called to refresh the state of the grid column headers to determine if they
     * should show a filter being present or not on that column.
     * @param grid
     */
    applyFilterColumnState : function()
    {
        // TODO
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
        //TODO
    },

    onExport : function(isExcel) {
        //TODO
    }
});
