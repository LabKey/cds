CREATE TABLE cds.import_assay_combined_antigen_metadata
(
    antigen_cds_id VARCHAR(250) NOT NULL,
    antigen_full_name VARCHAR(250),
    antigen_short_name VARCHAR(250),
    antigen_plot_label VARCHAR(250),
    antigen_name_other VARCHAR(250),
    antigen_dna_construct INTEGER,
    antigen_category VARCHAR(250),
    antigen_type_component VARCHAR(250),
    antigen_type_region VARCHAR(250),
    antigen_type_scaffold VARCHAR(250),
    antigen_type_modifiers VARCHAR(250),
    antigen_type_tags VARCHAR(250),
    antigen_type_virus_type VARCHAR(250),
    antigen_type_backbone VARCHAR(250),
    antigen_type_reporter_molecule VARCHAR(250),
    antigen_type_differentiate VARCHAR(250),
    antigen_type_control VARCHAR(250),
    isolate_name_component VARCHAR(250),
    isolate_species VARCHAR(250),
    isolate_donor_id VARCHAR(250),
    isolate_differentiate VARCHAR(250),
    isolate_clade VARCHAR(250),
    isolate_clone VARCHAR(250),
    isolate_mutations VARCHAR(250),
    isolate_neut_tier VARCHAR(250),
    isolate_clone_pi VARCHAR(250),
    isolate_country_origin VARCHAR(250),
    isolate_year_isolated INTEGER,
    isolate_fiebig_stage VARCHAR(250),
    antigen_accession_num INTEGER,
    antigen_amino_acid_sequence VARCHAR(250),
    production_component VARCHAR(250),
    isolate_host_cell VARCHAR(250),
    antigen_purification VARCHAR(250),
    antigen_reagents VARCHAR(250),
    antigen_manufacturer VARCHAR(250),
    antigen_codon_optimize VARCHAR(250),
    antigen_source VARCHAR(250),
    isolate_transfection_method VARCHAR(250),
    isolate_TF_status VARCHAR(250),
    isolate_PV_backbone_system VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_import_assay_combined_antigen_metadata PRIMARY KEY (antigen_cds_id, container)
);

CREATE TABLE cds.assay_combined_antigen_metadata
(
    antigen_cds_id VARCHAR(250) NOT NULL,
    antigen_full_name VARCHAR(250),
    antigen_short_name VARCHAR(250),
    antigen_plot_label VARCHAR(250),
    antigen_name_other VARCHAR(250),
    antigen_dna_construct INTEGER,
    antigen_category VARCHAR(250),
    antigen_type_component VARCHAR(250),
    antigen_type_region VARCHAR(250),
    antigen_type_scaffold VARCHAR(250),
    antigen_type_modifiers VARCHAR(250),
    antigen_type_tags VARCHAR(250),
    antigen_type_virus_type VARCHAR(250),
    antigen_type_backbone VARCHAR(250),
    antigen_type_reporter_molecule VARCHAR(250),
    antigen_type_differentiate VARCHAR(250),
    antigen_type_control VARCHAR(250),
    isolate_name_component VARCHAR(250),
    isolate_species VARCHAR(250),
    isolate_donor_id VARCHAR(250),
    isolate_differentiate VARCHAR(250),
    isolate_clade VARCHAR(250),
    isolate_clone VARCHAR(250),
    isolate_mutations VARCHAR(250),
    isolate_neut_tier VARCHAR(250),
    isolate_clone_pi VARCHAR(250),
    isolate_country_origin VARCHAR(250),
    isolate_year_isolated INTEGER,
    isolate_fiebig_stage VARCHAR(250),
    antigen_accession_num INTEGER,
    antigen_amino_acid_sequence VARCHAR(250),
    production_component VARCHAR(250),
    isolate_host_cell VARCHAR(250),
    antigen_purification VARCHAR(250),
    antigen_reagents VARCHAR(250),
    antigen_manufacturer VARCHAR(250),
    antigen_codon_optimize VARCHAR(250),
    antigen_source VARCHAR(250),
    isolate_transfection_method VARCHAR(250),
    isolate_TF_status VARCHAR(250),
    isolate_PV_backbone_system VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_assay_combined_antigen_metadata PRIMARY KEY (antigen_cds_id, container)
);