Ext.define('Connector.model.Citation', {

    extend : 'Ext.data.Model',

    fields : [
        {name : 'title'},
        {name : 'description'},
        {name : 'link'},
        {name : 'authors'},     // array of strings
        {name : 'references'},  // array of objects
        {name : 'dataSources'}, // array of objects
        {name : 'uri'}
    ]
});