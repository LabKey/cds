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
