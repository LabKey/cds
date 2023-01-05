/*
 * Copyright (c) 2019 LabKey Corporation
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

/* cds-0.00-15.30.sql */

CREATE SCHEMA cds;

CREATE TABLE cds.Feedback
(
    RowId SERIAL,
    Container ENTITYID NOT NULL,
    Created TIMESTAMP NOT NULL,
    CreatedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Description TEXT,
    State TEXT,

    CONSTRAINT pk_feedback PRIMARY KEY (Container, RowId)
);

CREATE TABLE cds.Sites
(
	Id VARCHAR(250) NOT NULL,
	PI VARCHAR(250),
	Description TEXT,
	Location TEXT,
	Container ENTITYID NOT NULL,
  Status VARCHAR(50),
  AltName VARCHAR(250),
  Network VARCHAR(250),

	CONSTRAINT pk_sites PRIMARY KEY (Container, Id)
);

CREATE TABLE cds.import_Study (
  prot VARCHAR(250) NOT NULL,
  network VARCHAR(250),
  study_label VARCHAR(250),
  study_short_name VARCHAR(250),
  study_title VARCHAR(500),
  study_type VARCHAR(250),
  study_status VARCHAR(250),
  study_stage VARCHAR(250),
  study_population VARCHAR(250),
  study_species VARCHAR(250),

  study_first_enr_date DATE,
  study_fu_complete_date DATE,
  study_start_date DATE,
  study_public_date DATE,

  study_description TEXT,
  study_rationale TEXT,
  study_hypothesis TEXT,
  study_objectives TEXT,
  study_methods TEXT,
  study_findings TEXT,
  study_discussion TEXT,
  study_context TEXT,

  CONSTRAINT PK_import_Study PRIMARY KEY (prot)
);

CREATE TABLE cds.import_Product (
  product_id INTEGER NOT NULL,
  product_name VARCHAR(250) NOT NULL UNIQUE,
  product_type VARCHAR(250),
  product_class VARCHAR(250),
  product_subclass VARCHAR(250),
  product_class_label VARCHAR(250),
  product_developer VARCHAR(250),
  product_manufacturer VARCHAR(250),
  product_immunogen VARCHAR(250),

  product_description TEXT,

  CONSTRAINT PK_import_Product PRIMARY KEY (product_id)
);

CREATE TABLE cds.import_Assay (
  assay_identifier VARCHAR(250) NOT NULL,
  assay_label VARCHAR(250),
  assay_short_name VARCHAR(250),
  assay_category VARCHAR(250),
  assay_detection_platform VARCHAR(250),
  assay_body_system_type VARCHAR(250),
  assay_body_system_target VARCHAR(250),
  assay_general_specimen_type VARCHAR(250),
  assay_description TEXT,
  assay_method_description TEXT,
  assay_endpoint_description TEXT,
  assay_endpoint_statistical_analysis TEXT,

  CONSTRAINT PK_import_Assay PRIMARY KEY (assay_identifier)
);

-- one record per Insert per Product
CREATE TABLE cds.import_ProductInsert (
  row_id SERIAL,
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),
  insert_id INTEGER,
  clade_id INTEGER,
  insert_name VARCHAR(250) NOT NULL,
  clade_name VARCHAR(250) NOT NULL,

  CONSTRAINT UQ_import_ProductInsert UNIQUE (product_id, insert_id, clade_id),
  CONSTRAINT PK_import_ProductInsert PRIMARY KEY (row_id)
);

-- one record per Product in a Study
CREATE TABLE cds.import_StudyProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),

  CONSTRAINT PK_import_StudyProduct PRIMARY KEY (prot, product_id)
);

CREATE TABLE cds.import_StudyPartGroupArm (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_randomization VARCHAR(100),
  study_arm_description_coded_label VARCHAR(100), -- formerly, treatment_regimen_code
  product_class_combination_label VARCHAR(100),
  product_combination_label VARCHAR(100),
  study_arm_last_exp_vacc_day INTEGER, -- NOT NULL?

  study_arm_description TEXT,

  CONSTRAINT PK_import_StudyArm PRIMARY KEY (prot, study_part, study_group, study_arm)
);

-- one record per Visit in a Study Group Arm
-- each arm in a group is on the same schedule in reality
CREATE TABLE cds.import_StudyPartGroupArmVisit (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  study_visit_code VARCHAR(250),
  study_week INTEGER NOT NULL,
  study_month INTEGER NOT NULL,
  study_arm_visit_type VARCHAR(250),
  study_arm_visit_label VARCHAR(250),
  study_arm_visit_detail_label VARCHAR(250),
  isvaccvis BOOLEAN DEFAULT FALSE,
  ischallvis BOOLEAN DEFAULT FALSE,

  CONSTRAINT PK_import_StudyPartGroupArmVisit PRIMARY KEY (prot, study_part, study_arm, study_group, study_day)
);

CREATE TABLE cds.import_StudyPartGroupArmVisitProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_part VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),

  CONSTRAINT PK_import_StudyPartGroupArmVisitProduct PRIMARY KEY (prot, study_part, study_group, study_arm, study_day, product_id)
);

CREATE TABLE cds.import_StudyPartGroupArmProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),

  CONSTRAINT PK_import_StudyPartGroupArmProduct PRIMARY KEY (prot, study_part, study_group, study_arm, product_id)
);

CREATE TABLE cds.import_Site (
  site_id INTEGER NOT NULL,
  site_name VARCHAR(250),
  site_institution VARCHAR(250),
  site_city VARCHAR(250),
  site_country VARCHAR(250),
  continent VARCHAR(250),
  latitude VARCHAR(50),
  longitude VARCHAR(50),

  CONSTRAINT PK_import_Site PRIMARY KEY (site_id)
);

CREATE TABLE cds.import_Personnel (
  person_id INTEGER NOT NULL,
  person_first_name VARCHAR(250),
  person_last_name VARCHAR(250),

  CONSTRAINT PK_import_Personnel PRIMARY KEY (person_id)
);

-- one record per Person in a Study
CREATE TABLE cds.import_StudyPersonnel (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  person_id INTEGER NOT NULL REFERENCES cds.import_Personnel (person_id),
  study_person_role VARCHAR(250),

  CONSTRAINT PK_import_StudyPersonnel PRIMARY KEY (prot, person_id)
);

-- one record per Person at a Site
CREATE TABLE cds.import_StudySitePersonnel (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  site_id INTEGER NOT NULL REFERENCES cds.import_Site (site_id),
  person_id INTEGER NOT NULL REFERENCES cds.import_Personnel (person_id),
  study_site_person_role VARCHAR(250),

  CONSTRAINT PK_import_StudySitePersonnel PRIMARY KEY (prot, site_id, person_id)
);

-- one record per Site per Function in a Study
CREATE TABLE cds.import_StudySiteFunction (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  site_id INTEGER NOT NULL REFERENCES cds.import_Site (site_id),
  site_type VARCHAR(250) NOT NULL,

  CONSTRAINT PK_import_StudySiteFunction PRIMARY KEY (prot, site_id, site_type)
);

CREATE TABLE cds.import_Lab (
  lab_code VARCHAR(32) NOT NULL,
  lab_name VARCHAR(250),
  lab_pi_name VARCHAR (250),

  CONSTRAINT PK_import_Lab PRIMARY KEY (lab_code)
);

-- Dataset Tables
CREATE TABLE cds.import_StudySubject (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  subject_species VARCHAR(250),
  subject_subspecies VARCHAR(250),
  subject_sex_at_birth VARCHAR(250),
  subject_age_enrollment_years INTEGER,
  subject_race_nih VARCHAR(250),
  subject_hispanic VARCHAR(250),
  subject_country_enrollment VARCHAR(250),
  subject_bmi_enrollment NUMERIC(15,4),
  subject_circumcised_enrollment VARCHAR(250),

  CONSTRAINT PK_import_StudySubject PRIMARY KEY (prot, subject_id)
);

CREATE TABLE cds.import_StudyPartGroupArmSubject (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,

  CONSTRAINT PK_import_StudyPartGroupArmSubject PRIMARY KEY (prot, subject_id, study_part, study_group, study_arm)
);

ALTER TABLE cds.import_StudyPartGroupArmSubject ADD CONSTRAINT FK_ArmSubject_StudySubject FOREIGN KEY (prot, subject_id) REFERENCES cds.import_StudySubject (prot, subject_id) MATCH FULL;

