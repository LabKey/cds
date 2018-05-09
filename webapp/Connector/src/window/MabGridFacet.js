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

    initComponent : function()
    {
        this.callParent();
        this.createFacetGrid();
    },

    createFacetGrid : function() {
        var filterStatus = this._getFilterValues();
        var config = this.filterConfig;
        this.facetGrid = Ext.create('Connector.grid.MabGridFacet', {
            itemId: 'faceted-mab-' + config.fieldName,
            border: false,
            useStoreCache: true,
            filterValues: filterStatus.filterValues,
            activeValues: this.activeValues,
            allValues: this.mabModel.getUniqueFieldValues(config.fieldName),
            isFilterNegated: filterStatus.isFilterNegated,
            columnField: config.fieldName,
            valueType: config.valueType
        });

        this.add(this.facetGrid);
    },

    _getFilterValues: function() {
        var fieldName = this.filterConfig.fieldName;
        var filter = this.mabModel.getFieldStateFilter(fieldName);
        if (filter) {
            var value = Ext.isArray(filter.getValue()) ? filter.getValue()[0] : filter.getValue();
            return {
                filterValues: value ? value.split(";") : [],
                isFilterNegated: filter.getFilterType().getURLSuffix() === 'notin'
            }
        }
        else {
            return {
                filterValues: [],
                isFilterNegated: false
            }
        }
    },

    onAfterRender : function() {
        this.callParent(arguments);
        this.getButton('doclear').hide();
        this.getButton('dofilter').setText('Done');
    },

    applyFiltersAndColumns : function()
    {
        var view = this.getComponent('faceted-mab-' + this.filterConfig.fieldName);
        var facetValues = view.getFacetValues();
        var selected = facetValues.selected, unselected = facetValues.unselected;
        var filter = this.constructFilter(selected, unselected);
        this.fireEvent('mabfilter', this.filterConfig.fieldName, filter);
        this.close();
    },

    constructFilter: function (selected, unselected) {
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

    delimitValues: function (valueArray) {
        var value = '', sep = '';
        for (var s = 0; s < valueArray.length; s++) {
            value += sep + valueArray[s];
            sep = ';';
        }
        return value;
    }
});


Ext4.define('Connector.grid.MabGridFacet', {

    extend: 'Connector.grid.AbstractGroupedFacet',

    getFilteredValues: function() {
        return this.activeValues;
    },

    getStoreId: function()
    {
        return 'mab-col-' + this.columnField;
    },

    getAllValues: function() {
        return this.allValues;
    }

});