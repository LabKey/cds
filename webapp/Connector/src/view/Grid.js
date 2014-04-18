Ext.define('Connector.view.Grid', {

    extend: 'Ext.container.Container',

    alias: 'widget.groupdatagrid',

    axisSourceCls: 'rawdatasource',

    // These probably are not good starting filters as the user might filter on them prior to choosing any other columns
    schemaName: 'study',

    queryName: 'Subject',

    constructor : function(config) {

        GG = this;

        this.callParent([config]);

        this.addEvents('measureselected');
    },

    initComponent : function() {

        this.columnMeasureCache = {};

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
                    text: 'export',
                    margin: '27 0 0 5',
                    handler: function() {},
                    scope: this
                },{
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    text: 'citations',
                    margin: '27 0 0 5',
                    handler: function() {},
                    scope: this
                },{
                    xtype: 'button',
                    ui: 'rounded-inverted-accent',
                    text: 'choose columns',
                    margin: '27 0 0 5',
                    handler: this.showMeasureSelection,
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

        this.on('boxready', function() {
            this.add(this.getGridComponent());
        }, this, {single: true});

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

        var colBasedWidth = (this.getModel().getColumnSet().length * 100);
        var viewBasedWidth = box.width - 27;
        var width = viewBasedWidth; //Math.min(colBasedWidth, viewBasedWidth);

        var viewHeight = box.height;
        var height = viewHeight - 161 + 92;

        return {
            width: width,
            height: height
        };
    },

    getGridComponent : function() {

        var size = this.getWidthHeight();

        return {
            itemId: 'gridcomponent',
            xtype: 'connector-gridpanel',
            height: size.height,
            width: size.width,
            forceFit: true,
            store: this.getStore(),
            border: false,
            margin: '-92 0 0 27',
            ui: 'custom',
            listeners: {
                columnmodelcustomize: this.onColumnModelCustomize,
                beforerender: function(grid) {
                    var header = grid.down('headercontainer');
                    header.on('headertriggerclick', this.onTriggerClick, this);
                },
                scope: this
            }
        };
    },

    getStore : function() {

        if (!this.gridStore) {

            var model = this.getModel();

            this.gridStore = Ext.create('LABKEY.ext4.data.Store', {
                schemaName: this.schemaName,
                queryName: this.queryName,
                columns: model.getColumnSet(),
                filterArray: model.getFilterArray()
            });
        }

        return this.gridStore;
    },

    onColumnModelCustomize : function() {
        console.log('TODO: Implement onColumnModelCustomize');
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
                dataView: this
            });
        }
        else {
            console.error('Unable to find column for filtering.');
        }

        return false;
    },

    getColumnMetadata : function(columnName) {
        var fields = this.getModel().get('metadata').metaData.fields;

        // The proxy will have the most complete metadata -- getData API does not return lookup info
        if (this.gridStore && this.gridStore.proxy) {
            fields = this.gridStore.proxy.reader.getFields();
        }

        var target;

        if (fields) {
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].name == columnName) {
                    target = fields[i];
                    break;
                }
            }
        }

        return target;
    },

    refreshGrid : function() {
        this.initializeGrid(this.getModel());
    },

    initializeGrid : function(model) {

        if (!this.initialized) {
            this.initialized = true;
        }

        var oldGrid = this.getComponent('gridcomponent');
        if (oldGrid) {
            // remove the grid and associated store
            this.remove(this.getComponent('gridcomponent'), true);
            this.gridStore = null;
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
        var metadata = this.getModel().get('metadata');
        var queryMetadata = metadata.metaData;

        // map columns to measures
        var columns = Connector.model.Grid.getColumnList(this.getModel());
//        var measures = this.getModel().getMeasures();
//        var colMeasure = {};
//        Ext.each(measures, function(measure) {
//            colMeasure[measure.alias] = measure;
//        });
//        colMeasure[queryMetadata.measureToColumn[Connector.studyContext.subjectColumn]] = {label: "Subject ID"};
//        colMeasure[queryMetadata.measureToColumn[Connector.studyContext.subjectVisitColumn + "/VisitDate"]] = {label : "Visit Date"};
//        this.columnMeasureCache = colMeasure;

        // establish columns to include
//        Ext.each(queryMetadata.fields, function(field) {
//            columns.push(field.fieldKey);
//        });

        this.getModel().set('columnSet', columns);

        // establish filters to apply
        var filterArray = [];
        // TODO: Add app filters
        // add Participant Filter due to application filters
        filterArray.push(LABKEY.Filter.create(columns[0], subjects.join(';'), LABKEY.Filter.Types.IN));
        this.getModel().set('filterArray', filterArray);

        this.schemaName = metadata.schemaName;
        this.queryName = metadata.queryName;

        this.add(this.getGridComponent());
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
                disableVariableOptions: true
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
                            this.fireEvent('measureselected', axispanel.getSelection(), allMeasures);
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

    //
    // ALL CODE BELOW HERE IS FILTER RELATED
    //

    processFilters : function(groups, filterArrays) {
        this.fireEvent('filtertranslate', this, groups, filterArrays);
    },

    translateGridFilter : function(query, schema, column) {
        if (column) {
            this.lastCol = column;
        }

        if (this.getModel().get('filterArray').length == 0) {
            return;
        }

        var store = this.getStore();
        this.flights++;
        var configs = [],
                bins = {},
                keys = [],
                fa = store.filterArray,
                colname, f,
                s = schema || store.schemaName,
                q = query  || store.queryName;

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

    removeGridFilter : function() {
        console.log('TODO: removeGridFilter');
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

        for (var c=0 ; c < configs.length ; c++) {
            config = Ext.apply(configs[c], {
                success: innerSuccess,
                failure: innerFailure
            });
            LABKEY.Query.selectDistinctRows(config);
        }
    }
});
