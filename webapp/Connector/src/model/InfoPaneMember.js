
Ext.define('Connector.model.InfoPaneMember', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'uniqueName'},
        {name: 'name'},
        {name: 'count', type: 'int'},
        {name: 'hasData', type: 'boolean', convert: function(val, rec) { return rec.data.count > 0; }},
        {name: 'hasDetails', type: 'boolean', defaultValue: false},
        {name: 'detailLink'},
        {name: 'selected', type: 'boolean', defaultValue: false}
    ]
});