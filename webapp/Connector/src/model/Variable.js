Ext.define('Connector.model.Variable', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'typeLabel'},
        {name: 'primaryLabel'},
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

        var label = '';
        if (sel) {
            if (sel.$className === 'Measure') {
                label = sel.get('queryLabel') + ': ' + sel.get('label');
            }
            else {
                // assume an object with measure 'properties'
                label = sel['queryLabel'] + ': ' + sel['label'];
            }
        }

        this.set('primaryLabel', label);
        this.fireEvent('updatevariable', this);
    }
});