CREATE TABLE cds.import_ICS (
  -- KEYS
  row_id SERIAL,

  -- REQUIRED
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay (assay_identifier),

  -- LOOKUPS
  ics_lab_source_key INTEGER,
  exp_assayid INTEGER,
  lab_code VARCHAR(32) REFERENCES cds.import_Lab (lab_code),

  -- DIMENSIONS
  specimen_type VARCHAR(250),
  summary_level VARCHAR(250),
  cell_type VARCHAR(250),
  cell_name VARCHAR(250),
  antigen VARCHAR(250),
  antigen_type VARCHAR(250),
  peptide_pool VARCHAR(250),
  protein VARCHAR(250),
  protein_panel VARCHAR(250),
  clade VARCHAR(250),
  vaccine_matched BOOLEAN,
  functional_marker_name VARCHAR(250),
  functional_marker_type VARCHAR(250),

  -- MEASURES
  ics_response BOOLEAN,
  pctpos NUMERIC(15,4),
  pctpos_adj NUMERIC(15,4),
  pctpos_neg NUMERIC(15,4),

  CONSTRAINT PK_import_ICS PRIMARY KEY (row_id)
);

CREATE TABLE cds.import_NAb (
  -- KEYS
  row_id SERIAL,

  -- REQUIRED
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay (assay_identifier),

  -- LOOKUPS
  nab_lab_source_key INTEGER,
  exp_assayid INTEGER,
  lab_code VARCHAR(32) REFERENCES cds.import_Lab (lab_code),

  -- DIMENSIONS
  specimen_type VARCHAR(250),
  summary_level VARCHAR(250),
  antigen VARCHAR(250),
  antigen_type VARCHAR(250),
  virus VARCHAR(250),
  virus_insert_name VARCHAR(250),
  virus_type VARCHAR(250),
  neutralization_tier VARCHAR(250),
  clade VARCHAR(250),
  vaccine_matched BOOLEAN,
  target_cell VARCHAR(250),
  initial_dilution NUMERIC(15,4),

  -- MEASURES
  nab_response BOOLEAN,
  titer_ic50 NUMERIC(15,4),
  titer_ic80 NUMERIC(15,4),

  CONSTRAINT PK_import_NAb PRIMARY KEY (row_id)
);

CREATE TABLE cds.import_ELS_IFNg (
  -- KEYS
  row_id SERIAL,

  -- REQUIRED
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay (assay_identifier),

  -- LOOKUPS
  els_ifng_lab_source_key INTEGER,
  exp_assayid INTEGER,
  lab_code VARCHAR(32) REFERENCES cds.import_Lab (lab_code),

  -- DIMENSIONS
  summary_level VARCHAR(250),
  specimen_type VARCHAR(250),
  antigen VARCHAR(250),
  antigen_type VARCHAR(250),
  peptide_pool VARCHAR(250),
  protein VARCHAR(250),
  protein_panel VARCHAR(250),
  clade VARCHAR(250),
  vaccine_matched BOOLEAN,
  cell_name VARCHAR(250),
  cell_type VARCHAR(250),
  functional_marker_name VARCHAR(250),
  functional_marker_type VARCHAR(250),

  -- MEASURES
  els_ifng_response BOOLEAN,
  mean_sfc NUMERIC(15,4),
  mean_sfc_neg NUMERIC(15,4),
  mean_sfc_raw NUMERIC(15,4),

  CONSTRAINT PK_import_ELS_IFNg PRIMARY KEY (row_id)
);

CREATE TABLE cds.import_BAMA (
  -- KEYS
  row_id SERIAL,

  -- REQUIRED
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_Assay (assay_identifier),

  -- LOOKUPS
  bama_lab_source_key INTEGER,
  exp_assayid INTEGER,
  lab_code VARCHAR(32) REFERENCES cds.import_Lab (lab_code),

  -- DIMENSIONS
  summary_level VARCHAR(250),
  specimen_type VARCHAR(250),
  antigen VARCHAR(250),
  antigen_type VARCHAR(250),
  antibody_isotype VARCHAR(32),
  protein VARCHAR(250),
  protein_panel VARCHAR(250),
  clade VARCHAR(250),
  vaccine_matched BOOLEAN,
  detection_ligand VARCHAR(250),
  instrument_code VARCHAR(32),
  dilution INTEGER,

  -- MEASURES
  bama_response BOOLEAN,
  mfi_delta NUMERIC(15,4),
  mfi_delta_baseline NUMERIC(15,4),
  mfi_raw NUMERIC(15,4),
  mfi_raw_baseline NUMERIC(15,4),
  mfi_blank NUMERIC(15,4),
  mfi_blank_baseline NUMERIC(15,4),

  CONSTRAINT PK_import_BAMA PRIMARY KEY (row_id)
);

CREATE TABLE cds.Study (
  study_name VARCHAR(250) NOT NULL,
  container ENTITYID UNIQUE NOT NULL,
  network VARCHAR(250),
  label VARCHAR(250),
  short_name VARCHAR(250),
  title VARCHAR(500),
  type VARCHAR(250),
  status VARCHAR(250),
  stage VARCHAR(250),
  population VARCHAR(250),
  species VARCHAR(250),
  study_cohort VARCHAR(250),

  first_enr_date DATE,
  followup_complete_date DATE,
  start_date DATE,
  public_date DATE,

  rationale TEXT,
  description TEXT,
  hypothesis TEXT,
  objectives TEXT,
  methods TEXT,
  findings TEXT,
  discussion TEXT,
  context TEXT,

  CONSTRAINT PK_Study PRIMARY KEY (study_name)
);

CREATE TABLE cds.Facts (
  participantid VARCHAR(32) NOT NULL,
  container ENTITYID NOT NULL, -- dataspace project
  study ENTITYID,
  treatment_arm VARCHAR(250),
  study_label VARCHAR(250),
  product_group VARCHAR(250)
);

CREATE TABLE cds.Lab (
  lab_code VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,
  lab_name VARCHAR(250) NOT NULL,
  lab_pi_name VARCHAR(250),

  CONSTRAINT PK_Lab PRIMARY KEY (lab_code)
);

CREATE TABLE cds.Assay (
  assay_identifier VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,
  assay_label VARCHAR(250),
  assay_short_name VARCHAR(250),
  assay_category VARCHAR(250),
  assay_detection_platform VARCHAR(250),
  assay_body_system_type VARCHAR(250),
  assay_body_system_target VARCHAR(250),
  assay_general_specimen_type VARCHAR(250),
  assay_description TEXT,
  assay_method_description TEXT,
  assay_endpoint_description TEXT,
  assay_endpoint_statistical_analysis TEXT,
  assay_type VARCHAR(250),

  CONSTRAINT PK_Assay PRIMARY KEY (assay_identifier)
);

CREATE TABLE cds.Product (
  product_id INTEGER NOT NULL,
  container ENTITYID NOT NULL,
  product_name VARCHAR(250) NOT NULL UNIQUE,
  product_type VARCHAR(250),
  product_class VARCHAR(250),
  product_subclass VARCHAR(250),
  product_class_label VARCHAR(250),
  product_developer VARCHAR(250),
  product_manufacturer VARCHAR(250),

  product_description TEXT,

  CONSTRAINT UQ_Product UNIQUE (product_id, container),
  CONSTRAINT PK_Product PRIMARY KEY (product_id)
);

CREATE TABLE cds.StudyGroup (
  row_id SERIAL,
  group_name VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,

  CONSTRAINT UQ_StudyGroup UNIQUE (group_name, container),
  CONSTRAINT PK_StudyGroup PRIMARY KEY (row_id)
);

CREATE TABLE cds.StudyGroupVisitMap (
  group_id INTEGER NOT NULL REFERENCES cds.StudyGroup (row_id),
  visit_row_id INTEGER NOT NULL,
  container ENTITYID NOT NULL,

  CONSTRAINT PK_StudyGroupVisitMap PRIMARY KEY (group_id, container, visit_row_id)
);

CREATE TABLE cds.TreatmentArm (
  arm_id VARCHAR(250) NOT NULL,

  container ENTITYID NOT NULL,
  arm_part VARCHAR(250),
  arm_group VARCHAR(250),
  arm_name VARCHAR(250),

  randomization VARCHAR(100),
  coded_label VARCHAR(100),

  last_day INTEGER,
  description TEXT,

  CONSTRAINT PK_TreatmentArm PRIMARY KEY (arm_id)
);

CREATE TABLE cds.TreatmentArmSubjectMap (
   participantid VARCHAR(32) NOT NULL,
   container ENTITYID NOT NULL,
   arm_id VARCHAR(250) NOT NULL REFERENCES cds.TreatmentArm (arm_id),

   CONSTRAINT PK_TreatmentArmSubjectMap PRIMARY KEY (participantid, container, arm_id)
);

CREATE TABLE cds.StudyProductMap (
  study_name VARCHAR(250) NOT NULL REFERENCES cds.Study (study_name),
  container ENTITYID NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.Product (product_id),

  CONSTRAINT PK_StudyProductMap PRIMARY KEY (study_name, container, product_id)
);

CREATE TABLE cds.SubjectProductMap (
  participantid VARCHAR(32) NOT NULL,
  container ENTITYID NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.Product (product_id),

  -- These are appended for ease of access in Find Subjects
  insert_name VARCHAR(250),
  clade_name VARCHAR(250)

--   CONSTRAINT PK_SubjectProductMap PRIMARY KEY (participantid, container, product_id)
);

