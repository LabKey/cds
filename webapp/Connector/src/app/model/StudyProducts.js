/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.StudyProducts', {

    extend : 'Ext.data.Model',

    idProperty: 'product_id',

    labelProperty: 'product_name',

    resolvableField: 'product_name',

    dataAvailabilityField: 'studies_with_data',

    /**
     * Issue 28093
     * These "marker" products trigger special behavior because they have semantic meaning.
     * They are not considered actual products. The expected behavior is:
     * 1. Study learn about summary should not show NONE.
     * 2. Study learn about detail should not show NONE.
     * 3. Products learn about summary should not show NONE, NOT_USED, COMING_SOON
     */
    statics: {
        markerProducts: {
            NONE: "none",
            NOT_USED: "no products used in study",
            COMING_SOON: "product info coming soon!"
        }
    },

    fields: [
        {name: 'product_id', type: 'int'},
        {name: 'product_name', sortType: 'asUCString'},
        {name: 'product_type'},
        {name: 'product_subclass'},
        {name: 'product_class'},
        {name: 'product_class_label'},
        {name: 'product_developer'},
        {name: 'product_manufacturer'},
        {name: 'product_description'},
        {name: 'data_availability'},
        {name: 'data_accessible'},
        {name: 'studies_with_data_count'},
        {name: 'studies', convert : Connector.model.Filter.asArray},
        {name: 'other_products', convert : Connector.model.Filter.asArray},
        {name: 'studies_with_data', convert : Connector.model.Filter.asArray}
    ]
});