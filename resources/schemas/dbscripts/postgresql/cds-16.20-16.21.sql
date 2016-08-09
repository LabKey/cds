/* cds-16.20-16.21.sql */

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