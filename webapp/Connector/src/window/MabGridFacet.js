/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.window.MabGridFacet', {

    extend: 'Connector.window.AbstractGroupedFacet',

    filterConfig: undefined,

    currentfieldName: '',

    blankValue: '[blank]',

    /* To avoid URL overflow, allow up to 100 selections per column */
    maxSelection: 100,

    initComponent : function() {
        this.callParent();
        this.addEvents('clearmabfilter', 'mabfilter', 'mabfiltersearchchanged');
        this.createFacetGrid();
        this.on('mabfiltersearchchanged', this.facetGrid.filterFacetOptions, this.facetGrid);
    },

    // Override to add search box
    getTopConfig : function() {
        var allValues = this.mabModel.getUniqueFieldValues(this.filterConfig.fieldName);
        if (allValues && allValues.length > 10) {
            return {
                xtype: 'container',
                dock: 'top',
                border: false,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    ui: 'actionheader',
                    cls: 'filter-top-toolbar',
                    items: [
                        {
                            xtype: 'tbtext',
                            style: 'font-size: 13.5pt; font-weight: bold; text-transform: uppercase; font-family: Arial;',
                            text: Ext.htmlEncode(this.columnMetadata.caption)
                        },
                        '->',
                        {
                            text: '&#215;',
                            ui: 'custom',
                            style: 'font-size: 16pt; color: black; font-weight: bold;',
                            handler: this.close,
                            scope: this
                        }
                    ]
                }, {
                    xtype: 'textfield',
                    emptyText: 'Search ' + this.filterConfig.caption,
                    padding: '10 50 0 15',
                    width: 200,
                    checkChangeBuffer: 800,
                    cls: 'mab-facet-search',
                    value: '',
                    validator: Ext.bind(function(value) {
                        var allSelect = Ext.select('.learnFilter .x-grid-header-ct-docked-top');
                        if (value === '')
                            allSelect.show();
                        else
                            allSelect.hide();
                        if (value != this.searchValue) {
                            this.fireEvent('mabfiltersearchchanged', value, this.searchValue);
                            this.searchValue = value;
                        }
                        return true;
                    }, this)
                }]
            };
        }
        return this.callParent();
    },

    createFacetGrid : function() {
        var filterStatus = this._getFilterValues();
        var config = this.filterConfig;
        var allValues = this.mabModel.getUniqueFieldValues(config.fieldName);
        this.facetGrid = Ext.create('Connector.grid.MabGridFacet', {
            itemId: 'faceted-mab-' + config.fieldName,
            border: false,
            useStoreCache: true,
            filterValues: filterStatus.filterValues,
            activeValues: this.activeValues,
            allValues: allValues,
            isFilterNegated: filterStatus.isFilterNegated,
            columnField: config.fieldName,
            valueType: config.valueType,
            useSearch: allValues && allValues.length > 10 ? true: false
        });

        this.add(this.facetGrid);
    },

    _getFilterValues : function() {
        var fieldName = this.filterConfig.fieldName;
        var filter = this.mabModel.getFieldStateFilter(fieldName);

        if (filter) {
            var value = Ext.isArray(filter.getValue()) ? filter.getValue()[0] : filter.getValue();
            return {
                filterValues: value ? value.split(";") : [],
                isFilterNegated: filter.getFilterType().getURLSuffix() === 'notin'
            }
        }

        return {
            filterValues: [],
            isFilterNegated: false
        }
    },

    applyFiltersAndColumns : function() {
        var view = this.getComponent('faceted-mab-' + this.filterConfig.fieldName),
            facetValues = view.getFacetValues(),
            selected = facetValues.selected,
            unselected = facetValues.unselected,
            filter = this.constructFilter(selected, unselected);

        this.fireEvent('mabfilter', this, this.filterConfig.fieldName, filter);
        this.close();
    },

    onClear : function() {
        this.fireEvent('clearmabfilter', this, this.filterConfig.fieldName);
        this.close();
    },

    constructFilter : function(selected, unselected) {
        var filter = null;

        if (selected.length > 0) {

            var columnName = this.filterConfig.fieldName;

            if (selected.length > unselected.length) {
                filter = LABKEY.Filter.create(columnName, this.delimitValues(unselected), LABKEY.Filter.Types.NOT_IN);
            }
            else {
                filter = LABKEY.Filter.create(columnName, this.delimitValues(selected), LABKEY.Filter.Types.IN);
            }
        }

        return filter;
    },

    delimitValues : function (valueArray) {
        var value = '', sep = '';
        for (var s = 0; s < valueArray.length; s++) {
            value += sep + valueArray[s];
            sep = ';';
        }
        return value;
    }
});

Ext.define('Connector.grid.MabGridFacet', {

    extend: 'Connector.grid.AbstractGroupedFacet',

    groupInText: 'In current mAb grid',

    groupOutText: 'Not in current mAb grid',

    resetSearch: true,

    initComponent : function() {
        Ext.applyIf(this, {
            activeValues: []
        });

        this.callParent();
    },

    getFilteredValues : function() {
        return this.activeValues;
    },

    getStoreId : function() {
        return 'mab-col-' + this.columnField;
    },

    filterFacetOptions : function(value, previousValue) {
        var facetStore = this.getLookupStore();
        var regex = new RegExp(LABKEY.Utils.escapeRe(value), 'i');

        facetStore.clearFilter(false);

        if (value !== '') {
            facetStore.filterBy(function(record) {
                return regex.test(record.get('displayValue'));
            });
        }

        if (value === '' || (previousValue && previousValue.indexOf(value) === 0)) {
            if (this.useSearch && this.latestSelections.length > 0) {
                this.updateSelectionOnSearch();
            }
        }
    },

    updateStoreFiltering : function(facetStore, regex) {
        if (!this.updateStoreFilteringTask) {
            this.updateStoreFilteringTask = new Ext.util.DelayedTask(this.filterStore, this);
        }
        this.updateStoreFilteringTask.delay(200, null, this, [facetStore, regex]);
    },

    filterStore : function(facetStore, regex) {
        facetStore.filterBy(function(record) {
            return regex.test(record.get('displayValue'));
        });
    },

    updateSelectionOnSearch : function() {
        if (!this.updateSelectionTask) {
            this.updateSelectionTask = new Ext.util.DelayedTask(function () {
                var selModel = this.getGrid().getSelectionModel(), store = selModel.store, selections = [];
                var validKeys = store.data.keys;
                Ext.each(this.latestSelections, function(sel) {
                    if (validKeys.indexOf(sel.internalId) > -1)
                        selections.push(sel);
                });
                selModel.select(selections, false, true);
            }, this);
        }
        this.updateSelectionTask.delay(600, null, this);
    }
});
