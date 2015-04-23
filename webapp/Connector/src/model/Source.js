Ext.define('Connector.model.Source', {
    extend: 'Ext.data.Model',
    idProperty: 'key',
    fields: [
        {name: 'key'},
        {name: 'sortOrder'},
        {name: 'schemaName'},
        {name: 'queryName'},
        {name: 'queryLabel'},
        {name: 'description'},
        {name: 'variableType'},
        {name: 'category'}
    ]
});