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

        if (sel && sel.$className === 'Measure') {
            this.set('primaryLabel', sel.get('queryLabel') + ': ' + sel.get('label'));
            this.fireEvent('updatevariable', this);
        }
    }
});