CREATE TABLE cds.VisitTagMap (
  visit_tag VARCHAR(250) NOT NULL,
  visit_tag_label VARCHAR(250),
  visit_row_id INTEGER NOT NULL,
  container ENTITYID NOT NULL,
  study_group_id INTEGER NOT NULL REFERENCES cds.StudyGroup (row_id),
  single_use BOOLEAN DEFAULT FALSE,
  is_vaccination BOOLEAN DEFAULT FALSE,
  is_challenge BOOLEAN DEFAULT FALSE,
  arm_id VARCHAR(250) NOT NULL REFERENCES cds.TreatmentArm (arm_id),
  detail_label VARCHAR(250),

  CONSTRAINT PK_VisitTagMap PRIMARY KEY (visit_tag, visit_row_id, study_group_id, arm_id, container)
);

CREATE TABLE cds.VisitTagAlignment (
  row_id SERIAL,
  container ENTITYID NOT NULL,
  participantid VARCHAR(32) NOT NULL,
  visitid INTEGER NOT NULL,
  protocolday INTEGER NOT NULL,
  visittagname VARCHAR(250) NOT NULL,

  CONSTRAINT UQ_VisitTagAlignment UNIQUE (container, participantid, visittagname),
  CONSTRAINT PK_VisitTagAlignment PRIMARY KEY (row_id)
);

CREATE TABLE cds.Properties (
  RowId SERIAL,
  container ENTITYID NOT NULL,
  Created TIMESTAMP NOT NULL,
--   CreatedBy USERID NOT NULL,
  Modified TIMESTAMP NOT NULL,
--   ModifiedBy USERID NOT NULL,

  assays INTEGER,
  products INTEGER,
  studies INTEGER,
  subjects INTEGER,
  datacount INTEGER,
  subjectlevelstudies INTEGER,

  CONSTRAINT PK_Properties PRIMARY KEY (RowId)
);

CREATE TABLE cds.GridBase (
  SubjectId VARCHAR(250),
  Study VARCHAR(250),
  TreatmentSummary VARCHAR(250),
  SubjectVisit VARCHAR(250),

  ParticipantSequenceNum VARCHAR(250),
  SequenceNum NUMERIC(15,4),
  Container ENTITYID,

  CONSTRAINT PK_GridBase_ParticipantSequenceNum PRIMARY KEY (Container, ParticipantSequenceNum)
);

CREATE INDEX IX_GridBase_Study ON cds.GridBase(Study);
CREATE INDEX IX_GridBase_SubjectId ON cds.GridBase(SubjectId);

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

/* cds-15.30-16.10.sql */

ALTER TABLE cds.GridBase ADD COLUMN ProtocolDay INT;

ALTER TABLE cds.GridBase DROP COLUMN SubjectVisit;
ALTER TABLE cds.GridBase ADD COLUMN VisitRowId INT;

ALTER TABLE cds.import_Study ADD COLUMN study_primary_poc_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_primary_poc_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pi_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pi_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pm_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pm_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_investigator_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_investigator_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN cavd_affiliation TEXT;
ALTER TABLE cds.import_Study ADD COLUMN treatment_schema_link TEXT;
ALTER TABLE cds.import_Study ADD COLUMN assay_schema_link TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_groups TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_conclusions TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_publications TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_executive_summary TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_data_availability TEXT;

ALTER TABLE cds.Study ADD COLUMN primary_poc_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN primary_poc_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pi_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pi_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pm_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pm_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN investigator_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN investigator_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN cavd_affiliation TEXT;
ALTER TABLE cds.Study ADD COLUMN treatment_schema_link TEXT;
ALTER TABLE cds.Study ADD COLUMN assay_schema_link TEXT;
ALTER TABLE cds.Study ADD COLUMN groups TEXT;
ALTER TABLE cds.Study ADD COLUMN conclusions TEXT;
ALTER TABLE cds.Study ADD COLUMN publications TEXT;
ALTER TABLE cds.Study ADD COLUMN executive_summary TEXT;
ALTER TABLE cds.Study ADD COLUMN data_availability TEXT;

/* cds-16.10-16.20.sql */

CREATE TABLE cds.import_StudyAssay (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_study (prot),
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_assay (assay_identifier),

  CONSTRAINT PK_import_StudyAssay PRIMARY KEY (prot, assay_identifier)
);

CREATE TABLE cds.StudyAssay (
  prot VARCHAR(250) NOT NULL REFERENCES cds.Study (study_name),
  container ENTITYID NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL REFERENCES  cds.Assay (assay_identifier),
  has_data BOOLEAN,

  CONSTRAINT PK_StudyAssay PRIMARY KEY (prot, assay_identifier)
);

ALTER TABLE cds.StudyProductMap ADD COLUMN has_data BOOLEAN;

/* cds-16.20-16.30.sql */

DROP TABLE cds.import_StudyAssay;
DROP TABLE cds.StudyAssay;
DROP TABLE cds.import_StudyProduct;
DROP TABLE cds.StudyProductMap;

CREATE TABLE cds.import_StudyAssay (
  prot VARCHAR(250) NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL,

  CONSTRAINT PK_import_StudyAssay PRIMARY KEY (prot, assay_identifier)
);

CREATE TABLE cds.StudyAssay (
  prot VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL,
  has_data BOOLEAN,

  CONSTRAINT PK_StudyAssay PRIMARY KEY (prot, assay_identifier)
);

CREATE TABLE cds.import_StudyProduct (
  prot VARCHAR(250) NOT NULL,
  product_id INTEGER NOT NULL,

  CONSTRAINT PK_import_StudyProduct PRIMARY KEY (prot, product_id)
);

CREATE TABLE cds.StudyProductMap (
  study_name VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,
  product_id INTEGER NOT NULL,
  has_data BOOLEAN,

  CONSTRAINT PK_StudyProductMap PRIMARY KEY (study_name, container, product_id)
);

CREATE TABLE cds.StudyPartGroupArmProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.Study (study_name),
  container ENTITYID NOT NULL,
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.Product (product_id),

  CONSTRAINT PK_StudyPartGroupArmProduct PRIMARY KEY (prot, study_part, study_group, study_arm, product_id)
);

CREATE TABLE cds.import_Document (
  document_id VARCHAR(250) NOT NULL,
  label VARCHAR(250),
  filename VARCHAR(255),
  document_type VARCHAR(250),

  CONSTRAINT PK_import_Document PRIMARY KEY (document_id)
);

CREATE TABLE cds.import_StudyDocument(
  prot VARCHAR(250) NOT NULL,
  document_id VARCHAR(250) NOT NULL,

  CONSTRAINT pk_import_StudyDocument PRIMARY KEY (prot, document_id)
);

ALTER TABLE cds.import_Study ADD COLUMN atlas_link TEXT;
ALTER TABLE cds.import_Study ADD COLUMN cavd_link TEXT;

CREATE TABLE cds.Document (
  document_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  label VARCHAR(250),
  filename VARCHAR(255),
  document_type VARCHAR(250),

  CONSTRAINT PK_Document PRIMARY KEY (document_id)
);

CREATE TABLE cds.StudyDocument(
  prot VARCHAR(250) NOT NULL,
  document_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT pk_StudyDocument PRIMARY KEY (prot, document_id)
);

ALTER TABLE cds.Study ADD COLUMN atlas_link TEXT;
ALTER TABLE cds.Study ADD COLUMN cavd_link TEXT;

ALTER TABLE cds.import_study ADD COLUMN study_strategy VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN strategy VARCHAR(250);

ALTER TABLE cds.import_studyAssay ADD COLUMN assay_status VARCHAR(250);
ALTER TABLE cds.studyAssay ADD COLUMN assay_status VARCHAR(250);

CREATE TABLE cds.import_Publication (
  publication_id VARCHAR(250) NOT NULL,
  publication_title TEXT,
  publication_author_all TEXT,
  publication_journal_short VARCHAR(250),
  publication_date VARCHAR(250),
  publication_volume VARCHAR(250),
  publication_issue VARCHAR(250),
  publication_location VARCHAR(250),
  publication_pmid VARCHAR(250),
  publication_link VARCHAR(250),

  CONSTRAINT pk_import_Publication PRIMARY KEY (publication_id)
);

CREATE TABLE cds.import_StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  study_publication_order VARCHAR(250),

  CONSTRAINT pk_import_StudyPublication PRIMARY KEY (prot, publication_id)
);

CREATE TABLE cds.Publication (
  id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  title TEXT,
  author_all TEXT,
  journal_short VARCHAR(250),
  date VARCHAR(250),
  volume VARCHAR(250),
  issue VARCHAR(250),
  location VARCHAR(250),
  pmid VARCHAR(250),
  link VARCHAR(250),

  CONSTRAINT PK_Publication PRIMARY KEY (id)
);

