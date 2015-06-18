/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Measure', {
    extend : 'Ext.data.Model',
    idProperty : 'alias',
    fields : [
        {name : 'id'},
        {name : 'alias'},

        // Properties from the LabKey schema and query
        {name : 'name', defaultValue: undefined},
        {name : 'label', defaultValue: undefined},
        {name : 'description', defaultValue: undefined},
        {name : 'schemaName', defaultValue: undefined},
        {name : 'queryName', defaultValue: undefined},
        {name : 'queryLabel', defaultValue: undefined},
        {name : 'lookup', defaultValue: {}},
        {name : 'type', defaultValue: undefined},

        // Boolean properties describing the type of measure/column
        {name : 'hidden', type: 'boolean', defaultValue: false},
        {name : 'isDemographic', type: 'boolean', defaultValue: false},
        {name : 'isUserDefined', type: 'boolean', defaultValue: undefined},
        {name : 'isMeasure', type: 'boolean', defaultValue: false},
        {name : 'isDimension', type: 'boolean', defaultValue: false},
        {name : 'inNotNullSet', defaultValue: undefined},

        // Misc properties about the measure display in the application
        {name : 'isRecommendedVariable', type: 'boolean', defaultValue: false},
        {name : 'recommendedVariableGrouper', convert: function(val, rec){ return rec.data.isRecommendedVariable ? '0' : '1'; }},
        {name : 'defaultScale', defaultValue: 'LINEAR'},
        {name : 'sortOrder', type: 'int', defaultValue: 0},
        {name : 'variableType', defaultValue: null}, // i.e. TIME, USER_GROUPS (default to null for query based variables)
        {name : 'queryType', defaultValue: null}, // see LABKEY.Query.Visualization.Filter.QueryType
        {name : 'sourceCount', type: 'int', defaultValue: undefined},
        {name : 'uniqueKeys', defaultValue: undefined},

        // Array of configs for what options to display in the Advanced options panel of the Variable Selector.
        // If undefined, fallback to the dimensions defined on the source query.
        {name : 'dimensions', defaultValue: undefined},

        // True to require selection of this option in the Advanced options panel of the Variable Selector.
        {name : 'requiresSelection', type: 'boolean', defaultValue: false},

        // True to allow multiple values of this option to be selected in the Advanced options panel of the Variable Selector.
        {name : 'allowMultiSelect', type: 'boolean', defaultValue: true},

        // The default selection state for this option. Configurations include: select all {all: true},
        // select first {all: false}, or select a specific value {all: false, value: 'XYZ'}.
        {name : 'defaultSelection', defaultValue: {all: true, value: undefined}},

        // If the selection method for this option involves a hierarchical relationship with other columns,
        // this property lists the child column's alias.
        {name : 'hierarchicalSelectionChild', defaultValue: undefined}
    ],

    shouldShowScale : function() {
        return this.get('variableType') == null && this.get('type') !== 'VARCHAR' && this.get('type') !== 'TIMESTAMP' && this.get('type') !== 'BOOLEAN';
    }
});