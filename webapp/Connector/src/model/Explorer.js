/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Explorer', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'label'},
        {name: 'count', type: 'int'},
        {name: 'subcount', type: 'int'},
        {name: 'hierarchy'},
        {name: 'value'},
        {name: 'level'},
        {name: 'isGroup', type: 'boolean'},
        {name: 'collapsed', type: 'boolean'},
        {name: 'btnId'}
    ]

});