CREATE TABLE cds.StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  publication_order VARCHAR(250),

  CONSTRAINT pk_StudyPublication PRIMARY KEY (prot, publication_id)
);

ALTER TABLE cds.import_studydocument ADD COLUMN study_document_order INTEGER;
ALTER TABLE cds.StudyDocument ADD COLUMN document_order INTEGER;

CREATE TABLE cds.import_StudyRelationshipOrder(
  relationship VARCHAR(250) NOT NULL,
  rel_sort_order INTEGER NOT NULL,

  CONSTRAINT pk_import_StudyRelationshipOrder PRIMARY KEY (relationship)
);

CREATE TABLE cds.StudyRelationshipOrder(
  relationship VARCHAR(250) NOT NULL,
  rel_sort_order INTEGER NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT pk_StudyRelationshipOrder PRIMARY KEY (relationship)
);

CREATE TABLE cds.import_StudyRelationship(
  prot VARCHAR(250) NOT NULL,
  rel_prot VARCHAR(250) NOT NULL,
  relationship VARCHAR(250) NOT NULL,

  CONSTRAINT pk_import_StudyRelationship PRIMARY KEY (prot, rel_prot),
  CONSTRAINT fk_import_study_relationship_prot FOREIGN KEY (prot) REFERENCES cds.import_study(prot)
);

CREATE TABLE cds.StudyRelationship(
  prot VARCHAR(250) NOT NULL,
  rel_prot VARCHAR(250) NOT NULL,
  relationship VARCHAR(250) NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT pk_StudyRelationship PRIMARY KEY (prot, rel_prot),
  CONSTRAINT fk_study_relationship_prot FOREIGN KEY (prot) REFERENCES cds.study(study_name)
);

/* cds-16.30-17.10.sql */

ALTER TABLE cds.import_study ADD COLUMN study_clintrials_id VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN clintrials_id VARCHAR(250);

ALTER TABLE cds.GridBase ADD COLUMN EnrollmentDay INT;
ALTER TABLE cds.GridBase ADD COLUMN LastVaccinationDay INT;

/* cds-17.10-17.20.sql */

ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN enrollment BOOLEAN DEFAULT FALSE;
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN firstvacc BOOLEAN DEFAULT FALSE;
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN lastvacc BOOLEAN DEFAULT FALSE;

ALTER TABLE cds.GridBase ADD COLUMN FirstVaccinationDay INT;

DROP TABLE cds.studyrelationshiporder;

ALTER TABLE cds.import_studydocument ADD COLUMN access_level VARCHAR(250);
ALTER TABLE cds.studydocument ADD COLUMN access_level VARCHAR(250);

CREATE TABLE cds.import_studygroups (
  prot VARCHAR(250) NOT NULL,
  "group" VARCHAR(250) NOT NULL,
  role VARCHAR(250) NOT NULL
);

-- titer_ID50, titer_ID80, nab_response_ID50, nab_response_ID80, slope --
ALTER TABLE cds.import_nab ADD COLUMN titer_ID50 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_ID80 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID50 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID80 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN slope NUMERIC(15,4);

-- mfi_bkgd, auc --
ALTER TABLE cds.import_bama ADD COLUMN mfi_bkgd NUMERIC(15, 4);
ALTER TABLE cds.import_bama ADD COLUMN auc NUMERIC(15, 4);

/* cds-17.20-17.30.sql */

ALTER TABLE cds.import_nab DROP COLUMN titer_response_ID50;
ALTER TABLE cds.import_nab DROP COLUMN titer_response_ID80;
ALTER TABLE cds.import_nab ADD COLUMN nab_response_ID50 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN nab_response_ID80 BOOLEAN;

ALTER TABLE cds.import_ics ADD COLUMN response_method VARCHAR(250);
ALTER TABLE cds.import_ics ADD COLUMN control BOOLEAN;
ALTER TABLE cds.import_ics ADD COLUMN pooled_info VARCHAR(250);

ALTER TABLE cds.import_bama ADD COLUMN mfi_bkgd_blank NUMERIC(15, 4);

ALTER TABLE cds.import_studyassay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.import_studyassay ADD COLUMN provenance_summary TEXT;

ALTER TABLE cds.studyassay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.studyassay ADD COLUMN provenance_summary TEXT;

/* cds-18.10-18.20.sql */

TRUNCATE
    cds.import_ics,
    cds.import_els_ifng,
    cds.import_bama,
    cds.import_studysitepersonnel,
    cds.import_studypartgrouparmsubject,
    cds.import_studysitefunction,
    cds.import_studyrelationship,
    cds.import_studypublication,
    cds.import_studyproduct,
    cds.import_studypersonnel,
    cds.import_studypartgrouparmvisitproduct,
    cds.import_studypartgrouparmproduct,
    cds.import_studydocument,
    cds.import_studyassay,
    cds.import_productinsert,
    cds.import_studypartgrouparmvisit,
    cds.import_studypartgrouparm,
    cds.import_studygroups,
    cds.import_nabantigen,
    cds.import_icsantigen,
    cds.import_elispotantigen,
    cds.import_bamaantigen,
    cds.import_studysubject,
    cds.import_product,
    cds.import_nab,
    cds.import_assay,
    cds.import_studyrelationshiporder,
    cds.import_site,
    cds.import_publication,
    cds.import_personnel,
    cds.import_document,
    cds.import_lab,
    cds.import_study
RESTART IDENTITY CASCADE;

-- Drop FKs
ALTER TABLE cds.import_ics DROP CONSTRAINT import_ics_assay_identifier_fkey;
ALTER TABLE cds.import_ics DROP CONSTRAINT import_ics_lab_code_fkey;
ALTER TABLE cds.import_ics DROP CONSTRAINT import_ics_prot_fkey;

ALTER TABLE cds.import_els_ifng DROP CONSTRAINT import_els_ifng_assay_identifier_fkey;
ALTER TABLE cds.import_els_ifng DROP CONSTRAINT import_els_ifng_lab_code_fkey;
ALTER TABLE cds.import_els_ifng DROP CONSTRAINT import_els_ifng_prot_fkey;

ALTER TABLE cds.import_bama DROP CONSTRAINT import_bama_assay_identifier_fkey;
ALTER TABLE cds.import_bama DROP CONSTRAINT import_bama_lab_code_fkey;
ALTER TABLE cds.import_bama DROP CONSTRAINT import_bama_prot_fkey;

ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT import_studysitepersonnel_person_id_fkey;
ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT import_studysitepersonnel_prot_fkey;
ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT import_studysitepersonnel_site_id_fkey;

ALTER TABLE cds.import_studypartgrouparmsubject DROP CONSTRAINT fk_armsubject_studysubject;
ALTER TABLE cds.import_studypartgrouparmsubject DROP CONSTRAINT import_studypartgrouparmsubject_prot_fkey;

ALTER TABLE cds.import_studysitefunction DROP CONSTRAINT import_studysitefunction_prot_fkey;
ALTER TABLE cds.import_studysitefunction DROP CONSTRAINT import_studysitefunction_site_id_fkey;

ALTER TABLE cds.import_studyrelationship DROP CONSTRAINT fk_import_study_relationship_prot;

ALTER TABLE cds.import_studypersonnel DROP CONSTRAINT import_studypersonnel_person_id_fkey;
ALTER TABLE cds.import_studypersonnel DROP CONSTRAINT import_studypersonnel_prot_fkey;

ALTER TABLE cds.import_studypartgrouparmvisitproduct DROP CONSTRAINT import_studypartgrouparmvisitproduct_product_id_fkey;
ALTER TABLE cds.import_studypartgrouparmvisitproduct DROP CONSTRAINT import_studypartgrouparmvisitproduct_prot_fkey;

ALTER TABLE cds.import_studypartgrouparmproduct DROP CONSTRAINT import_studypartgrouparmproduct_product_id_fkey;
ALTER TABLE cds.import_studypartgrouparmproduct DROP CONSTRAINT import_studypartgrouparmproduct_prot_fkey;

ALTER TABLE cds.import_productinsert DROP CONSTRAINT import_productinsert_product_id_fkey;
ALTER TABLE cds.import_productinsert DROP CONSTRAINT uq_import_productinsert;

ALTER TABLE cds.import_product DROP CONSTRAINT import_product_product_name_key;

ALTER TABLE cds.import_studypartgrouparmvisit DROP CONSTRAINT import_studypartgrouparmvisit_prot_fkey;

ALTER TABLE cds.import_studypartgrouparm DROP CONSTRAINT import_studypartgrouparm_prot_fkey;

ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_assay_identifier_fkey;

ALTER TABLE cds.import_icsantigen DROP CONSTRAINT import_icsantigen_assay_identifier_fkey;

ALTER TABLE cds.import_elispotantigen DROP CONSTRAINT import_elispotantigen_assay_identifier_fkey;

ALTER TABLE cds.import_bamaantigen DROP CONSTRAINT import_bamaantigen_assay_identifier_fkey;

ALTER TABLE cds.import_studysubject DROP CONSTRAINT import_studysubject_prot_fkey;

