/*
 * Copyright (c) 2014-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Publication', {

    extend : 'Ext.data.Model',

    idProperty: 'id',

    resolvableField: 'id',

    dataAvailabilityField: 'studies_with_data', //TODO

    fields: [
        {name: 'id'},
        {name: 'container'},
        {name: 'title'},
        {name: 'author_all'},
        {name: 'journal_short'},
        {name: 'date', sortType: Connector.model.Filter.sorters.getPublicationDateSortStr},
        {name: 'volume'},
        {name: 'issue'},
        {name: 'location'},
        {name: 'pmid'},
        {name: 'link'},
        {name: 'author_first'},
        {name: 'publication_label'},

        {name: 'year'},
        {name: 'study_to_sort_on'},
        {name: 'study_names', convert : Connector.model.Filter.asArray},
        {name: 'studies', convert : Connector.model.Filter.asArray},
        {name: 'data_accessible'},
        {name: 'studies_with_data', convert : Connector.model.Filter.asArray}
    ]
});