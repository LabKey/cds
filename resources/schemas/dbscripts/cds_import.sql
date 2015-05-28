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
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitTag CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitProduct CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisit CASCADE;
DROP TABLE IF EXISTS cds.import_ProductInsert CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPartGroupArm CASCADE;
DROP TABLE IF EXISTS cds.import_StudySiteFunction CASCADE;
DROP TABLE IF EXISTS cds.import_StudyPersonnel CASCADE;

-- Drop Core Tables
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

  product_description TEXT,

  CONSTRAINT PK_import_Product PRIMARY KEY (product_id)
);

-- one record per Insert per Product
CREATE TABLE cds.import_ProductInsert (
  product_insert_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),
  product_insert_region_name VARCHAR(250) NOT NULL,
  product_insert_clade VARCHAR(250) NOT NULL,

  CONSTRAINT PK_import_ProductInsert PRIMARY KEY (product_insert_id, product_id)
);

-- one record per Product in a Study
CREATE TABLE cds.import_StudyProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),

  CONSTRAINT PK_import_StudyProduct PRIMARY KEY (prot, product_id)
);

CREATE TABLE cds.import_StudyPartGroupArm (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_arm VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_part VARCHAR(250),
  study_randomization VARCHAR(100),
  study_arm_description_coded_label VARCHAR(100), -- formerly, treatment_regimen_code
  product_class_combination_label VARCHAR(100),
  product_combination_label VARCHAR(100),
  study_arm_last_exp_vacc_day INTEGER, -- NOT NULL?

  study_arm_description TEXT,

  CONSTRAINT PK_import_StudyArm PRIMARY KEY (prot, study_group, study_arm)
);

-- one record per Visit in a Study Group Arm
-- each arm in a group is on the same schedule in reality
CREATE TABLE cds.import_StudyPartGroupArmVisit (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_arm VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_part VARCHAR(250),
  study_day INTEGER NOT NULL,
  study_visit_code VARCHAR(250),
  study_week INTEGER NOT NULL,
  study_month INTEGER NOT NULL,
  study_arm_visit_type VARCHAR(250),
  study_arm_visit_label VARCHAR(250),
  study_arm_visit_detail_label VARCHAR(250),

  CONSTRAINT PK_import_StudyPartGroupArmVisit PRIMARY KEY (prot, study_arm, study_group, study_day)
);

CREATE TABLE cds.import_StudyPartGroupArmVisitTag (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_arm VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  study_visit_tag VARCHAR(250),

  CONSTRAINT PK_import_StudyPartGroupArmVisitTag PRIMARY KEY (prot, study_group, study_arm, study_day, study_visit_tag)
);

CREATE TABLE cds.import_StudyPartGroupArmVisitProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  study_arm VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.import_Product (product_id),

  CONSTRAINT PK_import_StudyPartGroupArmVisitProduct PRIMARY KEY (prot, study_group, study_arm, study_day, product_id)
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
  lab_id VARCHAR(250) NOT NULL,
  lab_name VARCHAR(250),
  lab_pi_name VARCHAR(250),

  CONSTRAINT PK_import_Lab PRIMARY KEY (lab_id)
);

-- Dataset Tables
CREATE TABLE cds.import_StudySubject (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  subject_species VARCHAR(250),
  subject_subspecies VARCHAR(250),
  subject_sex_at_birth VARCHAR(250),
  subject_age_enrollment_years VARCHAR(250),
  subject_race_nih VARCHAR(250),
  subject_hispanic VARCHAR(250),
  subject_country_enrollment VARCHAR(250),
  subject_bmi_enrollment NUMERIC(15,4),
  subject_circumcised_enrollment VARCHAR(250),

  -- TODO: Bunch more to come 5.14.2015

  CONSTRAINT PK_import_StudySubject PRIMARY KEY (prot, subject_id)
);

-- CREATE TABLE cds.import_ICS (
--   prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
--   subject_id VARCHAR(250) NOT NULL,
--   study_day INTEGER NOT NULL,
--   specimen_type VARCHAR(250) NOT NULL,
--   assay_id VARCHAR(250),
-- --   lab_id VARCHAR(250), -- TODO: Consider FK to import_Lab
--   cell_type VARCHAR(250),
--   summary_level VARCHAR(250),
--   antigen_panel VARCHAR(250),
--   antigen_subpanel VARCHAR(250),
--   functional_marker_name VARCHAR(250),
--   functional_marker_type VARCHAR(250),
--
--   ics_response_call BOOLEAN,
--   ics_magnitude NUMERIC(15,4),
--   ics_magnitude_raw NUMERIC(15,4),
--   ics_magnitude_background NUMERIC(15,4),
--   ics_magnitude_unit VARCHAR(100),
--
--   CONSTRAINT PK_import_ICS PRIMARY KEY (prot, subject_id, study_day)
-- );

