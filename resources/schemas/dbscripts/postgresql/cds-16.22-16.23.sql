/* cds-16.21-16.22.sql */

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

  CONSTRAINT importstudydocument_document_id_fkey FOREIGN KEY (document_id)
  REFERENCES cds.import_Document(document_id),

  CONSTRAINT importstudydocument_prot_fkey FOREIGN KEY (prot)
  REFERENCES cds.import_Study(prot)
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

  CONSTRAINT studydocument_document_id_fkey FOREIGN KEY (document_id)
    REFERENCES cds.Document(document_id),

  CONSTRAINT studydocument_study_name_fkey FOREIGN KEY (prot)
    REFERENCES cds.Study(study_name)
);

ALTER TABLE cds.Study ADD COLUMN atlas_link TEXT;
ALTER TABLE cds.Study ADD COLUMN cavd_link TEXT;
