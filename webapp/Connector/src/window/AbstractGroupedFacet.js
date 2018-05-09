/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.AbstractGroupedFacet', {

    extend: 'Connector.window.AbstractFilter',

    bodyStyle: 'overflow-y: auto; padding: 10px;',

    width: 290,

    height: 375,

    currentFilterField: '',

    cls: 'learnFilter',

    /* To avoid URL overflow, allow up to 100 selections per column */
    maxSelection: 100

});

Ext4.define('Connector.grid.AbstractGroupedFacet', {

    extend: 'Ext.panel.Panel',

    border: false,

    ui: 'custom',

    useStoreCache: true,

    maxRows: 500,

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
                    tpl: new Ext4.XTemplate('{displayValue:htmlEncode}')
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
                                        return v ? 'In current selection' : 'Not in current selection';
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

    createColumnFilterStore: function() {
        var storeId = this.getStoreId(), me = this;
        return Ext4.create('Ext.data.ArrayStore', {
            fields: [
                'value', 'displayValue', {name:'hasData', type: 'boolean', defaultValue: true}
            ],
            data: this.prepareValuesArray(),
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

    prepareValuesArray: function() {
        var values = this.getAllValues();
        values = values.map(function(record) {
            if (record != undefined && !Ext.isObject(record))
                return [record, record, true];
            return [record.value, record.displayValue, true];
        });
        return values;
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

    getGroupedLookupStore : function() {
        var filteredValues = this.getFilteredValues();

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