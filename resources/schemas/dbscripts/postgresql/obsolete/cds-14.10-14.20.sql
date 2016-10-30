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
/* cds-14.10-14.11.sql */

ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_study;
ALTER TABLE cds.Facts DROP COLUMN study;
ALTER TABLE cds.Facts ADD COLUMN study ENTITYID;
ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_assay;
ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_lab;

/* cds-14.11-14.12.sql */

ALTER TABLE cds.assaypublications DROP CONSTRAINT fk_assay_pub;

/* cds-14.12-14.13.sql */

CREATE TABLE cds.Properties
(
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  PrimaryCount INTEGER,
  DataCount INTEGER,

  CONSTRAINT pk_properties PRIMARY KEY (Container, RowId)
);

/* cds-14.13-14.14.sql */

ALTER TABLE cds.Antigens ADD COLUMN panel varchar(200);

/* cds-14.14-14.15.sql */

ALTER TABLE cds.Antigens ADD COLUMN description TEXT;