ALTER TABLE cds.import_nab DROP CONSTRAINT import_nab_assay_identifier_fkey;
ALTER TABLE cds.import_nab DROP CONSTRAINT import_nab_lab_code_fkey;
ALTER TABLE cds.import_nab DROP CONSTRAINT import_nab_prot_fkey;

-- Drop PKs
ALTER TABLE cds.import_studysitepersonnel DROP CONSTRAINT pk_import_studysitepersonnel;
ALTER TABLE cds.import_studypartgrouparmsubject DROP CONSTRAINT pk_import_studypartgrouparmsubject;
ALTER TABLE cds.import_studysitefunction DROP CONSTRAINT pk_import_studysitefunction;
ALTER TABLE cds.import_studyrelationship DROP CONSTRAINT pk_import_studyrelationship;
ALTER TABLE cds.import_studypublication DROP CONSTRAINT pk_import_studypublication;
ALTER TABLE cds.import_studyproduct DROP CONSTRAINT pk_import_studyproduct;
ALTER TABLE cds.import_studypersonnel DROP CONSTRAINT pk_import_studypersonnel;
ALTER TABLE cds.import_studypartgrouparmvisitproduct DROP CONSTRAINT pk_import_studypartgrouparmvisitproduct;
ALTER TABLE cds.import_studypartgrouparmproduct DROP CONSTRAINT pk_import_studypartgrouparmproduct;
ALTER TABLE cds.import_studydocument DROP CONSTRAINT pk_import_studydocument;
ALTER TABLE cds.import_studyassay DROP CONSTRAINT pk_import_studyassay;
ALTER TABLE cds.import_studypartgrouparmvisit DROP CONSTRAINT pk_import_studypartgrouparmvisit;
ALTER TABLE cds.import_studypartgrouparm DROP CONSTRAINT pk_import_studyarm;
ALTER TABLE cds.import_nabantigen DROP CONSTRAINT pk_import_nabantigen;
ALTER TABLE cds.import_icsantigen DROP CONSTRAINT pk_import_icsantigen;
ALTER TABLE cds.import_elispotantigen DROP CONSTRAINT pk_import_elispotantigen;
ALTER TABLE cds.import_bamaantigen DROP CONSTRAINT pk_import_bamaantigen;
ALTER TABLE cds.import_studysubject DROP CONSTRAINT pk_import_studysubject;
ALTER TABLE cds.import_product DROP CONSTRAINT pk_import_product;
ALTER TABLE cds.import_assay DROP CONSTRAINT pk_import_assay;
ALTER TABLE cds.import_studyrelationshiporder DROP CONSTRAINT pk_import_studyrelationshiporder;
ALTER TABLE cds.import_site DROP CONSTRAINT pk_import_site;
ALTER TABLE cds.import_publication DROP CONSTRAINT pk_import_publication;
ALTER TABLE cds.import_personnel DROP CONSTRAINT pk_import_personnel;
ALTER TABLE cds.import_document DROP CONSTRAINT pk_import_document;
ALTER TABLE cds.import_lab DROP CONSTRAINT pk_import_lab;
ALTER TABLE cds.import_study DROP CONSTRAINT pk_import_study;


-- Add container columns
ALTER TABLE cds.import_ics ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_els_ifng ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_bama ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studysitepersonnel ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmsubject ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studysitefunction ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyrelationship ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypublication ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyproduct ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypersonnel ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmproduct ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studydocument ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyassay ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_productinsert ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparmvisit ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studypartgrouparm ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studygroups ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_nabantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_icsantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_elispotantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_bamaantigen ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studysubject ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_product ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_nab ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_assay ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_studyrelationshiporder ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_site ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_publication ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_personnel ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_document ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_lab ADD COLUMN container ENTITYID NOT NULL;
ALTER TABLE cds.import_study ADD COLUMN container ENTITYID NOT NULL;

-- Add PKs
ALTER TABLE cds.import_studysitepersonnel ADD PRIMARY KEY (container, prot, site_id, person_id);
ALTER TABLE cds.import_studypartgrouparmsubject ADD PRIMARY KEY (container, prot, subject_id, study_part, study_group, study_arm);
ALTER TABLE cds.import_studysitefunction ADD PRIMARY KEY (container, prot, site_id, site_type);
ALTER TABLE cds.import_studyrelationship ADD PRIMARY KEY (container, prot, rel_prot);
ALTER TABLE cds.import_studypublication ADD PRIMARY KEY (container, prot, publication_id);
ALTER TABLE cds.import_studyproduct ADD PRIMARY KEY (container, prot, product_id);
ALTER TABLE cds.import_studypersonnel ADD PRIMARY KEY (container, prot, person_id);
ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm, study_day, product_id);
ALTER TABLE cds.import_studypartgrouparmproduct ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm, product_id);
ALTER TABLE cds.import_studydocument ADD PRIMARY KEY (container, prot, document_id);
ALTER TABLE cds.import_studyassay ADD PRIMARY KEY (container, prot, assay_identifier);
ALTER TABLE cds.import_studypartgrouparmvisit ADD PRIMARY KEY (container, prot, study_part, study_arm, study_group, study_day);
ALTER TABLE cds.import_studypartgrouparm ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm);
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, antigen_name, target_cell, antigen_type);
ALTER TABLE cds.import_icsantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);
ALTER TABLE cds.import_elispotantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);
ALTER TABLE cds.import_bamaantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);
ALTER TABLE cds.import_studysubject ADD PRIMARY KEY (container, prot, subject_id);
ALTER TABLE cds.import_product ADD PRIMARY KEY (container, product_id);
ALTER TABLE cds.import_assay ADD PRIMARY KEY (container, assay_identifier);
ALTER TABLE cds.import_studyrelationshiporder ADD PRIMARY KEY (container, relationship);
ALTER TABLE cds.import_site ADD PRIMARY KEY (container, site_id);
ALTER TABLE cds.import_publication ADD PRIMARY KEY (container, publication_id);
ALTER TABLE cds.import_personnel ADD PRIMARY KEY (container, person_id);
ALTER TABLE cds.import_document ADD PRIMARY KEY (container, document_id);
ALTER TABLE cds.import_lab ADD PRIMARY KEY (container, lab_code);
ALTER TABLE cds.import_study ADD PRIMARY KEY (container, prot);

-- Add FKs
ALTER TABLE cds.import_ics ADD CONSTRAINT import_ics_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_ics ADD CONSTRAINT import_ics_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_ics ADD CONSTRAINT import_ics_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_els_ifng ADD CONSTRAINT import_els_ifng_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_els_ifng ADD CONSTRAINT import_els_ifng_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_els_ifng ADD CONSTRAINT import_els_ifng_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_bama ADD CONSTRAINT import_bama_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_bama ADD CONSTRAINT import_bama_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_bama ADD CONSTRAINT import_bama_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studysitepersonnel ADD CONSTRAINT import_studysitepersonnel_person_id_fkey
    FOREIGN KEY (container, person_id) REFERENCES cds.import_personnel (container, person_id);
ALTER TABLE cds.import_studysitepersonnel ADD CONSTRAINT import_studysitepersonnel_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);
ALTER TABLE cds.import_studysitepersonnel ADD CONSTRAINT import_studysitepersonnel_site_id_fkey
    FOREIGN KEY (container, site_id) REFERENCES cds.import_site (container, site_id);

ALTER TABLE cds.import_studypartgrouparmsubject ADD CONSTRAINT fk_armsubject_studysubject
    FOREIGN KEY (container, prot, subject_id) REFERENCES cds.import_studysubject (container, prot, subject_id);
ALTER TABLE cds.import_studypartgrouparmsubject ADD CONSTRAINT import_studypartgrouparmsubject_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studysitefunction ADD CONSTRAINT import_studysitefunction_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);
ALTER TABLE cds.import_studysitefunction ADD CONSTRAINT import_studysitefunction_site_id_fkey
    FOREIGN KEY (container, site_id) REFERENCES cds.import_site (container, site_id);

ALTER TABLE cds.import_studyrelationship ADD CONSTRAINT fk_import_study_relationship_prot
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypersonnel ADD CONSTRAINT import_studypersonnel_person_id_fkey
    FOREIGN KEY (container, person_id) REFERENCES cds.import_personnel (container, person_id);
ALTER TABLE cds.import_studypersonnel ADD CONSTRAINT import_studypersonnel_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD CONSTRAINT import_studypartgrouparmvisitproduct_product_id_fkey
    FOREIGN KEY (container, product_id) REFERENCES cds.import_product (container, product_id);
ALTER TABLE cds.import_studypartgrouparmvisitproduct ADD CONSTRAINT import_studypartgrouparmvisitproduct_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypartgrouparmproduct ADD CONSTRAINT import_studypartgrouparmproduct_product_id_fkey
    FOREIGN KEY (container, product_id) REFERENCES cds.import_product (container, product_id);
