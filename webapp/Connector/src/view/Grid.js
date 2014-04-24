Ext.define('Connector.view.Grid', {

    extend: 'Ext.container.Container',

    alias: 'widget.groupdatagrid',

    axisSourceCls: 'rawdatasource',

    columnWidth: 125,

    constructor : function(config) {

        GG = this;
        this.callParent([config]);

        this.addEvents('measureselected', 'updatecolumnmodel');
    },

    initComponent : function() {

        this.flights = 0;

        if (!Ext.isDefined(this.model)) {
            this.model = Ext.create('Connector.model.Grid', {});
        }

        this.items = [
            // Iniital layout container for header objects (title, buttons, etc)
            {
                xtype: 'panel',
                height: 161,
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
                    ui: 'rounded-inverted-accent',
                    cls: 'gridexportbtn',
                    text: 'export',
                    margin: '27 0 0 5',
                    handler: function() {},
                    scope: this
                },{
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    cls: 'gridcitationsbtn',
                    text: 'citations',
                    margin: '27 0 0 5',
                    handler: function() {},
                    scope: this
                },{
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    cls: 'gridcolumnsbtn',
                    text: 'choose columns',
                    margin: '27 0 0 5',
                    handler: this.showMeasureSelection,
                    listeners: {
                        afterrender : function(b) {
                            var picker = this.getAxisPanel().getMeasurePicker();
                            picker.on('beforeMeasuresStoreLoad', function(p, data) {
                                if (Ext.isDefined(data) && Ext.isArray(data.measures)) {
                                    this.setText('choose from ' + data.measures.length + ' other columns');
                                }
                            }, b, {single: true});
                            picker.getMeasures();
                        },
                        scope: this
                    },
                    scope: this
                }]
            }
        ];

        this.callParent();

        var model = this.getModel();

        // bind model to view
        this.on('measureselected', model.changeMeasures, model);

        // bind view to model
        model.on('measurechange', this.initializeGrid, this);
        model.on('filterarraychange', this.onFilterArrayUpdate, this);

        this.on('boxready', this.initializeGrid, this, {single: true});
        this.on('resize', this.onViewResize, this);
    },

    getModel : function() {
        return this.model;
    },

    onViewResize : function() {
        Ext.defer(function() {
            var grid = this.getComponent('gridcomponent');
            if (grid) {
                var size = this.getWidthHeight();
                grid.setSize(size.width, size.height);
            }
        }, 50, this);
    },

    getWidthHeight : function() {

        var box = this.getBox();

//        var colBasedWidth = (this.getModel().getColumnSet().length * this.columnWidth);
        var viewBasedWidth = box.width - 27;
        var width = viewBasedWidth; //Math.min(colBasedWidth, viewBasedWidth);

        var viewHeight = box.height;
        var height = viewHeight - 161 + 93;

        return {
            width: width,
            height: height
        };
    },

    getGridComponent : function() {

        var size = this.getWidthHeight();

        // reset the column mapping
        this.columnMap = {};

        return {
            itemId: 'gridcomponent',
            xtype: 'connector-gridpanel',
            height: size.height,
            width: size.width,
            forceFit: true,
            store: this.getStore(),
            border: false,
            defaultColumnWidth: this.columnWidth,
            margin: '-93 0 0 27',
            ui: 'custom',
            listeners: {
                columnmodelcustomize: this.onColumnModelCustomize,
                columnmove : this.updateColumnMap,
                beforerender: function(grid) {
                    var header = grid.down('headercontainer');
                    header.on('headertriggerclick', this.onTriggerClick, this);
                },
                reconfigure : function(grid) {
                    this.updateColumnMap(grid.down('headercontainer'));
                    // reapply filters to the column UI
                    this.onFilterArrayUpdate(this.getModel().getFilterArray());
                },
                scope: this
            }
        };
    },

    getStore : function() {

        if (!this.gridStore) {

            var model = this.getModel();

            this.gridStore = Ext.create('LABKEY.ext4.data.Store', {
                schemaName: model.get('schemaName'),
                queryName: model.get('queryName'),
                columns: model.getColumnSet(),
                filterArray: model.getFilterArray()
            });
        }

        return this.gridStore;
    },

    updateColumnMap : function(/* Ext.grid.header.Container */ gridHeader)
    {
        var columns = gridHeader.getGridColumns();

        Ext.each(columns, function(gridColumn, idx) {
            this.columnMap[gridColumn.dataIndex] = idx;
        }, this);
    },

    onColumnModelCustomize : function(grid, columnGroups) {
        console.log('TODO: Implement onColumnModelCustomize');
//        var model = this.getModel(), columns;
//
//        Ext.each(columnGroups, function(group)
//        {
//            columns = group.columns;
//            Ext.each(columns, function(column)
//            {
//                console.log('customize:', column.dataIndex);
//            }, this);
//
//        }, this);
    },

    onTriggerClick : function(headerCt, column, evt, el) {

        // open the filter window

        if (Ext.isString(column)) {

            var _name = column;
            column = null;

            // lookup column by name
            var grid = this.getGrid();
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
                    filter: function(win, boundColumn, filterArray, apply) {
                        this.applyGridFilter(boundColumn, filterArray, apply);
                    },
                    clearfilter: function(win, fieldKeyPath) {
                        this.removeGridFilter(fieldKeyPath, false);
                    },
                    clearall: function() {
                        this.removeAllFilters();
                    },
                    scope: this
                },
                scope: this
            });
        }
        else {
            console.error('Unable to find column for filtering.');
        }

        return false;
    },

    getColumnMetadata : function(columnName) {

        var target;

        if (Ext.isString(columnName))
        {
            var fields = this.getModel().getMetadata().metaData.fields;

            // The proxy will have the most complete metadata -- getData API does not return lookup info
            if (this.gridStore && this.gridStore.proxy)
            {
                fields = this.gridStore.proxy.reader.getFields();
            }

            if (fields)
            {
                for (var i = 0; i < fields.length; i++)
                {
                    if (fields[i].name == columnName)
                    {
                        target = Ext.clone(fields[i]);
                        break;
                    }
                }
            }

            if (target)
            {
                target.filterField = (Ext.isDefined(target.displayField) ? target.displayField : target.fieldKey);
            }
            else
            {
                console.warn('failed to find column metadata:', columnName);
            }
        }

        return target;
    },

    initializeGrid : function()
    {
        var model = this.getModel();

        if (!this.initialized)
        {
            this.initialized = true;
        }

        // retrieve new column metadata based on the model configuration
        Connector.model.Grid.getMetaData(model, {
            onSuccess: function(gridModel, metadata) {
                var me = this;
                me.control.getParticipantIn(function(subjects) {
                    me.updateColumnModel.call(me, subjects);
                });
            },
            onFailure: this.onFailure,
            scope: this
        });
    },

    updateColumnModel : function(subjects) {

        //
        // remove the old grid
        //
        var oldGrid = this.getComponent('gridcomponent');
        if (oldGrid) {
            // remove the grid and associated store
            this.remove(this.getComponent('gridcomponent'), true);
            this.gridStore = null;
        }

        //
        // update the model
        //
        var model = this.getModel();
        var metadata = model.getMetadata();

        var columns = Connector.model.Grid.getColumnList(this.getModel());

        model.set('schemaName', metadata.schemaName);
        model.set('queryName', metadata.queryName);
        model.set('columnSet', columns);

        //
        // add Participant Filter due to application filters
        //
        model.changeSubjectFilter(LABKEY.Filter.create(columns[0], subjects.join(';'), LABKEY.Filter.Types.IN));

        //
        // add the new grid
        //
        this.add(this.getGridComponent());

        //
        // fire events
        //
        this.fireEvent('updatecolumnmodel', this, model.get('schemaName'), model.get('queryName'), model.getColumnSet());
    },

    showMeasureSelection : function() {
        var measureWindow = this.getMeasureSelectionWindow();
        var box = this.getBox();

        measureWindow.setSize(box.width-100, box.height-100);
        measureWindow.showAt(47, 128);

        // Run the query to determine current measure counts
        this.runUniqueQuery();
    },

    runUniqueQuery : function(force) {
        var store = this.getAxisPanel().getMeasurePicker().sourcesStore;

        if (this.initialized || force) {
            if (store.getCount() > 0) {
                this._processQuery(store);
            }
            else {
                store.on('load', function(s) {
                    this._processQuery(s);
                }, this, {single: true});
            }
        }
        else if (!force) {
            if (this.control) {
                var me = this;
                this.control.getParticipantIn(function(ptids) {
                    if (!me.initialized) {
                        me.queryPtids = ptids;
                        me.runUniqueQuery(true);
                    }
                });
            }
        }
    },

    _processQuery : function(store) {
        var sources = [], s;

        for (s=0; s < store.getCount(); s++) {
            sources.push(store.getAt(s).data['queryLabel'] || store.getAt(s).data['queryName']);
        }

        if (this.control) {
            var me = this;
            this.control.getParticipantIn(function(ids) {
                me.control.requestCounts(sources, ids, me._postProcessQuery, me);
            });
        }
    },

    _postProcessQuery : function(response) {
        this.control.displayCounts(response, this.axisSourceCls);
    },

    getAxisPanel : function() {
        if (!this.axisPanel) {
            this.axisPanel = Ext.create('Connector.panel.AxisSelector', {
                ui: 'axispanel',
                bodyStyle: 'padding: 15px 27px 0 27px;',
                measureConfig : {
                    allColumns: true,
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
                disableScale: true,
                disableVariableOptions: false
            });
        }

        return this.axisPanel;
    },

    getMeasureSelectionWindow : function() {

        if (!this.measureWindow) {
            this.measureWindow = Ext.create('Ext.window.Window', {
                id: 'gridmeasurewin',
                ui: 'axiswindow',
                cls: 'measurewindow',
                plain: true,
                modal: true,
                draggable: false,
                preventHeader: true,
                resizable: false,
                closeAction: 'hide',
                layout: 'fit',
                items: [ this.getAxisPanel() ],
                dockedItems : [{
                    xtype : 'toolbar',
                    dock : 'bottom',
                    ui : 'footer',
                    padding : 15,
                    items : ['->',{
                        text: 'select',
                        ui: 'rounded-inverted-accent',
                        handler : function() {
                            var axispanel = this.getAxisPanel();
                            var allMeasures = axispanel.getMeasurePicker().measuresStoreData.measures;
                            this.fireEvent('measureselected', axispanel.getSelection(), allMeasures, axispanel.getLookups());
                            this.measureWindow.hide();
                        },
                        scope: this
                    },{
                        text: 'cancel',
                        ui: 'rounded-inverted-accent',
                        handler : function() { this.measureWindow.hide(); },
                        scope: this
                    }]
                }]
            });
        }

        return this.measureWindow;
    },

    onViewChange : function(controller, view) {
        this.isActiveView = view == 'datagrid';

        if (this.measureWindow) {
            if (!this.isActiveView)
                this.measureWindow.hide();
            else if (!this.initialized)
                this.measureWindow.show();
        }
    },

    onFilterArrayUpdate : function(filterArray) {
        if (this.gridStore) {
            this.gridStore.filterArray = filterArray;
        }

        var grid = this.getComponent('gridcomponent');
        if (Ext.isDefined(grid))
        {
            var columns = grid.headerCt.getGridColumns();

            // remove all filter classes
            Ext.each(columns, function(column) {
                if (Ext.isDefined(column.getEl()))
                {
                    column.getEl().removeCls('filtered-column');
                }
            }, this);

            var filterFieldMap = {}, colMeta;
            Ext.iterate(this.columnMap, function(dataIndex)
            {
                colMeta = this.getColumnMetadata(dataIndex);

                if (Ext.isDefined(colMeta.filterField))
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

            Ext.each(filterArray, function(filter)
            {
                colMeta = filterFieldMap[filter.getColumnName()];
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
                else
                {
                    console.log('failed to find filter column');
                }

            }, this);
        }
        else
        {
            console.warn('unable to locate grid for filter array updates');
        }
    },

    //
    // ALL CODE BELOW HERE IS FILTER RELATED
    //

    processFilters : function(groups, filterArrays) {
        this.fireEvent('filtertranslate', this, groups, filterArrays);
    },

    applyFilters : function(gridFilters) {
        if (Ext.isArray(gridFilters) && gridFilters.length > 0) {
            var filterArray = Ext.clone(this.getModel().get('filterArray'));
            filterArray = filterArray.slice(1);

            Ext.each(gridFilters, function(gridFilter) {
                filterArray = LABKEY.Filter.merge(filterArray, gridFilter.getColumnName(), [gridFilter]);
            }, this);

            // update model filterArray
            this.getModel().changeFilterArray(filterArray);
            this._applyGridFilterHelper();
        }
    },

    applyGridFilter : function(boundColumn, filterArray, apply) {

        // update model filterArray
        this.getModel().changeFilterArray(filterArray);

        // check if the column set has changed
        if (apply.columnSetChange) {

            // update foreign column model
            var foreignColumns = this.getModel().get('foreignColumns');
            foreignColumns[boundColumn.name] = apply.newColumns;
            this.getModel().set('foreignColumns', foreignColumns);

            this.updateAppliedColumns(apply.newColumns, apply.oldColumns);
        }

        this._applyGridFilterHelper();
    },

    _applyGridFilterHelper : function() {

        // update the grid store
        this.getStore().load();

        this.flights++;
        var configs = [],
                bins = {},
                keys = [],
                fa = this.getModel().get('filterArray'),
                colname, f;

        for (f=1; f < fa.length; f++) {
            colname = fa[f].getColumnName();
            if (bins[colname]) {
                bins[colname].push(fa[f]);
            }
            else {
                keys.push(colname);
                bins[colname] = [fa[f]];
            }
        }

        // This must be done independently for each filter
        var schema = this.getModel().get('schemaName');
        var query = this.getModel().get('queryName');

        for (f=0; f < keys.length; f++) {
            configs.push({
                schemaName: schema,
                queryName: query,
                flight: this.flights,
                configId: bins[keys[f]][0].getURLParameterName(),
                column: this.getModel().getColumnSet()[0], // subject column?
                filterArray: bins[keys[f]],
                scope: this
            });
        }

        if (configs.length > 0) {
            this.queryMultiple(configs, function(result, flight) {
                if (flight != this.flights) {
                    return;
                }

                var groups = [], filterArrays = [];
                for (f=0; f < configs.length; f++) {
                    groups.push(result[f].queryResult.values);
                    filterArrays.push(configs[result[f].configIndex].filterArray);
                }

                if (this.gridLock) {
                    this.gridLock = false;
                    return;
                }

                this.processFilters(groups, filterArrays);
            }, null, this);
        }

        if (this.gridLock) {
            this.gridLock = false;
        }
    },

    removeGridFilter : function(fieldKey, all) {
        this.fireEvent('removefilter', fieldKey, all);
    },

    removeAllFilters : function() {
        this.removeGridFilter(null, true);
    },

    // This is called when users add/remove columns via the filter window
    updateAppliedColumns : function(newColumns, oldColumns) {
        this.fireEvent('lookupcolumnchange', newColumns, oldColumns);
    },

    // called when a 'grid' filter is removed from the application
    removeAppFilter : function(fieldKeyArray) {
        if (fieldKeyArray.length > 0) {

            var store = this.getStore(), found = false, key;
            var filtersToKeep = [];

            for (var s=1; s < store.filterArray.length; s++) {

                found = false;

                for (var f=0; f < fieldKeyArray.length; f++) {
                    key = store.filterArray[s].getURLParameterName() + '=' + store.filterArray[s].getValue();
                    if (key == fieldKeyArray[f].urlParam) {
                        found = true;
                    }
                }

                if (!found) {
                    filtersToKeep.push(store.filterArray[s]);
                }
            }

            this.getModel().changeFilterArray(filtersToKeep);

            this.gridLock = true;
            store.load();
        }
    },

    queryMultiple : function(configs, success, failure, scope) {
        var outstandingQueries = configs.length,
                results = new Array(configs.length),
                failed = false,
                flight = configs[0].flight;

        // map configIds to indexes
        var configMap = {}, config;
        for (var h=0; h < configs.length; h++) {
            configMap[configs[h].configId] = h;
        }

        var checkDone = function()
        {
            if (outstandingQueries == 0) {
                if (Ext.isFunction(failure))
                    failure.call(scope);
                else if (Ext.isFunction(success))
                    success.call(scope, results, flight);
                else
                    console.warn('checkDone unable to find callback');
            }
        };

        var innerSuccess = function(qr, config)
        {
            var activeIdx = -1;
            for (var param in config.params) {
                if (config.params.hasOwnProperty(param)) {
                    if (param in configMap) {
                        activeIdx = configMap[param];
                    }
                }
            }
            results[activeIdx] = {
                queryResult: qr,
                configIndex: activeIdx
            };
            outstandingQueries--;
            checkDone();
        };

        var innerFailure = function()
        {
            console.error("NYI: finish failure handling");
            failed = true;
            outstandingQueries--;
            checkDone();
        };

        for (var c=0 ; c < configs.length ; c++) {
            config = Ext.apply(configs[c], {
                success: innerSuccess,
                failure: innerFailure
            });
            LABKEY.Query.selectDistinctRows(config);
        }
    }
});
