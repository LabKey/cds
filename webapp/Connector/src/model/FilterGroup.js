Ext.define('Connector.model.FilterGroup', {
    extend : 'Ext.data.Model',
    fields : [
        {name : 'label'},
        {name : 'name'},
        {name : 'participantIds'},
        {name : 'description'},
        {name : 'shared', type: 'boolean'},
        {name : 'type'},
        {name : 'filters'}
    ],

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
