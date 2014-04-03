Ext.define('Connector.model.Variable', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'typeLabel'},
        {name: 'schemaLabel'},
        {name: 'queryLabel'},
        {name: 'subLabel'}
    ],

    updateVariable : function(selections) {
        var sel = null;
        if (Ext.isArray(selections)) {
            if (selections.length > 0)
                sel = selections[0];
        }
        else if (Ext.isDefined(selections)) {
            sel = selections;
        }

        var schema = '', query = '';
        if (sel) {
            if (sel.$className === 'Measure') {
                schema = sel.get('queryLabel');
                query = sel.get('label');
            }
            else {
                // assume an object with measure 'properties'
                schema = sel['queryLabel'];
                query = sel['label'];
            }
        }

        this.set('schemaLabel', schema);
        this.set('queryLabel', query);
        this.fireEvent('updatevariable', this);
    }
});