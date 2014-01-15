/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.model.Citation', {

    extend : 'Ext.data.Model',

    fields : [
        {name : 'title'},
        {name : 'description'},
        {name : 'link'},
        {name : 'authors'},     // array of strings
        {name : 'references'},  // array of objects
        {name : 'dataSources'}, // array of objects
        {name : 'uri'}
    ]
});