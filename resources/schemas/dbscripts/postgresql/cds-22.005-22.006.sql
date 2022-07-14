/*
 * Copyright (c) 2022 LabKey Corporation
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

--  Update cds.import_studyReport table
ALTER TABLE cds.import_studyReport ADD COLUMN cds_report_link TEXT;
ALTER TABLE cds.import_studyReport ADD COLUMN cds_report_label VARCHAR(250);

ALTER TABLE cds.import_studyReport DROP CONSTRAINT PK_ImportStudyReport; -- Drop 'PRIMARY KEY(prot, cds_report_id, container)' since cds_report_id can now be null if cds_report_link is provided
ALTER TABLE cds.import_studyReport ALTER COLUMN cds_report_id DROP NOT NULL;

ALTER TABLE cds.import_studyReport ADD COLUMN rowId SERIAL;
ALTER TABLE cds.import_studyReport ADD CONSTRAINT PK_CDS_IMPORT_STUDY_REPORT PRIMARY KEY (rowId);

ALTER TABLE cds.import_studyReport ADD CONSTRAINT UQ_CDS_IMPORT_STUDY_REPORT UNIQUE (prot, cds_report_id, container, cds_report_link, cds_report_label);

-- Update cds.studyReport table
ALTER TABLE cds.studyReport ADD COLUMN cds_report_link TEXT;
ALTER TABLE cds.studyReport ADD COLUMN cds_report_label VARCHAR(250);

ALTER TABLE cds.studyReport DROP CONSTRAINT PK_studyReport; -- Drop 'PRIMARY KEY (prot, cds_report_id, container)' since cds_report_id can now be null if cds_report_link is provided
ALTER TABLE cds.studyReport ALTER COLUMN cds_report_id DROP NOT NULL;

ALTER TABLE cds.studyReport ADD COLUMN rowId SERIAL;
ALTER TABLE cds.studyReport ADD CONSTRAINT PK_CDS_STUDY_REPORT PRIMARY KEY (rowId);

ALTER TABLE cds.studyReport ADD CONSTRAINT UQ_CDS_STUDY_REPORT UNIQUE (prot, cds_report_id, container, cds_report_link, cds_report_label);