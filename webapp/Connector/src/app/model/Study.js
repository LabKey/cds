/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Study', {

    extend : 'Ext.data.Model',

    idProperty: 'Label',

    fields: [
        {name: 'Container'},
        {name: 'Label'},
        {name: 'Description'},
        {name: 'Phase'},
        {name: 'StartDate'},
        {name: 'EndDate'},
        {name: 'Treatments'},
        {name: 'Editorial'},
        {name: 'SiteLocations'},
        {name: 'Network'},
        {name: 'Type'},

        // TEMP: Test data
        {name: 'MainContact', defaultValue: {
            Name: 'Warren Burger',
//            Portrait: 'http://doctor.png',
            Role: 'Program Manager',
            Team: 'HVTN concept development team'
        }}
    ]
});