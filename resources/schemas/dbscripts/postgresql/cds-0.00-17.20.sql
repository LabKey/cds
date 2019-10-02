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

/* cds-15.286-15.287.sql */

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



/* cds-15.287-15.288.sql */

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