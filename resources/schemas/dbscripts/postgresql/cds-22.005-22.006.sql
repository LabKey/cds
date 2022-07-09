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

TRUNCATE TABLE cds.import_studyReport;
DROP TABLE cds.import_studyReport;

CREATE TABLE cds.import_studyReport
(
    rowId SERIAL,
    prot VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    cds_report_link TEXT,
    cds_report_label TEXT,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_CDS_IMPORT_STUDY_REPORT PRIMARY KEY (rowId),
    CONSTRAINT UQ_CDS_IMPORT_STUDY_REPORT UNIQUE (prot, cds_report_id, container, cds_report_link, cds_report_label)
);

TRUNCATE TABLE cds.studyReport;
DROP TABLE cds.studyReport;

CREATE TABLE cds.studyReport
(
    rowId SERIAL,
    prot VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    cds_report_link TEXT,
    cds_report_label TEXT,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_CDS_STUDY_REPORT PRIMARY KEY (rowId),
    CONSTRAINT UQ_CDS_STUDY_REPORT UNIQUE (prot, cds_report_id, container, cds_report_link, cds_report_label)
);