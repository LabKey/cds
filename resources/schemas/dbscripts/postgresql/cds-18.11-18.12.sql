/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_pkey;
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, assay_identifier, antigen_name, target_cell, antigen_type);

ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_pkey;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, assay_identifier, antigen_name, target_cell, antigen_type);

CREATE TABLE cds.import_MAbMetadata (
  container ENTITYID NOT NULL,
  mab_id VARCHAR(250) NOT NULL,
  mab_name_std VARCHAR(250),
  mab_lanlid VARCHAR(250),
  mab_hxb2_location VARCHAR(250),
  mab_ab_binding_type VARCHAR(250),
  mab_isotype VARCHAR(250),
  mab_donorid VARCHAR(250),
  mab_donor_species VARCHAR(250),
  mab_donor_clade VARCHAR(250),

  CONSTRAINT PK_import_MAbMetadata PRIMARY KEY (container, mab_id)
);

CREATE TABLE cds.MAbMetadata (
  container ENTITYID NOT NULL,
  mab_id VARCHAR(250) NOT NULL,
  mab_name_std VARCHAR(250),
  mab_lanlid VARCHAR(250),
  mab_hxb2_location VARCHAR(250),
  mab_ab_binding_type VARCHAR(250),
  mab_isotype VARCHAR(250),
  mab_donorid VARCHAR(250),
  mab_donor_species VARCHAR(250),
  mab_donor_clade VARCHAR(250),

  CONSTRAINT PK_MAbMetadata PRIMARY KEY (container, mab_id)
);

CREATE TABLE cds.import_MAbMixMetadata (
  container ENTITYID NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_mix_name_std VARCHAR(250),
  mab_mix_label VARCHAR(250),

  CONSTRAINT PK_import_MAbMixMetadata PRIMARY KEY (container, mab_mix_id)
);

CREATE TABLE cds.MAbMixMetadata (
  container ENTITYID NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_mix_name_std VARCHAR(250),
  mab_mix_label VARCHAR(250),

  CONSTRAINT PK_MAbMixMetadata PRIMARY KEY (container, mab_mix_id)
);

CREATE TABLE cds.import_MAbMix (
  container ENTITYID NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_id VARCHAR(250) NOT NULL,

  CONSTRAINT PK_import_MAbMix PRIMARY KEY (container, mab_mix_id, mab_id),

  CONSTRAINT import_MAbMix_mab_mix_id_fkey
  FOREIGN KEY (container, mab_mix_id) REFERENCES cds.import_MAbMixMetadata (container, mab_mix_id),

  CONSTRAINT import_MAbMix_mab_id_fkey
  FOREIGN KEY (container, mab_id) REFERENCES cds.import_MAbMetadata (container, mab_id)
);

CREATE TABLE cds.MAbMix (
  container ENTITYID NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_id VARCHAR(250) NOT NULL,

  CONSTRAINT PK_MAbMix PRIMARY KEY (container, mab_mix_id, mab_id),

  CONSTRAINT MAbMix_mab_mix_id_fkey
  FOREIGN KEY (container, mab_mix_id) REFERENCES cds.MAbMixMetadata (container, mab_mix_id),

  CONSTRAINT MAbMix_mab_id_fkey
  FOREIGN KEY (container, mab_id) REFERENCES cds.MAbMetadata (container, mab_id)
);

CREATE TABLE cds.import_NABMAb (
  row_id SERIAL,
  container ENTITYID NOT NULL,

  prot VARCHAR(250) NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_name_source VARCHAR(250),
  target_cell VARCHAR(250),
  assay_identifier VARCHAR(250),
  summary_level VARCHAR(250),
  clade VARCHAR(250),
  neutralization_tier VARCHAR(250),
  virus_dilution VARCHAR(250),
  specimen_type VARCHAR(250),
  lab_code VARCHAR(250),
  virus VARCHAR(250),
  virus_type VARCHAR(250),

  initial_concentration NUMERIC(15,4),
  specimen_concentration_id INTEGER,
  mab_concentration NUMERIC(15,4),
  mab_concentration_units VARCHAR(250),
  min_concentration NUMERIC(15,4),
  max_concentration NUMERIC(15,4),
  min_well_value NUMERIC(15,4),
  max_well_value NUMERIC(15,4),
  mean_well_value NUMERIC(15,4),
  well_std_dev NUMERIC(15,4),
  percent_neutralization NUMERIC(15,4),
  neutralization_plus_minus NUMERIC(15,4),
  titer_ic50 NUMERIC(15,4),
  titer_ic80 NUMERIC(15,4),
  nab_response_ic50 BOOLEAN,
  nab_response_ic80 BOOLEAN,
  slope NUMERIC(15,4),

  fit_min NUMERIC(15,4),
  fit_max NUMERIC(15,4),
  fit_asymmetry NUMERIC(15,4),
  fit_slope NUMERIC(15,4),
  fit_inflection NUMERIC(15,4),
  fit_error NUMERIC(15,4),

  CONSTRAINT PK_import_NABMAb PRIMARY KEY (row_id),

  CONSTRAINT import_NABMAb_mab_mix_id_fkey
    FOREIGN KEY (container, mab_mix_id) REFERENCES cds.import_MAbMixMetadata (container, mab_mix_id),

  CONSTRAINT import_NABMAb_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot),

  CONSTRAINT import_NABMAb_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier),

  CONSTRAINT import_NABMAb_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code)
);
