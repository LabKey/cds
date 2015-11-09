/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Detail', {

    extend : 'Ext.data.Model',

    idProperty : 'label',

    fields : [
        {name: 'label'},
        {name: 'value'},
        {name: 'count', type: 'int'},
        {name: 'subcount', type: 'int'}, // a value of -1 determines that the subcount is not provided
        {name: 'plotBasedCount', type: 'boolean'},
        {name: 'valueLabel'},
        {name: 'highlight', type: 'boolean'},
        {name: 'activeCountLink', type: 'boolean'},
        {name: 'dimension', defaultValue: undefined},
        {name: 'hierarchy', defaultValue: undefined},
        {name: 'level', defaultValue: undefined},
        {name: 'infoPaneViewClass', defaultValue: undefined}, // alternate class name for the info pane to display on click
        {name: 'dataRows', defaultValue: undefined} // array of data rows to use for the info pane grid members
    ]
});