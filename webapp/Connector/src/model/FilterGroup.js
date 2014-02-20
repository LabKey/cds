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

    addFilter : function(filter) {},

    removeFilter : function(id) {},

    getName : function() {
        if (this.data.label)
            return this.data.label;
        return this.data.name;
    },

    isGroup : function() {
        return true;
    }
});

// models Subject Groups and Cohorts mixed
Ext.define('LABKEY.study.GroupCohort', {
    extend : 'Ext.data.Model',
    fields : [
        {name : 'id'},
        {name : 'label'},
        {name : 'description'},
        {name : 'filters'},
        {name : 'type'},
        {name : 'participantIds'} // array
    ]
});
