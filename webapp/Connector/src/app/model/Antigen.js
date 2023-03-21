/*
 * Copyright (c) 2023 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.app.model.Antigen', {

    extend : 'Ext.data.Model',

    idProperty: 'antigen_cds_id',

    labelProperty: 'antigen_short_name',

    resolvableField: 'antigen_short_name',

    fields: [
        {name: 'antigen_cds_id', type: 'int'},
        {name: 'antigen_short_name', sortType: 'asUCString'},
        {name: 'antigen_full_name'},
        {name: 'antigen_name_other'},
        {name: 'antigen_category'},
        {name: 'isolate_species'},
        {name: 'isolate_clade'},
        {name: 'isolate_donor_id'},
        {name: 'isolate_mutations'},
        {name: 'antigen_type_modifiers'},
        {name: 'antigen_panel'},
        {name: 'antigen_type_control'}
    ]
});