/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Summary', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'label'},
        {name: 'total', type: 'int'},
        {name: 'subject'}, // in the sentence "3 total regimens" this would be 'regimens'
        {name: 'details'}, // Array of {text, nav} objects
        {name: 'sort', type: 'int'},
        {name: 'dimName'},
        {name: 'hierarchy'},
        {name: 'defaultLvl'},
        {name: 'counter'},
        {name: 'text'}
    ]
});
