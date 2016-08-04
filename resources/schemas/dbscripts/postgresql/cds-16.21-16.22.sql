/* cds-16.21-16.22.sql */

CREATE TABLE cds.import_Documents (
  document_id VARCHAR(250) NOT NULL,
  label VARCHAR(250),
  filename VARCHAR(255),
  document_type VARCHAR(250),

  CONSTRAINT PK_import_Documents PRIMARY KEY (document_id)
);

CREATE TABLE cds.import_StudyDocuments(
  prot VARCHAR(250) NOT NULL,
  document_id VARCHAR(250) NOT NULL,

  CONSTRAINT importstudydocuments_document_id_fkey FOREIGN KEY (document_id)
  REFERENCES cds.import_Documents(document_id) MATCH SIMPLE
  ON UPDATE NO ACTION ON DELETE NO ACTION,

  CONSTRAINT importstudydocuments_prot_fkey FOREIGN KEY (prot)
  REFERENCES cds.import_Study(prot) MATCH SIMPLE
  ON UPDATE NO ACTION ON DELETE NO ACTION
);

ALTER TABLE cds.import_Study ADD COLUMN atlas_link TEXT;
ALTER TABLE cds.import_Study ADD COLUMN cavd_link TEXT;

CREATE TABLE cds.Documents (
  document_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  label VARCHAR(250),
  filename VARCHAR(255),
  document_type VARCHAR(250),

  CONSTRAINT PK_Documents PRIMARY KEY (document_id)
);

CREATE TABLE cds.StudyDocuments(
  prot VARCHAR(250) NOT NULL,
  document_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT studydocuments_document_id_fkey FOREIGN KEY (document_id)
    REFERENCES cds.Documents(document_id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,

  CONSTRAINT studydocuments_study_name_fkey FOREIGN KEY (prot)
    REFERENCES cds.Study(study_name) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

ALTER TABLE cds.Study ADD COLUMN atlas_link TEXT;
ALTER TABLE cds.Study ADD COLUMN cavd_link TEXT;
