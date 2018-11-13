/*
 * Copyright (c) 2018 LabKey Corporation
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
/* cds-16.10-16.11.sql */

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

ALTER TABLE cds.StudyProductMap ADD COLUMN has_data BOOLEAN;