/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Variable', {
    extend: 'Ext.data.Model',

    fields: [
        {name: 'type'},
        {name: 'source', defaultValue: undefined},
        {name: 'variable', defaultValue: undefined},
        {name: 'options', defaultValue: undefined}
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

        var source, variable, options = '', sep = '';
        if (sel) {
            if (sel.$className === 'Measure') {
                source = sel.get('queryLabel');
                variable = sel.get('label');
            }
            else {
                // assume an object with measure 'properties'
                source = sel['queryLabel'];
                variable = sel['label'];
            }

            var selOptions = sel['options'];
            if (Ext.isObject(selOptions))
            {
                if (selOptions.antigen) {
                    options = selOptions.antigen.values.join(', ');
                    sep = '; ';
                }
                if (selOptions.alignmentVisitTag) {
                    options += sep + (selOptions.alignmentVisitTagLabel || selOptions.alignmentVisitTag);
                    sep = '; ';
                }
                if (Ext.isObject(selOptions.dimensions)) {
                    Ext.Object.each(selOptions.dimensions, function(key, value){
                        options += sep + value.join(', ');
                        sep = '; ';
                    });
                }
                if (selOptions.scale) {
                    options += sep + selOptions.scale.toLowerCase();
                    sep = '; ';
                }

                if (options == '') {
                    options = undefined;
                }
            }
        }

        this.set('source', source);
        this.set('variable', variable);
        this.set('options', options);
        this.fireEvent('updatevariable', this);
    }
});