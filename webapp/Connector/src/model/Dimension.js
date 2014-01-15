Ext.define('Connector.model.Dimension', {

    extend : 'Ext.data.Model',

    fields : [
        {name: 'name'},
        {name: 'uniqueName'},
        {name: 'singularName'},
        {name: 'pluralName'},
        {name: 'hidden', type: 'boolean'},
        {name: 'priority', type: 'int'},
        {name: 'supportsDetails', type: 'boolean'},
        {name: 'detailModel'},
        {name: 'detailView'}
    ]
});