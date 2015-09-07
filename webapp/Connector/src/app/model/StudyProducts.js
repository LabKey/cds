/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.StudyProducts', {

    extend : 'Ext.data.Model',

    idProperty: 'product_id',

    labelProperty: 'product_name',

    resolvableField: 'product_name',

    fields: [
        {name: 'product_id', type: 'int'},
        {name: 'product_name'},
        {name: 'product_type'},
        {name: 'product_subclass'},
        {name: 'product_class_label'},
        {name: 'product_developer'},
        {name: 'product_manufacturer'},
        {name: 'product_description'},
        {name: 'studies', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }}
    ]
});