/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.FilterGroup', {
    extend : 'Ext.data.Model',
    fields : [
        {name : 'id'},
        {name : 'label'},
        {name : 'name'},
        {name : 'participantIds'},
        {name : 'description'},
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
                label: cohortGroupModel.get('label'),
                description: cohortGroupModel.get('description'),
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
