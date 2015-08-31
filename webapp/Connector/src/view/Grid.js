/*
 * Copyright (c) 2014-2015 LabKey Corporation
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

    titleHeight: 93,

    id: 'connector-view-grid',

    paging: true,

    constructor : function(config) {
        this.callParent([config]);
        this.addEvents('applyfilter', 'removefilter', 'requestexport', 'measureselected');
    },

    initComponent : function() {

        // At times the store can be completely replaced for a given grid. When this occurs we want to
        // maintain the sorts that appeared on the previous store instance. They are temporarily stored
        // on this property.
        this.sorters = undefined;

        this.columnMap = {};

        this.items = [{
            xtype: 'container',
            height: this.headerHeight,
            ui: 'custom',
            cls: 'header-container',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype: 'actiontitle',
                    text: 'View data grid'
                },
                {
                    // This allows for the following items to be right aligned
                    xtype: 'box',
                    flex: 1,
                    autoEl: {
                        tag: 'div'
                    }
                },
                this.getExportButton(),
                this.getCitationsButton(),
                this.getSelectColumnsButton()
            ]
        },{
            // This provides a row count on the screen for testing purposes
            id: 'gridrowcountcmp',
            xtype: 'box',
            style: 'position: absolute; top: 50px; left: 27px; color: transparent;',
            tpl: '<span id="gridrowcount">Row Count: {count}</span>',
            data: {count: -1}
        }];

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

        // destroy footer
        this.on('destroy', this.onDestroy, this);

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

        this.footer = Ext.create('Connector.component.GridPager', {
            listeners: {
                updatepage: this.showAlignFooter,
                scope: this
            }
        });

        this.on('beforehide', this.hideVisibleWindow);
    },

    getExportButton : function() {
        if (!this.exportButton) {
            this.exportButton = Ext.create('Ext.button.Button', {
                cls: 'gridexportbtn',
                ui: 'rounded-inverted-accent-text',
                text: 'export',
                margin: '0 15 0 0',
                handler: this.requestExport,
                scope: this
            });
        }

        return this.exportButton;
    },

    getCitationsButton : function() {
        if (!this.citationsButton) {
            this.citationsButton = Ext.create('Ext.button.Button', {
                cls: 'gridcitationsbtn',
                text: 'citations',
                ui: 'rounded-inverted-accent-text',
                margin: '0 15 0 0',
                disabled: true,
                handler: function() {},
                scope: this
            });
        }

        return this.citationsButton;
    },

    getSelectColumnsButton : function() {
        if (!this.selectColumnsButton) {
            this.selectColumnsButton = Ext.create('Ext.button.Button', {
                cls: 'gridcolumnsbtn',
                text: 'select columns',
                handler: this.showMeasureSelection,
                scope: this
            });
        }

        return this.selectColumnsButton;
    },

    setVisibleWindow : function(win) {
        this.visibleWindow = win;
    },

    clearVisibleWindow : function() {
        if (Ext.isObject(this.visibleWindow) && this.visibleWindow.hideLock === true) {
            this.visibleWindow.hideLock = false;
        }
        else {
            this.visibleWindow = undefined;
        }
    },

    // Issue 23585: panel remains even if underlying page changes
    hideVisibleWindow : function() {
        if (Ext.isObject(this.visibleWindow)) {
            this.visibleWindow.hide();
        }
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
                    this.showAlignFooter(null, null, true);
                    this.resizeMessage();
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
        var isActive = view === this.xtype;
        this.getModel().setActive(isActive);

        if (!isActive) {
            this.hideMessage();
            this.footer.hide();
        }
        else if (this.grid) {
            this.showAlignFooter();
        }
    },

    onColumnUpdate : function() {

        // hold on to the previous grid id so it can be removed once we are ready to add the new grid
        var prevGridId = this.grid ? this.grid.getId() : null;

        // reset the grid and column mapping
        if (prevGridId != null) {
            var sorters = this.grid.getStore().getSorters();
            if (!Ext.isEmpty(sorters)) {
                this.sorters = sorters;
            }
            else {
                this.sorters = undefined;
            }
        }
        else {
            this.sorters = undefined;
        }

        this.grid = null;
        this.columnMap = {};

        // add the new grid once the store has finished loading
        var newGrid = this.getGrid();
        newGrid.getStore().on('load', function() {
            if (prevGridId != null && prevGridId != newGrid.getId()) {
                this.remove(prevGridId, true);
                this._hideOverlay();
            }

            this.add(newGrid);

        }, this, {single: true});
    },

    onFilterChange : function(model) {
        var grid = this.getGrid(),
            store = grid.getStore();
        store.filterArray = model.getFilterArray(true);
        store.load();
        this.getGrid().getStore().loadPage(1);
        this.applyFilterColumnState(grid);
        Connector.getService('Query').clearSourceCountsCache();
    },

    getColumnSelector : function() {
        if (!this.columnSelectorPanel) {
            this.columnSelectorPanel = Ext.create('Connector.panel.Selector', {
                headerTitle: 'choose columns',
                selectButtonTitle: 'Done',
                testCls: 'column-axis-selector',
                multiSelect: true,
                sourceMeasureFilter: {
                    queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                    includeTimpointMeasures: true,
                    includeHidden: this.canShowHidden
                },
                memberCountsFn: ChartUtils.getSubjectsIn,
                memberCountsFnScope: this,
                supportSelectionGroup: true,
                supportSessionGroup: true,
                disableAdvancedOptions: true,
                listeners: {
                    selectionmade: function(selected) {
                        this.clearVisibleWindow();

                        this.fireEvent('measureselected', selected);
                        this.getMeasureSelectionWindow().hide();
                    },
                    cancel: function() {
                        this.clearVisibleWindow();
                        this.getMeasureSelectionWindow().hide();
                    },
                    scope: this
                }
            });
        }

        return this.columnSelectorPanel;
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
                        this.showAlignFooter();
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
                ui: 'axiswindow',
                modal: true,
                draggable: false,
                header: false,
                resizable: false,
                closeAction: 'hide',
                style: 'padding: 0',
                minHeight: 580,
                border: false,
                layout: {
                    type: 'fit'
                },
                items: [ this.getColumnSelector() ],
                listeners: {
                    scope: this,
                    show: function(cmp) {
                        this.setVisibleWindow(cmp);
                    }
                }
            });

            // whenever the window is closed/hidden, go back to the sources panel
            this.measureWindow.on('hide', function() { this.getColumnSelector().showSources(); }, this);
        }

        return this.measureWindow;
    },

    getModel : function() {
        return this.model;
    },

    initGridStore : function() {
        var model = this.getModel();
        var maxRows = Connector.model.Grid.getMaxRows();

        var config = {
            schemaName: model.get('schemaName'),
            queryName: model.get('queryName'),
            columns: model.get('columnSet'),
            filterArray: model.getFilterArray(true),
            maxRows: maxRows,
            pageSize: maxRows,
            remoteSort: true
        };

        if (Ext.isDefined(this.sorters)) {
            config['sorters'] = this.sorters;
            this.sorters = undefined;
        }

        var store = Ext.create('LABKEY.ext4.data.Store', config);

        store.on('beforeload', function() {
            this.fireEvent('showload', this);
        }, this);

        this.footer.registerStore(store);

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

            if (rowCount >= maxRows && !this.paging) {
                this.showLimitMessage(maxRows);
            }
        }, this);

        return store;
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
    applyFilterColumnState : function(grid) {

        var columns = grid.headerCt.getGridColumns(),
            filterFieldMap = {}, colMeta;

        // remove all filter classes
        Ext.each(columns, function(column) {
            if (Ext.isDefined(column.getEl())) {
                column.getEl().removeCls('filtered-column');
            }
        }, this);

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

        Ext.each(this.getModel().getFilterArray(), function(filter) {
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
        var model = this.getModel(),
            modelMap = {},
            columns,
            models = model.get('metadata').columnModel;

        Ext.each(models, function(model) {
            modelMap[model.dataIndex] = model;
        }, this);

        Ext.each(columnGroups, function(group) {
            columns = group.columns;
            Ext.each(columns, function(column) {
                var model = modelMap[column.dataIndex];
                if (model) {
                    column.hidden = model.hidden;
                    column.header = Ext.htmlEncode(model.header);
                }

                column.showLink = false;
            }, this);

        }, this);
    },

    onTriggerClick : function(headerCt, column/*, evt, el */) {
        if (Ext.isString(column)) {

            var _name = column;
            column = null;

            // lookup column by name
            if (this.grid) {
                var columns = this.getGrid().query('gridcolumn');
                Ext.each(columns, function(col) {
                    if (col.text.indexOf(_name) >= 0) {
                        column = col;
                        return false;
                    }
                });
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

                Ext.create(clzz, config);
            }
        }
        else {
            console.error('Unable to find column for filtering.');
        }

        // ensure that the default trigger events do not occur
        return false;
    },

    getLockedMeasureAliases : function() {
        // return an array of measure aliases for those columns added to the grid via plot selection or active filters
        var model = this.getModel(), aliases;
        aliases = Ext.Array.pluck(model.getMeasures('plotMeasures'), 'alias');
        aliases = aliases.concat(Ext.Array.pluck(model.getMeasures('SQLMeasures'), 'alias'));
        return Ext4.Array.unique(aliases);
    },

    getSelectedMeasureAliases : function() {
        // return an array of measure aliases for those columns added to the grid via the column chooser
        return Ext.Array.pluck(this.getModel().getMeasures('measures'), 'alias');
    },

    showMeasureSelection : function() {
        Connector.getService('Query').onQueryReady(function() {
            this.getColumnSelector().setLockedMeasures(this.getLockedMeasureAliases());
            this.getColumnSelector().setSelectedMeasures(this.getSelectedMeasureAliases());
            this.getColumnSelector().loadSourceCounts();
            this.getMeasureSelectionWindow(this.getSelectColumnsButton().getEl()).show();
        }, this);
    },

    requestExport : function() {
        if (this.grid) {

            var model = this.getModel(), sort = '', sep = '';

            var exportParams = {
                schemaName: [model.get('schemaName')],
                "query.queryName": [model.get('queryName')],
                "query.showRows": ["ALL"],
                columnNames: [],
                columnAliases: []
            };

            // apply filters
            Ext.each(model.getFilterArray(true /* includeBaseFilters */), function(filter) {
                exportParams[filter.getURLParameterName()] = [filter.getURLParameterValue()];
            });

            // apply sorts
            Ext.each(this.getGrid().getStore().getSorters(), function(sorter) {
                sort += sep + (sorter.direction === 'DESC' ? '-' : '') + sorter.property;
                sep = ',';
            });
            if (!Ext.isEmpty(sort)) {
                exportParams["query.sort"] = sort;
            }

            // issue 20850: set export column headers to be "Dataset - Variable"
            Ext.each(this.getGrid().getColumnsConfig(), function(colGroup) {
                Ext.each(colGroup.columns, function(col) {
                    exportParams.columnNames.push(col.dataIndex);
                    exportParams.columnAliases.push(colGroup.text + " - " + col.header);
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
                callback: function(options, success/*, response*/) {
                    document.body.removeChild(newForm);

                    if (!success) {
                        // TODO: show error message
                    }
                }
            });

            this.fireEvent('requestexport', this, exportParams);
        }
    },

    showLimitMessage : function(max) {

        var msg = 'The app only shows up ' + max + ' rows. Export to see all data.';
        var msgKey = 'GRID_LIMIT';

        var exportId = Ext.id();
        var exportText = '<a id="' + exportId + '">Export</a>';
        msg += ' ' + exportText;

        var dismissId = Ext.id();
        var dismissText = '<a id="' + dismissId + '">Dismiss</a>';
        msg += ' ' + dismissText;

        var shown = this.sessionMessage(msgKey, msg);
        if (shown) {
            Ext.get(exportId).on('click', this.requestExport, this);
            Ext.get(dismissId).on('click', function() {
                this.showmsg = true; this.hideMessage();
                Connector.getService('Messaging').block(msgKey);
            }, this);
        }
    },

    showAlignFooter : function(comp, caller, resize) {
        if (this.footer && this.grid) {
            var footer = this.footer,
                size = this.getWidthHeight(),
                up = this.up(),
                position = 'c-tl',
                offsets = [size.width / 2, (size.height + 11)];

            if (!footer.isVisible()) {
                footer.show();
                footer.alignTo(up, position, offsets);
            }

            if (footer.realign) {
                footer.alignTo(up, position, offsets);
                footer.realign = false;
            }

            if (resize) {
                footer.alignTo(up, position, offsets);
            }
        }
    }
});
