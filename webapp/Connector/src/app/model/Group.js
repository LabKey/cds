/*
 * Copyright (c) 2016-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Group', {

    extend : 'Ext.data.Model',

    idProperty: 'label',

    labelProperty: 'label',

    resolvableField: 'label',

    fields: [
        {name: 'label', sortType: 'asUCString'},
        {name: 'id'},
        {name: 'rowid'},

        // fields for the home page listing and group summary
        {name: 'filters'},
        {name: 'containsPlot', type: 'boolean', defaultValue: false, convert : function(value, partial) {
                if (partial.raw){
                    if (partial.raw.type === 'mab')
                        return value;
                    var raw = partial.raw.filters;
                    var containsPlot = false;
                    if (Ext.isString(raw)) {
                        var filterArray = Connector.model.Filter.fromJSON(raw);
                        if (Ext.isArray(filterArray)) {
                            Ext.each(filterArray, function(filter) {
                                if (filter.isPlot === true) {
                                    containsPlot = true;
                                }
                            });
                        }
                    }
                    return containsPlot;
                }
            }},
        {name: 'categoryId'},
        {name: 'shared', type: 'boolean', defaultValue: false, convert : function(value, partial) {
                if (partial.raw){
                    if (partial.raw.type === 'mab')
                        return value;
                    return partial.raw.category.shared;
                }
            }},
        {name: 'type'},
        {name: 'participantIds', convert : Connector.model.Filter.asArray},
        {name: 'modified', type: 'DATE'},
        {name: 'isMab', type: 'Boolean'},
        {name: 'description', convert : function(value, partial) {
                if (partial.raw){
                    return partial.raw.description ? partial.raw.description : 'No description given.'
                }
            }},

        // fields for the learn grid
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
        {name: 'study_names_to_sort_on'},
        {name: 'product_to_sort_on'},
        {name: 'species_to_sort_on'},
        {name: 'assay_to_sort_on'}
    ]
});