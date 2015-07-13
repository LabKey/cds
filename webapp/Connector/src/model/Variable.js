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

    statics: {
        getSourceDisplayText : function(variable) {
            var sourceTxt;

            if (Ext.isObject(variable)) {
                var isDataset = variable['queryType'] == 'datasets';
                sourceTxt = variable[isDataset ? 'queryName': 'queryLabel'];
            }

            return sourceTxt;
        },

        getOptionsDisplayText : function(variable, includeScale) {
            var optionsTxt = '', sep = '';

            if (Ext.isObject(variable) && Ext.isObject(variable.options)) {
                if (variable.options.antigen) {
                    optionsTxt = variable.options.antigen.values.join(', ');
                    sep = '; ';
                }
                if (variable.options.alignmentVisitTag) {
                    optionsTxt += sep + (variable.options.alignmentVisitTagLabel || variable.options.alignmentVisitTag);
                    sep = '; ';
                }
                if (Ext.isObject(variable.options.dimensions)) {
                    Ext.Object.each(variable.options.dimensions, function(key, value) {
                        optionsTxt += sep + value.join(', ');
                        sep = '; ';
                    });
                }
                if (includeScale && variable.options.scale) {
                    optionsTxt += sep + variable.options.scale.toLowerCase();
                    sep = '; ';
                }
            }

            if (optionsTxt == '') {
                optionsTxt = undefined;
            }

            return optionsTxt;
        }
    },

    updateVariable : function(selections) {
        var sel = null, source, variable, options;
        if (Ext.isArray(selections)) {
            if (selections.length > 0)
                sel = selections[0];
        }
        else if (Ext.isDefined(selections)) {
            sel = selections;
        }

        if (sel) {
            if (sel.$className === 'Measure') {
                source = Connector.model.Variable.getSourceDisplayText(sel.data);
                variable = sel.get('label');
            }
            else {
                // assume an object with measure 'properties'
                source = Connector.model.Variable.getSourceDisplayText(sel);
                variable = sel['label'];
            }

            options = Connector.model.Variable.getOptionsDisplayText(sel, true);
        }

        this.set({
            source: source,
            variable: variable,
            options: options
        });

        this.fireEvent('updatevariable', this);
    }
});