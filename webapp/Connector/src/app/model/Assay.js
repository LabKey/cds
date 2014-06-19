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
        {name: 'Label'},
        {name: 'LabPI'},
        {name: 'Description'},
        {name: 'Editorial'},
        {name: 'Summary'},
        {name: 'Category'},
        {name: 'AlternateName'},
        {name: 'Contact'},
        {name: 'LeadContributor'},
        {name: 'Platform'},
        {name: 'Type'},
        {name: 'Target'},
        {name: 'TargetFunction'},
        {name: 'FullName'},
        {name: 'Lab'},
        {name: 'TargetType'},
        {name: 'TargetSubtype'}
    ]
});