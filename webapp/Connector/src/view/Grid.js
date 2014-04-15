Ext.define('Connector.view.Grid', {

    extend: 'Ext.container.Container',

    alias: 'widget.groupdatagrid',

    axisSourceCls: 'rawdatasource',

    // These probably are not good starting filters as the user might filter on them prior to choosing any other columns
    schemaName: 'study',

    queryName: 'Subject',

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('measureselected');
    },

    initComponent : function() {

        Ext.applyIf(this, {
            columnSet: [
                Connector.studyContext.subjectColumn,
                'Study',
                'StartDate'
            ]
        });

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

        this.on('boxready', function() {
            this.add(this.getGridComponent());
        }, this, {single: true});

        this.on('resize', this.onViewResize, this);
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

        var colBasedWidth = (this.columnSet.length * 100);
        var viewBasedWidth = box.width - 27;
        var width = Math.min(colBasedWidth, viewBasedWidth);

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
            store: this.getGridStore(),
            border: false,
            margin: '-92 0 0 27',
            ui: 'custom',
            border: false
        };
    },

    getGridStore : function() {

        console.log('schema:', this.schemaName);
        console.log('query:', this.queryName);
        console.log('columns:', this.columnSet);

        if (!this.gridStore) {
            this.gridStore = Ext.create('LABKEY.ext4.data.Store', {
                schemaName: this.schemaName,
                queryName: this.queryName,
                columns: this.columnSet,
//                queryName: this.queryMetadata.queryName,
//                schemaName: this.queryMetadata.schemaName,
//                filterArray: filterArray,
//                columns: columnList,
                pageSize: 100
            });
        }

        return this.gridStore;
    },

    refreshGrid : function(result, measures, participants) {

        // remove the grid and associated store
        this.remove(this.getComponent('gridcomponent'), true);
        this.gridStore = null;

        // establish columns to include
        var columns = [];

        Ext.each(result.metaData.fields, function(field) {
            columns.push(field.fieldKey);
        });

        // determine the new query context that will be used by the grid/store
        this.setQueryContext(result.schemaName, result.queryName, columns);

        this.add(this.getGridComponent());
    },

    setQueryContext : function(schema, query, columns) {
        this.schemaName = schema;
        this.queryName = query;
        this.columnSet = columns;
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
                modal: this.initialized ? true : false,
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
                            this.fireEvent('measureselected', this, this.getAxisPanel().getSelection());
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
    }
});
