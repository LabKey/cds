/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.MabVirusSelection', {

    extend: 'Connector.panel.AbstractAntigenSelection',

    measureColumnWidth: 124,

    filterFieldName: 'tier_clade_virus',

    subjectNoun: 'MAb/Mix',

    virusFields: ['neutralization_tier', 'clade', 'virus'],

    fieldLabels: ['Neutralization tier', 'Clade', 'Virus'],

    constructor : function(config) {
        this.callParent([config]);

        this.loadDistinctValuesStore();
    },

    getFields : function() {
        return this.virusFields;
    },

    createFieldColumnHeaders : function(checkboxItems) {
        // add a column header for each hierarchical measure and the subject counts
        Ext.each(this.fieldLabels, function(label) {
            checkboxItems.push(this.createColumnHeaderCmp(label, null, this.measureColumnWidth));
        }, this);
    },

    createAllCheckboxes : function(checkboxItems) {
        // add 'All' checkbox for each hierarchical measure
        Ext.each(this.virusFields, function(field) {
            checkboxItems.push(this.createAllCheckboxCmp(field, field));
        }, this);
    },

    loadDistinctValuesStore : function() {
        this.initSelectionFromState();
        var fields = ['neutralization_tier', 'clade', 'virus'];

        this.uniqueValuesStore = Ext.create('Ext.data.ArrayStore', {
            model: Ext.define('UniqueValueModel' + Ext.id(), {
                extend: 'Ext.data.Model',
                fields: ['key', 'subjectCount'].concat(fields),
                idProperty: 'key'
            }),
            sorters: ['key']
        });

        Connector.getQueryService().getMabViruses({
            success: function(response) {
                var allRows = {};
                Ext.each(response.rows, function(row) {
                    var key = this.getConcatKeyForRow(row);
                    row.key = key;
                    if (!allRows[key] || allRows[key].subjectCount === 0)
                        allRows[key] = row;
                }, this);
                var validRows = Ext.Object.getKeys(allRows).map(function(key){return allRows[key]});
                validRows.sort(function(a, b){
                    return a.key - b.key;
                });
                this.uniqueValuesStore.loadData(validRows);
                this.initCheckboxColumns();
            },
            scope: this
        });
    },

    initSelectionFromState : function() {
        if (!this.initSelection) {
            this.allValues = this.mabModel.getUniqueFieldValues(this.filterFieldName);
            var filter = this.mabModel.getFieldStateFilter(this.filterFieldName);
            if (filter) {
                var values = filter.getValue();
                values = values ? values : [];
                if (filter.getFilterType().getURLSuffix() === 'notin') {
                    values = Ext.Array.difference(this.allValues, values);
                }
                this.initSelection = values;
            }
            else
                this.initSelection = this.allValues;
        }
        return this.initSelection;
    },

    getConcatKeyForRow : function(row) {
        var key = '', sep = '';
        Ext.each(this.virusFields, function(field) {
            key += sep + (row[field] || 'null');
            sep = ChartUtils.ANTIGEN_LEVEL_DELIMITER;
        });
        return key;
    },

    onSelectionChange : function() {
        // do nothing
    },

    getColumnSize : function() {
        return this.virusFields.length + 1;
    },

    getConcatFieldValues : function() {
        return this.getValues()['virus-check'];
    },

    constructFilter : function () {
        var filter = null, selected = this.getSelectedValues();
        var unselected = Ext.Array.difference(this.allValues, selected);
        if (selected.length > 0 && unselected.length > 0) {

            if (selected.length > unselected.length) {
                filter = LABKEY.Filter.create(this.filterFieldName, this.delimitValues(unselected), LABKEY.Filter.Types.NOT_IN);
            }
            else {
                filter = LABKEY.Filter.create(this.filterFieldName, this.delimitValues(selected), LABKEY.Filter.Types.IN);
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