CREATE TABLE cds.import_ICS (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  specimen_type VARCHAR(250) NOT NULL,
  assay_id VARCHAR(250),
  cell_type VARCHAR(250),
  antigen_panel VARCHAR(250),
  functional_marker_name VARCHAR(250),
  ics_lab_source_key INTEGER,

  ics_magnitude NUMERIC(15,4),
  ics_magnitude_raw NUMERIC(15,4),
  ics_magnitude_background NUMERIC(15,4),

  CONSTRAINT PK_import_ICS PRIMARY KEY (prot, subject_id, study_day, specimen_type, assay_id, antigen_panel, cell_type, functional_marker_name)
);


CREATE TABLE cds.import_NAb (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  specimen_type VARCHAR(250),
  assay_id VARCHAR(250),
  lab_id VARCHAR(250), -- TODO: Consider FK to import_Lab
  target_cell VARCHAR(250),
  isolate_name VARCHAR(250),
  isolate_clade VARCHAR(250),
  isolate_tier VARCHAR(250),
  antibody VARCHAR(250),

  nab_response BOOLEAN,
  nab_ic50 NUMERIC(15,4),
  nab_ic80 NUMERIC(15,4),
  nab_magnitude_unit VARCHAR(20),

  CONSTRAINT PK_import_NAb PRIMARY KEY (prot, subject_id, study_day) -- TODO: Consider adding all the keys as primary
);

-- CREATE TABLE cds.import_ELS_IFNg (
--   prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
--   subject_id VARCHAR(250) NOT NULL,
--   study_day INTEGER NOT NULL,
--   specimen_type VARCHAR(250),
--   assay_id VARCHAR(250),
--   lab_id VARCHAR(250), -- TODO: Consider FK to import_Lab
--   cell_type VARCHAR(250),
--   summary_level VARCHAR(250),
--   antigen_panel VARCHAR(250),
--   antigen_subpanel VARCHAR(250),
--   functional_marker_name VARCHAR(250),
--   functional_marker_type VARCHAR(250),
--
--   els_ifng_response_call BOOLEAN,
--   els_ifng_magnitude NUMERIC(15,4),
--   els_ifng_magnitude_raw NUMERIC(15,4),
--   els_ifng_magnitude_background NUMERIC(15,4),
--   els_ifng_magnitude_unit VARCHAR(20),
--
--   CONSTRAINT PK_import_ELS_IFNg PRIMARY KEY (prot, subject_id, study_day) -- TODO: Consider adding all the keys as primary
-- );

CREATE TABLE cds.import_ELS_IFNg (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  specimen_type VARCHAR(250),
  assay_id VARCHAR(250),
  antigen VARCHAR(250),
  cell_type VARCHAR(250),
  functional_marker_name VARCHAR(250),
  els_ifng_lab_source_key INTEGER,

  els_ifng_response BOOLEAN,
  els_ifng_magnitude NUMERIC(15,4),
  els_ifng_magnitude_raw NUMERIC(15,4),
  els_ifng_magnitude_background NUMERIC(15,4),

  CONSTRAINT PK_import_ELS_IFNg PRIMARY KEY (prot, subject_id, study_day, assay_id, antigen, cell_type, functional_marker_name)
);

CREATE TABLE cds.import_BAMA (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_Study (prot),
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  specimen_type VARCHAR(250),
  assay_id VARCHAR(250),
  lab_id VARCHAR(250), -- TODO: Consider FK to import_Lab
  instrument_code VARCHAR(250),
  detection_type VARCHAR(250),
  dilution VARCHAR(25),
  antigen VARCHAR(250),
  antibody_isotype VARCHAR(250),

  bama_response_call BOOLEAN,
  bama_response_call_method VARCHAR(250),
  bama_magnitude NUMERIC(15,4),
  bama_magnitude_raw NUMERIC(15,4),
  bama_magnitude_background NUMERIC(15,4),
  bama_magnitude_unit VARCHAR(20),

  CONSTRAINT PK_import_BAMA PRIMARY KEY (prot, subject_id, study_day) -- TODO: Consider adding all the keys as primary
);