CREATE TABLE cds.import_Publication (
  publication_id VARCHAR(250) NOT NULL,
  label VARCHAR(250),
  filename VARCHAR(255),
  publication_type VARCHAR(250),
  is_external BOOLEAN,

  CONSTRAINT PK_import_Publication PRIMARY KEY (publication_id)
);

CREATE TABLE cds.import_StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,

  CONSTRAINT pk_import_StudyPublication PRIMARY KEY (prot, publication_id)
);

CREATE TABLE cds.Publication (
  publication_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  label VARCHAR(250),
  filename VARCHAR(255),
  publication_type VARCHAR(250),
  is_external BOOLEAN,

  CONSTRAINT PK_Publication PRIMARY KEY (publication_id)
);

CREATE TABLE cds.StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT pk_StudyPublication PRIMARY KEY (prot, publication_id)
);

ALTER TABLE cds.import_document ADD COLUMN is_external BOOLEAN;
ALTER TABLE cds.document ADD COLUMN is_external BOOLEAN;
