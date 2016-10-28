/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* cds-16.20-16.21.sql */

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

/* cds-16.21-16.22.sql */

CREATE TABLE cds.StudyPartGroupArmProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.Study (study_name),
  container ENTITYID NOT NULL,
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.Product (product_id),

  CONSTRAINT PK_StudyPartGroupArmProduct PRIMARY KEY (prot, study_part, study_group, study_arm, product_id)
);

/* cds-16.22-16.23.sql */

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

  CONSTRAINT pk_import_StudyDocument PRIMARY KEY (prot, document_id)
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

  CONSTRAINT pk_StudyDocument PRIMARY KEY (prot, document_id)
);

ALTER TABLE cds.Study ADD COLUMN atlas_link TEXT;
ALTER TABLE cds.Study ADD COLUMN cavd_link TEXT;

/* cds-16.23-16.24.sql */

ALTER TABLE cds.import_study ADD COLUMN study_strategy VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN strategy VARCHAR(250);

/* cds-16.24-16.25.sql */

ALTER TABLE cds.import_studyAssay ADD COLUMN assay_status VARCHAR(250);
ALTER TABLE cds.studyAssay ADD COLUMN assay_status VARCHAR(250);

/* cds-16.25-16.26.sql */

CREATE TABLE cds.import_Publication (
  publication_id VARCHAR(250) NOT NULL,
  publication_title TEXT,
  publication_author_all TEXT,
  publication_journal_short VARCHAR(250),
  publication_date VARCHAR(250),
  publication_volume VARCHAR(250),
  publication_issue VARCHAR(250),
  publication_location VARCHAR(250),
  publication_pmid VARCHAR(250),
  publication_link VARCHAR(250),

  CONSTRAINT pk_import_Publication PRIMARY KEY (publication_id)
);

CREATE TABLE cds.import_StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  study_publication_order VARCHAR(250),

  CONSTRAINT pk_import_StudyPublication PRIMARY KEY (prot, publication_id)
);

CREATE TABLE cds.Publication (
  id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  title TEXT,
  author_all TEXT,
  journal_short VARCHAR(250),
  date VARCHAR(250),
  volume VARCHAR(250),
  issue VARCHAR(250),
  location VARCHAR(250),
  pmid VARCHAR(250),
  link VARCHAR(250),

  CONSTRAINT PK_Publication PRIMARY KEY (id)
);

CREATE TABLE cds.StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  publication_order VARCHAR(250),

  CONSTRAINT pk_StudyPublication PRIMARY KEY (prot, publication_id)
);

ALTER TABLE cds.import_studydocument ADD COLUMN study_document_order INTEGER;
ALTER TABLE cds.StudyDocument ADD COLUMN document_order INTEGER;

/* cds-16.26-16.27.sql */

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