ALTER TABLE cds.import_studypartgrouparmproduct ADD CONSTRAINT import_studypartgrouparmproduct_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_productinsert ADD CONSTRAINT import_productinsert_product_id_fkey
    FOREIGN KEY (container, product_id) REFERENCES cds.import_product (container, product_id);
ALTER TABLE cds.import_productinsert ADD CONSTRAINT uq_import_productinsert
    UNIQUE (container, product_id, insert_id, clade_id);

ALTER TABLE cds.import_product ADD CONSTRAINT import_product_product_name_key
    UNIQUE (container, product_name);

ALTER TABLE cds.import_studypartgrouparmvisit ADD CONSTRAINT import_studypartgrouparmvisit_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_studypartgrouparm ADD CONSTRAINT import_studypartgrouparm_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_nabantigen ADD CONSTRAINT import_nabantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_icsantigen ADD CONSTRAINT import_icsantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_elispotantigen ADD CONSTRAINT import_elispotantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_bamaantigen ADD CONSTRAINT import_bamaantigen_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);

ALTER TABLE cds.import_studysubject ADD CONSTRAINT import_studysubject_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);

ALTER TABLE cds.import_nab ADD CONSTRAINT import_nab_assay_identifier_fkey
    FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier);
ALTER TABLE cds.import_nab ADD CONSTRAINT import_nab_lab_code_fkey
    FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code);
ALTER TABLE cds.import_nab ADD CONSTRAINT import_nab_prot_fkey
    FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot);



-- These tables have container that is project container
TRUNCATE
    cds.lab,
    cds.nabantigen,
    cds.icsantigen,
    cds.elispotantigen,
    cds.document,
    cds.bamaantigen,
    cds.publication,
    cds.properties,
    cds.product,
    cds.assay
RESTART IDENTITY CASCADE;

-- These tables have container that is subfolder (study) container
TRUNCATE
    cds.facts,
    cds.feedback,
    cds.gridbase,
    cds.sites,
    cds.study,
    cds.studyassay,
    cds.studydocument,
    cds.studygroup,
    cds.studygroupvisitmap,
    cds.studypartgrouparmproduct,
    cds.studyproductmap,
    cds.studypublication,
    cds.studyrelationship,
    cds.subjectproductmap,
    cds.treatmentarm,
    cds.treatmentarmsubjectmap,
    cds.visittagalignment,
    cds.visittagmap
RESTART IDENTITY CASCADE;

-- Drop FKs
ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_assay_identifier_fkey;
ALTER TABLE cds.icsantigen DROP CONSTRAINT icsantigen_assay_identifier_fkey;
ALTER TABLE cds.elispotantigen DROP CONSTRAINT elispotantigen_assay_identifier_fkey;
ALTER TABLE cds.bamaantigen DROP CONSTRAINT bamaantigen_assay_identifier_fkey;

ALTER TABLE cds.studypartgrouparmproduct DROP CONSTRAINT studypartgrouparmproduct_product_id_fkey;
ALTER TABLE cds.studypartgrouparmproduct DROP CONSTRAINT studypartgrouparmproduct_prot_fkey;
ALTER TABLE cds.studyrelationship DROP CONSTRAINT fk_study_relationship_prot;
ALTER TABLE cds.subjectproductmap DROP CONSTRAINT subjectproductmap_product_id_fkey;
ALTER TABLE cds.treatmentarmsubjectmap DROP CONSTRAINT treatmentarmsubjectmap_arm_id_fkey;
ALTER TABLE cds.visittagmap DROP CONSTRAINT visittagmap_arm_id_fkey;

-- Drop and Add PKs
ALTER TABLE cds.lab DROP CONSTRAINT pk_lab;
ALTER TABLE cds.lab ADD PRIMARY KEY (container, lab_code);

ALTER TABLE cds.nabantigen DROP CONSTRAINT pk_nabantigen;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, antigen_name, target_cell, antigen_type);

ALTER TABLE cds.icsantigen DROP CONSTRAINT pk_icsantigens;
ALTER TABLE cds.icsantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);

ALTER TABLE cds.elispotantigen DROP CONSTRAINT pk_elispotantigen;
ALTER TABLE cds.elispotantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);

ALTER TABLE cds.document DROP CONSTRAINT pk_document;
ALTER TABLE cds.document ADD PRIMARY KEY (container, document_id);

ALTER TABLE cds.bamaantigen DROP CONSTRAINT pk_bamaantigen;
ALTER TABLE cds.bamaantigen ADD PRIMARY KEY (container, antigen_name, antigen_type);

ALTER TABLE cds.publication DROP CONSTRAINT pk_publication;
ALTER TABLE cds.publication ADD PRIMARY KEY (container, id);

ALTER TABLE cds.product DROP CONSTRAINT pk_product;
ALTER TABLE cds.product DROP CONSTRAINT uq_product;
ALTER TABLE cds.product DROP CONSTRAINT product_product_name_key;
ALTER TABLE cds.product ADD PRIMARY KEY (container, product_id);
ALTER TABLE cds.product ADD CONSTRAINT product_product_name_key UNIQUE (container, product_name);

ALTER TABLE cds.assay DROP CONSTRAINT pk_assay;
ALTER TABLE cds.assay ADD PRIMARY KEY (container, assay_identifier);

ALTER TABLE cds.study DROP CONSTRAINT pk_study;
ALTER TABLE cds.study ADD PRIMARY KEY (container, study_name);

ALTER TABLE cds.studyassay DROP CONSTRAINT pk_studyassay;
ALTER TABLE cds.studyassay ADD PRIMARY KEY (container, prot, assay_identifier);

ALTER TABLE cds.studydocument DROP CONSTRAINT pk_studydocument;
ALTER TABLE cds.studydocument ADD PRIMARY KEY (container, prot, document_id);

ALTER TABLE cds.studypartgrouparmproduct DROP CONSTRAINT pk_studypartgrouparmproduct;
ALTER TABLE cds.studypartgrouparmproduct ADD PRIMARY KEY (container, prot, study_part, study_group, study_arm, product_id);

ALTER TABLE cds.studypublication DROP CONSTRAINT pk_studypublication;
ALTER TABLE cds.studypublication ADD PRIMARY KEY (container, prot, publication_id);

ALTER TABLE cds.studyrelationship DROP CONSTRAINT pk_studyrelationship;
ALTER TABLE cds.studyrelationship ADD PRIMARY KEY (container, prot, rel_prot);

ALTER TABLE cds.treatmentarm DROP CONSTRAINT pk_treatmentarm;
ALTER TABLE cds.treatmentarm ADD PRIMARY KEY (container, arm_id);

-- New fields to reference product properly
ALTER TABLE cds.studyproductmap ADD COLUMN projectContainer ENTITYID NOT NULL;
ALTER TABLE cds.studypartgrouparmproduct ADD COLUMN projectContainer ENTITYID NOT NULL;
ALTER TABLE cds.subjectproductmap ADD COLUMN projectContainer ENTITYID NOT NULL;

-- Add FKs
ALTER TABLE cds.nabantigen ADD CONSTRAINT nabantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.icsantigen ADD CONSTRAINT icsantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.elispotantigen ADD CONSTRAINT elispotantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.bamaantigen ADD CONSTRAINT bamaantigen_assay_identifier_fkey FOREIGN KEY (container, assay_identifier) REFERENCES
    cds.assay (container, assay_identifier);

ALTER TABLE cds.studypartgrouparmproduct ADD CONSTRAINT studypartgrouparmproduct_product_id_fkey FOREIGN KEY (projectContainer, product_id) REFERENCES
    cds.product (container, product_id);
ALTER TABLE cds.studypartgrouparmproduct ADD CONSTRAINT studypartgrouparmproduct_prot_fkey FOREIGN KEY (container, prot) REFERENCES
    cds.study (container, study_name);

ALTER TABLE cds.studyproductmap ADD CONSTRAINT studyproductmap_product_id_fkey FOREIGN KEY (projectContainer, product_id) REFERENCES
    cds.product (container, product_id);

ALTER TABLE cds.studyrelationship ADD CONSTRAINT fk_study_relationship_prot FOREIGN KEY (container, prot) REFERENCES
    cds.study (container, study_name);

ALTER TABLE cds.subjectproductmap ADD CONSTRAINT subjectproductmap_product_id_fkey FOREIGN KEY (projectContainer, product_id) REFERENCES
    cds.product (container, product_id);

ALTER TABLE cds.treatmentarmsubjectmap ADD CONSTRAINT treatmentarmsubjectmap_arm_id_fkey FOREIGN KEY (container, arm_id) REFERENCES
    cds.treatmentarm (container, arm_id);

ALTER TABLE cds.visittagmap ADD CONSTRAINT visittagmap_arm_id_fkey FOREIGN KEY (container, arm_id) REFERENCES
    cds.treatmentarm (container, arm_id);
;

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

