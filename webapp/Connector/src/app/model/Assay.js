/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Assay', {

    extend : 'Ext.data.Model',

    idProperty: 'Name',
    
    fields: [
        {name: 'Name'},
        {name: 'Description'},
        {name: 'Label'},
        {name: 'PI'},
        {name: 'SystemTarget'},
        {name: 'Type'},
        {name: 'Platform'},
        {name: 'Target'},
        {name: 'TargetFunction'}
    ]
});