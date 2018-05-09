/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.panel.AntigenSelection', {

    extend: 'Connector.panel.AbstractAntigenSelection',

    constructor : function(config) {
        this.callParent([config]);

        this.addEvents('selectionchange');

        this.hierarchyMeasures = this.dimension.getHierarchicalMeasures();
        this.measureColumnWidth = Math.floor(this.totalColumnWidth / this.hierarchyMeasures.length);

        Connector.getQueryService().getMeasureValueSubjectCount(
                this.hierarchyMeasures[this.hierarchyMeasures.length - 1],
                this.selectorMeasure,
                this.measureSetStore.measureSet,
                this.filterOptionValues,
                this.plotAxis,
                this.loadDistinctValuesStore,
                this
        );
    },

    getFields: function() {
        return Ext.Array.pluck(Ext.Array.pluck(this.hierarchyMeasures, 'data'), 'alias');
    },

    createFieldColumnHeaders: function(checkboxItems) {
        // add a column header for each hierarchical measure and the subject counts
        Ext.each(this.hierarchyMeasures, function(measure) {
            checkboxItems.push(this.createColumnHeaderCmp(measure.get('label'), null, this.measureColumnWidth));
        }, this);
    },

    createAllCheckboxes: function(checkboxItems) {
        // add 'All' checkbox for each hierarchical measure
        Ext.each(this.hierarchyMeasures, function(measure) {
            checkboxItems.push(this.createAllCheckboxCmp(measure.get('alias'), measure.get('name')));
        }, this);
    },

    loadDistinctValuesStore : function(subjectCountMap) {
        var rows = [], fields = [], sorters = [], filterColumnAlias, filterColumnValue;

        Ext.each(this.hierarchyMeasures, function(measure) {
            fields.push(measure.get('alias'));
            sorters.push({property: measure.get('alias'), transform: function(val) {
                return val == null ? '[Blank]' : val;
            }});

            if (Ext.isDefined(measure.get('distinctValueFilterColumnAlias')) && Ext.isDefined(measure.get('distinctValueFilterColumnValue'))) {
                filterColumnAlias = measure.get('distinctValueFilterColumnAlias');
                filterColumnValue = measure.get('distinctValueFilterColumnValue');
            }
        }, this);

        this.uniqueValuesStore = Ext.create('Ext.data.ArrayStore', {
            model: Ext.define('UniqueValueModel' + Ext.id(), {
                extend: 'Ext.data.Model',
                fields: ['key', 'subjectCount'].concat(fields),
                idProperty: 'key'
            }),
            sorters: sorters
        });

        // filter on the data summary column for its distinct values and create a key so we don't load duplicates into the store
        Ext.each(this.measureSetStore.query(filterColumnAlias, filterColumnValue, false, true, true).items, function(record) {
            var data = Ext.clone(record.data);
            data.key = this.getConcatKeyForRecord(record, fields);
            data.subjectCount = subjectCountMap[data.key] || 0;

            rows.push(data);
        }, this);

        this.uniqueValuesStore.loadData(rows);

        this.initCheckboxColumns();
    },

    onSelectionChange: function() {
        var selectedValues = this.getSelectedValues();
        this.fireEvent('selectionchange', selectedValues, this.uniqueValuesStore.getCount() == selectedValues.length);
    },

    getColumnSize : function() {
        return this.hierarchyMeasures.length + 1;
    },

    getConcatFieldValues: function() {
        return this.getValues()[this.hierarchyMeasures[this.hierarchyMeasures.length - 1].get('alias') + '-check'];
    }

});