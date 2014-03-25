/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Study', {

    extend : 'Ext.data.Model',

    fields: [
        {name: 'Label'},
        {name: 'Description'},
        {name: 'Phase'},
        {name: 'StartDate'},
        {name: 'EndDate'},
        {name: 'Treatments'}
    ]
});