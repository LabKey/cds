/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Assay', {

    extend : 'Ext.data.Model',

    idProperty: 'Label',
    
    fields: [
        {name: 'Name'},
        {name: 'Category'},
        {name: 'Contact'},
        {name: 'LeadContributor'},
        {name: 'Summary'},
        {name: 'Description'},
        {name: 'Label'},
        {name: 'PI'},
        {name: 'Platform'},
        {name: 'Type'},
        {name: 'Target'},
        {name: 'TargetFunction'}
    ]
});