CREATE TABLE cds.import_StudyAssay (
  prot VARCHAR(250) NOT NULL REFERENCES cds.import_study (prot),
  assay_identifier VARCHAR(250) NOT NULL REFERENCES cds.import_assay (assay_identifier),

  CONSTRAINT PK_import_StudyAssay PRIMARY KEY (prot, assay_identifier)
);

CREATE TABLE cds.StudyAssay (
  prot VARCHAR(250) NOT NULL REFERENCES cds.Study (study_name),
  container ENTITYID NOT NULL,
  assay_identifier VARCHAR(250) NOT NULL REFERENCES  cds.Assay (assay_identifier),
  has_data BOOLEAN,

  CONSTRAINT PK_StudyAssay PRIMARY KEY (prot, assay_identifier)
);