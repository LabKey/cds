/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Source', {
    extend: 'Ext.data.Model',
    idProperty: 'key',
    fields: [
        {name: 'key'},
        {name: 'sortOrder'},
        {name: 'schemaName'},
        {name: 'queryName'},
        {name: 'queryLabel'},
        {name: 'longLabel'},
        {name: 'description'},
        {name: 'variableType'},
        {name: 'category'},
        { name: 'subjectCount', type: 'int', defaultValue: -1 }
    ]
});