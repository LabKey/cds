/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
/* cds-17.20-17.21.sql */

ALTER TABLE cds.import_nab DROP COLUMN titer_response_ID50;
ALTER TABLE cds.import_nab DROP COLUMN titer_response_ID80;
ALTER TABLE cds.import_nab ADD COLUMN nab_response_ID50 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN nab_response_ID80 BOOLEAN;

ALTER TABLE cds.import_ics ADD COLUMN response_method VARCHAR(250);
ALTER TABLE cds.import_ics ADD COLUMN control BOOLEAN;
ALTER TABLE cds.import_ics ADD COLUMN pooled_info VARCHAR(250);

ALTER TABLE cds.import_bama ADD COLUMN mfi_bkgd_blank NUMERIC(15, 4);

/* cds-17.21-17.22.sql */

ALTER TABLE cds.import_studyassay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.import_studyassay ADD COLUMN provenance_summary TEXT;

ALTER TABLE cds.studyassay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.studyassay ADD COLUMN provenance_summary TEXT;