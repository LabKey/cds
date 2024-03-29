/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Publication', {

    extend : 'Ext.data.Model',

    idProperty: 'publication_id',

    resolvableField: 'publication_id',

    labelProperty: 'publication_label',

    dataAvailabilityField: 'publication_data',

    fields: [
        {name: 'publication_id'},
        {name: 'container'},
        {name: 'publication_title'},
        {name: 'author_all'},
        {name: 'publication_abstract'},
        {name: 'journal_short'},
        {name: 'date', sortType: Connector.model.Filter.sorters.getPublicationDateSortStr},
        {name: 'volume'},
        {name: 'issue'},
        {name: 'location'},
        {name: 'pmid'},
        {name: 'link'},
        {name: 'author_first'},
        {name: 'publication_label'},
        {name: 'publication_data', convert : Connector.model.Filter.asArray},
        {name: 'publication_data_count'},
        {name: 'data_availability'},
        {name: 'year'},
        {name: 'study_to_sort_on'},
        {name: 'study_names', convert : Connector.model.Filter.asArray},
        {name: 'studies', convert : Connector.model.Filter.asArray},
        {name: 'interactive_reports', convert : Connector.model.Filter.asArray},
        {name: 'curated_groups', convert : Connector.model.Filter.asArray},
        {name: 'data_types_available', convert : Connector.model.Filter.asArray}
    ]
});