/*
 * Copyright (c) 2018 LabKey Corporation
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

Ext.define('Connector.grid.AbstractGroupedFacet', {

    extend: 'Ext.panel.Panel',

    border: false,

    ui: 'custom',

    useStoreCache: true,

    maxRows: 500,

    columnField: undefined,

    filterValues: undefined,

    groupInText: 'In current selection',

    groupOutText: 'Not in current selection',

    isFilterNegated: false,

    latestSelections: undefined,

    initComponent : function() {

        this.gridReady = false;

        Ext.applyIf(this, {
            allValues: [],
            filterValues: [],
            latestSelections: []
        });

        this.items = [this.getGrid()];

        this.on('beforedestroy', function(){this.hideItemTooltip();}, this);
        this.callParent();
    },

    getFacetValues : function() {
        var grid = this.getGrid();
        var selected = [], unselected = [], all = [];

        var store = grid.store.snapshot ? grid.store.snapshot : grid.store;
        var count = store.getCount();
        var selections = this.useSearch ? this.latestSelections : grid.getSelectionModel().getSelection();

        if (selections.length > 0 && selections.length !== count) {
            Ext.each(selections, function(selection) {
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
        if (!Ext.isDefined(this.grid)) {

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
                    tpl: new Ext.XTemplate('{displayValue:htmlEncode}')
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
                    },
                    select: function(view, model)
                    {
                        if (this.useSearch)
                            this.latestSelections.push(model);
                        return true;
                    },
                    deselect: function(view, model)
                    {
                        if (this.useSearch) {
                            this.latestSelections = Ext.Array.filter(this.latestSelections, function(sel) {
                                return sel.id !== model.id;
                            });
                        }
                        return true;
                    },
                    itemmouseenter : this.showItemTooltip,
                    itemmouseleave : this.hideItemTooltip,
                    itemmousedown : this.hideItemTooltip,
                    scope: this
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
                                    return v ? this.groupInText : this.groupOutText;
                                }.bind(this)
                            }
                        )
                    }
                ]
            };

            this.grid = Ext.create('Ext.grid.Panel', gridConfig);
        }

        return this.grid;
    },

    createColumnFilterStore: function() {
        var me = this;
        var fields = ['value', 'displayValue', {name:'hasData', type: 'boolean', defaultValue: true}];

        if (this.filterConfig.showTooltip)
            fields.push({name: 'tooltip', type: 'string', defaultValue: ''});

        return Ext.create('Ext.data.ArrayStore', {
            fields: fields,
            data: this.prepareValuesArray(),
            storeId: this.getStoreId(),
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

    prepareValuesArray : function() {
        var values = this.getAllValues();
        values = values.map(function(record) {
            var rec;

            if (record != undefined && !Ext.isObject(record))
                rec = [record, record, true];
            else
                rec = [record.value, record.displayValue, true];

            if (this.filterConfig.showTooltip)
                rec.push(this.getTooltip(!Ext.isObject(record) ? record : record.displayValue));

            return rec;
        }, this);
        return values;
    },

    getTooltip : function(value) {
        return '';
    },

    getAllValues : function() {
        return this.allValues;
    },

    getFilteredValues : function() {
        return this.filterValues;
    },

    getLookupStore : function() {
        var storeId = this.getStoreId();

        // cache
        if (this.useStoreCache === true) {
            var store = Ext.StoreMgr.get(storeId);
            if (store) {
                return store;
            }
        }

        return this.createColumnFilterStore();
    },

    getSortFn : function() {
        if (this.valueType === 'number') {
            return function(a, b) {
                return a - b;
            }
        }
        else if (this.valueType === 'date_display') {
            return function(a, b) {
                return Ext.Date.parse(a, "M jS, Y").getTime() - Ext.Date.parse(b, "M jS, Y").getTime();
            }
        }
        return function(a, b) {
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
        if (this.resetSearch)
            facetStore.clearFilter();
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

            if (this.filterValues.length === 0) {
                grid.getSelectionModel().selectAll(true);
            }
            else {
                this.setValue(this.filterValues, this.isFilterNegated);
            }

            if (this.useSearch)
                this.latestSelections = grid.getSelectionModel().getSelection();
        }
        if (Ext.isDefined(this.onSuccessfulLoad) && Ext.isFunction(this.onSuccessfulLoad)) {
            this.onSuccessfulLoad(this, this.scope);
        }
    },

    setValue : function(values, negated) {
        if (!this.rendered) {
            this.on('render', function() { this.setValue(values, negated); }, this, {single: true});
        }

        if (!Ext.isArray(values) && Ext.isString(values)) {
            values = values.split(';');
        }

        this._checkAndLoadValues(this.getGrid().getStore(), values, negated);
    },

    _checkAndLoadValues : function(store, values, negated) {
        var records = [],
            recIdx,
            recordNotFound = false;

        Ext.each(values, function(val) {
            recIdx = store.findBy(function(rec) {
                return rec.get('value') == val;
            });

            if (recIdx !== -1) {
                records.push(store.getAt(recIdx));
            }
            else {
                // Issue 14710: if the record is not found, we will not be able to select it, so should reject.
                // If it's null/empty, ignore silently
                if (!Ext.isEmpty(val)) {
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
    },

    showItemTooltip : function(cmp, rec) {
        if (rec && rec.data.tooltip) {
            var highlighted = Ext.dom.Query.select('div.x-grid-cell-inner:contains(' + rec.data.value + ')');
            var el = Ext.get(highlighted[0]);

            if (el) {
                var calloutMgr = hopscotch.getCalloutManager(),
                        _id = el.id,
                        displayTooltip = setTimeout(function() {
                            calloutMgr.createCallout(Ext.apply({
                                id: _id,
                                xOffset: -30,
                                yOffset: -20,
                                showCloseButton: false,
                                target: highlighted[0],
                                placement: 'left',
                                content: rec.data.tooltip,
                                width: 200
                            }, {}));
                        }, 200);

                this.on('hideTooltip', function() {
                    clearTimeout(displayTooltip);
                    calloutMgr.removeCallout(_id);
                }, this);
            }
        }
    },

    hideItemTooltip : function() {
        this.fireEvent('hideTooltip');
    }
});