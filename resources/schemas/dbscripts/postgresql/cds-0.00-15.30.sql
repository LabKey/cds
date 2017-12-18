/*
 * Copyright (c) 2017 LabKey Corporation
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


/* cds-0.00-15.10.sql */

/* cds-0.00-12.20.sql */

CREATE SCHEMA cds;

CREATE TABLE cds.Antigens
(
	Container ENTITYID NOT NULL,
	Id varchar(250) NOT NULL,
	OtherNamesUsed VARCHAR(250),
	Clade VARCHAR(250),
	Tier VARCHAR(250),
	Countryoforigin VARCHAR(250),
	Year VARCHAR(250),
	FiebigStage VARCHAR(250),
	ModeOfTrans VARCHAR(250),
	SpecimenSource VARCHAR(250),
	NucleicAcidAmplificationMethod VARCHAR(250),
	AccessionNumber VARCHAR(250),
	ArrrpCatNum VARCHAR(250),
	NucleotideSequence TEXT,
	AminoAcidSequence TEXT,
	EnvCloneProvider VARCHAR(250),
	ContributorsOfSourceSpecimen VARCHAR(250),
	ContributingInstituteOrNetwork VARCHAR(250),
	Notes TEXT,

	CONSTRAINT pk_antigens PRIMARY KEY (container, id)
);

ALTER TABLE cds.Antigens
	ADD COLUMN ShortDescription VARCHAR(100),
    ADD COLUMN AntigenCategory VARCHAR(50),
    ADD COLUMN AntigenType VARCHAR(50),
    ADD COLUMN HostSpecies VARCHAR(50),
    ADD COLUMN Family VARCHAR(50),
    ADD COLUMN "Group" VARCHAR(10),
    ADD COLUMN Region VARCHAR(50),
    ADD COLUMN Mutations VARCHAR(50),
    ADD COLUMN ConsensusVIsolate VARCHAR(50),
    ADD COLUMN IsolateOrConsensusName VARCHAR(50),
    ADD COLUMN Protein VARCHAR(50),
    ADD COLUMN Virus VARCHAR(50),
    ADD COLUMN Purification VARCHAR(50),
    ADD COLUMN Tag VARCHAR(50),
    ADD COLUMN HostCell VARCHAR(50),
    ADD COLUMN JournalReference VARCHAR(50),
    ADD COLUMN ProviderName VARCHAR(100),
    ADD COLUMN Biotin VARCHAR(30);

ALTER TABLE cds.Antigens
    RENAME COLUMN fiebigstage to stageofinfection;

ALTER TABLE cds.Antigens
    RENAME COLUMN arrrpcatnum to catnumber;

DELETE FROM cds.Antigens WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Assays
(
	Id VARCHAR(250) NOT NULL,
	Caption VARCHAR(250),
	LabId VARCHAR(250),
	DatasetId int4,
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT pk_assays PRIMARY KEY (container, id)
);

ALTER TABLE cds.Assays
   ADD COLUMN category VARCHAR(250);

ALTER TABLE cds.Assays
	ADD COLUMN leadcontributor VARCHAR(250),
	ADD COLUMN contact VARCHAR(250),
	ADD COLUMN assayabstract TEXT,
	ADD COLUMN relatedpublications VARCHAR(250),
	ADD COLUMN methodology VARCHAR(250);

ALTER TABLE cds.Assays
	RENAME COLUMN category TO targetarea;

ALTER TABLE cds.Assays
	ADD COLUMN datasetname VARCHAR(200);

DELETE FROM cds.Assays WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Datasources
(
	Container ENTITYID NOT NULL,
	RowId SERIAL,
	SourceContainer ENTITYID NOT NULL,
	QueryName VARCHAR(250),
	SchemaName VARCHAR(250),
	ViewName VARCHAR(250),
	TargetDatasetId int4,
	Lab VARCHAR(250),
	Assay VARCHAR(250),
	Contact VARCHAR(250),
	Batch VARCHAR(250),

	CONSTRAINT pk_datasources PRIMARY KEY (Container, RowId)
);

CREATE TABLE cds.Labs
(
	Id VARCHAR(250) NOT NULL,
	PI VARCHAR(250),
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT pk_labs PRIMARY KEY (Container, Id)
);

