/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.app.model.Site', {

    extend : 'Ext.data.Model',

    fields: [
        {name: 'Id'},
        {name: 'AltName'},
        {name: 'PI'},
        {name: 'Location'},
        {name: 'Status'},
        {name: 'Network'},
        {name: 'Description'}
    ]
});