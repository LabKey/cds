/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

Ext.define('Connector.model.InfoPaneMember', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'uniqueName'},
        {name: 'name'},
        {name: 'otherName'}, //example use case: 'virus full name', which is different than 'virus name' can go under this otherName
        {name: 'count', type: 'int'},
        {name: 'hasData', type: 'boolean', convert: function(val, rec) { return rec.data.count > 0; }},
        {name: 'hasDetails', type: 'boolean', defaultValue: false},
        {name: 'detailLink'},
        {name: 'selected', type: 'boolean', defaultValue: false},
        {name: 'description'}
    ]
});