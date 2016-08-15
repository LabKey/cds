/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.LearnFacet', {

    extend: 'Connector.window.AbstractFilter',

    bodyStyle: 'overflow-y: auto; padding: 10px;',

    width: 290,

    height: 375,

    dim: undefined,

    filterConfig: {},

    filterConfigSet: [],

    currentFilterField: '',

    learnStore: undefined,

    cls: 'learnFilter',

    /* To avoid URL overflow, allow up to 100 selections per column */
    maxSelection: 100,

    getItems : function()
    {
        var facetGrids = this.createFacetGrids(this.filterConfigSet);
        this.facetGrids = facetGrids;

        this.currentFilterField = this.filterConfigSet[0].filterField;

        if (this.filterConfigSet.length > 1) {

            var btnId = Ext.id();
            var dropDownBtn = {
                id: btnId,
                xtype: 'imgbutton',
                itemId: 'infosortdropdown',
                cls: 'sortDropdown ipdropdown', // tests
                style: 'float: right;',
                menu: {
                    xtype: 'menu',
                    autoShow: true,
                    itemId: 'infosortedmenu',
                    showSeparator: false,
                    width: 270,
                    ui: 'custom',
                    cls: 'infosortmenu',
                    btn: btnId,
                    items: this.filterConfigSet.map(function(config) {
                        return {text: config.title};
                    }),
                    listeners: {
                        click: function(menu, item) {
                            var filterConfig = this.getConfigForField('title', item.text);
                            this.getTitleBar().update(filterConfig);
                            this.setFacetGridVisibility(filterConfig.filterField);
                        },
                        scope: this
                    }
                }
            };

            var selector = {
                xtype: 'container',
                ui: 'custom',
                layout: { type: 'hbox' },
                items: [this.getTitleBar(), dropDownBtn]
            };
            this.setFacetGridVisibility()
            return [selector].concat(facetGrids);
        }
        return facetGrids;
    },

    createFacetGrids : function(filterConfigSet) {
        return filterConfigSet.map(function(config) {
            return Ext.create('Connector.grid.LearnFaceted', {
                itemId: 'faceted-' + config.filterField,
                border: false,
                useStoreCache: true,
                filterValues: config.filterValues,
                dim: this.dim,
                columnField: config.filterField,
                valueType: config.valueType,
                learnStore: this.learnStore
            });
        }, this)
    },

    setFacetGridVisibility : function(colName) {
        if (colName) {
            this.currentFilterField = colName;
        }
        this.facetGrids.forEach(function(grid)
        {
            if (grid.columnField == this.currentFilterField) {
                grid.show();
            }
            else {
                grid.hide();
            }
        }, this);
    },

    getTitleBar : function() {
        if (!this.titleBar) {
            this.titleBar = Ext.create('Ext.Component', {
                xtype: 'box',
                tpl: new Ext.XTemplate(
                        '<div class="sorter">',
                        '<span class="sorter-label">Filter Values by:</span>',
                        '<span class="sorter-content">{title:htmlEncode}</span>',
                        '</div>'
                ),
                data: this.filterConfig,
                flex: 10
            });
        }
        return this.titleBar
    },

    getConfigForField : function(field, value) {
        return this.filterConfigSet.find(function(config) {
            return config[field] == value;
        });
    },

    onAfterRender : function() {
        this.callParent(arguments);
        this.getButton('dofilter').setText('Search');
    },

    applyFiltersAndColumns : function()
    {
        var view = this.getComponent('faceted-' + this.currentFilterField);
        var filterValues = view.getFilterValues();
        if (filterValues.length == 0) {
            this.fireEvent('clearfilter', this.currentFilterField);
        }
        else if (filterValues.length > this.maxSelection) {
            Ext.Msg.alert('Error', 'Maximum selection of ' + this.maxSelection + ' values allowed.')
        }
        else {
            this.fireEvent('filter', this.currentFilterField, filterValues);
        }
        this.close();
    },

    onClear : function() {
        this.fireEvent('clearfilter', this.currentFilterField);
        this.close();
    }
});


