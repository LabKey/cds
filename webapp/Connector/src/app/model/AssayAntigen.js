/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.AssayAntigen', {

    extend : 'Ext.data.Model',

    idProperty: 'antigen_identifier',

    resolvableField: 'antigen_identifier',

    labelProperty: 'antigen_name',

    fields: [
        {name: 'antigen_identifier'},
        {name: 'Container'},
        {name: 'antigen_name',sortType: 'asUCString'},
        {name: 'antigen_description', convert : function(value) {
                return Ext.isArray(value) ? value : [];
            }
        },
        {name: 'antigen_control_value'},
        {name: 'antigen_type',sortType: 'asUCString'},
        {name: 'antigen_clade'},
        {name: 'antigen_clades', convert : function(value) {
                return Ext.isArray(value) ? value : [];
            }
        },
        {name: 'antigen_neutralization_tier'},
        {name: 'antigen_protein'},
        {name: 'antigen_proteinAndPools', convert : function(value) {
                return Ext.isArray(value) ? value : [];
            }
        },
        {name: 'antigen_proteins', convert : function(value) {
                return Ext.isArray(value) ? value : [];
            }
        },
        {name: 'antigen_pools', convert : function(value) {
                return Ext.isArray(value) ? value : [];
            }
        },
        {name: 'antigen_target_cell',sortType: 'asUCString'},
        {name: 'antigen_virus_type'}
    ]
});