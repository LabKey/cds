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

    headerHeight: 120,

    titleHeight: 50,

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

        // bind model to view
        this.on('applyfilter', model.onGridFilterChange, model);
        this.on('removefilter', model.onGridFilterRemove, model);
        this.on('boxready', model.onViewReady, model, {single: true});

        // bind view to model
        model.on('filterchange', this.onFilterChange, this);

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

        this.add(this.getGrid());

        this.on('beforehide', this.hideVisibleWindow);
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

    getGrid : function() {

        if (!this.grid) {
            // this.fireEvent('showload', this); //TODO fix

            if (!this.gridStore) {
                this.gridStore = this.getModel().getGridStore(Connector.view.MabGrid.getDefaultSort());
            }

            this.grid = Ext.create('Ext.grid.Panel', {
                store: this.gridStore,
                selModel: {
                    selType: 'checkboxmodel',
                    showHeaderCheckbox: true
                },
                columns: [
                    { text: 'Mab/Mixture',  dataIndex: 'mab_mix_name_std' },
                    { text: 'Donor Species', dataIndex: 'mab_donor_species' },
                    { text: 'Isotype', dataIndex: 'mab_isotype' },
                    { text: 'HXB2 Location',  dataIndex: 'mab_hxb2_location' },
                    { text: 'Viruses', dataIndex: 'virusCount' },
                    { text: 'Clades', dataIndex: 'cladeCount' },
                    { text: 'Tiers',  dataIndex: 'neutralization_tierCount' },
                    { text: 'Geometric mean IC50', dataIndex: 'IC50geomean' },
                    { text: 'Studies', dataIndex: 'studyCount' }
                ],
                cls: 'connector-grid',
                border: false,
                defaultColumnWidth: this.columnWidth,
                margin: '-50 24 0 24',
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
                    scope: this
                }
            });
        }

        return this.grid;
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
    applyFilterColumnState : function(grid)
    {
        // TODO
    },

    cellRenderer : function(v, meta, record, measure) {
        return v;
    },

    onTriggerClick : function(headerCt, column)
    {
        // ensure that the default trigger events do not occur
        return false;
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
