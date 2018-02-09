/*
 * Copyright (c) 2014-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.Grid', {

    extend: 'Ext.container.Container',

    alias: 'widget.groupdatagrid',

    requires: ['Ext.menu.DatePicker', 'Connector.window.*'],

    axisSourceCls: 'rawdatasource',

    cls: 'connector-grid-container',

    columnWidth: 125,

    headerHeight: 180,

    titleHeight: 50,

    id: 'connector-view-grid',

    paging: true,

    statics: {
        getDefaultSort : function (datasource) {
            if (datasource === QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS)
            {
                return [{
                    property: QueryUtils.DEMOGRAPHICS_SUBJECT_ALIAS,
                    direction: 'ASC'
                }];
            }
            else
            {
                return [{
                    property: QueryUtils.STUDY_ALIAS_PREFIX + 'SubjectId',
                    direction: 'ASC'
                },{
                    property: QueryUtils.STUDY_ALIAS_PREFIX + 'Days',
                    direction: 'ASC'
                }];
            }

        }
    },

    constructor : function(config)
    {
        this.callParent([config]);
        this.addEvents('applyfilter', 'removefilter', 'requestexport', 'measureselected', 'usergridfilter', 'datasourceupdate', 'sheetselected');
    },

    initComponent : function()
    {
        // At times the store can be completely replaced for a given grid. When this occurs we want to
        // maintain the sorts that appeared on the previous store instance. They are temporarily stored
        // on this property.
        this.sorters = Connector.view.Grid.getDefaultSort();

        this.columnMap = {};

        this.gridSorters = {}; // hold on to client side sorts for each grid

        this.items = [{
            xtype: 'container',
            height: this.headerHeight,
            ui: 'custom',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                cls: 'header-container',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'actiontitle',
                    flex: 1,
                    text: 'View data grid',
                    buttons: [
                        this.getExportCSVButton(),
                        this.getExportExcelButton(),
                        this.getCitationsButton()
                    ]
                }]
            }, {
                xtype: 'container',
                items: [this.getSourceTabHeader(), this.getSelectColumnsButton()],
                layout: {
                    type: 'hbox',
                }
            }]
        }];

        this.callParent();
        var model = this.getModel();

        // bind model to view
        this.on('applyfilter', model.onGridFilterChange, model);
        this.on('removefilter', model.onGridFilterRemove, model);
        this.on('measureselected', model.onMeasureSelected, model);
        this.on('sheetselected', model.onSheetSelected, model);
        this.getSourceTabHeader().on('sheetselected', model.onSheetSelected, model);
        this.on('boxready', model.onViewReady, model, {single: true});

        // bind view to model
        model.on('filterchange', this.onFilterChange, this);
        model.on('updatecolumns', this.onColumnUpdate, this, {buffer: 200});
        model.on('datasourceupdate', this.updateGridTabs, this, {buffer: 200});

        // propagate event from model
        this.relayEvents(model, ['usergridfilter']);

        // bind view to view
        this.on('resize', this.onViewResize, this);

        // destroy footer
        this.on('destroy', this.onDestroy, this);

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

        this.footer = Ext.create('Connector.component.GridPager', {
            listeners: {
                updatepage: function() {
                    this.showAlignFooter();
                },
                scope: this
            }
        });

        this.on('beforehide', this.hideVisibleWindow);
    },

    getSourceTabHeader : function() {
        if (!this.headerDataView) {
            var sourceData = this.getModel().getSources().map(function(sourceName){
                return {source: sourceName}
            });

            var store = Ext.create('Ext.data.Store', {
                model: 'Connector.model.GridHeaderDataView',
                data: sourceData,
                autoLoad: true
            });

            this.headerDataView = Ext.create('Connector.view.GridHeaderDataView', {
                cls: 'grid-tab-selector',
                flex: 1,
                store: store
            });
            this.headerDataView.on({
                itemclick: function(view, model) {
                    this.fireEvent('sheetselected', model.get('source'));
                },
                scope: this
            });
        }
        return this.headerDataView;
    },

    updateGridTabs: function () {
        var firstTimeLoad = this.getSourceTabHeader().getStore().getCount() === 0;
        var sourceData = this.getModel().getSources().map(function(sourceName){
            return {source: sourceName}
        });

        this.getSourceTabHeader().getStore().loadData(sourceData);

        if (!this.getModel().isValidDataSource() || firstTimeLoad) {
            this.getSourceTabHeader().selectTab(QueryUtils.DATA_SOURCE_STUDY_AND_TIME);
        }
        else {
            this.getSourceTabHeader().selectTab(this.getModel().get("dataSource"), true);
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
                text: 'Add/Remove columns',
                width: 150,
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

    _showOverlay : function(datasource)
    {
        if (!this.NO_SHOW || datasource)
        {
            // Ensure we're in a proper state to show the overlay message
            if (this.getModel().get('columnSet').length <= 8)
            {
                Ext.create('Ext.Component', {
                    renderTo: this.getEl(),
                    cls: 'nogridmsg',
                    autoEl: {
                        tag: 'div',
                        style: 'position: absolute; left: ' + (datasource ? '40%' : '600px') + '; top: 47%;',
                        children: [{
                            tag: 'h1',
                            html: 'Choose columns of ' + (datasource ? datasource : 'subject data') + '.'
                        },{
                            tag: 'h1',
                            html: 'Sort, filter, and label subjects.',
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
            if (this.getModel().isActive())
            {
                if (this.grid)
                {
                    var size = this.getWidthHeight();
                    this.getGrid().setSize(size.width, size.height);
                    this.showAlignFooter(true);
                }

                if (this.measureWindow)
                {
                    this.measureWindow.center();
                }
            }
        }, 50, this);
    },

    onActivate : function()
    {
        this.getModel().setActive(true);

        this.showAlignFooter();
    },

    onDeactivate : function()
    {
        this.getModel().setActive(false);

        this.footer.hide();
    },

    onColumnUpdate : function() {

        // hold on to the previous grid id so it can be removed once we are ready to add the new grid
        var prevGridId = this.grid ? this.grid.getId() : null;
        var newDataSource = this.getModel().get('dataSource');
        var defaultSorters = Connector.view.Grid.getDefaultSort(newDataSource);
        // reset the grid and column mapping
        if (prevGridId != null) {
            var prevGridSorters = this.grid.getStore().getSorters();
            var previousDataSource = this.grid.datasource ? this.grid.datasource : QueryUtils.DATA_SOURCE_STUDY_AND_TIME;
            if (!Ext.isEmpty(prevGridSorters)) {
                this.gridSorters[previousDataSource] = prevGridSorters;
            }
        }

        if (this.gridSorters[newDataSource] && !Ext.isEmpty(this.gridSorters[newDataSource])) {
            this.sorters = this.gridSorters[newDataSource];
        }
        else {
            this.sorters = defaultSorters;
        }

        this.grid = null;
        this.columnMap = {};

        this._hideOverlay();
        if (!this.getModel().isValidDataSource())
        {
            this.remove(prevGridId, true);
            this._showOverlay(this.getModel().getDataSource());
            if (this.footer && this.footer.isVisible())
                this.footer.hide();
            return;
        }

        // add the new grid once the store has finished loading
        var newGrid = this.getGrid();
        newGrid.getStore().on('load', function() {
            if (prevGridId != null && prevGridId != newGrid.getId()) {
                this.remove(prevGridId, true);
            }

            this.add(newGrid);

        }, this, {single: true});
    },

    onFilterChange : function()
    {
        this.getGrid().getStore().loadPage(1);
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
                    includeTimepointMeasures: true,
                    includeHidden: this.canShowHidden,
                    includeAssayRequired: true,
                    includeVirtualSources: true,
                    includeDefinedMeasureSources: true,
                    userFilter : function(row) {
                        return row.variableType !== 'TIME' || !row.isDiscreteTime;
                    }
                },
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
            var fields = this.getModel().getActiveSheetMetadata().metaData.fields;

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

            var defaultRowSize = this.getDefaultRowSize();

            this.grid = Ext.create('Connector.grid.Panel', {
                model: this.getModel(),
                datasource: this.getModel().get("dataSource"),
                height: size.height,
                width: size.width,
                forceFit: false,
                store: this.initGridStore(),
                border: false,
                defaultColumnWidth: this.columnWidth,
                margin: '-50 24 0 24',
                ui: 'custom',
                viewConfig: {
                    emptyText: '<div style="width:' + defaultRowSize + 'px;">No grid data with current filters</div>',
                    deferEmptyText: false,
                    loadMask: false
                },
                listeners: {
                    columnmodelcustomize: this.onColumnModelCustomize,
                    beforerender: function(grid) {
                        var header = grid.down('headercontainer');
                        header.on('headertriggerclick', this.onTriggerClick, this);
                    },
                    boxready : function() {
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

    getDefaultRowSize: function() {
        var uniqColumns = this.getModel().get('columnSet');
        uniqColumns = Ext.Array.map(uniqColumns, function(v){
            return v.toLowerCase();
        });
        uniqColumns = uniqColumns.filter(function(value, index) {
            return uniqColumns.indexOf(value) === index;
        });
        return uniqColumns.length * this.columnWidth;
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
                    },
                    hide: function() {
                        // whenever the window is closed/hidden, go back to the sources panel
                        this.getColumnSelector().showSources();
                    }
                }
            });
        }

        return this.measureWindow;
    },

    getModel : function() {
        return this.model;
    },

    initGridStore : function()
    {
        var model = this.getModel(),
            maxRows = Connector.model.Grid.getMaxRows();

        var config = {
            schemaName: model.get('schemaName'),
            queryName: model.get('queryName'),
            columns: model.get('columnSet'),
            maxRows: maxRows,
            pageSize: maxRows,
            remoteSort: true,
            supressErrorAlert: true,
            listeners: {
                beforeload: function()
                {
                    this.fireEvent('showload', this);
                },
                load: function()
                {
                    // show/hide for a filter change need to place nicely with the show/hide for a column change
                    // (i.e. new grid creation) so we only hide the mask on store load if the grid is already rendered
                    if (this.getGrid().rendered) {
                        this.fireEvent('hideload', this);
                    }
                },
                scope: this
            }
        };

        if (Ext.isDefined(this.sorters)) {
            config['sorters'] = this.sorters;
            this.sorters = undefined;
        }

        var store = Ext.create('LABKEY.ext4.data.Store', config);

        this.footer.registerStore(store);

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
    applyFilterColumnState : function(grid)
    {
        var filterFieldMap = {}, colMeta;

        // remove all filter classes
        Ext.each(grid.headerCt.getGridColumns(), function(column)
        {
            if (Ext.isDefined(column.getEl()))
            {
                column.getEl().removeCls('filtered-column');
            }
        });

        Ext.iterate(this.columnMap, function(dataIndex)
        {
            colMeta = this.getColumnMetadata(dataIndex);

            if (colMeta && Ext.isDefined(colMeta.filterField))
            {
                filterFieldMap[colMeta.filterField] = {
                    metdata: colMeta,
                    dataIndex: dataIndex
                };
            }
            else
            {
                console.warn('unable to map filter column');
            }
        }, this);

        Ext.each(this.getModel().getFilterArray(), function(filter)
        {
            var alias = filter.getColumnName(),
                altAlias = Connector.getQueryService().getMeasureSourceAlias(alias, 'child');

            // if measure does not exist by the given alias, try looking up by the sourceMeasureAlias
            if (!Ext.isDefined(filterFieldMap[alias]) && altAlias != null)
            {
                alias = altAlias;
            }

            colMeta = filterFieldMap[alias];
            if (colMeta)
            {
                var columnIndex = this.columnMap[colMeta.dataIndex];

                if (columnIndex > -1)
                {
                    var col = grid.headerCt.getHeaderAtIndex(columnIndex);
                    if (col)
                    {
                        col.getEl().addCls('filtered-column');
                    }
                }
            }

        }, this);
    },

    /**
     * Updates the columnMap to ensure the correct column index
     * @param {Ext.grid.header.Container} gridHeader
     */
    updateColumnMap : function(gridHeader)
    {
        var i = 0;
        Ext.each(gridHeader.getGridColumns(), function(gridColumn)
        {
            if (!gridColumn.hidden)
            {
                // only index for non-hidden columns
                this.columnMap[gridColumn.dataIndex] = i;
                i++;
            }
        }, this);
    },

    onColumnModelCustomize : function(grid, columnGroups) {
        var model = this.getModel(),
            modelMap = {},
            columns,
            columnModels = model.getActiveSheetMetadata().columnModel,
            applyChecker = false,
            queryService = Connector.getQueryService();

        Ext.each(columnModels, function(columnModel) {
            modelMap[columnModel.dataIndex] = columnModel;
        }, this);

        if (QueryUtils.DATASET_ALIAS in modelMap) {
            applyChecker = true;
        }

        Ext.each(columnGroups, function(group) {
            columns = group.columns;
            Ext.each(columns, function(column) {

                var model = modelMap[column.dataIndex];
                if (model) {
                    column.hidden = model.hidden || (model.dataIndex == QueryUtils.DATASET_ALIAS);
                    column.header = Ext.htmlEncode(model.header);
                }

                if (applyChecker) {
                    var measure = !QueryUtils.isGeneratedColumnAlias(column.dataIndex) ? queryService.getMeasure(column.dataIndex) : undefined;
                    if (Ext.isObject(measure) && (measure.isMeasure || measure.isDimension)) {
                        column.renderer = Ext.bind(this.cellRenderer, this, [measure], 3);
                    }
                }

                column.showLink = false;
            }, this);

        }, this);
    },

    cellRenderer : function(v, meta, record, measure) {
        if (Ext.isEmpty(v) && Ext.isDefined(record.get(QueryUtils.DATASET_ALIAS)) &&
            (record.get(QueryUtils.DATASET_ALIAS) !== measure.queryName))
        {
            meta.style = "text-align: center;"; // Ext will inject this as 'right' if we don't
            meta.tdCls += " no-value";
            return null;
        }
        return v;
    },

    onTriggerClick : function(headerCt, column)
    {
        if (Ext.isString(column))
        {
            var _name = column;
            column = null;

            // lookup column by name
            if (this.grid)
            {
                Ext.each(this.getGrid().query('gridcolumn'), function(col)
                {
                    if (col.text.indexOf(_name) >= 0)
                    {
                        column = col;
                        return false;
                    }
                });
            }
        }

        if (column)
        {
            var metadata = this.getColumnMetadata(column.dataIndex);

            if (Ext.isDefined(metadata))
            {
                var clzz = 'Connector.window.Filter';
                if (metadata.jsonType === 'string')
                {
                    clzz = 'Connector.window.Facet';
                }

                Ext.create(clzz, {
                    col: column,
                    columnMetadata: metadata,
                    dataView: this,
                    listeners: {
                        filter: function(win, boundColumn, oldFilters, newFilters)
                        {
                            this.fireEvent('applyfilter', this, boundColumn, oldFilters, newFilters);
                        },
                        clearfilter: function(win, fieldKeyPath)
                        {
                            this.fireEvent('removefilter', this, fieldKeyPath);
                        },
                        scope: this
                    },
                    scope: this
                });
            }
        }
        else
        {
            console.error('Unable to find column for filtering.');
        }

        // ensure that the default trigger events do not occur
        return false;
    },

    /**
     * return an array of measure aliases for those columns added to the grid via plot selection or active filters
     * @returns {*|Array}
     */
    getLockedMeasureAliases : function()
    {
        var model = this.getModel();
        var aliases = Ext.Array.push(Ext.Array.pluck(model.getMeasures('defaultMeasures'), 'alias'));

        // special case for getting the alias of an alignment visit from plot
        Ext4.each(model.get('SQLMeasures'), function(sqlMeasure) {
            aliases.push(QueryUtils.ensureAlignmentAlias(sqlMeasure, sqlMeasure.measure.alias));
        }, this);

        return Ext.Array.unique(aliases);
    },

    /**
     * return an array of measure aliases for those columns added to the grid via the column chooser
     * @returns {*|Array}
     */
    getSelectedMeasureAliases : function()
    {
        var model = this.getModel();

        var aliases = Ext.Array.push(
            Ext.Array.pluck(model.getMeasures('gridColumnMeasures'), 'alias')
        );

        return Ext.Array.unique(aliases);
    },

    showMeasureSelection : function()
    {
        Connector.getQueryService().onQueryReady(function()
        {
            var columnSelector = this.getColumnSelector();

            columnSelector.setLockedMeasures(this.getLockedMeasureAliases());
            columnSelector.setSelectedMeasures(this.getSelectedMeasureAliases());
            columnSelector.loadSourceCounts();

            this.getMeasureSelectionWindow(this.getSelectColumnsButton().getEl()).show();
        }, this);
    },

    requestExportCSV: function() {
        this.requestExport(false);
    },

    requestExportExcel: function() {
        this.requestExport(true);
    },

    requestExport : function(isExcel) {
        var sources = this.getModel().getSources();
        this.getModel().requestMetaData(sources, this.onExport, this, isExcel);
    },

    onExport : function(isExcel) {
        if (this.grid || !this.getModel().isValidDataSource()) {
            var model = this.getModel();

            var exportParams = {
                "query.showRows": ['ALL'],
                columnNames: [],
                columnAliases: [],
                variables: []
            };

            var dataTabNames = [], schemaNames = [], queryNames = [], metadatas = this.getModel().get('metadatas');

            Ext.each(this.getModel().getSources(), function (datasource) { // ensure tab ordering
                var metadata = metadatas[datasource];
                if (metadata) {
                    dataTabNames.push(datasource);
                    schemaNames.push(metadata.schemaName);
                    queryNames.push(metadata.queryName);
                }
            });

            exportParams.dataTabNames = dataTabNames;
            exportParams.schemaNames = schemaNames;
            exportParams.queryNames = queryNames;

            // apply filters
            Ext.each(model.getBaseFilters(), function (filter) {
                exportParams[filter.getURLParameterName()] = [filter.getURLParameterValue()];
            });

            // apply sorts
            sort = this.getGridSortExportParams();

            if (!Ext.isEmpty(sort)) {
                exportParams["query.sort"] = sort;
            }

            var gridAssays = [];
            var gridModel = this.getModel();

            var groups = Connector.grid.Panel.groupColumns(gridModel.getAllWrappedMeasures(gridModel.hasDemographics()), true);
            groups = this.getSortedDemographicsCols(groups);
            Ext.each(groups, function (group) {
                Ext.each(group.columns, function (m) {
                    var measure = m.measure;
                    var alias = measure.alias.toLowerCase();
                    if (exportParams.columnNames.indexOf(alias) !== -1)
                        return; // skip duplicate
                    else if (alias === QueryUtils.SUBJECT_SEQNUM_ALIAS.toLowerCase())
                        return; // skip participant sequence num
                    exportParams.columnNames.push(alias);
                    exportParams.columnAliases.push(measure.label);

                    if (measure.queryType == 'datasets') {
                        if (gridAssays.indexOf(measure.queryName) === -1)
                            gridAssays.push(measure.queryName);
                        var variable = measure.queryLabel + ChartUtils.ANTIGEN_LEVEL_DELIMITER + measure.label + ChartUtils.ANTIGEN_LEVEL_DELIMITER + measure.description;
                        exportParams.variables.push(variable);
                    }
                });
            });

            /**
             * Sometimes the GET URL gets too long, so use a POST instead. We have to create a separate <form>.
             */
            var newForm = document.createElement('form');
            document.body.appendChild(newForm);

            var me = this;
            Connector.getState().onMDXReady(function (mdx) {

                var filterStrings = [];
                Ext.each(Connector.getState().filters, function (filter) {
                    filterStrings = filterStrings.concat(QueryUtils.getFilterStrings(filter, mdx));
                });
                exportParams.filterStrings = filterStrings;

                mdx.query({
                    onRows: [{
                        level: '[Study.Treatment].[Treatment]',
                        members: 'members'
                    }],
                    useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                    showEmpty: false,
                    success: function (results) {
                        exportParams.studies = me.loadExportableStudies(results);

                        LABKEY.Query.selectRows({
                            schemaName: 'study',
                            queryName: 'ds_assayidentifier',
                            success: function (assayData) {
                                var assayIdentifierTypes = {};
                                Ext.each(assayData.rows, function (assayMeta) {
                                    assayIdentifierTypes[assayMeta.assay_identifier] = assayMeta.dataset_name;
                                }, this);

                                mdx.query({
                                    onRows: [{
                                        level: '[Assay.Study].[Study]',
                                        members: 'members'
                                    }],
                                    useNamedFilters: [LABKEY.app.constant.STATE_FILTER],
                                    showEmpty: false,
                                    success: function (results) {
                                        exportParams.studyassays = me.loadExportableStudyAssays(results, gridAssays, assayIdentifierTypes);

                                        var exportUrl = LABKEY.ActionURL.buildURL('cds', isExcel ? 'exportRowsXLSX' : 'exportCSV');
                                        Ext.Ajax.request({
                                            url: exportUrl,
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

                                        this.fireEvent('requestexport', me, exportParams);
                                    },
                                    scope: me
                                });
                            },
                            scope: this
                        });
                    }
                });
            });

        }
    },

    getSortedDemographicsCols: function(groups) {
        if (groups[0].text === QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS)
        {
            groups[0].columns = this.model.getDefaultWrappedMeasures(QueryUtils.DATA_SOURCE_SUBJECT_CHARACTERISTICS).concat(groups[0].columns);
        }
        return groups;
    },

    getGridSortExportParams: function() {
        var currentGridSorters = this.grid.getStore().getSorters();
        var currentDataSource = this.grid.datasource ? this.grid.datasource : QueryUtils.DATA_SOURCE_STUDY_AND_TIME;
        if (!Ext.isEmpty(currentGridSorters)) {
            this.gridSorters[currentDataSource] = currentGridSorters;
        }

        var rOrderedTabs = this.getModel().getSources().slice().reverse(); // reverse tab order so sorting is performed on the significant column for each tab
        var sort = '', sep = '';
        Ext.each(rOrderedTabs, function(datasource){
            var sorters = this.gridSorters[datasource];
            if (!sorters)
                return true; // skip
            Ext.each(sorters, function(sorter) {
                sort += sep + (sorter.direction === 'DESC' ? '-' : '') + sorter.property;
                sep = ',';
            });
        }, this);

        return sort;
    },

    loadExportableStudies: function(cellset)
    {
        if (!cellset || !cellset.axes[1])
            return [];
        var memberDefinitions = cellset.axes[1].positions, members = [];
        Ext.each(memberDefinitions, function(definition) {
            var def = definition[0];
            members.push(LABKEY.app.model.Filter.getMemberLabel(def.name));
        });
        return members;
    },

    loadExportableStudyAssays: function(cellset, gridAssays, assayIdentifierTypes)
    {
        if (!cellset || !cellset.axes[1])
            return [];
        var memberDefinitions = cellset.axes[1].positions, studyassays = [];
        Ext.each(memberDefinitions, function(definition) {
            var def = definition[0], uniqueName = def.uniqueName, parts = uniqueName.split("].[");
            var assay = LABKEY.app.model.Filter.getMemberLabel(parts[1]), study = LABKEY.app.model.Filter.getMemberLabel(def.name);

            // Issue 31333: Export cover sheet lists all assays regardless of columns chosen
            // Only include assays listed on data grid, which may be a smaller set compared with active assays in filters
            // If no assay columns are present on data grid, then list all assays active in filter
            var assayType = assayIdentifierTypes[assay];
            if (gridAssays != null && gridAssays.length > 0 && gridAssays.indexOf(assayType) > -1)
                studyassays.push(study + ChartUtils.ANTIGEN_LEVEL_DELIMITER + assay);
        });
        return studyassays;
    },

    showAlignFooter : function(resize)
    {
        if (this.getModel().isActive() && this.footer && this.grid)
        {
            var footer = this.footer,
                size = this.getWidthHeight(),
                up = this.up(),
                position = 'c-tl',
                offsets = [size.width / 2, (size.height + 80)];

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

Ext.define('Connector.view.GridHeaderDataView', {

    extend: 'Connector.view.HeaderDataView',

    alias: 'widget.gridheaderdataview',

    itemSelector: 'h1.lhdv',

    selectedItemCls: 'active',

    loadMask: false,

    selectInitialDimension: false,

    tabSelectEventName: 'sheetselected',

    keyFieldName: 'source',

    tpl: new Ext.XTemplate(
            '<tpl for=".">',
            '<h1 class="lhdv"><span class="gridtablhdv">{source}</span></h1>',
            '</tpl>'
    ),

    initComponent : function() {
        this.callParent();
    },

    _select : function(model, skipEvent) {
        this.getSelectionModel().select(model);
        if (!skipEvent)
            this.fireEvent('sheetselected', model.get("source"));
    }
});