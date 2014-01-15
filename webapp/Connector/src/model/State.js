Ext.define('Connector.model.State', {

    extend : 'Ext.data.Model',

    requires : [
        'Connector.types.Filter'
    ],

    fields : [
        {name : 'activeView'},
        {name : 'viewState'},
        {name : 'views'},
        {name : 'filters'}, //,    type : Ext.data.Types.FILTER},
        {name : 'selections'},
        {name : 'detail'}
    ],

    proxy : {
        type : 'sessionstorage',
        id   : 'connectorStateProxy'
    }
});