ALTER TABLE cds.import_NABMAb
  RENAME COLUMN nab_response_ic50 to response_ic50;
ALTER TABLE cds.import_NABMAb
  RENAME COLUMN nab_response_ic80 to response_ic80;

ALTER TABLE cds.import_NABMAb
  RENAME COLUMN titer_ic50 to titer_curve_ic50;
ALTER TABLE cds.import_NABMAb
  RENAME COLUMN titer_ic80 to titer_curve_ic80;

ALTER TABLE cds.import_NABMAb ALTER COLUMN titer_curve_ic50 TYPE double precision;
ALTER TABLE cds.import_NABMAb ALTER COLUMN titer_curve_ic80 TYPE double precision;

ALTER TABLE cds.import_NABMAb ADD COLUMN curve_id INTEGER;
ALTER TABLE cds.import_NABMAb ADD COLUMN vaccine_matched BOOLEAN;
ALTER TABLE cds.import_NABMAb ADD COLUMN titer_point_ic50 double precision;
ALTER TABLE cds.import_NABMAb ADD COLUMN titer_point_ic80 double precision;

/* Materialize the mabgridbase query */
DROP TABLE IF EXISTS cds.mAbGridBase;

CREATE TABLE cds.mAbGridBase (
  mab_mix_id VARCHAR(250),
  mab_mix_name_std VARCHAR(250),
  study VARCHAR(250),
  virus VARCHAR(250),
  clade VARCHAR(250),
  neutralization_tier VARCHAR(250),
  tier_clade_virus VARCHAR(250),
  titer_curve_ic50 NUMERIC(15,4),
  titer_curve_ic50_group VARCHAR(10),

  target_cell VARCHAR(250),
  lab_code VARCHAR(250),
  summary_level VARCHAR(250),

  curve_id INTEGER,

  container ENTITYID,

  CONSTRAINT PK_mAbGridBase PRIMARY KEY (container, mab_mix_id, tier_clade_virus, target_cell, lab_code, summary_level, curve_id)
);

DROP TABLE IF EXISTS cds.mAbMetaGridBase;

CREATE TABLE cds.mAbMetaGridBase (
  mab_mix_id VARCHAR(250),
  mab_mix_name_std VARCHAR(250),
  mab_id VARCHAR(250),
  mab_hxb2_location VARCHAR(250),
  mab_isotype VARCHAR(250),
  mab_donor_species VARCHAR(250),
  container ENTITYID,

  CONSTRAINT PK_mAbMetaGridBase PRIMARY KEY (container, mab_mix_id, mab_id)
);

ALTER TABLE cds.import_NABMAb
  RENAME COLUMN response_ic50 to nab_response_ic50;
ALTER TABLE cds.import_NABMAb
  RENAME COLUMN response_ic80 to nab_response_ic80;

/* cds-18.20-18.30.sql */

ALTER TABLE cds.import_NABMAb ALTER COLUMN slope TYPE double precision;
ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_slope TYPE double precision;
ALTER TABLE cds.mAbGridBase ALTER COLUMN titer_curve_ic50 TYPE double precision;

ALTER TABLE cds.import_ics ADD COLUMN functionality_score double precision;
ALTER TABLE cds.import_ics ADD COLUMN polyfunctionality_score double precision;
ALTER TABLE cds.import_studysubject ADD COLUMN subject_gender_identity VARCHAR(250);
ALTER TABLE cds.import_studysubject ADD COLUMN subject_study_cohort VARCHAR(250);

ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_type VARCHAR(250);
ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_name_other VARCHAR(250);
ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_lanlid VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_type VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_name_other VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_lanlid VARCHAR(250);
ALTER TABLE cds.mAbMetaGridBase ADD COLUMN mab_mix_type VARCHAR(250);

CREATE TABLE cds.studymAb (
  prot VARCHAR(250) NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,

  CONSTRAINT pk_studymab PRIMARY KEY (container, prot, mab_mix_id)
);

/* cds-18.30-19.10.sql */

CREATE TABLE cds.mabgroup (
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  Label VARCHAR(250) NOT NULL,
  Description TEXT,
  Type VARCHAR(250),
  Filters TEXT,
  Shared BOOLEAN DEFAULT FALSE,

  Created TIMESTAMP NOT NULL,
  CreatedBy USERID NOT NULL,
  Modified TIMESTAMP NOT NULL,
  ModifiedBy USERID NOT NULL,

  CONSTRAINT pk_mabgroup PRIMARY KEY (container, rowId)
);

ALTER TABLE cds.mAbMetaGridBase ADD COLUMN mab_ab_binding_type VARCHAR(250);

ALTER TABLE cds.import_publication ADD COLUMN publication_author_first VARCHAR(250);
ALTER TABLE cds.import_publication ADD COLUMN publication_label VARCHAR(250);
ALTER TABLE cds.publication ADD COLUMN author_first VARCHAR(250);
ALTER TABLE cds.publication ADD COLUMN publication_label VARCHAR(250);

CREATE TABLE cds.import_StudyPartGroupArmVisitTime (
  container ENTITYID NOT NULL,
  prot VARCHAR(250) NOT NULL,

  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  visit_code VARCHAR(250) NOT NULL,

  hours_post_initial_infusion NUMERIC(7,2),
  hours_post_recent_infusion NUMERIC(7,2),
  visit_time_label VARCHAR(250),

  CONSTRAINT PK_import_StudyPartGroupArmVisitTime PRIMARY KEY (container, prot, study_part, study_arm, study_group, study_day, visit_code),

  CONSTRAINT import_StudyPartGroupArmVisitTime_combo_fkey
  FOREIGN KEY (container, prot, study_part, study_arm, study_group, study_day) REFERENCES cds.import_StudyPartGroupArmVisit (container, prot, study_part, study_arm, study_group, study_day)
);

CREATE TABLE cds.StudyPartGroupArmVisitTime (
  container ENTITYID NOT NULL,

  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  visit_code VARCHAR(250) NOT NULL,

  hours_post_initial_infusion NUMERIC(7,2),
  hours_post_recent_infusion NUMERIC(7,2),
  visit_time_label VARCHAR(250),

  CONSTRAINT PK_StudyPartGroupArmVisitTime PRIMARY KEY (container, study_part, study_arm, study_group, study_day, visit_code)
);

CREATE TABLE cds.import_PKMAb (
  row_id SERIAL,
  container ENTITYID NOT NULL,

  -- REQUIRED
  prot VARCHAR(250) NOT NULL,
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  visit_code VARCHAR(250) NOT NULL,
  source_assay VARCHAR(250) NOT NULL,

  lab_code VARCHAR(250),
  specimen_type VARCHAR(250),
  summary_level VARCHAR(250),
  assay_identifier VARCHAR(250) NOT NULL,

  mab_name_source VARCHAR(250),
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_concentration NUMERIC(15,4),
  mab_concentration_units VARCHAR(250),

  CONSTRAINT PK_import_PKMAb PRIMARY KEY (row_id),

  CONSTRAINT import_PKMAb_mab_mix_id_fkey
  FOREIGN KEY (container, mab_mix_id) REFERENCES cds.import_MAbMixMetadata (container, mab_mix_id),

  CONSTRAINT import_PKMAb_prot_fkey
  FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot),

  CONSTRAINT import_PKMAb_assay_identifier_fkey
  FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier),

  CONSTRAINT import_PKMAb_lab_code_fkey
  FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code)
);

ALTER TABLE cds.import_product ADD COLUMN mab_mix_id VARCHAR(250);
ALTER TABLE cds.product ADD COLUMN mab_mix_id VARCHAR(250);

/* cds-19.20-19.30.sql */

ALTER TABLE cds.import_document ADD COLUMN assay_identifier VARCHAR(250);
ALTER TABLE cds.document ADD COLUMN assay_identifier VARCHAR(250);

ALTER TABLE cds.import_study ADD COLUMN study_specimen_repository VARCHAR(250);
ALTER TABLE cds.study ADD COLUMN specimen_repository_label VARCHAR(250);

CREATE TABLE cds.import_antigenPanel
(
    cds_panel_id VARCHAR(250),
    panel_name VARCHAR(250),
    panel_description TEXT,
    antigen_type VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_import_antigenPanel PRIMARY KEY(container, cds_panel_id)
);

CREATE TABLE cds.antigenPanel
(
    cds_panel_id VARCHAR(250),
    panel_name VARCHAR(250),
    panel_description TEXT,
    antigen_type VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_antigenPanel PRIMARY KEY(container, cds_panel_id)
);

ALTER TABLE cds.import_nabantigen ADD COLUMN virus_full_name VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_name_other VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_species VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_host_cell VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_backbone VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN cds_virus_id VARCHAR(250);

TRUNCATE --necessary since cds_virus_id currently has null values and can't otherwise make it part of Primary Key below. Data will get repopulated as part of ETL run after server upgrade.
    cds.import_nabantigen
RESTART IDENTITY CASCADE;

ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_pkey;
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, assay_identifier, antigen_name, target_cell, antigen_type, cds_virus_id);

