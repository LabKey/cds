/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Grid', {

    extend: 'Ext.container.Container',

    alias: 'widget.groupdatagrid',

    requires: ['Ext.menu.DatePicker'],

    axisSourceCls: 'rawdatasource',

    columnWidth: 125,

    headerHeight: 161,

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
                cls: 'dimensionview',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'box',
                    autoEl: {
                        tag: 'div',
                        cls: 'titlepanel',
                        children: [{
                            tag: 'span',
                            html: 'view data grid'
                        }]
                    }
                },{
                    xtype: 'button',
                    cls: 'gridexportbtn',
                    text: 'export',
                    margin: '27 0 0 5',
                    handler: this.requestExport,
                    scope: this
                },{
                    xtype: 'button',
                    cls: 'gridcitationsbtn',
                    text: 'citations',
                    margin: '27 0 0 5',
                    disabled: true,
                    handler: function() {},
                    scope: this
                },{
                    // This allows for the following items to be right aligned
                    xtype: 'box',
                    flex: 1,
                    autoEl: {
                        tag: 'div'
                    }
                },{
                    xtype: 'button',
                    cls: 'gridcolumnsbtn',
                    text: 'choose columns',
                    margin: '27 20 0 5',
                    handler: this.showMeasureSelection,
                    listeners: {
                        afterrender : function(b) {
                            var picker = this.getAxisSelector().getMeasurePicker();
                            picker.on('beforeMeasuresStoreLoad', function(p, data) {
                                if (Ext.isDefined(data) && Ext.isArray(data.measures)) {
                                    this.setText('choose from ' + data.measures.length + ' columns');
                                }
                            }, b, {single: true});
                            picker.getMeasures();
                        },
                        scope: this
                    },
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
        model.on('updatecolumns', this.onColumnUpdate, this);

        // bind view to view
        this.on('resize', this.onViewResize, this);

        // plugin to handle loading mask for the grid
        this.addPlugin({
            ptype: 'loadingmask',
            beginConfig: {
                component: this,
                events: ['showload']
            },
            endConfig: {
                component: this,
                events: ['hideload']
            }
        });
    },

    showMessage : function() {
        if (!this.NO_SHOW) {

            //
            // Ensure we're in a proper state to show the overlay message
            //
            var valid = true;

            if (this.getModel().get('columnSet').length > 3) {
                valid = false;
            }

            if (valid) {
                var nogrid = Ext.create('Ext.Component', {
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

    hideMessage : function() {
        this.NO_SHOW = true;
        if (this.nogridmsg) {
            this.nogridmsg.hide();
        }
    },

    onViewResize : function() {
        Ext.defer(function() {
            if (this.getModel().isActive()) {
                var grid = this.getComponent('gridcomponent');
                if (grid) {
                    var size = this.getWidthHeight();
                    grid.setSize(size.width, size.height);
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
        this.getModel().setActive(view == 'groupdatagrid');
    },

    onColumnUpdate : function() {
        this.fireEvent('showload', this);

        //
        // remove the old grid
        //
        if (this.grid) {
            this.remove(this.grid, true);
            this.grid = null;
            this.gridStore = null;

            // reset the column mapping
            this.columnMap = {};
            this.hideMessage();
        }

        //
        // add the new grid
        //
        this.add(this.getGrid(this.getStore()));
    },

    onFilterChange : function(model, filterArray) {
        if (this.gridStore) {
            this.fireEvent('showload', this);
            this.gridStore.filterArray = model.getFilterArray(true);
            this.gridStore.load();
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
                    includeTimpointMeasures: true,
                    sourceCls: this.axisSourceCls,
                    filter: LABKEY.Query.Visualization.Filter.create({
                        schemaName: 'study',
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
            if (this.gridStore && this.gridStore.proxy) {
                fields = this.gridStore.proxy.reader.getFields();
            }

            if (fields) {
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].name == columnName) {
                        target = Ext.clone(fields[i]);
                        break;
                    }
                }
            }

            if (target) {
                target.filterField = (Ext.isDefined(target.displayField) ? target.displayField : target.fieldKey);
            }
            else {
                console.warn('failed to find column metadata:', columnName);
            }
        }

        return target;
    },

    getGrid : function(store) {

        if (!this.grid) {
            this.fireEvent('showload', this);

            var size = this.getWidthHeight();

            this.grid = Ext.create('Connector.grid.Panel', {
                model: this.getModel(),
                itemId: 'gridcomponent',
                height: size.height,
                width: size.width,
                forceFit: true,
                store: store,
                border: false,
                defaultColumnWidth: this.columnWidth,
                margin: '-93 0 0 27',
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
                        this.showMessage();
                    },
                    reconfigure: function(grid) {
                        this.updateColumnMap(grid.down('headercontainer'));

                        // reapply filters to the column UI
                        this.applyFilterColumnState(grid);
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

        if (!this.gridStore) {

            var model = this.getModel();

            this.gridStore = Ext.create('LABKEY.ext4.data.Store', {
                schemaName: model.get('schemaName'),
                queryName: model.get('queryName'),
                columns: model.get('columnSet'),
                filterArray: model.getFilterArray(true),
                maxRows: Connector.model.Grid.getMaxRows()
            });

            this.gridStore.on('load', function(store) {
                var cmp = Ext.getCmp('gridrowcountcmp');
                if (cmp) {
                    cmp.update({count: store.getCount()});
                }

                this.fireEvent('hideload', this);
            }, this);
        }

        return this.gridStore;
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
            else {
                console.log('failed to find filter column');
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
            var grid = this.getGrid(this.getStore());
            if (grid) {
                var columns = grid.query('gridcolumn');
                for (var c=0; c < columns.length; c++) {
                    if (columns[c].text.indexOf(_name) >= 0) {
                        column = columns[c];
                        break;
                    }
                }
            }
        }

        if (column) {
            this.filterWin = Ext.create('Connector.window.Filter', {
                col: column,
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
            });
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
        measureWindow.showAt(47, 128);

        // Run the query to determine current measure counts
        var picker = this.getAxisSelector().getMeasurePicker();
        picker.setCountMemberSet(this.getModel().get('filterState').subjects);
    },

    requestExport : function() {
        if (this.gridStore) {

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

            /**
             * Sometimes the GET URL gets too long, so use a POST instead. We have to create a separate <form>.
             */
            var newForm = document.createElement('form');
            document.body.appendChild(newForm);

            Ext.Ajax.request({
                url: LABKEY.ActionURL.buildURL('query', 'exportRowsXLSX'),
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
    }
});
