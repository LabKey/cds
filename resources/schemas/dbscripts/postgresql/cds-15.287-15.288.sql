CREATE TABLE cds.import_ICSAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay(assay_identifier),
  antigen_name VARCHAR(250),
  antigen_type VARCHAR(250),
  protein_panel VARCHAR(250),
  protein VARCHAR(250),
  peptide_pool VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_import_ICSAntigen PRIMARY KEY (antigen_name, antigen_type)
);

CREATE TABLE cds.import_NAbAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay(assay_identifier),
  antigen_name VARCHAR(250),
  target_cell VARCHAR(250),
  antigen_type VARCHAR(250),
  virus VARCHAR(250),
  virus_type VARCHAR(250),
  virus_insert_name VARCHAR(250),
  neutralization_tier VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_import_NAbAntigen PRIMARY KEY (antigen_name, target_cell, antigen_type)
);

CREATE TABLE cds.import_BAMAAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay(assay_identifier),
  antigen_name VARCHAR(250),
  antigen_type VARCHAR(250),
  protein_panel VARCHAR(250),
  protein VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_import_BAMAAntigen PRIMARY KEY (antigen_name, antigen_type)
);

CREATE TABLE cds.import_ELISpotAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay(assay_identifier),
  antigen_name VARCHAR(250),
  antigen_type VARCHAR(250),
  protein_panel VARCHAR(250),
  protein VARCHAR(250),
  peptide_pool VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_import_ELISpotAntigen PRIMARY KEY (antigen_name, antigen_type)
);

CREATE TABLE cds.ICSAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.Assay(assay_identifier),
  container ENTITYID NOT NULL,
  antigen_name VARCHAR(250),
  antigen_type VARCHAR(250),
  protein_panel VARCHAR(250),
  protein VARCHAR(250),
  peptide_pool VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_ICSAntigens PRIMARY KEY (antigen_name, antigen_type)
);

CREATE TABLE cds.NAbAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.Assay(assay_identifier),
  container ENTITYID NOT NULL,
  antigen_name VARCHAR(250),
  target_cell VARCHAR(250),
  antigen_type VARCHAR(250),
  virus VARCHAR(250),
  virus_type VARCHAR(250),
  virus_insert_name VARCHAR(250),
  neutralization_tier VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_NAbAntigen PRIMARY KEY (antigen_name, target_cell, antigen_type)
);

CREATE TABLE cds.BAMAAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.Assay(assay_identifier),
  container ENTITYID NOT NULL,
  antigen_name VARCHAR(250),
  antigen_type VARCHAR(250),
  protein_panel VARCHAR(250),
  protein VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_BAMAAntigen PRIMARY KEY (antigen_name, antigen_type)
);

CREATE TABLE cds.ELISpotAntigen (
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.Assay(assay_identifier),
  container ENTITYID NOT NULL,
  antigen_name VARCHAR(250),
  antigen_type VARCHAR(250),
  protein_panel VARCHAR(250),
  protein VARCHAR(250),
  peptide_pool VARCHAR(250),
  clade VARCHAR(250),
  antigen_description TEXT,
  antigen_control VARCHAR(250),

  CONSTRAINT PK_ELISpotAntigen PRIMARY KEY (antigen_name, antigen_type)
);