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

        {name: 'Phase'},
        {name: 'StartDate'},
        {name: 'EndDate'},
        {name: 'Treatments'},
        {name: 'SiteLocations'},
        {name: 'Network'},
        {name: 'Type'},

        // TEMP: Test data
        {name: 'Title'},//, defaultValue: "[PLACEHOLDER Study.Title]"},
        {name: 'Description'},// defaultValue: "[PLACEHOLDER Study.Description]"},
        {name: 'Editorial'},// defaultValue: "[PLACEHOLDER Study.Editorial]"},
        {name: 'Objectives'},// defaultValue: "[PLACEHOLDER Study.Objectives]"},
        {name: 'StudyPopulation'},// defaultValue: "[PLACEHOLDER Study.Population]"},
        {name: 'Stage'},// defaultValue: "[PLACEHOLDER Study.Stage]"},
        
        {name: 'MainContact'}// defaultValue: {
//            Name: 'Warren Burger',
//            Portrait: 'http://doctor.png',
//            Role: 'Program Manager',
//            Team: 'HVTN concept development team'
//        }}
    ]
});