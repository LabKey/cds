/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.define('Connector.view.RawData', {

    extend : 'Ext.Panel',

    alias  : 'widget.datagrid',

    cls : 'rawdataview',

    grid : null,

    gridMargin : 20,

    flights : 0,

    /**
     * columns not reachable via getData API but joined in via the grid API.
     * Each lookup col has array of Connector.model.ColumnInfo objects.
     */
    foreignColumns : {},

    constructor : function(config) {

        this.callParent([config]);

        this.addEvents('measureselected');
    },

    initComponent : function() {

        this.initialized = false;
        this.items = [];

        this.exportButton = Ext.create('Connector.button.RoundedButton', {
            text : 'Export',
            cls    : 'dark',
            margin : '5 0 0 5',
            handler : function() {
                if (this.store) {
                    // First post the set of Participants -- can be too large for url
                    var filters = {
                        filters : LABKEY.Filter.appendFilterParams({}, this.store.filterArray)
                    };
                    Ext.Ajax.request({
                        url : LABKEY.ActionURL.buildURL('cds', 'storeFilter'),
                        method : 'POST',
                        jsonData : filters,
                        success : function(){
                            var config = this.store.getExportConfig();

                            // replace configured action with CDS version
                            config.action = 'exportExcel';

                            // Request File
                            window.location = LABKEY.ActionURL.buildURL('cds', config.action, this.store.containerPath, config.params);
                        },
                        failure : function(){ /* No-op */ console.warn('Failed to store filter.'); },
                        scope : this
                    });
                }
            },
            hidden : true,
            scope : this
        });

        this.items.push([{
            xtype : 'panel',
            ui : 'custom',
            layout : {
                type : 'hbox'
            },
            items : [{
                xtype : 'box',
                autoEl: {
                    tag : 'div',
                    cls : 'dimgroup',
                    html: 'Data Grid'
                }
            },{
                xtype  : 'roundedbutton',
                id     : 'choosecolumns',
                text   : 'Choose Columns',
                cls    : 'dark',
                margin : '5 0 0 5',
                handler : this.showMeasureSelection,
                scope  : this
            },
                this.exportButton
            ]
        }]);

        this.axisSourceCls = 'rawdatasource';
        this.axisPanel = Ext.create('Connector.panel.AxisSelector', {
            flex      : 1,
            ui        : 'axispanel',
            bodyStyle : 'padding-left: 27px; padding-top: 15px;',
            measureConfig : {
                allColumns : true,
                sourceCls  : this.axisSourceCls,
                filter     : LABKEY.Query.Visualization.Filter.create({
                    schemaName : 'study',
                    queryType  : LABKEY.Query.Visualization.Filter.QueryType.DATASETS
                }),
                showHidden : this.canShowHidden,
                bubbleEvents : ['beforeMeasuresStoreLoad', 'measuresStoreLoaded', 'measureChanged']
            },
            displayConfig : {
                defaultHeader : 'Add Measures'
            },
            disableScale : true
        });

        this.getMeasureWindow();

        this.resizeTask = new Ext.util.DelayedTask(this.handleResize, this);
        this.callParent();

        this.on('resize', function() {
            this.resizeTask.delay(250);
        }, this);

        this.on('afterrender', this.showMeasureSelection, this, {single: true});
    },

    handleResize : function () {

        var viewbox = this.getBox();

        if (this.win) {
            this.win.setSize(viewbox.width-100, viewbox.height-100);
        }

        if (this.grid) {
            var gridbox = this.grid.getBox();
            this.grid.setSize(
                    viewbox.width - (2 * this.gridMargin),
                    viewbox.height - (gridbox.y - viewbox.y) - this.gridMargin - 40
            );
        }
    },

    getMeasureWindow : function() {
        if (this.win) {
            return this.win;
        }

        this.win = Ext.create('Ext.window.Window', {
            id    : 'gridmeasurewin',
            ui    : 'custom',
            cls   : 'measurewindow',
            plain : true,
            modal : this.initialized,
            preventHeader : true,
            draggable : false,
            resizable : false,
            closable  : false, // 15095
            layout : {
                type : 'vbox',
                align: 'stretch'
            },
            items : [
                this.axisPanel
            ],
            buttons: [{
                text  : 'select',
                ui    : 'rounded-inverted-accent',
                handler : function() {
                    this.fireEvent('measureselected', this.axisPanel.getSelection());
                    this.win.hide();
                },
                scope : this
            },{
                text  : 'cancel',
                ui    : 'rounded-inverted-accent',
                handler : function() {
                    this.win.hide();
                },
                scope : this
            }],
            scope : this
        });

        return this.win;
    },

    getGrid : function () {
        return this.grid;
    },

    removeGrid : function () {
        if (this.grid) {
            this.remove(this.grid, true);
            this.grid = null;
        }
        if (this.bottomBar) {
            this.remove(this.bottomBar, true);
            this.bottomBar = null;
        }
    },

    refreshGrid : function(queryMetadata, measures, ptids, subjectColumn) {

        // RawData acts differently once the grid has been displayed
        if (!this.initialized) {
            this.initialized = true;
            if (this.win) {
                this.win.modal = true;
            }
        }

        var oldFilters;
        if (this.store) {
            if (!this.store.filterArray) {
                oldFilters = null;
            }
            else if (this.store.filterArray.length <= 1) {
                oldFilters = null;
            }
            else {
                oldFilters = this.store.filterArray.slice(1);
            }
        }

        this.removeGrid();

        if (queryMetadata) {
            this.queryMetadata = queryMetadata;
        }

        if (ptids) {
            this.queryPtids = ptids;
        }

        if (subjectColumn) {
            this.subjectColumn = subjectColumn;
        }

        if (measures) {
            this.measures = measures;
            var colToMeasure = {};
            for (var i=0; i < measures.length; i++) {
                colToMeasure[measures[i].alias] = measures[i];
            }
            //Add columns for implicitly selected ParticipantId && ParticipantVisit/VisitDate
            colToMeasure[this.queryMetadata.measureToColumn["ParticipantId"]] = {label: "Participant ID"};
            colToMeasure[this.queryMetadata.measureToColumn["ParticipantVisit/VisitDate"]] = {label : "Visit Date"};

            this.colToMeasure = colToMeasure;
        }

        //TODO: Have a subclass of Ext4 grid & store for showing vis data -- get rid of this customization
        var onColumnModelCustomize = function(grid, columns) {
            grid.colToMeasure = colToMeasure;
            //Now update the columns with information from the measures
            Ext.each(columns, function (col) {
                var measureInfo = colToMeasure[col.dataIndex];
                if (null != measureInfo) {
                    col.hidden = measureInfo.hidden;
                    col.header = "<span title='" + Ext.htmlEncode(measureInfo.description) + "'>" + measureInfo.label+ "</span>";
                }
                else {
                    col.hidden = false; //Need to fix this somehow...
                }

                col.showLink = false;
            });
        };

        var onBeforeRender = function (grid) {
            var header = grid.down('headercontainer');
            header.on('headertriggerclick', this.onTriggerClick, this);
        };

        var viewbox     = this.getBox(),
                gridtop     = this.child().getHeight() + this.gridMargin + 13, //Coming from some style
                columnList  = this.getColumnList(),
                filterArray = this.reapplyFilters(oldFilters, columnList),

        // add Participant Filter due to application filters
                pFilter     = LABKEY.Filter.create(columnList[0], ptids.join(';'), LABKEY.Filter.Types.IN);

        if (filterArray) {
            filterArray = [pFilter].concat(filterArray);
        }
        else {
            filterArray = [pFilter];
        }

        this.store = Ext.create('Connector.store.CDSStore', {
            queryName   : this.queryMetadata.queryName,
            schemaName  : this.queryMetadata.schemaName,
            filterArray : filterArray,
            columns     : columnList,
            pageSize    : 100
        });

        this.translateGridFilter(this.queryMetadata.queryName, this.queryMetadata.schemaName, columnList[0]);

        this.grid = Ext.create('LABKEY.Ext.GridPanel', {
            store  : this.store,
            ui     : 'custom',
            cls    : 'iScroll',
            width  : viewbox.width - (2 * this.gridMargin),
            height : viewbox.height - gridtop - this.gridMargin - 40,
            margin : '' + this.gridMargin,
            showPagingToolbar: true,
            containerPath : LABKEY.ActionURL.getContainer(),
            autoScroll    : true,
            charWidth     : 10,
            listeners     : {
                columnmodelcustomize : onColumnModelCustomize,
                beforerender : onBeforeRender,
                scope : this
            }
        });

        this.bottomBar = Ext.create('Ext.Panel', {
            ui : 'custom',
            border : false, frame : false,
            items : [{
                id    : 'gridsources',
                xtype : 'roundedbutton',
                text  : 'Sources',
                ui    : 'rounded-accent',
                handler : this.showSources,
                scope : this
            }]
        });

        this.add(this.grid);
        this.add(this.bottomBar);

        if (this.exportButton) {
            this.exportButton.show();
        }
    },

    // If no values are provided for (query, schema, col) then the current stores values will be used.
    translateGridFilter : function(query, schema, col) {

        if (col) {
            this.lastCol = col;
        }

        if (!this.store.filterArray) {
            return;
        }

        this.flights++;
        var configs = [],
                bins = {},
                keys = [],
                fa = this.store.filterArray,
                colname, f,
                s = schema || this.store.schemaName,
                q = query  || this.store.queryName;

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
        for (f=0; f < keys.length; f++)
        {
            configs.push({
                schemaName : s,
                queryName  : q,
                flight     : this.flights,
                configId   : bins[keys[f]][0].getURLParameterName(),
                column     : this.lastCol,
                filterArray: bins[keys[f]],
                scope      : this
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
            if (outstandingQueries > 0)
                return;
            if (failed)
                failure.call(scope);
            else
                success.call(scope, results, flight);
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
                queryResult : qr,
                configIndex : activeIdx
            };
            outstandingQueries--;
            checkDone();
        };
        var innerFailure = function(a,b,c)
        {
            console.error("NYI: finish failure handling");
            failed = true;
            outstandingQueries--;
            checkDone();
        };
        for (var c=0 ; c<configs.length ; c++)
        {
            config = Ext.apply(configs[c], {
                success : innerSuccess,
                failure : innerFailure
            });
            LABKEY.Query.selectDistinctRows(config);
        }
    },

    removeAppFilter : function(fieldKeyArray) {
        if (fieldKeyArray.length > 0) {

            var ws = this.filterWin.store; var filtersToKeep = [], found, key;

            if (ws.filterArray && ws.filterArray.length == 1) {
                ws.filterArray = [this.store.filterArray[0]];
                ws.load();
                return;
            }

            if (ws.filterArray) {
                for (var s=1; s < ws.filterArray.length; s++) {
                    found = false;

                    for (var f=0; f < fieldKeyArray.length; f++) {
                        key = ws.filterArray[s].getURLParameterName() + '=' + ws.filterArray[s].getValue();
                        if (key == fieldKeyArray[f].urlParam)
                            found = true;
                    }

                    if (!found) {
                        filtersToKeep.push(ws.filterArray[s]);
                    }
                }
            }

            if (filtersToKeep.length == 0) {
                this.store.filterArray = [this.store.filterArray[0]];
                this.filterWin.clearAll.call(this.filterWin);
            }
            else {
                this.gridLock = true;
                ws.filterArray = [this.store.filterArray[0]].concat(filtersToKeep);
                ws.load();
            }
        }
    },

    removeGridFilter : function(fieldKey, all) {
        this.fireEvent('removefilter', fieldKey, all);
    },

    removeAllFilters : function() {
        this.removeGridFilter(null, true); // request to remove all filters
    },

    processFilters : function(groups, filterArrays) {
        this.fireEvent('filtertranslate', groups, filterArrays);
    },

    // This is called when users add/remove columns via the filter window
    updateAppliedColumns : function(newColumns, oldColumns) {
        this.fireEvent('lookupcolumnchange', newColumns, oldColumns);
    },

    getColumnList : function () {
        var cols = [];
        Ext.each(this.queryMetadata.metaData.fields, function(col) {
            if (this.colToMeasure[col.name]) {
                cols.push(col.fieldKey);
            }
            if (this.foreignColumns[col.fieldKeyPath]) {
                this.addLookupColumns(col, cols);
            }
        }, this);
        return cols;
    },


    addLookupColumns : function(keyCol, cols) {
        if (!this.foreignColumns[keyCol.fieldKeyPath]) {
            return;
        }

        Ext.each(this.foreignColumns[keyCol.name], function (rec) {
            var fieldKeyPath = rec.get("fieldKeyPath");
            cols.push(fieldKeyPath);
            if (this.foreignColumns[fieldKeyPath]) { //Recurse since fk's lookup to more fk's
                this.addLookupColumns(rec.raw, cols);
            }
        }, this);
    },

    reapplyFilters : function (oldFilters, cols) {
        if (null == oldFilters || !oldFilters) {
            return null;
        }

        var newFilters = [], filt, filtCol, slashPos;
        for (var i = 0; i < oldFilters.length; i++) {

            filt = oldFilters[i];
            filtCol = filt.getColumnName();

            if (Ext.Array.contains(cols, filtCol)) {
                newFilters.push(filt);
            }
            else {
                //Filters on FKs are actually applied on display field of the fk col
                //So if fk is in column set && filters on its display field exist, keep them
                slashPos = filtCol.lastIndexOf("/");
                if (slashPos != -1) {
                    var fkCol = filtCol.substring(0, slashPos);
                    if (Ext.Array.contains(cols, fkCol)) {
                        var fkMetadata = this.getColumnMetadata(fkCol);
                        if (null != fkMetadata && fkMetadata.displayField == filtCol) {
                            newFilters.push(filt);
                        }
                    }
                }
            }
        }

        return newFilters;
    },

    getColumnMetadata : function (colName) {

        var fields;

        //The proxy will have the most complete metadata -- getData API does not return lookup info
        if (this.store && this.store.proxy) {
            fields = this.store.proxy.reader.fields;
        }
        else {
            fields = this.queryMetadata.metaData.fields;
        }

        for (var i = 0; i < fields.length; i++) {
            if (fields[i].name == colName) {
                return fields[i];
            }
        }
    },

    onTriggerClick : function (headerCt, col, evt, el) {

        this.filterWin = Ext.create('Connector.window.Filter', {triggerEl : el, col : col, rawDataView:this});
        evt.stopEvent(); // stop the default menu from appearing
        return false;

    },

    onViewChange : function(xtype) {
        this.isActiveView = xtype == 'datagrid';

        if (this.win) {
            if (!this.isActiveView)
                this.win.hide();
            else if (!this.initialized)
                this.win.show();
        }
    },

    showMeasureSelection : function() {
        var box = this.getBox(),
                measureWindow = this.getMeasureWindow();
        measureWindow.setSize(box.width-100, box.height-100);
        measureWindow.show();
        measureWindow.getEl().setLeft(47);
        measureWindow.getEl().setTop(128);
        this.runUniqueQuery();
    },

    runUniqueQuery : function(force) {
        var store = this.axisPanel.getMeasurePicker().sourcesStore;

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
                this.control.getParticipantIn(function(ptids){
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

        for (s=0; s < store.getCount(); s++)
        {
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

    showSources : function () {
        this.fireEvent('sourcerequest', this.measures, this.queryMetadata);
    }
});

Ext.define('Connector.window.Filter', {

    extend : 'Ext.window.Window',

    alias  : 'widget.rawdatafilterwin',

    ui    : 'custom',
    cls   : 'filterwindow',
    modal : true,
    width : 340,
    autoShow  : true,
    draggable : false,
    closable  : false,
    bodyStyle : 'margin: 8px; background-color: white;',

    initComponent : function() {
        var box = Ext.get(this.triggerEl).getBox();

        Ext.apply(this, {
            store       : this.rawDataView.store,
            boundColumn : this.rawDataView.getColumnMetadata(this.col.dataIndex),
            x : box.x - 52,
            y : box.y + 35
        });

        this.items = this.getItems();

        this.buttons =  [{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text  : 'OK',
            width : 70,
            handler: this.applyFiltersAndColumns,
            scope: this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Cancel',
            width : 70,
            handler : this.close,
            scope : this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Clear Filters',
            width : 80,
            handler : function () {
                var fieldKeyPath = this.boundColumn.displayField ? this.boundColumn.displayField : this.boundColumn.fieldKeyPath;

                this.store.filterArray = LABKEY.Filter.merge(this.store.filterArray, fieldKeyPath, null);
                this.store.load();
                this.rawDataView.removeGridFilter(fieldKeyPath);
                this.close();
            },
            scope: this
        },{
            xtype : 'roundedbutton',
            ui    : 'rounded-inverted-accent',
            text : 'Clear All',
            width : 70,
            handler : function() {
                this.clearAll();
                this.close();
            },
            scope : this
        }];

        this.callParent(arguments);

        this.addListener('afterrender', this.onAfterRender, this);
    },

    onAfterRender : function () {
        var keymap = new Ext.util.KeyMap(this.el, [
            {
                key  : Ext.EventObject.ENTER,
                fn   : this.applyFiltersAndColumns,
                scope: this
            },{
                key  : Ext.EventObject.ESC,
                fn   : this.close,
                scope: this
            }
        ]);
    },

    clearAll : function() {
        this.store.filterArray = [this.store.filterArray[0]];
        this.store.load();
        this.rawDataView.removeAllFilters();
    },

    getItems : function () {

        var items = [{
            xtype : 'box',
            autoEl : {
                tag  : 'div',
                html : this.col.text,
                cls  : 'filterheader'
            }
        }];

        if (this.boundColumn.description) {
            items.push({xtype:'box', autoEl : {tag: 'div', cls:'x-body', html:Ext.htmlEncode(this.boundColumn.description)}});
        }

        items.push({
            itemId      : 'mememe',
            xtype       : 'labkey-default-filterpanel',
            boundColumn : this.boundColumn,
            title       : 'Filter',
            ui          : 'custom',
            filterArray : this.store.filterArray,
            style       : 'padding-bottom: 8px',
            schemaName  : this.rawDataView.queryMetadata.schemaName,
            queryName   : this.rawDataView.queryMetadata.queryName
        });

        if (null != this.boundColumn.lookup) {
            items.push({
                xtype   : 'grid',
                selType : 'checkboxmodel',
                title   : 'Show Detail Columns',
                selModel: { mode:'MULTI' },
                store   : this.getLookupColumnStore(),
                ui      : 'custom',
                cls     : 'lookupcols',
                columns : [{
                    header    : 'Detail Columns',
                    dataIndex : 'shortCaption',
                    width     : 320
                }],
                height  : 200,
                width   : 320,
                style   : 'padding-bottom:10px',
                hideHeaders : true,
                listeners : {
                    viewready : function() {
                        var selectedCols = this.rawDataView.foreignColumns[this.boundColumn.name];
                        if (!selectedCols || selectedCols.length == 0) {
                            return;
                        }

                        this.getLookupGrid().getSelectionModel().select(selectedCols);
                    },
                    scope:this
                }
            });
        }

        return items;
    },

    getLookupGrid : function () {
        return this.down('grid');
    },

    getLookupColumnStore : function () {
        if (!this.boundColumn.lookup) {
            return null;
        }

        var storeId = "fkColumns-" + this.boundColumn.lookup.schemaName + "-" + this.boundColumn.lookup.queryName + "-" + this.boundColumn.fieldKey;
        var store = Ext.getStore(storeId);
        if (null != store) {
            return store;
        }

        var url = LABKEY.ActionURL.buildURL("query", "getQueryDetails", null, {
            queryName  : this.store.queryName,
            schemaName : this.store.schemaName,
            fk         : this.boundColumn.fieldKey
        });

        var displayColFieldKey = this.boundColumn.fieldKey + "/" + this.boundColumn.lookup.displayColumn;
        return Ext.create('Ext.data.Store', {
            model   : 'Connector.model.ColumnInfo',
            storeId : storeId,
            proxy   : {
                type   : 'ajax',
                url    : url,
                reader : {
                    type:'json',
                    root:'columns'
                }
            },
            filterOnLoad: true,   //Don't allow user to select hidden cols or the display column (because it is already being displayed)
            filters: [function(item) {return !item.raw.isHidden && item.raw.name != displayColFieldKey;}],
            autoLoad:true
        });
    },

    applyColumns : function () {
        if (!this.boundColumn.lookup)
            return false;

        var lookupGrid = this.getLookupGrid(),
                selections = lookupGrid.getSelectionModel().selected,
                oldColumns = this.rawDataView.foreignColumns[this.boundColumn.name],
                newColumns = [];

        selections.each(function(item, idx) {
            newColumns.push(item);
        }, this);

        var columnListChanged = !this.equalColumnLists(oldColumns, newColumns);
        if (columnListChanged) {
            this.rawDataView.foreignColumns[this.boundColumn.name] = newColumns;
            this.rawDataView.updateAppliedColumns(newColumns, oldColumns);
        }

        return columnListChanged;
    },

    applyFilters : function () {
        var filterPanel = this.down('labkey-default-filterpanel');
        if (filterPanel.isValid()) {
            var colFilters = filterPanel.getFilters();
            this.store.filterArray = LABKEY.Filter.merge(this.store.filterArray, this.boundColumn.displayField ? this.boundColumn.displayField : this.boundColumn.fieldKey, colFilters);
            return true;
        }
        else {
            Ext.window.Msg.alert("Please fix errors in filter.");
            return false;
        }
    },

    applyFiltersAndColumns : function () {
        if (this.applyFilters()) {
            var columnListChanged = this.applyColumns();
            if (columnListChanged) {
                this.rawDataView.refreshGrid(this.rawDataView.queryMetadata, this.rawDataView.measures, this.rawDataView.queryPtids);
            }
            else {
                this.store.load();
            }
            this.rawDataView.translateGridFilter();

            this.ppx = this.getPosition();
            this.close();
        }
    },

    equalColumnLists : function(oldCols, newCols) {
        oldCols = oldCols || [];
        newCols = newCols || [];

        if (oldCols.length != newCols.length) {
            return false;
        }

        for (var i = 0; i < newCols.length; i++) {
            if (newCols[i].get("fieldKeyPath") != oldCols[i].get("fieldKeyPath")) {
                return false;
            }
        }

        return true;
    }
});

Ext.define('Connector.model.ColumnInfo', {
    extend: 'Ext.data.Model',
    fields: [
        {name:'shortCaption'},
        {name:'fieldKeyPath'}
    ]
});


