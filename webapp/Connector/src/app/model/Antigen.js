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
        {name: 'antigen_cds_id'},
        {name: 'antigen_full_name', sortType: 'asUCString'},
        {name: 'antigen_short_name'},
        {name: 'antigen_plot_label'},
        {name: 'antigen_name_other'},
        {name: 'antigen_dna_construct'},
        {name: 'antigen_category'},
        {name: 'antigen_type_component'},
        {name: 'antigen_type_region'},
        {name: 'antigen_type_scaffold'},
        {name: 'antigen_type_modifiers'},
        {name: 'antigen_type_tags'},
        {name: 'antigen_type_virus_type'},
        {name: 'antigen_type_backbone'},
        {name: 'antigen_type_reporter_molecule'},
        {name: 'antigen_type_differentiate'},
        {name: 'antigen_type_control'},
        {name: 'isolate_name_component'},
        {name: 'isolate_species'},
        {name: 'isolate_donor_id'},
        {name: 'isolate_differentiate'},
        {name: 'isolate_clade'},
        {name: 'isolate_clone'},
        {name: 'isolate_mutations'},
        {name: 'isolate_neut_tier'},
        {name: 'isolate_clone_pi'},
        {name: 'isolate_country_origin'},
        {name: 'isolate_year_isolated'},
        {name: 'isolate_fiebig_stage'},
        {name: 'antigen_accession_num'},
        {name: 'antigen_amino_acid_sequence'},
        {name: 'production_component'},
        {name: 'isolate_host_cell'},
        {name: 'antigen_purification'},
        {name: 'antigen_reagents'},
        {name: 'antigen_manufacturer'},
        {name: 'antigen_codon_optimize'},
        {name: 'antigen_source'},
        {name: 'isolate_transfection_method'},
        {name: 'isolate_TF_status'},
        {name: 'isolate_PV_backbone_system'}
    ]
});