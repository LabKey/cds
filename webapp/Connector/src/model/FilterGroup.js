/*
 * Copyright (c) 2014 LabKey Corporation
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
        {name : 'filters'},
        {name : 'isLive', type: 'boolean'}
    ],

    statics: {
        fromCohortGroup : function(cohortGroupModel) {

            var rawFilters = cohortGroupModel.get('filters'), filters = [], isLive = false;
            if (Ext.isString(rawFilters) && rawFilters.length > 0) {
                var json = Ext.decode(rawFilters);
                filters = Ext.isArray(json.filters) ? json.filters : [];
                isLive = json.isLive ? true : false;
            }

            return Ext.create('Connector.model.FilterGroup', {
                id: cohortGroupModel.get('id'),
                label: cohortGroupModel.get('label'),
                description: cohortGroupModel.get('description'),
                filters: filters,
                isLive: isLive,
                type: cohortGroupModel.get('type')
            });
        }
    },

    getName : function() {
        if (this.data.label)
            return this.data.label;
        return this.data.name;
    },

    isGroup : function() {
        return true;
    }
});
