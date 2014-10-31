/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.model.Antigen', {

    extend : 'Ext.data.Model',

    fields : [
        {name : 'Name'},
        {name : 'Description'}
    ],

    statics : {
        getAntigenAlias : function(measure) {
            if (measure && measure.options && measure.options.antigen) {
                var alias = measure.alias.substring(0, measure.alias.indexOf("_" + measure.name));
                alias += "_" + measure.options.antigen.name;
                return alias;
            }

            return null;
        }
    }
});
