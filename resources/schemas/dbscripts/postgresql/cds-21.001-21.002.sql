CREATE TABLE cds.import_AssayDocument(
     assay_identifier VARCHAR(250) NOT NULL,
     document_id VARCHAR(250) NOT NULL,
     container ENTITYID NOT NULL,

     CONSTRAINT pk_import_AssayDocument PRIMARY KEY (container, assay_identifier, document_id)
);

CREATE TABLE cds.AssayDocument(
     assay_identifier VARCHAR(250) NOT NULL,
     document_id VARCHAR(250) NOT NULL,
     container ENTITYID NOT NULL,

     CONSTRAINT pk_AssayDocument PRIMARY KEY (container, assay_identifier, document_id)
);

ALTER TABLE cds.import_document ADD COLUMN link TEXT;
ALTER TABLE cds.document ADD COLUMN link TEXT;