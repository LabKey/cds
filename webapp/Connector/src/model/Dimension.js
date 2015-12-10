/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Dimension', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'name'},
        {name: 'uniqueName'},
        {name: 'singularName'},
        {name: 'pluralName'},
        {name: 'hidden', type: 'boolean'},
        {name: 'priority', type: 'int'},
        {name: 'supportsDetails', type: 'boolean'},
        {name: 'detailModel'},
        {name: 'detailView'}
    ]
});

Ext.define('Connector.model.Hierarchy', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'defaultOperator'},
        {name: 'filterType'},
        {name: 'hidden', type: 'boolean'},
        {name: 'label'},
        {name: 'name'},
        {name: 'supportsSummary', type: 'boolean'},
        {name: 'uniqueName'}
    ]
});