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

/* cds-17.10-17.11.sql */

ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN enrollment BOOLEAN DEFAULT FALSE;
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN firstvacc BOOLEAN DEFAULT FALSE;
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN lastvacc BOOLEAN DEFAULT FALSE;

ALTER TABLE cds.GridBase ADD COLUMN FirstVaccinationDay INT;

/* cds-17.11-17.12.sql */

DROP TABLE cds.studyrelationshiporder;

ALTER TABLE cds.import_studydocument ADD COLUMN access_level VARCHAR(250);
ALTER TABLE cds.studydocument ADD COLUMN access_level VARCHAR(250);

/* cds-17.12-17.13.sql */

CREATE TABLE cds.import_studygroups (
  prot VARCHAR(250) NOT NULL,
  "group" VARCHAR(250) NOT NULL,
  role VARCHAR(250) NOT NULL
);

/* cds-17.13-17.14.sql */

-- titer_ID50, titer_ID80, nab_response_ID50, nab_response_ID80, slope --
ALTER TABLE cds.import_nab ADD COLUMN titer_ID50 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_ID80 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID50 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID80 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN slope NUMERIC(15,4);

-- mfi_bkgd, auc --
ALTER TABLE cds.import_bama ADD COLUMN mfi_bkgd NUMERIC(15, 4);
ALTER TABLE cds.import_bama ADD COLUMN auc NUMERIC(15, 4);