DELETE FROM cds.Labs WHERE container NOT IN (SELECT ENTITYID FROM core.Containers);

CREATE TABLE cds.People
(
	Email VARCHAR(250) NOT NULL,
	FullName VARCHAR(250),
	LabId VARCHAR(250),
	Role VARCHAR(250),
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT pk_people PRIMARY KEY (Container, Email)
);

ALTER TABLE cds.People
	ADD COLUMN PictureFile VARCHAR(250);

ALTER TABLE cds.People RENAME email TO Id;
ALTER TABLE cds.People ADD COLUMN email VARCHAR(250);
UPDATE cds.People SET email=Id;

ALTER TABLE cds.People
    ADD COLUMN ForeName VARCHAR(50),
    ADD COLUMN LastName VARCHAR(50),
    ADD COLUMN Initials VARCHAR(10);

UPDATE cds.people SET LastName = substring(fullname FROM '[^ ]*$'),  Forename = substring(fullname FROM '(.*) [^ ]*$'), Initials = substring(fullname FROM '(.)[^ ]* ') || coalesce(substring(fullname FROM '[^ ]* (.)[^ ]* [^ ]+'), '');
UPDATE cds.people SET id = coalesce(LastName || ' ' || Initials, id);

DELETE FROM cds.People WHERE container NOT IN (SELECT EntityId FROM core.Containers);

UPDATE cds.Assays SET Contact=people.id FROM cds.people WHERE Assays.Contact=People.email;
UPDATE cds.Assays SET LeadContributor=people.id FROM cds.people WHERE Assays.LeadContributor=People.email;

CREATE TABLE cds.Studies
(
	Container ENTITYID NOT NULL,
	StudyName VARCHAR(250) NOT NULL,
	Description TEXT,
	PI1 VARCHAR(250),
	PI2 VARCHAR(250),
	Contact VARCHAR(250),

	CONSTRAINT pk_studies PRIMARY KEY (Container, StudyName)
);


ALTER TABLE cds.Studies
	ADD COLUMN type VARCHAR(250),
	ADD COLUMN network VARCHAR(250);

UPDATE cds.Studies SET PI1=people.id FROM cds.people WHERE Studies.PI1=People.email;
UPDATE cds.Studies SET PI2=people.id FROM cds.people WHERE Studies.PI2=People.email;
UPDATE cds.Studies SET Contact=people.id FROM cds.people WHERE STudies.Contact=People.email;

DELETE FROM cds.Studies WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Facts
(
	ParticipantId VARCHAR(32) NOT NULL,
	Assay VARCHAR(250),
	Lab VARCHAR(250),
	Antigen VARCHAR(250),
	Study VARCHAR(250),
	Container ENTITYID NOT NULL,

	CONSTRAINT fk_fact_assay FOREIGN KEY (container, assay) REFERENCES cds.assays (container, id),
	CONSTRAINT fk_fact_lab FOREIGN KEY (container, lab) REFERENCES cds.labs (container, id),
	CONSTRAINT fk_fact_antigen FOREIGN KEY (container, antigen) REFERENCES cds.antigens (container, id),
	CONSTRAINT fk_fact_study FOREIGN KEY (container, study) REFERENCES cds.studies (container, studyname)
);

DELETE FROM cds.Facts WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.AssayPublications
(
	AssayId VARCHAR(250) NOT NULL,
	PubMedID VARCHAR(20),
	Link TEXT,
	Title TEXT,
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT fk_assay_pub FOREIGN KEY (container, AssayID) REFERENCES cds.assays (container, ID)
);

ALTER TABLE cds.AssayPublications
	ADD COLUMN RowId SERIAL,
	ADD COLUMN Type VARCHAR(50);

ALTER TABLE cds.AssayPublications
	ADD PRIMARY KEY (container, RowId);

DELETE FROM cds.AssayPublications WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Citable
(
	URI VARCHAR(250) NOT NULL,
	CitableType VARCHAR(20) NOT NULL,
	Link TEXT,
	Title TEXT,
	Description TEXT,
	Container ENTITYID NOT NULL,
	EntityId ENTITYID NOT NULL, -- for attachments

	CONSTRAINT pk_citable PRIMARY KEY (Container, URI)
);

