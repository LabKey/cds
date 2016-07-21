/* cds-16.20-16.21.sql */

DROP TABLE cds.import_StudyAssay;
DROP TABLE cds.StudyAssay;

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