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

-- drop FK constraints
ALTER TABLE cds.import_virus_lab_id DROP CONSTRAINT FK_PK_ImportVirusLabId;
ALTER TABLE cds.virus_lab_id DROP CONSTRAINT FK_PK_VirusLabId;

ALTER TABLE cds.import_virus_synonym DROP CONSTRAINT FK_ImportVirusSynonym;
ALTER TABLE cds.virus_synonym DROP CONSTRAINT FK_VirusSynonym;

-- change field types
ALTER TABLE cds.import_virus_metadata_all ALTER COLUMN cds_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.virus_metadata_all ALTER COLUMN cds_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.import_virus_lab_id ALTER COLUMN cds_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.import_virus_lab_id ALTER COLUMN lab_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.virus_lab_id ALTER COLUMN cds_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.virus_lab_id ALTER COLUMN lab_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.import_virus_synonym ALTER COLUMN cds_virus_id TYPE VARCHAR(250);
ALTER TABLE cds.virus_synonym ALTER COLUMN cds_virus_id TYPE VARCHAR(250);

-- re-add FK constraints
ALTER TABLE cds.import_virus_lab_id ADD CONSTRAINT FK_PK_ImportVirusLabId
    FOREIGN KEY (cds_virus_id, container) REFERENCES cds.import_virus_metadata_all(cds_virus_id, container);

ALTER TABLE cds.virus_lab_id ADD CONSTRAINT FK_PK_VirusLabId
    FOREIGN KEY (cds_virus_id, container) REFERENCES cds.virus_metadata_all(cds_virus_id, container);

ALTER TABLE cds.import_virus_synonym ADD CONSTRAINT FK_ImportVirusSynonym
    FOREIGN KEY (cds_virus_id, container) REFERENCES cds.import_virus_metadata_all(cds_virus_id, container);

ALTER TABLE cds.virus_synonym ADD CONSTRAINT FK_VirusSynonym
    FOREIGN KEY (cds_virus_id, container) REFERENCES cds.virus_metadata_all(cds_virus_id, container);
