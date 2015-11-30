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
        {name: 'activeCountEvent', defaultValue: undefined}, // an application even to fire on count click instead of opening the InfoPane view
        {name: 'dimension', defaultValue: undefined},
        {name: 'hierarchy', defaultValue: undefined},
        {name: 'level', defaultValue: undefined},
        {name: 'viewClass', defaultValue: undefined}, // alternate class name for the info pane to display on click (must extend Connector.view.InfoPane)
        {name: 'modelClass', defaultValue: undefined}, // alternate class name for the info pane model (must extend Connector.model.InfoPane)
        {name: 'measureSet', defaultValue: undefined}, // array of measures to use for the info pane members query
        {name: 'membersWithData', defaultValue: undefined} // array of filter members which have data in the current filters or selection
    ]
});