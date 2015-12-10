/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Antigen', {

    extend: 'Ext.data.Model',

    fields: [
        {name: 'Name'},
        {name: 'Description'}
    ],

    statics: {
        getAntigenAlias : function(measure) {
            var alias = null, sep = '_';
            if (measure && measure.options && measure.options.antigen) {
                alias = measure.alias.substring(0, measure.alias.indexOf(sep + measure.name));
                alias += sep + measure.options.antigen.name;
            }

            return alias;
        }
    }
});
