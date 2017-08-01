/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.VariableList', {

    extend : 'Ext.data.Model',

    idProperty : 'alias',

    fields: [
        {name: 'alias'},
        {name: 'label'},
        {name: 'isRecommendedVariable', type: 'Boolean'},
        {name: 'description'},
        {name: 'queryName'},
        {name: 'sortOrder', type: 'int'}
    ]
});