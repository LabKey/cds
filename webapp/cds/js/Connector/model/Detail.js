/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext4.define('Connector.model.Detail', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'label'},
        {name: 'value'},
        {name: 'count',     type: 'int'},
        {name: 'valueLabel'},
        {name: 'highlight'},
        {name: 'hierarchy'}
    ]
});