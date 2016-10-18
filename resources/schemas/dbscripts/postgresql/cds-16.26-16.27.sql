/* cds-16.26-16.27.sql */

CREATE TABLE cds.import_StudyRelationshipOrder(
  relationship VARCHAR(250) NOT NULL,
  rel_sort_order INTEGER NOT NULL,

  CONSTRAINT pk_import_StudyRelationshipOrder PRIMARY KEY (relationship)
);

CREATE TABLE cds.StudyRelationshipOrder(
  relationship VARCHAR(250) NOT NULL,
  rel_sort_order INTEGER NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT pk_StudyRelationshipOrder PRIMARY KEY (relationship)
);

CREATE TABLE cds.import_StudyRelationship(
  prot VARCHAR(250) NOT NULL,
  rel_prot VARCHAR(250) NOT NULL,
  relationship VARCHAR(250) NOT NULL,

  CONSTRAINT pk_import_StudyRelationship PRIMARY KEY (prot, rel_prot),
  CONSTRAINT fk_import_study_relationship_prot FOREIGN KEY (prot) REFERENCES cds.import_study(prot)
);

CREATE TABLE cds.StudyRelationship(
  prot VARCHAR(250) NOT NULL,
  rel_prot VARCHAR(250) NOT NULL,
  relationship VARCHAR(250) NOT NULL,
  container entityid NOT NULL,

  CONSTRAINT pk_StudyRelationship PRIMARY KEY (prot, rel_prot),
  CONSTRAINT fk_study_relationship_prot FOREIGN KEY (prot) REFERENCES cds.study(study_name)
);