DELETE FROM cds.Citable WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Citations
(
    RowId SERIAL,
    ObjectURI VARCHAR(250) NOT NULL,
    CitableURI VARCHAR(250) NOT NULL,
    CitationType VARCHAR(20),
    SortIndex INT NOT NULL,
    Container ENTITYID NOT NULL,

    CONSTRAINT uq_citations UNIQUE (Container, ObjectURI, CitableURI, CitationType),
    CONSTRAINT pk_citations PRIMARY KEY (Container, RowId)
);

ALTER TABLE cds.Citations ADD CONSTRAINT fk_citations_citable FOREIGN KEY (Container, CitableURI) REFERENCES cds.Citable(Container, URI) ON DELETE CASCADE;

DELETE FROM cds.Citations WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.CitableAuthors
(
    RowId SERIAL,
    CitableURI VARCHAR(250) NOT NULL,
    AuthorId VARCHAR(250) NOT NULL,
    AuthorType VARCHAR(20), -- CONTRIBUTOR | CREATOR
    Contact bool,
    SortIndex INT NOT NULL,
    Container ENTITYID NOT NULL,

    CONSTRAINT uq_citableauthors UNIQUE (Container, CitableURI, AuthorId),
    CONSTRAINT pk_citableauthors PRIMARY KEY (Container, RowId)
);

ALTER TABLE cds.CitableAuthors ADD CONSTRAINT fk_citableauthors_citable FOREIGN KEY (container, citableuri) REFERENCES cds.Citable(container, uri) ON DELETE CASCADE;
DELETE FROM cds.CitableAuthors WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Vaccines
(
    VaccineName VARCHAR(100),
    Type VARCHAR(20),
    Container ENTITYID NOT NULL,
    CONSTRAINT pk_vaccines PRIMARY KEY (Container, VaccineName)
);

CREATE TABLE cds.VaccineComponents
(
    RowId SERIAL,
    VaccineName VARCHAR(100),
    VaccineComponent VARCHAR(100),
    Type VARCHAR(100),
    Clade VARCHAR(10),
    Region VARCHAR(20),
    Container ENTITYID NOT NULL,

    CONSTRAINT fk_vaccine_components FOREIGN KEY (Container, VaccineName) REFERENCES cds.Vaccines(Container, VaccineName),
    CONSTRAINT pk_vaccine_components PRIMARY KEY (Container, RowId)
);

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

/* cds-12.20-12.30.sql */

ALTER TABLE cds.Vaccines
	ADD COLUMN description text,
	ADD COLUMN production text,
	ADD COLUMN inserts varchar(250),
	ADD COLUMN toxicity_studies text,
	ADD COLUMN previous_trials text
;

ALTER TABLE cds.VaccineComponents
    ADD COLUMN description text,
    ADD COLUMN isolate varchar(50),
    ADD COLUMN GenBankID varchar(50)
;

ALTER TABLE cds.Antigens
    ADD COLUMN viruscategory varchar(10),
    ADD COLUMN pseudovirus_backbone varchar(50)
;

ALTER TABLE cds.Antigens
    DROP COLUMN isolateorconsensusname
;

ALTER TABLE cds.Antigens
    RENAME COLUMN HostSpecies to DonorID
;

/* cds-13.30-14.10.sql */

ALTER TABLE cds.Studies
    ADD COLUMN StartDate TIMESTAMP,
    ADD COLUMN EndDate TIMESTAMP,
    ADD COLUMN Phase VARCHAR(10),
    ADD COLUMN Treatments TEXT;

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

ALTER TABLE cds.Studies
    ADD COLUMN AltTitle VARCHAR(250);

ALTER TABLE cds.Vaccines
    ADD COLUMN Class VARCHAR(250),
    ADD COLUMN SubClass VARCHAR(250),
    ADD COLUMN Developer VARCHAR(250);

ALTER TABLE cds.Assays
    ADD COLUMN AltName VARCHAR(250),
    ADD COLUMN SystemTarget VARCHAR(250),
    ADD COLUMN Type VARCHAR(250),
    ADD COLUMN Platform VARCHAR(250),
    ADD COLUMN Target VARCHAR(250),
    ADD COLUMN TargetFunction VARCHAR(250);

