/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Labs', {

    extend : 'Ext.data.Model',

    fields: [
        {name: 'Name'},
        {name: 'PI'},
        {name: 'Institution'},
        {name: 'Location'},
        {name: 'Description'}
    ]
});