Ext4.define('Connector.grid.LearnFaceted', {

    extend: 'Ext.panel.Panel',

    border: false,

    ui: 'custom',

    useStoreCache: true,

    maxRows: 500,

    dim: undefined,

    columnField: undefined,

    filterValues: [],

    initComponent : function() {

        this.gridReady = false;

        if (!this.filterValues) {
            this.filterValues = [];
        }

        this.items = [this.getGrid()];

        this.callParent();

    },

    getFilterValues : function() {
        var grid = this.getGrid();
        var filters = [];

        var store = grid.store;
        var count = store.getCount();
        var selected = grid.getSelectionModel().getSelection();

        if (selected.length > 0 && selected.length !== count) {
            Ext4.each(selected, function(selection){
                filters.push(selection.get('value'));
            });
        }

        return filters;
    },

    getGrid : function() {
        if (!Ext4.isDefined(this.grid)) {

            var gridConfig = {
                itemId: 'membergrid',
                store: this.getLookupStore(),
                viewConfig : { stripeRows : false },

                /* Selection configuration */
                selType: 'checkboxmodel',
                selModel: {
                    checkSelector: 'td.x-grid-cell-row-checker'
                },
                multiSelect: true,

                /* Column configuration */
                enableColumnHide: false,
                enableColumnResize: false,
                columns: [{
                    xtype: 'templatecolumn',
                    header: 'All',
                    dataIndex: 'value',
                    flex: 1,
                    sortable: false,
                    menuDisabled: true,
                    tpl: new Ext4.XTemplate('{value:htmlEncode}')
                }],

                /* Styling configuration */
                border: false,
                ui: 'custom',
                cls: 'measuresgrid filterpanegrid',

                listeners : {
                    viewready : {
                        fn: function() { this.gridReady = true; this.onViewReady(); },
                        scope: this,
                        single: true
                    },
                    selectionchange : {
                        fn: function() { this.changed = true; },
                        scope: this
                    }
                }
            };

            this.grid = Ext4.create('Ext.grid.Panel', gridConfig);
        }

        return this.grid;
    },

    getLookupStore : function() {
        var storeId = [this.dim, this.columnField].join('||');

        // cache
        if (this.useStoreCache === true) {
            var store = Ext4.StoreMgr.get(storeId);
            if (store) {
                return store;
            }
        }

        return this.createColumnFilterStore();
    },

    dataByDimension : {
        'Assay' : 'assayData',
        'Study' : 'studyData',
        'Study Product' : 'productData'
    },

    getSortFn: function() {
      if (this.valueType == 'number') {
          return function(a, b){
              return a - b;
          }
      }
      return function(a, b){
          if (a == undefined)
            return -1;
          else if (b == undefined)
            return 1;
          return a.localeCompare(b);
      }
    },

    createColumnFilterStore: function() {
        var dimensionValues = this.learnStore[this.dataByDimension[this.dim]];
            var validvalues = new Set(), field = this.columnField;
            Ext.each(dimensionValues, function(record){
                if (Ext.isArray(record[field])) {
                    Ext.each(record[field], function(val){
                        if (val != undefined) {
                            validvalues.add(val);
                        }
                    });
                }
                else {
                    if (record[field] != undefined) {
                        validvalues.add(record[field]);
                    }
                }
            });
            var validValuesArray = Array.from(validvalues).sort(this.getSortFn());
            var values = [];
            Ext.each(validValuesArray, function(value){
                values.push([value]);
            });
            var storeId = [this.dim, field].join('||');
            var columnStore = Ext4.create('Ext.data.ArrayStore', {
                fields: [
                    'value'
                ],
                data: values,
                storeId: storeId
            });
        return columnStore;
    },


    onViewReady : function() {

        if (this.gridReady) {
            // apply current filters
            var grid = this.getGrid();

            if (this.filterValues.length == 0) {
                grid.getSelectionModel().selectAll(true);
            }
            else {
                this.setValue(this.filterValues);
            }

        }
        if(Ext4.isDefined(this.onSuccessfulLoad) && Ext4.isFunction(this.onSuccessfulLoad))
            this.onSuccessfulLoad(this, this.scope);
    },

    setValue : function(values) {
        if (!this.rendered) {
            this.on('render', function() { this.setValue(values); }, this, {single: true});
        }

        if (!Ext4.isArray(values) && Ext4.isString(values)) {
            values = values.split(';');
        }

        var store = this.getGrid().getStore();
        this._checkAndLoadValues(store, values);

    },

    _checkAndLoadValues : function(store, values) {
        var records = [],
                recIdx,
                recordNotFound = false;

        Ext4.each(values, function(val) {
            recIdx = store.findBy(function(rec){
                return rec.get('value') == val;
            });

            if (recIdx != -1) {
                records.push(store.getAt(recIdx));
            }
            else {
                // Issue 14710: if the record is not found, we will not be able to select it, so should reject.
                // If it's null/empty, ignore silently
                if (!Ext4.isEmpty(val)) {
                    recordNotFound = true;
                    return false;
                }
            }
        }, this);

        if (recordNotFound) {
            return;
        }

        this.getGrid().getSelectionModel().select(records, false, true);
    }
});