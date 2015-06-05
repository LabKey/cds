-- MAPPING TABLES
DROP TABLE IF EXISTS cds.StudyProductMap CASCADE;

-- CORE TABLES
DROP TABLE IF EXISTS cds.Product CASCADE;
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

CREATE TABLE cds.Product (
  product_id INTEGER NOT NULL,
  product_name VARCHAR(250) NOT NULL UNIQUE,
  product_type VARCHAR(250),
  product_class VARCHAR(250),
  product_subclass VARCHAR(250),
  product_class_label VARCHAR(250),
  product_developer VARCHAR(250),
  product_manufacturer VARCHAR(250),

  product_description TEXT,

  CONSTRAINT PK_Product PRIMARY KEY (product_id)
);

CREATE TABLE cds.StudyProductMap (
  study_name VARCHAR(250) NOT NULL REFERENCES cds.Study (study_name),
  container ENTITYID NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.Product (product_id),

  CONSTRAINT  PK_StudyProductMap PRIMARY KEY (study_name, product_id)
);