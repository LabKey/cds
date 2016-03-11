/*
 * Copyright (c) 2014 LabKey Corporation
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
/* cds-13.30-13.31.sql */

ALTER TABLE cds.Studies
    ADD COLUMN StartDate TIMESTAMP,
    ADD COLUMN EndDate TIMESTAMP,
    ADD COLUMN Phase VARCHAR(10),
    ADD COLUMN Treatments TEXT;

/* cds-13.31-13.32.sql */

CREATE TABLE cds.Sites
(
	Id VARCHAR(250) NOT NULL,
	PI VARCHAR(250),
	Description TEXT,
	Location TEXT,
	Container ENTITYID NOT NULL,
  Status VARCHAR(50),
  AltName VARCHAR(250),
  Network VARCHAR(250),

	CONSTRAINT pk_sites PRIMARY KEY (Container, Id)
);

ALTER TABLE cds.Studies
    ADD COLUMN AltTitle VARCHAR(250);

ALTER TABLE cds.Vaccines
    ADD COLUMN Class VARCHAR(250),
    ADD COLUMN SubClass VARCHAR(250),
    ADD COLUMN Developer VARCHAR(250);

ALTER TABLE cds.Assays
    ADD COLUMN AltName VARCHAR(250),
    ADD COLUMN SystemTarget VARCHAR(250),
    ADD COLUMN Type VARCHAR(250),
    ADD COLUMN Platform VARCHAR(250),
    ADD COLUMN Target VARCHAR(250),
    ADD COLUMN TargetFunction VARCHAR(250);

ALTER TABLE cds.Labs
    ADD COLUMN Institution VARCHAR(250),
    ADD COLUMN Location TEXT;