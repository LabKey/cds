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
        {name: 'Sites', defaultValue: [{
            type: 'vaccine',
            latitude: 36,
            longitude: -105.9,
        }, {
            type: 'placebo',
            latitude: 39,
            longitude: -95.7,
        }]}
    ]
});