ALTER TABLE cds.Labs
    ADD COLUMN Institution VARCHAR(250),
    ADD COLUMN Location TEXT;

/* cds-14.10-14.20.sql */

ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_study;
ALTER TABLE cds.Facts DROP COLUMN study;
ALTER TABLE cds.Facts ADD COLUMN study ENTITYID;
ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_assay;
ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_lab;

ALTER TABLE cds.assaypublications DROP CONSTRAINT fk_assay_pub;

CREATE TABLE cds.Properties
(
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  PrimaryCount INTEGER,
  DataCount INTEGER,

  CONSTRAINT pk_properties PRIMARY KEY (Container, RowId)
);

ALTER TABLE cds.Antigens ADD COLUMN panel varchar(200);

ALTER TABLE cds.Antigens ADD COLUMN description TEXT;

/* cds-14.20-14.30.sql */

ALTER TABLE cds.Facts ADD COLUMN Day INTEGER;


/* cds-14.30-14.31.sql */

ALTER TABLE cds.Facts ADD COLUMN ProtocolDay NUMERIC(15, 4);

/* cds-15.20-15.30.sql */

/* cds-15.263-15.27.sql */

-- Drop Original Tables
DROP TABLE IF EXISTS cds.assaypublications CASCADE;
DROP TABLE IF EXISTS cds.citableauthors CASCADE;
DROP TABLE IF EXISTS cds.citations CASCADE;
DROP TABLE IF EXISTS cds.datasources CASCADE;
DROP TABLE IF EXISTS cds.studies CASCADE;
DROP TABLE IF EXISTS cds.vaccinecomponents CASCADE;

DROP TABLE IF EXISTS cds.assays CASCADE;

DROP TABLE IF EXISTS cds.people CASCADE;

DROP TABLE IF EXISTS cds.antigens CASCADE;
DROP TABLE IF EXISTS cds.citable CASCADE;
DROP TABLE IF EXISTS cds.labs CASCADE;
DROP TABLE IF EXISTS cds.vaccines CASCADE;

-- Drop Mapping Tables
DROP TABLE IF EXISTS cds.import_StudyProduct CASCADE;
DROP TABLE IF EXISTS cds.import_StudySitePersonnel CASCADE;

-- Drop Dataset Tables
DROP TABLE IF EXISTS cds.import_ICS CASCADE;
DROP TABLE IF EXISTS cds.import_NAb CASCADE;
DROP TABLE IF EXISTS cds.import_ELS_IFNg CASCADE;
DROP TABLE IF EXISTS cds.import_BAMA CASCADE;
DROP TABLE IF EXISTS cds.import_StudySubject CASCADE;

-- Drop Dependent Tables
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmSubject CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmProduct CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitTag CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitProduct CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisit CASCADE;
DROP TABLE IF EXISTS cds.import_ProductInsert CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArm CASCADE;
DROP TABLE IF EXISTS cds.import_StudySiteFunction CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPersonnel CASCADE;

-- Drop Core Tables
DROP TABLE IF EXISTS cds.import_Assay CASCADE;
DROP TABLE IF EXISTS cds.import_Product CASCADE;
DROP TABLE IF EXISTS cds.import_Lab CASCADE;
DROP TABLE IF EXISTS cds.import_Site CASCADE;
DROP TABLE IF EXISTS cds.import_Personnel CASCADE;
DROP TABLE IF EXISTS cds.import_Study CASCADE;

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

  CONSTRAINT PK_import_StudyPartGroupArmVisit PRIMARY KEY (prot, study_part, study_arm, study_group, study_day)
);

