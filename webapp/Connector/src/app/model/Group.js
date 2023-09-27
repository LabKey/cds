/*
 * Copyright (c) 2016-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Group', {

    extend : 'Ext.data.Model',

    idProperty: 'group_name',

    labelProperty: 'group_name',

    resolvableField: 'group_name',

    fields: [
        {name: 'group_name', sortType: 'asUCString'},
        {name: 'group_type'},
        {name: 'description'},
        {name: 'study_label'},
        {name: 'studies', convert : Connector.model.Filter.asArray},
        {name: 'studySpecies', convert : Connector.model.Filter.asArray},
        {name: 'species'},
        {name: 'product_name'},
        {name: 'species'},
        {name: 'products', convert : Connector.model.Filter.asArray},
        {name: 'assay_identifier'},
        {name: 'assays', convert : Connector.model.Filter.asArray},

        {name: 'study_names', convert : Connector.model.Filter.asArray},
        {name: 'product_names', convert : Connector.model.Filter.asArray},
        {name: 'assay_names', convert : Connector.model.Filter.asArray},
        {name: 'species_names', convert : Connector.model.Filter.asArray},

    ]
});