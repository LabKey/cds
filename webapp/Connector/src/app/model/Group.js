/*
 * Copyright (c) 2016-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Group', {

    extend : 'Ext.data.Model',

    idProperty: 'group_name',

    labelProperty: 'group_name',

    resolvableField: 'group_name',

    fields: [
        {name: 'group_name', sortType: 'asUCString'},
        // {name: 'group_description'},
        // {name: 'group_studies'},
        // {name: 'species'},
        // {name: 'products'},
        // {name: 'assays'}
    ]
});