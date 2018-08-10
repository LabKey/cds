/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.MabDetail', {

    extend: 'Connector.model.Detail',

    idProperty: 'label',

    fields: [
        {name: 'filterConfig', defaultValue: undefined},
        {name: 'name'},
        {name: 'label'},
        {name: 'value'},
        {name: 'count', type: 'int'},
        {name: 'subcount', type: 'int'}, // a value of -1 determines that the subcount is not provided
        {name: 'valueLabel'},
        {name: 'highlight', type: 'boolean'},
        {name: 'activeCountLink', type: 'boolean'},
        {name: 'viewClass', defaultValue: undefined}, // alternate class name for the info pane to display on click (must extend Connector.view.InfoPane)
        {name: 'modelClass', defaultValue: undefined}, // alternate class name for the info pane model (must extend Connector.model.InfoPane)
    ]
});