CREATE TABLE cds.import_StudyPartGroupArmVisitTag (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_part VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  study_visit_tag VARCHAR(250),

  CONSTRAINT PK_import_StudyPartGroupArmVisitTag PRIMARY KEY (prot, study_part, study_group, study_arm, study_day, study_visit_tag)
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
  initial_dilution INTEGER,

  -- MEASURES
  nab_response BOOLEAN,
  titer_ic50 INTEGER,
  titer_ic80 INTEGER,

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
  mean_sfc INTEGER,
  mean_sfc_neg INTEGER,
  mean_sfc_raw INTEGER,

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

-- LEAF TABLES
DROP TABLE IF EXISTS cds.Properties CASCADE;

-- MAPPING TABLES
DROP TABLE IF EXISTS cds.VisitTagAlignment CASCADE;
DROP TABLE IF EXISTS cds.VisitTagMap CASCADE;
DROP TABLE IF EXISTS cds.TreatmentArmSubjectMap CASCADE;
DROP TABLE IF EXISTS cds.StudyGroupVisitMap CASCADE;
DROP TABLE IF EXISTS cds.SubjectProductMap CASCADE;
DROP TABLE IF EXISTS cds.StudyProductMap CASCADE;

-- CORE TABLES
DROP TABLE IF EXISTS cds.TreatmentArm CASCADE;
DROP TABLE IF EXISTS cds.StudyGroup CASCADE;
DROP TABLE IF EXISTS cds.Product CASCADE;
DROP TABLE IF EXISTS cds.Assay CASCADE;
DROP TABLE IF EXISTS cds.Lab CASCADE;
DROP TABLE IF EXISTS cds.Facts CASCADE;
DROP TABLE IF EXISTS cds.Study CASCADE;

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
  study ENTITYID
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

  CONSTRAINT PK_VisitTagMap PRIMARY KEY (visit_tag, visit_row_id, study_group_id, container)
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

  CONSTRAINT PK_Properties PRIMARY KEY (RowId)
);

/* cds-15.27-15.28.sql */

ALTER TABLE cds.assay ADD COLUMN assay_type VARCHAR(250);

/* cds-15.28-15.285.sql */

DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitTag CASCADE;

ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN ischallvis BOOLEAN DEFAULT FALSE;

ALTER TABLE cds.import_NAb DROP COLUMN titer_ic50;
ALTER TABLE cds.import_NAb ADD COLUMN titer_ic50 NUMERIC(15,4);

ALTER TABLE cds.import_NAb DROP COLUMN titer_ic80;
ALTER TABLE cds.import_NAb ADD COLUMN titer_ic80 NUMERIC(15,4);

ALTER TABLE cds.import_NAb DROP COLUMN initial_dilution;
ALTER TABLE cds.import_NAb ADD COLUMN initial_dilution NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc_neg;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc_neg NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc_raw;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc_raw NUMERIC(15,4);

ALTER TABLE cds.VisitTagMap ADD COLUMN is_challenge BOOLEAN DEFAULT FALSE;

/* cds-15.285-15.286.sql */

DELETE FROM cds.import_StudyPartGroupArmSubject;

ALTER TABLE cds.import_StudyPartGroupArmSubject ADD CONSTRAINT FK_ArmSubject_StudySubject FOREIGN KEY (prot, subject_id) REFERENCES cds.import_StudySubject (prot, subject_id) MATCH FULL;

/* cds-15.286-15.287.sql */

/* Materialize the GridBase query */
DROP TABLE IF EXISTS cds.GridBase;

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

/* Add Treatment Arm dimension columns to fact table */
ALTER TABLE cds.Facts ADD COLUMN treatment_arm VARCHAR(250);
ALTER TABLE cds.Facts ADD COLUMN study_label VARCHAR(250);
ALTER TABLE cds.Facts ADD COLUMN product_group VARCHAR(250);

/* Alter VisitTagMap to support vaccination, non-vaccination scenarios */
DELETE FROM cds.VisitTagMap;

ALTER TABLE cds.VisitTagMap ADD COLUMN arm_id VARCHAR(250) NOT NULL REFERENCES cds.TreatmentArm (arm_id);
ALTER TABLE cds.VisitTagMap ADD COLUMN detail_label VARCHAR(250);

ALTER TABLE cds.VisitTagMap DROP CONSTRAINT PK_VisitTagMap;
ALTER TABLE cds.VisitTagMap ADD CONSTRAINT PK_VisitTagMap PRIMARY KEY (visit_tag, visit_row_id, study_group_id, arm_id, container);

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

/* cds-15.288-15.289.sql */

ALTER TABLE cds.Properties ADD COLUMN subjectlevelstudies INTEGER;