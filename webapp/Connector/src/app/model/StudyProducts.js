/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.StudyProducts', {

    extend : 'Ext.data.Model',

    idProperty: 'Label',

    fields: [
        {name: 'Label'},
        {name: 'Role'},
        {name: 'Type'},
        {name: 'Developer'},
        {name: 'Manufacturer'},
        {name: 'Immunogen'},
        {name: 'Class'},
        {name: 'VectorClass'},
        {name: 'ProductSubclass'},
        {name: 'Production'},
        {name: 'Inserts'},
        {name: 'ToxicityStudies'},
        {name: 'PreviousTrials'},
        {name: 'Description'},
        {name: 'DeveloperContact'},
        {name: 'Contact', defaultValue: {
            Name: 'Uknown Person',
//            Portrait: 'http://doctor.png',
            Role: 'Program Manager',
            Team: 'HVTN concept development team'
        }}
    ]
});