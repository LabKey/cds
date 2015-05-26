/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Measure', {
    extend : 'Ext.data.Model',
    idProperty : 'alias', // default to alias, this can be overridden by the stores proxy/reader
    fields : [
        {name : 'id'},
        {name : 'alias'},
        {name : 'name'},
        {name : 'label'},
        {name : 'description'},
        {name : 'dimensions', defaultValue: undefined},
        {name : 'isUserDefined'},
        {name : 'isMeasure', defaultValue: false},
        {name : 'isDimension', defaultValue: false},
        {name : 'isDemographic', defaultValue: false},
        {name : 'inNotNullSet', defaultValue: undefined},
        {name : 'hidden', defaultValue: false},
        {name : 'queryLabel'},
        {name : 'queryName'},
        {name : 'schemaName'},
        {name : 'lookup', defaultValue: {}},
        {name : 'type'},
        {name : 'isRecommendedVariable', type: 'boolean', defaultValue: false},
        {name : 'recommendedVariableGrouper', convert: function(val, rec){ return rec.data.isRecommendedVariable ? '0' : '1'; }},
        {name : 'defaultScale'},
        {name : 'sortOrder', defaultValue: 0},
        {name : 'variableType', defaultValue: null}, // i.e. TIME, USER_GROUPS (default to null for query based variables)
        {name : 'queryType', defaultValue: null}, // see LABKEY.Query.Visualization.Filter.QueryType
        {name : 'sourceCount', defaultValue: undefined},
        {name : 'uniqueKeys', defaultValue: null}
    ]
});