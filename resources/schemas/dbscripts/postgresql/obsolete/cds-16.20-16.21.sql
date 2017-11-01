/*
 * Copyright (c) 2017 LabKey Corporation
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