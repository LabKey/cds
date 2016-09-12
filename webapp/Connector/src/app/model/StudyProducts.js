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

    dataAvailabilityField: 'studies_with_data',

    fields: [
        {name: 'product_id', type: 'int'},
        {name: 'product_name', sortType: 'asUCString'},
        {name: 'product_type'},
        {name: 'product_subclass'},
        {name: 'product_class'},
        {name: 'product_class_label'},
        {name: 'product_developer', sortType: function(a){
            if (a == '[blank]')
                return '\uFFFF';
            return a;
        }},
        {name: 'product_manufacturer'},
        {name: 'product_description'},
        {name: 'data_availability'},
        {name: 'studies_with_data_count'},
        {name: 'studies', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'other_products', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }},
        {name: 'studies_with_data', convert : function(value) {
            return Ext.isArray(value) ? value : [];
        }}
    ]
});