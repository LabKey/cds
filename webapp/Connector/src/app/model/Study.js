/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Study', {

    extend : 'Ext.data.Model',

    idProperty: 'Container',

    fields: [
        {name: 'Container'},
        {name: 'Label'},
        {name: 'Description'},
        {name: 'Phase'},
        {name: 'StartDate'},
        {name: 'EndDate'},
        {name: 'Treatments'},

        // TEMP: Test data
        {name: 'Editorial', defaultValue: 'This study was stopped after vaccination when it became clear it was not efficacious. There was initial concern that vaccinated individuals may have been more likely to be infected if exposed to HIV. Investigation is ongoing but a more nuanced explanation is emerging.'},
        {name: 'Sites', defaultValue: "36,-105.9;39,-95.7"},
        // {name: 'SitesSummary', defaultValue: '66 (60 vaccine, 6 placebo) healthy HIV-1-uninfected adult (18 to 50 years old) participants who have preexisting Ad5 neutralizing antibody titers of <1:12 from 2 cities in the USA.'},
        // {name: 'Sites', defaultValue: [{
        //     Name: 'Site 1',
        //     Latitude: 36,
        //     Longitude: -105.9
        // }, {
        //     Name: 'Site 2',
        //     Latitude: 39,
        //     Longitude: -95.7
        // }]},
        {name: 'MainContact', defaultValue: {
            Name: 'Warren Burger',
//            Portrait: 'http://doctor.png',
            Role: 'Program Manager',
            Team: 'HVTN concept development team'
        }}
    ]
});