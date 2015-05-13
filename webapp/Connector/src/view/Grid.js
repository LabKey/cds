/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Grid.Pager', {

    extend: 'Ext.container.Container',

    layout: {
        type: 'hbox'
    },

    alias: 'widget.gridpager',

    floating: true,
    draggable: true,
    shadow: false,

    border: 1, // TODO: just for layout setup. remove.
    cls: 'grid-paging-widget',
    width: 260,
    height: 32,
    me: this,

    initComponent : function() {
        this.items = [{
            xtype: 'button',
            cls: 'paging-back-button',
            ui: 'rounded-small',
            icon: LABKEY.contextPath + '/Connector/images/icon_paging_leftArrow_normal.svg',
            iconCls: 'paging-arrow-svg-back',
            margin: '3 0 0 -2',
            handler: this.requestPreviousPage,
            listeners: {
                mouseover: {
                    fn: function() {
                        this.setIcon(LABKEY.contextPath + '/Connector/images/icon_paging_leftArrow_hover.svg');
                    }
                },
                mouseout: {
                    fn: function() {
                        this.setIcon(LABKEY.contextPath + '/Connector/images/icon_paging_leftArrow_normal.svg');
                    }
                }
            },
            scope: this
        },{
            xtype: 'container',
            cls: 'page-button-container',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            defaults: {
                xtype: 'button',
                ui: 'paging-widget-pages',
                flex: 1,
                handler: this.requestPage,
                scope: this
            },
            items : [{
                id: 'pager-first',
                text: "1"
            },{
                id: 'pager-ellipsisLeft',
                text: "..."
            },{
                id: 'pager-previous',
                text: "300"
            },{
                id: 'pager-middle',
                text: "301"
            },{
                id: 'pager-next',
                text: "302"
            },{
                id: 'pager-ellipsisRight',
                text: "..."
            },{
                id: 'pager-last',
                text: "700"
            }],
            border: 1,
            height: 30,
            margin: '1 0 0 0',
            width: 212
        },{
            xtype: 'button',
            cls: 'paging-next-button',
            ui: 'rounded-small',
            icon: LABKEY.contextPath + '/Connector/images/icon_paging_rightArrow_normal.svg',
            iconCls: 'paging-arrow-svg-next',
            margin: '3 0 0 0',
            handler: this.requestNextPage,
            listeners: {
                mouseover: {
                    fn: function() {
                        this.setIcon(LABKEY.contextPath + '/Connector/images/icon_paging_rightArrow_hover.svg');
                    }
                },
                mouseout: {
                    fn: function() {
                        this.setIcon(LABKEY.contextPath + '/Connector/images/icon_paging_rightArrow_normal.svg');
                    }
                }
            },
            scope: this
        }];

        this.callParent();
    },

    update : function(first, current, last) {

        //var first = 1000, current = 1000, last = 3000;

        var firstButton = Ext.getCmp('pager-first');
        var ellipLeft = Ext.getCmp('pager-ellipsisLeft');
        var prevButton = Ext.getCmp('pager-previous');
        var middleButton = Ext.getCmp('pager-middle');
        var nextButton = Ext.getCmp('pager-next');
        var ellipRight = Ext.getCmp('pager-ellipsisRight');
        var lastButton = Ext.getCmp('pager-last');

        if(firstButton && ellipLeft && prevButton && middleButton && nextButton && ellipRight && lastButton) {

            if(first === last) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.hide();
                prevButton.hide();
                middleButton.hide();
                nextButton.hide();
                ellipRight.hide();
                lastButton.hide();
                this.setWidth(75);
                this.items.items[1].setWidth(27);
            } else if(first === (last - 1)) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.setText(last.toString()).show().enable();
                prevButton.hide();
                middleButton.hide();
                nextButton.hide();
                ellipRight.hide();
                lastButton.hide();
                this.setWidth(105);
                this.items.items[1].setWidth(57);
            } else if(first === (last - 2)) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.setText((first + 1).toString()).show().enable();
                prevButton.setText(last.toString()).show().enable();
                middleButton.hide();
                nextButton.hide();
                ellipRight.hide();
                lastButton.hide();
                this.setWidth(135);
                this.items.items[1].setWidth(87);
            } else if(first === (last - 3)) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.setText((first + 1).toString()).show().enable();
                prevButton.setText((first + 2).toString()).show().enable();
                middleButton.setText(last.toString()).show().enable();
                nextButton.hide();
                ellipRight.hide();
                lastButton.hide();
                this.setWidth(165);
                this.items.items[1].setWidth(117);
            } else if(first === (last - 4)) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.setText((first + 1).toString()).show().enable();
                prevButton.setText((first + 2).toString()).show().enable();
                middleButton.setText((first + 3).toString()).show().enable();
                nextButton.setText(last.toString()).show().enable();
                ellipRight.hide();
                lastButton.hide();
                this.setWidth(195);
                this.items.items[1].setWidth(147);
            } else if(first === (last - 5)) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.setText((first + 1).toString()).show().enable();
                prevButton.setText((first + 2).toString()).show().enable();
                middleButton.setText((first + 3).toString()).show().enable();
                nextButton.setText((first + 4).toString()).show().enable();
                ellipRight.setText(last.toString()).show().enable();
                lastButton.hide();
                this.setWidth(225);
                this.items.items[1].setWidth(177);
            } else if(first === (last - 6)) {
                firstButton.setText(first.toString()).show().enable();
                ellipLeft.setText((first + 1).toString()).show().enable();
                prevButton.setText((first + 2).toString()).show().enable();
                middleButton.setText((first + 3).toString()).show().enable();
                nextButton.setText((first + 4).toString()).show().enable();
                ellipRight.setText((first + 5).toString()).show().enable();
                lastButton.setText(last.toString()).show().enable();
                this.setWidth(260);
                this.items.items[1].setWidth(212);
            } else {
                firstButton.setText(first.toString()).show().enable();
                lastButton.setText(last.toString()).show().enable();
                this.setWidth(260);
                this.items.items[1].setWidth(212);

                var middle;
                if(current <= first + 3) {
                    middle = first + 3;
                } else if(current >= last - 3) {
                    middle = last - 3;
                } else {
                    middle = current;
                }
                middleButton.setText(middle.toString()).show().enable();

                if( middle <= first + 3 ) {
                    ellipLeft.setText((first + 1).toString()).show().enable();
                    prevButton.setText((first + 2).toString()).show().enable();
                } else {
                    ellipLeft.setText("...").show().disable();
                    prevButton.setText((middle - 1).toString()).show().enable();
                }

                if( middle >= last - 3 ) {
                    nextButton.setText((last - 2).toString()).show().enable();
                    ellipRight.setText((last -1).toString()).show().enable();
                } else {
                    nextButton.setText((middle + 1).toString()).show().enable();
                    ellipRight.setText('...').show().disable();
                }
            }

            var btnArray = [];
            btnArray.push(firstButton);
            btnArray.push(ellipLeft);
            btnArray.push(prevButton);
            btnArray.push(middleButton);
            btnArray.push(nextButton);
            btnArray.push(ellipRight);
            btnArray.push(lastButton);

            var currentStr = current.toString();
            btnArray.forEach(function(btn) {
                btn.removeCls('selected');
                if(btn.getText() === currentStr)
                    btn.addClass('selected');
            });
        }
    },

    registerStore: function(newStore) {
        this.store = newStore;
    },

    requestPreviousPage: function() {
        if (this.store.currentPage > 1)
        {
            this.store.previousPage();
            this.update(1, this.store.currentPage, Math.ceil(this.store.totalCount/this.store.pageSize));
        }
    },

    requestNextPage: function() {
        var totalPages = Math.ceil(this.store.totalCount/this.store.pageSize);
        if (this.store.currentPage < totalPages)
        {
            this.store.nextPage();
            this.update(1, this.store.currentPage, totalPages);
        }
    },

    requestPage: function(f,e) {
        var pageNo = parseInt(f.getText());
        var totalPages = Math.ceil(this.store.totalCount/this.store.pageSize);
        if (pageNo <= totalPages && pageNo > 0)
        {
                this.store.loadPage(pageNo);
                this.update(1, this.store.currentPage, totalPages);
        }
    }

});


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
        this.addEvents('applyfilter', 'removefilter', 'measureselected');
    },

    initComponent : function() {

        // At times the store can be completely replaced for a given grid. When this occurs we want to
        // maintain the sorts that appeared on the previous store instance. They are temporarily stored
        // on this property.
        this.sorters = undefined;

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

        this.footer = Ext.create('Connector.view.Grid.Pager', this);
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
                    this.footer.alignTo('primarytabpanel', 'c-tl', [size.width/2, (size.height + 11)]);
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
        } else {
            // initialize footer if grid exists
            if(this.grid) {
                var size = this.getWidthHeight();
                var store = this.getGrid().getStore();
                this.footer.show();
                this.footer.alignTo('primarytabpanel', 'c-tl', [size.width / 2, (size.height + 11)]);
                this.footer.update(1, store.currentPage, Math.ceil(store.totalCount/store.pageSize));
            }
        }

        //this.footer.destroy();
        //this.remove(this.footer, true);
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
        newGrid.getStore().on('load', function()
        {

            if (prevGridId != null && prevGridId != newGrid.getId())
            {
                this.remove(prevGridId, true);
                this._hideOverlay();
            }

            this.add(newGrid);

            var size = this.getWidthHeight();
            var store = this.getGrid().getStore();
            this.footer.show();
            this.footer.alignTo('primarytabpanel', 'c-tl', [size.width/2, (size.height + 11)]);
            this.footer.update(1, store.currentPage, Math.ceil(store.totalCount/store.pageSize));

        }, this, {single: true});
    },

    onFilterChange : function(model) {
        var grid = this.getGrid(),
            store = grid.getStore();
        store.filterArray = model.getFilterArray(true);
        store.load();
        this.getGrid().getStore().loadPage(1);
        this.applyFilterColumnState(grid);
    },

    getAxisSelector : function() {
        if (!this.axisPanel) {
            this.axisPanel = Ext.create('Connector.panel.AxisSelector', {
                ui: 'axispanel',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                measureConfig : {
                    cls: 'gridcolumnpicker',
                    sourceCls: this.axisSourceCls,
                    supportSelectionGroup: true,
                    supportSessionGroup: true,
                    displaySourceCounts: true,
                    sourceCountSchema: Connector.studyContext.schemaName,
                    measuresStoreData: Connector.getService('Query').getMeasuresStoreData({
                        queryType: LABKEY.Query.Visualization.Filter.QueryType.DATASETS,
                        includeTimpointMeasures: true,
                        includeHidden: this.canShowHidden
                    }).measures
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

            this.footer.update(1, store.currentPage, Math.ceil(store.totalCount/store.pageSize));

        }, this);

        return store;
    },

    getWidthHeight : function() {

        var box = this.getBox();
        var width = box.width - 27;
        var height;
        //if (this.paging)
        //    height = box.height - this.headerHeight + 43;
        //else
            //height = box.height - this.headerHeight + 93;
        height = box.height - this.headerHeight + this.titleHeight;

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

    showMeasureSelection : function() {
        Connector.getService('Query').onQueryReady(function(query){
            var measureWindow = this.getMeasureSelectionWindow(),
                    box = this.getBox(),
                    mp = this.getAxisSelector().getMeasurePicker(),
                    filterState = this.getModel().get('filterState');

            measureWindow.setSize(box.width-100, box.height-100);
            measureWindow.show();

            // Run the query to determine current measure counts
            mp.setCountMemberSet(filterState.hasFilters ? filterState.subjects : null);

            // Open with 'Current columns' selected if we have a selection
            if (mp.getSelectedRecords().length > 0 && mp.getSourceStore().getCount() > 0) {
                mp.getSourcesView().getSelectionModel().select(mp.getSourceStore().getAt(0));
            }
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
    }
});
