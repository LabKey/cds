-- Changes to cds.import_bamaantigen
truncate table cds.import_bamaantigen;
ALTER TABLE cds.import_bamaantigen DROP CONSTRAINT import_bamaantigen_pkey;

-- Remove fields no longer useful from cds.import_bamaantigen
ALTER TABLE cds.import_bamaantigen DROP COLUMN antigen_name;
ALTER TABLE cds.import_bamaantigen DROP COLUMN antigen_type;
ALTER TABLE cds.import_bamaantigen DROP COLUMN protein_panel;
ALTER TABLE cds.import_bamaantigen DROP COLUMN protein;
ALTER TABLE cds.import_bamaantigen DROP COLUMN clade;
ALTER TABLE cds.import_bamaantigen DROP COLUMN antigen_description;

-- Add new cols to cds.import_bamaantigen
ALTER TABLE cds.import_bamaantigen ADD COLUMN cds_ag_id VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_full_name VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_short_name VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_plot_label VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_name_other VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN dna_construct_id INTEGER;
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_component VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_category VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_region VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_scaffold VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_modifiers VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_tags VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_differentiate VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_name_component VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_species VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_donor_id VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_differentiate VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_clade VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_clone VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_mutations VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_cloner_pi VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_country_origin VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_yr_isolated INTEGER;
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_fiebig_stage VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_accession_num INTEGER;
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_component VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_host_cell VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_purification_method VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_special_reagent VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_manufacturer VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_codon_optimization VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN transfection_method VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN transmitter_founder_status VARCHAR(250);

ALTER TABLE cds.import_bamaantigen ADD PRIMARY KEY (container, assay_identifier, cds_ag_id);

-- Changes to cds.bamaantigen --

truncate table cds.bamaantigen;
ALTER TABLE cds.bamaantigen DROP CONSTRAINT bamaantigen_pkey;

-- Remove fields no longer useful from cds.bamaantigen
ALTER TABLE cds.bamaantigen DROP COLUMN antigen_name;
ALTER TABLE cds.bamaantigen DROP COLUMN antigen_type;
ALTER TABLE cds.bamaantigen DROP COLUMN protein_panel;
ALTER TABLE cds.bamaantigen DROP COLUMN protein;
ALTER TABLE cds.bamaantigen DROP COLUMN clade;
ALTER TABLE cds.bamaantigen DROP COLUMN antigen_description;

-- Add new cols to cds.bamaantigen
ALTER TABLE cds.bamaantigen ADD COLUMN cds_ag_id VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_full_name VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_short_name VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_plot_label VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_name_other VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN dna_construct_id INTEGER;
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_component VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_category VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_region VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_scaffold VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_modifiers VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_tags VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_differentiate VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_name_component VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_species VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_donor_id VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_differentiate VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_clade VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_clone VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_mutations VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_cloner_pi VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_country_origin VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_yr_isolated INTEGER;
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_fiebig_stage VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_accession_num INTEGER;
ALTER TABLE cds.bamaantigen ADD COLUMN production_component VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN production_host_cell VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN production_purification_method VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN production_special_reagent VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN production_manufacturer VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN production_codon_optimization VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN transfection_method VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN transmitter_founder_status VARCHAR(250);

ALTER TABLE cds.bamaantigen ADD PRIMARY KEY (container, assay_identifier, cds_ag_id);

-- Rename existing Antigen Panel metadata tables
truncate table cds.import_antigenPanel;
ALTER TABLE cds.import_antigenPanel DROP CONSTRAINT pk_import_antigenPanel;
ALTER TABLE cds.import_antigenPanel RENAME TO import_antigenPanelMeta;

truncate table cds.antigenPanel;
ALTER TABLE cds.antigenPanel DROP CONSTRAINT pk_antigenPanel;
ALTER TABLE cds.antigenPanel RENAME TO antigenPanelMeta;

-- new AntigenPanel tables
CREATE TABLE cds.import_antigenPanel
(
    cds_ag_id VARCHAR(250),
    cds_panel_id VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_import_antigenPanel PRIMARY KEY (container, cds_ag_id, cds_panel_id)
);

CREATE TABLE cds.antigenPanel
(
    cds_ag_id VARCHAR(250),
    cds_panel_id VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_antigenPanel PRIMARY KEY (container, cds_ag_id, cds_panel_id)
);