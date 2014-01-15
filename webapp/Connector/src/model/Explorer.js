Ext.define('Connector.model.Explorer', {

    extend : 'Ext.data.Model',

    fields : [
        {name : 'label'},
        {name : 'count', type : 'int'},
        {name : 'subcount', type : 'int'},
        {name : 'hierarchy'},
        {name : 'value'},
        {name : 'level'},
        {name : 'isGroup', type : 'boolean'},
        {name : 'collapsed', type : 'boolean'},
        {name : 'btnId'}
    ]

});