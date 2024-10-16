/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.FilterGroup', {
    extend : 'Ext.data.Model',
    fields : [
        {name : 'id'},
        {name : 'rowid'},
        {name : 'label'},
        {name : 'name'},
        {name : 'participantIds'},
        {name : 'description'},
        {name : 'categoryId'},
        {name : 'shared', type: 'boolean'},
        {name : 'type'},
        {name : 'filters'}
    ],

    statics: {
        fromCohortGroup : function(cohortGroupModel)
        {
            var rawFilters = cohortGroupModel.get('filters'),
                filters = [];

            if (Ext.isString(rawFilters) && rawFilters.length > 0)
            {
                var json = Ext.decode(rawFilters);
                filters = Ext.isArray(json.filters) ? json.filters : [];
            }

            return Ext.create('Connector.model.FilterGroup', {
                id: cohortGroupModel.get('id'),
                rowid: cohortGroupModel.get('rowid'),
                label: cohortGroupModel.get('label'),
                participantIds: cohortGroupModel.get('participantIds'),
                description: cohortGroupModel.get('description'),
                categoryId: cohortGroupModel.get('categoryId'),
                shared: cohortGroupModel.get('shared'),
                filters: filters,
                type: cohortGroupModel.get('type')
            });
        }
    },

    getName : function()
    {
        return this.data.label ? this.data.label : this.data.name;
    }
});
