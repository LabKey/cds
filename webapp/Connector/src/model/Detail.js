Ext.define('Connector.model.Detail', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'label'},
        {name: 'value'},
        {name: 'count',     type: 'int'},
        {name: 'valueLabel'},
        {name: 'highlight'},
        {name: 'hierarchy'}
    ]
});