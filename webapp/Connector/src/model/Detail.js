/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Detail', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'label'},
        {name: 'value'},
        {name: 'count', type: 'int'},
        {name: 'subcount', type: 'int'}, // a value of -1 determines that the subcount is not provided
        {name: 'dataBasedCount', type: 'boolean'},
        {name: 'valueLabel'},
        {name: 'highlight'},
        {name: 'activeCountLink', type: 'boolean'},
        {name: 'dimension'},
        {name: 'hierarchy'},
        {name: 'level'}
    ]
});