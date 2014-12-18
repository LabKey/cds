/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Grid', {

    extend: 'Ext.container.Container',

    alias: 'widget.groupdatagrid',

    requires: ['Ext.menu.DatePicker', 'Connector.window.*'],

    axisSourceCls: 'rawdatasource',

    columnWidth: 125,

    headerHeight: 160,

    constructor : function(config) {
        this.callParent([config]);
        this.addEvents('applyfilter', 'removefilter', 'measureselected');
    },

    initComponent : function() {

        this.columnMap = {};

        this.items = [
            {
                xtype: 'container',
                height: this.headerHeight,
                ui: 'custom',
                cls: 'header-container',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'actiontitle',
                    text: 'View data grid'
                },{
                    // This allows for the following items to be right aligned
                    xtype: 'box',
                    flex: 1,
                    autoEl: {
                        tag: 'div'
                    }
                },{
                    xtype: 'button',
                    cls: 'gridexportbtn',
                    ui: 'rounded-inverted-accent-text',
                    text: 'export',
                    margin: '0 15 0 0',
                    handler: this.requestExport,
                    scope: this
                },{
                    xtype: 'button',
                    cls: 'gridcitationsbtn',
                    text: 'citations',
                    ui: 'rounded-inverted-accent-text',
                    margin: '0 15 0 0',
                    disabled: true,
                    handler: function() {},
                    scope: this
                },{
                    xtype: 'button',
                    cls: 'gridcolumnsbtn',
                    text: 'select columns',
                    handler: this.showMeasureSelection,
                    scope: this
                }]
            },{
                // This provides a row count on the screen for testing purposes
                id: 'gridrowcountcmp',
                xtype: 'box',
                style: 'position: absolute; top: 50px; left: 27px; color: transparent;',
                tpl: '<span id="gridrowcount">Row Count: {count}</span>',
                data: {
                    count: -1
                }
            }
        ];

        this.callParent();

        var model = this.getModel();

        // bind model to view
        this.on('applyfilter', model.onGridFilterChange, model);
        this.on('removefilter', model.onGridFilterRemove, model);
        this.on('measureselected', model.onMeasureSelected, model);
        this.on('boxready', model.onViewReady, model, {single: true});

        // bind view to model
        model.on('filterchange', this.onFilterChange, this, {buffer: 200});
        model.on('updatecolumns', this.onColumnUpdate, this, {buffer: 200});

        // bind view to view
        this.on('resize', this.onViewResize, this);

        // plugin to handle loading mask for the grid
        this.addPlugin({
            ptype: 'loadingmask',
            loadingDelay: 250, // show this loading mask quickly since the grid render itself takes most of the time
            beginConfig: {
                component: this,
                events: ['showload']
            },
            endConfig: {
                component: this,
                events: ['hideload']
            }
        });

        this.showmsg = true;
        this.addPlugin({
            ptype: 'messaging'
        });
    },

    _showOverlay : function() {
        if (!this.NO_SHOW) {

            //
            // Ensure we're in a proper state to show the overlay message
            //
            var valid = true;

            if (this.getModel().get('columnSet').length > 3) {
                valid = false;
            }

            if (valid) {
                Ext.create('Ext.Component', {
                    renderTo: this.getEl(),
                    cls: 'nogridmsg',
                    autoEl: {
                        tag: 'div',
                        style: 'position: absolute; left: 450px; top: 47%;',
                        children: [{
                            tag: 'h1',
                            html: 'Add columns about your filtered subjects.'
                        },{
                            tag: 'h1',
                            html: 'Sort, filter, and make subgroups.',
                            style: 'color: #7a7a7a;'
                        },{
                            tag: 'h1',
                            html: 'Export to your own tools.',
                            style: 'color: #b5b5b5;'
                        }]
                    },
                    listeners: {
                        afterrender : function(c) {
                            this.nogridmsg = c;
                        },
                        scope: this
                    }
                });
            }
        }
    },

    _hideOverlay : function() {
        this.NO_SHOW = true;
        if (this.nogridmsg) {
            this.nogridmsg.hide();
        }
    },

    onViewResize : function() {
        Ext.defer(function() {
            if (this.getModel().isActive()) {
                if (this.grid) {
                    var size = this.getWidthHeight();
                    this.getGrid().setSize(size.width, size.height);
                }
            }
        }, 50, this);
    },

    /**
     * Called when the application changes views. This will fire even when the bound view
     * might not be active.
     * @param controller
     * @param view
     */
    onViewChange : function(controller, view) {
        this.getModel().setActive(view === this.xtype);
    },

    onColumnUpdate : function() {

        // hold on to the previous grid id so it can be removed once we are ready to add the new grid
        var prevGridId = this.grid ? this.grid.getId() : null;

        // reset the grid and column mapping
        this.grid = null;
        this.columnMap = {};

        // add the new grid once the store has finished loading
        var newGrid = this.getGrid();
        newGrid.getStore().on('load', function() {

            if (prevGridId != null && prevGridId != newGrid.getId())
            {
                this.remove(prevGridId, true);
                this._hideOverlay();
            }

            this.add(newGrid);

        }, this, {single: true});
    },

    onFilterChange : function(model, filterArray) {
        if (this.grid) {
            this.getGrid().getStore().filterArray = model.getFilterArray(true);
            this.getGrid().getStore().load();
            this.applyFilterColumnState(this.getGrid());
        }
    },

    getAxisSelector : function() {
        if (!this.axisPanel) {
            this.axisPanel = Ext.create('Connector.panel.AxisSelector', {
                ui: 'axispanel',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                measureConfig : {
                    allColumns: true,
                    displaySourceCounts: true,
                    sourceCountSchema: Connector.studyContext.schemaName,
                    includeTimpointMeasures: true,
                    supportSelectionGroup: true,
                    supportSessionGroup: true,
                    sourceCls: this.axisSourceCls,
                    filter: LABKEY.Query.Visualization.Filter.create({
                        schemaName: Connector.studyContext.schemaName,
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS
                    }),
                    showHidden: this.canShowHidden,
                    cls: 'gridcolumnpicker'
                },
                displayConfig: {
                    mainTitle: 'Choose Measures for the Data Grid...'
                },
                disableLookups: false,
                disableScale: true
            });
        }

        return this.axisPanel;
    },

    getColumnMetadata : function(columnName) {

        var target;

        if (Ext.isString(columnName)) {
            var fields = this.getModel().get('metadata').metaData.fields;

            // The proxy will have the most complete metadata -- getData API does not return lookup info
            if (this.grid && this.grid.getStore().proxy) {
                fields = this.grid.getStore().proxy.reader.getFields();
            }

            if (!Ext.isEmpty(fields)) {
                Ext.each(fields, function(field) {
                    if (field.name === columnName) {
                        target = Ext.clone(field);
                        return false;
                    }
                });
            }

            if (Ext.isDefined(target)) {
                target.filterField = (!Ext.isEmpty(target.displayField) ? target.displayField : target.fieldKey);
            }
        }

        if (!Ext.isDefined(target)) {
            console.warn('failed to find column metadata:', columnName);
        }

        return target;
    },

    getGrid : function() {

        if (!this.grid) {
            this.fireEvent('showload', this);

            var size = this.getWidthHeight();

            this.grid = Ext.create('Connector.grid.Panel', {
                model: this.getModel(),
                height: size.height,
                width: size.width,
                forceFit: true,
                store: this.initGridStore(),
                border: false,
                defaultColumnWidth: this.columnWidth,
                margin: '-93 24 0 24',
                ui: 'custom',
                viewConfig: {
                    loadMask: false
                },
                listeners: {
                    columnmodelcustomize: this.onColumnModelCustomize,
                    columnmove: this.updateColumnMap,
                    beforerender: function(grid) {
                        var header = grid.down('headercontainer');
                        header.on('headertriggerclick', this.onTriggerClick, this);
                    },
                    boxready : function(grid) {
                        this._showOverlay();
                    },
                    viewready: function(grid) {
                        this.updateColumnMap(grid.down('headercontainer'));

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

    getMeasureSelectionWindow : function() {
        if (!this.measureWindow) {
            this.measureWindow = Ext.create('Ext.window.Window', {
                id: 'gridmeasurewin',
                ui: 'axiswindow',
                cls: 'axiswindow gridaxiswindow',
                plain: true,
                modal: true,
                draggable: false,
                preventHeader: true,
                resizable: false,
                closeAction: 'hide',
                layout: 'fit',
                maxWidth: 1400,
                items: [ this.getAxisSelector() ],
                dockedItems : [{
                    xtype : 'toolbar',
                    dock : 'bottom',
                    ui : 'footer',
                    padding : 15,
                    items : ['->',{
                        text: 'select',
                        handler : function() {
                            var axispanel = this.getAxisSelector();
                            var allMeasures = axispanel.getMeasurePicker().measuresStoreData.measures;
                            this.fireEvent('measureselected', axispanel.getSelection(), allMeasures, axispanel.getLookups());
                            this.measureWindow.hide();
                        },
                        scope: this
                    },{
                        text: 'cancel',
                        handler : function() { this.measureWindow.hide(); },
                        scope: this
                    }]
                }]
            });
        }

        return this.measureWindow;
    },

    getModel : function() {
        return this.model;
    },

    getStore : function() {
        return this.getGrid().getStore();
    },

    initGridStore : function() {
        var model = this.getModel();
        var maxRows = Connector.model.Grid.getMaxRows();

        var store = Ext.create('LABKEY.ext4.data.Store', {
            schemaName: model.get('schemaName'),
            queryName: model.get('queryName'),
            columns: model.get('columnSet'),
            filterArray: model.getFilterArray(true),
            maxRows: maxRows
        });

        store.on('beforeload', function(){
            this.fireEvent('showload', this);
        }, this);

        store.on('load', function(store) {

            var rowCount = store.getCount();

            var cmp = Ext.getCmp('gridrowcountcmp');
            if (cmp) {
                cmp.update({count: rowCount});
            }

            // show/hide for a filter change need to place nicely with the show/hide for a column change
            // (i.e. new grid creation) so we only hide the mask on store load if the grid is already rendered
            if (this.getGrid().rendered) {
                this.fireEvent('hideload', this);
            }

            if (rowCount >= maxRows) {
                this.showLimitMessage(maxRows);
            }
        }, this);

        return store;
    },

    getWidthHeight : function() {

        var box = this.getBox();
        var width = box.width - 27;
        var height = box.height - this.headerHeight + 93;

        return {
            width: width,
            height: height
        };
    },

    /**
     * This method can be called to refresh the state of the grid column headers to determine if they
     * should show a filter being present or not on that column.
     * @param grid
     */
    applyFilterColumnState : function(grid) {

        var columns = grid.headerCt.getGridColumns();

        // remove all filter classes
        Ext.each(columns, function(column) {
            if (Ext.isDefined(column.getEl())) {
                column.getEl().removeCls('filtered-column');
            }
        }, this);

        var filterFieldMap = {}, colMeta;
        Ext.iterate(this.columnMap, function(dataIndex) {
            colMeta = this.getColumnMetadata(dataIndex);

            if (Ext.isDefined(colMeta.filterField)) {
                filterFieldMap[colMeta.filterField] = {
                    metdata: colMeta,
                    dataIndex: dataIndex
                };
            }
            else {
                console.warn('unable to map filter column');
            }

        }, this);

        var filterArray = this.getModel().getFilterArray();

        Ext.each(filterArray, function(filter) {
            colMeta = filterFieldMap[filter.getColumnName()];
            if (colMeta) {
                var columnIndex = this.columnMap[colMeta.dataIndex];

                if (columnIndex > -1) {
                    var col = grid.headerCt.getHeaderAtIndex(columnIndex);
                    if (col) {
                        col.getEl().addCls('filtered-column');
                    }
                }
            }

        }, this);
    },

    updateColumnMap : function(/* Ext.grid.header.Container */ gridHeader) {
        var columns = gridHeader.getGridColumns();

        Ext.each(columns, function(gridColumn, idx) {
            this.columnMap[gridColumn.dataIndex] = idx;
        }, this);
    },

    onColumnModelCustomize : function(grid, columnGroups) {
        var model = this.getModel(), columns;

        var modelMap = {};
        var models = model.get('metadata').columnModel;
        Ext.each(models, function(model)
        {
            modelMap[model.dataIndex] = model;
        }, this);

        Ext.each(columnGroups, function(group)
        {
            columns = group.columns;
            Ext.each(columns, function(column)
            {
                var model = modelMap[column.dataIndex];
                if (model)
                {
                    column.hidden = model.hidden;
                    column.header = Ext.htmlEncode(model.header);
                }

                column.showLink = false;
            }, this);

        }, this);
    },

    onTriggerClick : function(headerCt, column, evt, el) {
        if (Ext.isString(column)) {

            var _name = column;
            column = null;

            // lookup column by name
            if (this.grid) {
                var columns = this.getGrid().query('gridcolumn');
                for (var c=0; c < columns.length; c++) {
                    if (columns[c].text.indexOf(_name) >= 0) {
                        column = columns[c];
                        break;
                    }
                }
            }
        }

        if (column) {

            var metadata = this.getColumnMetadata(column.dataIndex);

            if (Ext.isDefined(metadata)) {
                var config = {
                    col: column,
                    columnMetadata: metadata,
                    dataView: this,
                    listeners: {
                        filter: function(win, boundColumn, filterArray) {
                            this.fireEvent('applyfilter', this, boundColumn, filterArray);
                        },
                        clearfilter: function(win, fieldKeyPath) {
                            this.fireEvent('removefilter', this, fieldKeyPath, false);
                        },
                        clearall: function() {
                            this.fireEvent('removefilter', this, null, true);
                        },
                        scope: this
                    },
                    scope: this
                };

                var clzz = 'Connector.window.Filter';
                if (metadata.jsonType === 'string') {
                    clzz = 'Connector.window.Facet';
                }

                this.filterWin = Ext.create(clzz, config);
            }
        }
        else {
            console.error('Unable to find column for filtering.');
        }

        // ensure that the default trigger events do not occur
        return false;
    },

    showMeasureSelection : function() {
        var measureWindow = this.getMeasureSelectionWindow();
        var box = this.getBox();

        measureWindow.setSize(box.width-100, box.height-100);
        measureWindow.show();
//        measureWindow.showAt(47, 128);

        // Run the query to determine current measure counts
        var mp = this.getAxisSelector().getMeasurePicker();
        var filterState = this.getModel().get('filterState');
        mp.setCountMemberSet(filterState.hasFilters ? this.getModel().get('filterState').subjects : null);

        // Open with 'Current columns' selected if we have a selection
        if (mp.getSelectedRecords().length > 0 && mp.getSourceStore().getCount() > 0) {
            mp.getSourcesView().getSelectionModel().select(mp.getSourceStore().getAt(0));
        }
    },

    requestExport : function() {
        if (this.grid) {

            var model = this.getModel();

            var exportParams = {
                "schemaName": [model.get('schemaName')],
                "query.queryName": [model.get('queryName')],
                "query.showRows": ["ALL"]
            };

            // apply filters
            var filters = model.getFilterArray(true);
            Ext.each(filters, function(filter) {
                exportParams[filter.getURLParameterName()] = [filter.getURLParameterValue()];
            });

            // issue 20850: set export column headers to be "Dataset - Variable"
            exportParams["columnNames"] = [];
            exportParams["columnAliases"] = [];
            Ext.each(this.getGrid().getColumnsConfig(), function(colGroup){
                Ext.each(colGroup.columns, function(col){
                    exportParams["columnNames"].push(col.dataIndex);
                    exportParams["columnAliases"].push(colGroup.text + " - " + col.header);
                });
            });

            /**
             * Sometimes the GET URL gets too long, so use a POST instead. We have to create a separate <form>.
             */
            var newForm = document.createElement('form');
            document.body.appendChild(newForm);

            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('cds', 'exportRowsXLSX'),
                method: 'POST',
                form: newForm,
                isUpload: true,
                params: exportParams,
                callback: function(options, success, response) {
                    document.body.removeChild(newForm);

                    if (!success) {
                        // TODO: show error message
                    }
                }
            });
        }
    },

    showLimitMessage : function(max) {

        var msg = 'The app only shows up ' + max + ' rows. Export to see all data.';

        var exportId = Ext.id();
        var exportText = '<a id="' + exportId + '">Export</a>';
        msg += ' ' + exportText;

        var dismissId = Ext.id();
        var dismissText = '<a id="' + dismissId + '">Dismiss</a>';
        msg += ' ' + dismissText;

        this.showMessage(msg);
    }
});
