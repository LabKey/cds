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

-- drop virus metadata unique constraints
ALTER TABLE cds.import_virus_metadata_all DROP CONSTRAINT UQ_ImportVirusMetadataAll;
ALTER TABLE cds.virus_metadata_all DROP CONSTRAINT UQ_VirusMetadataAll;

-- drop PK constraints
ALTER TABLE cds.import_virus_lab_id DROP CONSTRAINT PK_ImportVirusLabId;
ALTER TABLE cds.virus_lab_id DROP CONSTRAINT PK_VirusLabId;

ALTER TABLE cds.import_virus_synonym DROP CONSTRAINT PK_ImportVirusSynonym;
ALTER TABLE cds.virus_synonym DROP CONSTRAINT PK_VirusSynonym;

-- set columns in the compound PK to not nullable
ALTER TABLE cds.import_virus_lab_id ALTER COLUMN lab_code SET NOT NULL;
ALTER TABLE cds.import_virus_lab_id ALTER COLUMN lab_virus_id SET NOT NULL;
ALTER TABLE cds.virus_lab_id ALTER COLUMN lab_code SET NOT NULL;
ALTER TABLE cds.virus_lab_id ALTER COLUMN lab_virus_id SET NOT NULL;

ALTER TABLE cds.import_virus_synonym ALTER COLUMN virus_synonym SET NOT NULL;
ALTER TABLE cds.virus_synonym ALTER COLUMN virus_synonym SET NOT NULL;

-- add new PK constraints
ALTER TABLE cds.import_virus_lab_id ADD CONSTRAINT PK_ImportVirusLabId PRIMARY KEY (cds_virus_id, lab_code, lab_virus_id, container);
ALTER TABLE cds.virus_lab_id ADD CONSTRAINT PK_VirusLabId PRIMARY KEY (cds_virus_id, lab_code, lab_virus_id, container);

ALTER TABLE cds.import_virus_synonym ADD CONSTRAINT PK_ImportVirusSynonym PRIMARY KEY (cds_virus_id, virus_synonym, container);
ALTER TABLE cds.virus_synonym ADD CONSTRAINT PK_VirusSynonym PRIMARY KEY (cds_virus_id, virus_synonym, container);
