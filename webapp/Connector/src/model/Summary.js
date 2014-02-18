Ext.define('Connector.model.Summary', {

    extend : 'Ext.data.Model',

    fields : [
        {name : 'label'},
        {name : 'total', type : 'int'},
        {name : 'subject'}, // in the sentence "3 total regimens" this would be 'regimens'
        {name : 'details'}, // Array of {text, nav} objects
        {name : 'sort',  type : 'int'},
        {name : 'hierarchy'}, // TODO: This is really the name of the dimesnion...
        {name : 'counter'},
        {name : 'text'}
    ]
});
