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

        // Array of configs for what options to display in the Advanced panel on the Variable Selector.
        {name: 'dimensions', defaultValue: undefined}
    ]
});