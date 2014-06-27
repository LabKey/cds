/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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

        var schema = '', query = '', sub = '';
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

            if (sel['options'])
            {
                if (sel['options'].antigen)
                    sub = sel['options'].antigen.values.join(', ');
                else if (sel['options'].alignmentVisitTagLabel)
                    sub = sel['options'].alignmentVisitTagLabel;
            }
        }

        this.set('schemaLabel', schema);
        this.set('queryLabel', query);
        this.set('subLabel', sub);
        this.fireEvent('updatevariable', this);
    }
});