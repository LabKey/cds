/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Source', {
    extend: 'Ext.data.Model',
    idProperty: 'key',
    fields: [
        // Key property of the form schemaName|queryName.
        {name: 'key'},

        // Properties from the LabKey schema
        {name: 'schemaName', defaultValue: undefined},
        {name: 'queryName', defaultValue: undefined},
        {name: 'queryLabel', defaultValue: undefined},
        {name: 'queryType', defaultValue: null},
        {name: 'isDemographic', defaultValue: false},
        {name: 'longLabel', defaultValue: undefined},
        {name: 'description', defaultValue: undefined},

        // Misc properties about the source display in the application
        {name: 'title', convert: function(val, rec) {
            var title = rec.get('queryLabel');
            if (rec.get('category') == 'Assays') {
                title = rec.get('queryName') + ' (' + title + ')';
            }
            return title;
        }},
        {name: 'sortOrder', type: 'int', defaultValue: 0},
        {name: 'variableType', defaultValue: undefined},
        {name: 'category', defaultValue: undefined},
        {name: 'subjectCount', type: 'int', defaultValue: -1},
        {name: 'subjectCountQueryName', defaultValue: undefined}, // alternate queryName to use for subject counts for this source

        // Array of configs for what options to display in the Advanced panel on the Variable Selector.
        {name: 'dimensions', defaultValue: undefined},
        // Array of measure alias to use for DEFINED_MEASURES study dataset sources
        {name: 'measures', defaultValue: undefined},

        // Array of alias to add when generating plot queries
        {name: 'plotDependencyColumnAlias', defaultValue: undefined},

        // alias to add when X axis is using Time point measures, for soring time points
        {name: 'timePointSortColumnAlias', defaultValue: undefined},

        {name: 'defaultPlotType', defaultValue: undefined},

        // if Hours option should show up in Time point for plot X axis
        {name: 'allowHoursTimePoint', type: 'boolean', defaultValue: false}
    ]
});