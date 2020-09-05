/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
        {name: 'antigen_description', convert : Connector.model.Filter.asArray},
        {name: 'antigen_control_value'},
        {name: 'antigen_type',sortType: 'asUCString'},
        {name: 'antigen_clade'},
        {name: 'antigen_clades', convert : Connector.model.Filter.asArray},
        {name: 'antigen_neutralization_tier'},
        {name: 'antigen_protein'},
        {name: 'antigen_proteinAndPools', convert : Connector.model.Filter.asArray},
        {name: 'antigen_proteins', convert : Connector.model.Filter.asArray},
        {name: 'antigen_pools', convert : Connector.model.Filter.asArray},
        {name: 'antigen_target_cell',sortType: 'asUCString'},
        {name: 'antigen_virus_type'},
        {name: 'antigen_virus_full_name'},
        {name: 'antigen_virus_species'},
        {name: 'antigen_virus_host_cell'},
        {name: 'antigen_virus_backbone'},
        {name: 'antigen_virus_name_other'},
        {name: 'antigen_panel_names'}
    ]
});