ALTER TABLE cds.nabantigen ADD COLUMN virus_full_name VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_name_other VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_species VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_host_cell VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_backbone VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN cds_virus_id VARCHAR(250);

TRUNCATE --necessary since cds_virus_id currently has null values and can't otherwise make it part of Primary Key below. Data will get repopulated as part of ETL run after server upgrade.
    cds.nabantigen
RESTART IDENTITY CASCADE;

ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_pkey;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, assay_identifier, antigen_name, target_cell, antigen_type, cds_virus_id);

CREATE TABLE cds.import_virusPanel
(
    cds_virus_id VARCHAR(250),
    cds_panel_id VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_import_virusPanel PRIMARY KEY (container, cds_virus_id, cds_panel_id)
);

CREATE TABLE cds.virusPanel
(
    cds_virus_id VARCHAR(250),
    cds_panel_id VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_virusPanel PRIMARY KEY (container, cds_virus_id, cds_panel_id)
);

-- maps publications to documents
CREATE TABLE cds.import_publicationDocument
(
     Publication_Id VARCHAR(250) NOT NULL,
     Document_Id VARCHAR(250) NOT NULL,
     Container ENTITYID NOT NULL,

     CONSTRAINT PK_ImportPublicationDocument PRIMARY KEY (Publication_Id, Document_Id, Container),
     CONSTRAINT FK_ImportPublicationId_PublicationId FOREIGN KEY (Container, Publication_Id) REFERENCES cds.import_Publication (Container, Publication_Id),
     CONSTRAINT FK_ImportDocumentId_DocumentId FOREIGN KEY (Container, Document_Id) REFERENCES cds.import_Document (Container, Document_Id)
);

CREATE TABLE cds.PublicationDocument
(
    Publication_Id VARCHAR(250) NOT NULL,
    Document_Id VARCHAR(250) NOT NULL,
    Container ENTITYID NOT NULL,

    CONSTRAINT PK_PublicationDocument PRIMARY KEY (Publication_Id, Document_Id, Container),
    CONSTRAINT FK_PublicationId_PublicationId FOREIGN KEY (Container, Publication_Id) REFERENCES cds.Publication (Container, Id),
    CONSTRAINT FK_DocumentId_DocumentId FOREIGN KEY (Container, Document_Id) REFERENCES cds.Document (Container, Document_Id)
);

ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_pkey;
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, assay_identifier, cds_virus_id);

ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_pkey;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, assay_identifier, cds_virus_id);

ALTER TABLE cds.import_nab DROP COLUMN antigen;
ALTER TABLE cds.import_nab DROP COLUMN antigen_type;
ALTER TABLE cds.import_nab DROP COLUMN virus;
ALTER TABLE cds.import_nab DROP COLUMN virus_insert_name;
ALTER TABLE cds.import_nab DROP COLUMN virus_type;
ALTER TABLE cds.import_nab DROP COLUMN neutralization_tier;
ALTER TABLE cds.import_nab DROP COLUMN clade;
ALTER TABLE cds.import_nab DROP COLUMN target_cell;
ALTER TABLE cds.import_nab ADD COLUMN cds_virus_id VARCHAR(250);

ALTER TABLE cds.import_nabmab DROP COLUMN target_cell;
ALTER TABLE cds.import_nabmab DROP COLUMN clade;
ALTER TABLE cds.import_nabmab DROP COLUMN neutralization_tier;
ALTER TABLE cds.import_nabmab DROP COLUMN virus;
ALTER TABLE cds.import_nabmab DROP COLUMN virus_type;
ALTER TABLE cds.import_nabmab ADD COLUMN cds_virus_id VARCHAR(250);

ALTER TABLE cds.mabgridbase ADD COLUMN virus_full_name VARCHAR(250);

-- add target_cell columns back since data for target_cell should be coming from nab and nabmab assays, and not nabantigen metadata table
ALTER TABLE cds.import_nab ADD COLUMN target_cell VARCHAR(250);
ALTER TABLE cds.import_nabmab ADD COLUMN target_cell VARCHAR(250);

ALTER TABLE cds.import_nabantigen DROP COLUMN target_cell;
ALTER TABLE cds.nabantigen DROP COLUMN target_cell;

ALTER TABLE cds.import_nabmab ADD COLUMN virus_control_mean NUMERIC(15,4);
ALTER TABLE cds.import_nabmab ADD COLUMN cell_control_mean NUMERIC(15,4);

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
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_full_name VARCHAR(250) NOT NULL;
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_short_name VARCHAR(250) NOT NULL;
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_plot_label VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_name_other VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN dna_construct_id INTEGER;
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_component VARCHAR(250) NOT NULL;
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_category VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_region VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_scaffold VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_modifiers VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_tags VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN antigen_type_differentiate VARCHAR(250);
ALTER TABLE cds.import_bamaantigen ADD COLUMN isolate_name_component VARCHAR(250) NOT NULL;
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
ALTER TABLE cds.import_bamaantigen ADD COLUMN production_component VARCHAR(250) NOT NULL;
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
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_full_name VARCHAR(250) NOT NULL;
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_short_name VARCHAR(250) NOT NULL;
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_plot_label VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_name_other VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN dna_construct_id INTEGER;
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_component VARCHAR(250) NOT NULL;
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_category VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_region VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_scaffold VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_modifiers VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_tags VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN antigen_type_differentiate VARCHAR(250);
ALTER TABLE cds.bamaantigen ADD COLUMN isolate_name_component VARCHAR(250) NOT NULL;
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
ALTER TABLE cds.bamaantigen ADD COLUMN production_component VARCHAR(250) NOT NULL;
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

ALTER TABLE cds.import_NABMAb ALTER COLUMN initial_concentration TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN mab_concentration TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN min_concentration TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN max_concentration TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN min_well_value TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN max_well_value TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN mean_well_value TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN well_std_dev TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN percent_neutralization TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN neutralization_plus_minus TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN titer_curve_ic50 TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN titer_curve_ic80 TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN slope TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_min TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_max TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_asymmetry TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_slope TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_inflection TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_error TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN virus_control_mean TYPE double precision;
  ALTER TABLE cds.import_NABMAb ALTER COLUMN cell_control_mean TYPE double precision;

/* 21.xxx SQL scripts */

CREATE TABLE cds.import_studyReport
(
    prot VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportStudyReport PRIMARY KEY (prot, cds_report_id, container)
);

CREATE TABLE cds.studyReport
(
    prot VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_studyReport PRIMARY KEY (prot, cds_report_id, container)
);

CREATE TABLE cds.import_studyCuratedGroup
(
    prot VARCHAR(250) NOT NULL,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportStudyCuratedGroup PRIMARY KEY (prot, cds_saved_group_id, container)
);

CREATE TABLE cds.studyCuratedGroup
(
    prot VARCHAR(250) NOT NULL,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_studyCuratedGroup PRIMARY KEY (prot, cds_saved_group_id, container)
);

CREATE TABLE cds.import_publicationReport
(
    publication_id INTEGER,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportPublicationReport PRIMARY KEY (publication_id, cds_report_id, container)
);

CREATE TABLE cds.publicationReport
(
    publication_id INTEGER,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_publicationReport PRIMARY KEY (publication_id, cds_report_id, container)
);

CREATE TABLE cds.import_publicationCuratedGroup
(
    publication_id INTEGER,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportPublicationCuratedGroup PRIMARY KEY (publication_id, cds_saved_group_id, container)
);

CREATE TABLE cds.publicationCuratedGroup
(
    publication_id INTEGER,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_publicationCuratedGroup PRIMARY KEY (publication_id, cds_saved_group_id, container)
);

CREATE TABLE cds.import_AssayDocument(
     assay_identifier VARCHAR(250) NOT NULL,
     document_id VARCHAR(250) NOT NULL,
     container ENTITYID NOT NULL,

     CONSTRAINT pk_import_AssayDocument PRIMARY KEY (container, assay_identifier, document_id)
);

CREATE TABLE cds.AssayDocument(
     assay_identifier VARCHAR(250) NOT NULL,
     document_id VARCHAR(250) NOT NULL,
     container ENTITYID NOT NULL,

     CONSTRAINT pk_AssayDocument PRIMARY KEY (container, assay_identifier, document_id)
);

ALTER TABLE cds.import_document ADD COLUMN video_link TEXT;
ALTER TABLE cds.import_document ADD COLUMN video_thumbnail_label TEXT;
ALTER TABLE cds.document ADD COLUMN video_link TEXT;
ALTER TABLE cds.document ADD COLUMN video_thumbnail_label TEXT;

CREATE TABLE cds.import_assayReport
(
    assay_identifier VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportAssayReport PRIMARY KEY (assay_identifier, cds_report_id, container)
);

CREATE TABLE cds.assayReport
(
    assay_identifier VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_AssayReport PRIMARY KEY (assay_identifier, cds_report_id, container)
);