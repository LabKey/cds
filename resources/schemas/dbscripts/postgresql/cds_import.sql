DROP TABLE IF EXISTS  cds.import_Study CASCADE;
DROP TABLE IF EXISTS  cds.import_Demographic CASCADE;
DROP TABLE IF EXISTS  cds.import_ICS CASCADE;

CREATE TABLE cds.import_Study (
  prot VARCHAR(250) NOT NULL,
  network VARCHAR(250),
  study_label VARCHAR(250),
  study_short_name VARCHAR(250),
  study_title VARCHAR(250),
  study_type VARCHAR(250),
  study_design VARCHAR(250),
  study_stage VARCHAR(250),
  study_subject_type VARCHAR(250),
  study_species VARCHAR(250),
  study_cohort VARCHAR(250),

  first_enr_date TIMESTAMP,
  followup_complete_date TIMESTAMP,
  study_start_date TIMESTAMP,
  study_completion_date TIMESTAMP,

  study_description TEXT,
  study_hypothesis TEXT,
  study_objectives TEXT,
  study_methods TEXT,
  study_findings TEXT,
  study_discussion TEXT,

  CONSTRAINT PK_import_Study PRIMARY KEY (prot)
);

CREATE TABLE cds.import_Demographic (
  prot VARCHAR(250) NOT NULL,
  individual_id VARCHAR(250) NOT NULL,
  species VARCHAR(250),
  subspecies VARCHAR(250),
  sex_at_birth VARCHAR(250),
  age_at_enrollment VARCHAR(250),
  nih_race VARCHAR(250),
  nih_ethnicity VARCHAR(250),

  CONSTRAINT PK_import_Demographic PRIMARY KEY (prot, individual_id)
);

CREATE TABLE cds.import_ICS (
  prot VARCHAR(250) NOT NULL,
  individual_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  specimen_type VARCHAR(250),
  assay_id VARCHAR(250),
  lab_id VARCHAR(250),
  cell_type VARCHAR(250),
  summary_level VARCHAR(250),
  antigen_panel VARCHAR(250),
  antigen_subpanel VARCHAR(250),
  functional_marker_name VARCHAR(250),
  functional_marker_type VARCHAR(250),

  ics_response_call BOOLEAN,
  ics_magnitude NUMERIC(15,4),
  ics_magnitude_raw NUMERIC(15,4),
  ics_magnitude_background NUMERIC(15,4),
  ics_magnitude_unit VARCHAR(100),

  CONSTRAINT PK_import_ICS PRIMARY KEY (prot, individual_id, study_day)
);