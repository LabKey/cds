/*
 * Copyright (c) 2018 LabKey Corporation
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

        ColumnMap: {
            'mab_mix_name_std': {colInd: [1], filterLabel: 'Mab Mix Name Std'},
            'mab_donor_species': {colInd: [2], filterLabel: 'Mab Donor Species'},
            'mab_isotype': {colInd: [3], filterLabel: 'Mab Isotype'},
            'mab_hxb2_location': {colInd: [4], filterLabel: 'Mab Hxb2 Location'},
            'mab_ab_binding_type': {colInd: [5], filterLabel: 'Antibody binding type'},
            'tier_clade_virus': {colInd: [6, 7, 8], filterLabel: 'Neutralization tier + Clade + Virus'},
            'titer_curve_ic50_group': {colInd: [9], filterLabel: 'Titer Curve IC50'},
            'study': {colInd: [10], filterLabel: 'Study'}
        },

        MAbReportID_PROP_PREFIX: "MAbReportID",
        MAbReportLabel_PROP_PREFIX: "MAbReportLabel"
    },

    constructor : function(config) {
        this.callParent([config]);
        this.addEvents('updateMabSelection', 'requestmabexport');
    },

    initComponent : function() {
        this.allowReporting = false;
        this.sorters = [];

        this.gridSorters = {}; // hold on to client side sorts for each grid

        this.callParent();
        this.add(this.getGridHeader());
        var model = this.getModel();

        this.on('updateMabSelection', this.onMabSelectionChange, this);
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

    getGridHeader : function() {
        if (!this.gridHeader) {
            var buttons = this.getReportButtons();
            buttons.push(this.getExportButton());

            this.gridHeader = Ext.create('Ext.container.Container', {
                height: this.headerHeight,
                ui: 'custom',
                cls: 'header-container',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'actiontitle',
                    flex: 1,
                    text: 'Explore monoclonal antibody (mAb) characterization data',
                    buttons: buttons
                }]
            });
        }
        return this.gridHeader;
    },

    onInitMabGrid : function() {
        this.add(this.getGrid());
    },

    hideVisibleWindow : function() {
        if (Ext.isObject(this.visibleWindow)) {
            this.visibleWindow.hide();
        }
    },

    getExportButton : function() {
        if (!this.exportButton) {
            this.exportButton = {
                xtype: 'exportbutton',
                margin : '0 0 0 25',
                width : 100,
                listeners: {
                    exportcsv : this.requestExportCSV,
                    exportexcel : this.requestExportExcel,
                    scope: this
                }
            }
        }
        return this.exportButton;
    },

    getReportButtons : function() {
        if (this.reportButtons === undefined) {
            var items = [];
            this.reportButtons = [];

            for (var i = 1; i < 3; i++) {
                var reportId = LABKEY.getModuleProperty('cds', Connector.view.MabGrid.MAbReportID_PROP_PREFIX + i);
                var reportLabel = LABKEY.getModuleProperty('cds', Connector.view.MabGrid.MAbReportLabel_PROP_PREFIX + i);

                if (reportId && reportLabel) {
                    items.push({
                        xtype: 'button',
                        cls: 'mabgridcolumnsbtn',
                        handler: (function(id, label) {
                            return function() {
                                this.showRReport(id, label);
                            }
                        })(reportId, reportLabel),
                        text: reportLabel,
                        scope: this
                    });
                }
            }

            if (items.length) {
                this.reportButtons.push({
                    xtype: 'container',
                    disabled: !this.allowReporting,
                    disabledCls: 'vardisable',
                    maskOnDisable: false,
                    childEls: ['outerCt', 'innerCt'],
                    renderTpl: [
                        '<span id="{id}-outerCt" style="display:table;">',
                            '<div id="{id}-innerCt" class="mabgridbuttonslayout"></div>',
                        '</span>'
                    ],
                    items: items,
                    listeners: {
                        afterrender: {
                            fn: function(ct) {
                                this.reportButtonContainer = ct;

                                ct.getEl().on({
                                    mouseenter: function() {
                                        if (!this.allowReporting) {
                                            ChartUtils.showCallout({
                                                target: ct.getEl().dom,
                                                placement: 'bottom',
                                                title: 'Enable reporting',
                                                xOffset: -65,
                                                arrowOffset: 215,
                                                content: [
                                                    'Select data in the MAb grid, via the check box on each row,',
                                                    'that you\'d like to see in a report.'
                                                ].join(' ')
                                            }, 'hidereportdatamsg', this);
                                        }
                                    },
                                    mouseleave: function() {
                                        this.fireEvent('hidereportdatamsg');
                                    },
                                    scope: this
                                });
                            },
                            scope: this,
                            single: true
                        }
                    }
                });
            }
        }

        return this.reportButtons;
    },

    getGridColumnsConfig : function() {
        var ind = 1;
        return [
            this._getMabMixColumnConfig('MAb/Mixture', MabQueryUtils.MAB_MIX_NAME_STD, ind++),
            this._getMetaColumnConfig('Donor Species', 'mab_donor_species', ind++),
            this._getMetaColumnConfig('Isotype', 'mab_isotype', ind++),
            this._getMetaColumnConfig('HXB2 Location', 'mab_hxb2_location', ind++),
            this._getMetaColumnConfig('Antibody binding type', 'mab_ab_binding_type', ind++),
            this._getVirusColumnConfig('Viruses', 'virusCount', ind++),
            this._getVirusColumnConfig('Clades', 'cladeCount', ind++),
            this._getVirusColumnConfig('Tiers', 'neutralization_tierCount', ind++),
            this._getIC50MeanColumnConfig('Geometric mean Curve IC50', 'IC50geomean', ind++, MabQueryUtils.IC50_GROUP_COLUMN),
            this._getCountColumnConfig('Studies', 'studyCount', ind, 'study.label', true)
        ];
    },

    _getMabMixColumnConfig : function(title, dataIndex, colInd) {
        return Ext.apply(this._getBaseColumnConfig(title, dataIndex, colInd), {
            width: 250,
            filterConfig: {
                isMeta: true,
                fieldName: dataIndex,
                caption: title
            }
        });
    },

    _getMetaColumnConfig : function(title, dataIndex, colInd) {
        return Ext.apply(this._getBaseColumnConfig(title, dataIndex, colInd), {
            filterConfig: {
                isMeta: true,
                fieldName: dataIndex,
                caption: title
            }
        });
    },

    _getCountColumnConfig : function(title, dataIndex, colInd, fieldName, showTooltip) {
        return Ext.apply(this._getBaseColumnConfig(title, dataIndex, colInd), {
            width: this.countColumnWidth,
            filterConfig: {
                isMeta: false,
                fieldName: fieldName,
                showTooltip : showTooltip,
                caption: title
            }
        });
    },

    _getVirusColumnConfig : function(title, dataIndex, colInd) {
        return Ext.apply(this._getBaseColumnConfig(title, dataIndex, colInd), {
            width: this.countColumnWidth,
            filterConfig: {
                fieldName: MabQueryUtils.VIRUS_FILTER_COLUMN,
                isMeta: false,
                isVirus: true
            }
        });
    },

    _getIC50MeanColumnConfig : function(title, dataIndex, colInd, fieldName) {
        return Ext.apply(this._getBaseColumnConfig(title, dataIndex, colInd), {
            width: 105,
            filterConfig: {
                isIC50: true,
                fieldName: fieldName,
                caption: 'Curve IC50'
            }
        });
    },

    _getBaseColumnConfig : function(title, dataIndex, colInd) {
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
                selType: 'checkboxmodel',
                selModel: {
                    checkSelector: 'td.x-grid-cell-row-checker'
                },
                multiSelect: true,
                headerWidth: 35,

                columns: this.getGridColumnsConfig(),
                cls: 'connector-grid mab-connector-grid',
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
                                        me.triggerColumnHeaderOver(evt, item, {colInd: colInd, isEnter: true});
                                    }

                                })(cell, i);
                            }
                        }
                    },
                    selectionchange: function(model, selections) {
                        this.fireEvent('updateMabSelection', selections);
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
            this.getModel().getAllFacetValues({
                isMeta: filterConfig.isMeta,
                fieldName: filterConfig.fieldName,
                useFilter: false,
                filterConfig: filterConfig,
                success: this.getActiveFacetValues,
                scope: this
            });
        }
        else {
            this.getActiveFacetValues(null, {filterConfig: filterConfig});
        }
    },

    getActiveFacetValues: function(response, config) {
        var filterConfig = config.filterConfig;
        if (response && response.rows) {
            var fieldName = Connector.utility.MabQuery.getParsedFieldName(filterConfig.fieldName, true);
            var key = fieldName + '_values';
            var values = [];
            Ext.each(response.rows, function(row) {
                values.push(row[fieldName] ? row[fieldName] : this.blankValue);
            }, this);
            this.getModel()[key] = values;
        }
        if (filterConfig.isVirus) {
            this.createFilterPopup(null, config);
            return;
        }

        this.getModel().getActiveFacetValues({
            isMeta: filterConfig.isMeta,
            fieldName: filterConfig.fieldName,
            useFilter: true,
            filterConfig: filterConfig,
            success: this.createFilterPopup,
            scope: this
        });
    },

    createFilterPopup : function(response, config) {
        var filterConfig = config.filterConfig;
        filterConfig.isVirus ? this.createVirusSelectionPanel() : this.createFacetFilterPanel(response, filterConfig);
    },

    createFacetFilterPanel : function(response, filterConfig) {
        var activeValues = [];
        if (response && response.rows) {
            Ext.each(response.rows, function(row) {
                var fieldName = Connector.utility.MabQuery.getParsedFieldName(filterConfig.fieldName, true);
                activeValues.push(row[fieldName] ? row[fieldName] : this.blankValue);
            }, this);
        }
        Ext.create('Connector.window.MabGridFacet', {
            filterConfig: filterConfig,
            columnMetadata: filterConfig,
            col: filterConfig.column, //used to position facet window
            mabModel: this.getModel(),
            activeValues: activeValues,
            listeners: {
                clearmabfilter: function(window, columnName) {
                    this.onMabGridFilterChange(columnName);
                },
                mabfilter: function(window, columnName, filter) {
                    this.onMabGridFilterChange(columnName, filter);
                },
                scope: this
            },
            scope: this
        });
    },

    createVirusSelectionPanel : function() {
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

    getVirusFilterHeader : function() {
        return {
            xtype: 'box',
            html: '<div class="header">' +
            '<div style="font-size: 13.5pt; font-weight: bold;">Viruses tested against mAbs</div>' +
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
                    text: 'Cancel',
                    cls: 'filter-btn',
                    handler : function() {
                        this.virusFilterPanel.close();
                    },
                    scope : this
                },
                {
                    itemId: 'dofilter',
                    text: 'Done',
                    cls: 'filter-btn',
                    handler: function() {
                        this.onMabGridFilterChange(MabQueryUtils.VIRUS_FILTER_COLUMN, filterPanel.constructFilter());
                        this.virusFilterPanel.close();
                    },
                    scope: this
                }
            ]
        };
    },

    onTriggerClick : function(headerCt, column) {
        var filterConfig = column.filterConfig;
        filterConfig.column = column;
        this.openFilterPanel(filterConfig);
        return false;
    },

    onMabGridFilterChange : function(columnName, filter) {
        if (filter) {
            Connector.getState().updateMabFilter(columnName, {
                gridFilter: [filter],
                filterSource: 'GETDATA'
            });
        }
        else {
            Connector.getState().removeMabFilter(columnName);
        }
    },

    onMabDataLoaded : function() {
        this.applyFilterColumnState();
        this.applyMAbSelections();
    },

    applyMAbSelections : function() {
        var records = [],
            recIdx,
            store = this.gridStore;

        Ext.each(Connector.getState().getSelectedMAbs(), function(val) {
            recIdx = store.findBy(function(rec) {
                return rec.get(MabQueryUtils.MAB_MIX_NAME_STD) === val;
            });

            if (recIdx !== -1) {
                records.push(store.getAt(recIdx));
            }
        }, this);

        this.getGrid().getSelectionModel().select(records, false, true);

        this.updateReportButtons(records.length);
    },

    updateReportButtons : function(selectionCount) {
        this.allowReporting = selectionCount !== 0;
        if (this.reportButtonContainer) {
            this.reportButtonContainer.setDisabled(!this.allowReporting);
        }
    },

    onMabSelectionChange : function(mAbSelections) {
        var mAbs = [];
        Ext.each(mAbSelections, function(selection) {
            mAbs.push(selection.get(MabQueryUtils.MAB_MIX_NAME_STD));
        });
        Connector.getState().updateSelectedMAbs(mAbs);

        this.updateReportButtons(mAbs.length);
    },

    /**
     * This method can be called to refresh the state of the grid column headers to determine if they
     * should show a filter being present or not on that column.
     */
    applyFilterColumnState : function() {
        var grid = this.getGrid();
        // remove all filter classes
        Ext.each(grid.headerCt.getGridColumns(), function(column) {
            if (Ext.isDefined(column.getEl())) {
                column.getEl().removeCls('filtered-column');
                column.getEl().removeCls('x-column-header-over');
            }
        });

        Ext.each(Connector.getState().getMabFilters(true), function(filter) {
            var f = filter.gridFilter[0];
            var fieldName = f.getColumnName();
            if (fieldName.indexOf('.') > -1)
                fieldName = fieldName.split('.')[0];
            var colIndexes = Connector.view.MabGrid.ColumnMap[fieldName].colInd;
            if (colIndexes && Ext.isArray(colIndexes)) {
                Ext.each(colIndexes, function(colIndex) {
                    var col = grid.headerCt.getHeaderAtIndex(colIndex);
                    if (col) {
                        col.getEl().addCls('filtered-column');
                    }
                })
            }
        }, this);
    },

    triggerColumnHeaderOver : function(event, item, options) {
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
            if (this.getModel().isActive() && this.grid && !this.grid.isHidden()) {
                var size = this.getWidthHeight();
                this.getGrid().setSize(size.width, size.height);
            }
        }, 50, this);
    },

    onActivate : function() {
        this.getModel().setActive(true);
    },

    onDeactivate : function() {
        this.getModel().setActive(false);
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

    cellRenderer : function(v) {
        return v;
    },

    requestExportCSV : function() {
        this.requestExport(false);
    },

    requestExportExcel : function() {
        this.requestExport(true);
    },

    requestExport : function(isExcel) {
        if (!this.getGrid() || !this.getGrid().store || this.getGrid().store.getCount() === 0) {
            Ext.Msg.alert('Error', "No MAb/Mixture available for export with current grid filters.");
            return false;
        }

        Connector.getQueryService().prepareMAbExportQueries({
            exportParams: {
                isExcel: isExcel,
                excludedColumns: ['study_nabmab_subjectvisit_visit'],
                exportInfoTitle: 'Data summary level exported:',
                exportInfoContent: 'Neutralization curve details and titers by virus and mAb concentration', // future work to allow multiple export options
                'X-LABKEY-CSRF': LABKEY.CSRF
            },
            isExcel: isExcel,
            success: function(config) {
                var exportParams = config.exportParams;
                var newForm = document.createElement('form');
                document.body.appendChild(newForm);
                Ext.Ajax.request({
                    url: LABKEY.ActionURL.buildURL('cds', 'exportMAbGrid'),
                    method: 'POST',
                    form: newForm,
                    isUpload: true,
                    params: exportParams,
                    callback: function (options, success/*, response*/) {
                        document.body.removeChild(newForm);

                        if (!success) {
                            Ext.Msg.alert('Error', 'Unable to export.');
                        }
                    }
                });
                this.fireEvent('requestmabexport', this, exportParams);
            },
            failure: function() {
                Ext.Msg.alert('Error', "Unable to export.");
            },
            scope: this
        });
    },

    showRReport : function(reportId, reportLabel) {
        if (!this.getModel().hasMAbSelected()) {
            Ext.Msg.alert('Error', "No MAb/Mixture has been selected.");
            return false;
        }
        this.showGridView(false);
        this.add({
            xtype: 'mabreportview',
            parentGrid: this,
            id: 'mab-report-view',
            reportId: reportId,
            reportLabel: reportLabel
        });
        this.doLayout();
    },

    showGridView : function(show) {
        if (show) {
            this.getGridHeader().show();
            this.getGrid().show();
        }
        else {
            this.getGridHeader().hide();
            this.getGrid().hide();
        }
    }
});
