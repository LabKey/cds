/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.LearnFacet', {

    extend: 'Connector.window.AbstractFilter',

    bodyStyle: 'overflow-y: auto; padding: 10px;',

    width: 290,

    height: 375,

    dim: undefined,

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
                menuAlign: 'tr-br',
                menuOffsets: [25, 0],
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
                },
                listeners: {
                    afterrender : function(b) {
                        b.showMenu(); b.hideMenu(); // allows the menu to layout/render
                    }
                }
            };

            var selector = {
                xtype: 'container',
                ui: 'custom',
                layout: { type: 'hbox' },
                items: [this.getTitleBar(), dropDownBtn],
                listeners :{
                    render: function(cmp) {
                        cmp.getEl().on('click', function(){
                            Ext.getCmp(btnId).showMenu();
                        });
                    }
                }
            };
            this.setFacetGridVisibility();
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
                filterValues: config.columnFilter.filterValues,
                isFilterNegated: config.columnFilter.negated,
                dim: this.dim,
                tabId: this.tabId,
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
                data: this.filterConfigSet[0],
                flex: 10
            });
        }
        return this.titleBar
    },

    getConfigForField : function(field, value) {
        var targetConfig = null;
        if (Ext.isArray(this.filterConfigSet)){
            Ext.each(this.filterConfigSet, function(config){
                if (config[field] == value) {
                    targetConfig = config;
                    return false;
                }
            });
        }
        return targetConfig;
    },

    onAfterRender : function() {
        this.callParent(arguments);
        this.getButton('dofilter').setText('Search');
    },

    applyFiltersAndColumns : function()
    {
        var view = this.getComponent('faceted-' + this.currentFilterField);
        var facetValues = view.getOptimizedFacetValues();
        var filterValues = facetValues.values;
        if (filterValues.length == 0) {
            this.fireEvent('clearfilter', this.currentFilterField);
        }
        else if (filterValues.length > this.maxSelection) {
            Ext.Msg.alert('Error', 'Maximum selection of ' + this.maxSelection + ' values allowed.')
        }
        else {
            this.fireEvent('filter', this.currentFilterField, filterValues, facetValues.negated);
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

    isFilterNegated: false,

    initComponent : function() {

        this.gridReady = false;

        if (!this.filterValues) {
            this.filterValues = [];
        }

        this.items = [this.getGrid()];

        this.callParent();
    },

    getOptimizedFacetValues : function() {
        var facetValues = this.getFacetValues();
        var selected = facetValues.selected, unselected = facetValues.unselected;
        if (selected && selected.length > 1 && selected.length > unselected.length)
        {
            return {
                values: unselected,
                negated: true
            };
        }
        return {
            values: selected,
            negated: false
        };
    },

    getFacetValues : function() {
        var grid = this.getGrid();
        var selected = [], unselected = [], all = [];

        var store = grid.store;
        var count = store.getCount();
        var selections = grid.getSelectionModel().getSelection();

        if (selections.length > 0 && selections.length !== count) {
            Ext4.each(selections, function(selection){
                selected.push(selection.get('value'));
            });
            all = store.getRange()
                    .map(function(record) {
                        return record.get('value');
                    }, this);
            unselected = Ext.Array.difference(all, selected);
        }

        return {
            selected: selected,
            unselected: unselected
        };
    },

    getGrid : function() {
        if (!Ext4.isDefined(this.grid)) {

            var gridConfig = {
                itemId: 'membergrid',
                store: this.getGroupedLookupStore(),
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
                },

                requires: ['Ext.grid.feature.Grouping'],

                features: [
                    {
                        ftype: 'grouping',
                        collapsible: false,
                        groupHeaderTpl: new Ext.XTemplate(
                                '{name:this.renderHeader}', // 'name' is actually the value of the groupField
                                {
                                    renderHeader: function(v) {
                                        return v ? 'Has data in current selection' : 'No data in current selection';
                                    }
                                }
                        )
                    }
                ]

            };

            this.grid = Ext4.create('Ext.grid.Panel', gridConfig);
        }

        return this.grid;
    },

    getLookupStore : function() {
        var storeId = this.getStoreId();

        // cache
        if (this.useStoreCache === true) {
            var store = Ext4.StoreMgr.get(storeId);
            if (store) {
                return store;
            }
        }

        return this.createColumnFilterStore();
    },

    getGroupedLookupStore : function() {
        var filteredStore = this.learnStore.data;
        var filteredValues = this.getLearnStoreValues(filteredStore);

        var facetStore = this.getLookupStore(), allValues = [];
        facetStore.each(function(record) {
            allValues.push(record.data);
        });
        Ext.each(allValues, function(data) {
            var value = data.value;
            data.hasData = filteredValues.indexOf(value) > -1;
        });
        facetStore.loadData(allValues);
        return facetStore;
    },

    getStoreId: function()
    {
        var id = '';
        if (this.dim)
        {
            id += this.dim;
        }
        else if (this.tabId)
        {
            id += this.tabId;
        }
        id += ('||' + this.columnField);
        return id;
    },

    getSortFn: function() {
      if (this.valueType == 'number') {
          return function(a, b){
              return a - b;
          }
      }
      else if (this.valueType == 'date_display') {
          return function(a, b){
              return Ext.Date.parse(a, "M jS, Y").getTime() - Ext.Date.parse(b, "M jS, Y").getTime();
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

    getLearnStoreValues: function(store)
    {
        var concatBeforeSort = false; //if record is an array.
        var hasBlank = false; // handle empty value
        var values = store.getRange()
                .map(function(record) {
                    var value = record.get(this.columnField);
                    if (Ext.isArray(value)) {
                        concatBeforeSort = true;
                        if (value.length == 0)
                            hasBlank = true;
                    }
                    else {
                        if (value == null || value === '')
                            hasBlank = true;
                    }
                    return value;
                }, this);

        //converts 2d array to 1d array
        if (concatBeforeSort) {
            values = values.reduce(function (prev, curr){
                return (prev || []).concat(curr);
            });
        }

        if (hasBlank)
            values.push('[blank]');

        //remove null and duplicates
        values = Ext.Array.clean(values);
        return Ext.Array.unique(values);
    },

    createColumnFilterStore: function() {
        var store = this.learnStore.snapshot || this.learnStore.data;
        var values = this.getLearnStoreValues(store);
        values = values.map(function(record) {
                    return [record, true];
                });
        var storeId = this.getStoreId(), me = this;
        return Ext4.create('Ext.data.ArrayStore', {
            fields: [
                'value', {name:'hasData', type: 'boolean', defaultValue: true}
            ],
            data: values,
            storeId: storeId,
            groupField: 'hasData',
            groupDir: 'DESC',
            sorters: [{
                sorterFn: function(o1, o2) {
                    var val1 = o1.get('value'), val2 = o2.get('value');
                    var sortFn = me.getSortFn();
                    return sortFn.call(me, val1, val2);
                }
            }]
        });
    },

    onViewReady : function() {

        if (this.gridReady) {
            // apply current filters
            var grid = this.getGrid();

            if (this.filterValues.length == 0) {
                grid.getSelectionModel().selectAll(true);
            }
            else {
                this.setValue(this.filterValues, this.isFilterNegated);
            }

        }
        if(Ext4.isDefined(this.onSuccessfulLoad) && Ext4.isFunction(this.onSuccessfulLoad))
            this.onSuccessfulLoad(this, this.scope);
    },

    setValue : function(values, negated) {
        if (!this.rendered) {
            this.on('render', function() { this.setValue(values, negated); }, this, {single: true});
        }

        if (!Ext4.isArray(values) && Ext4.isString(values)) {
            values = values.split(';');
        }

        var store = this.getGrid().getStore();
        this._checkAndLoadValues(store, values, negated);

    },

    _checkAndLoadValues : function(store, values, negated) {
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

        if (negated) {
            var count = store.getCount(), found = false, negRecords = [], i, j;
            for (i=0; i < count; i++) {
                found = false;
                for (j=0; j < records.length; j++) {
                    if (records[j] == store.getAt(i))
                        found = true;
                }
                if (!found) {
                    negRecords.push(store.getAt(i));
                }
            }
            records = negRecords;
        }

        if (recordNotFound) {
            return;
        }

        this.getGrid().getSelectionModel().select(records, false, true);
    }
});