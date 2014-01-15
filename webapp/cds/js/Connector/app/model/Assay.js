/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.app.model.Assay', {

    extend : 'Ext.data.Model',

    fields: [
        {name: 'Id'},
        {name: 'Description'},
        {name: 'AltName'},
        {name: 'PI'},
        {name: 'SystemTarget'},
        {name: 'Type'},
        {name: 'Platform'},
        {name: 'Target'},
        {name: 'TargetFunction'}
    ]
});