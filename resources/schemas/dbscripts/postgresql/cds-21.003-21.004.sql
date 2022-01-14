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

CREATE TABLE cds.import_virus_metadata_all
(
    cds_virus_id INTEGER NOT NULL,
    virus VARCHAR(250) NOT NULL,
    virus_full_name VARCHAR(250),
    virus_backbone VARCHAR(250),
    virus_host_cell VARCHAR(250),
    virus_plot_label VARCHAR(250),
    virus_type VARCHAR(250),
    virus_species VARCHAR(250),
    clade VARCHAR(250),
    neutralization_tier VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportVirusMetadataAll PRIMARY KEY (cds_virus_id),
    CONSTRAINT UQ_ImportVirusMetadataAll UNIQUE (virus_full_name)
);

CREATE TABLE cds.virus_metadata_all
(
    cds_virus_id INTEGER NOT NULL,
    virus VARCHAR(250) NOT NULL,
    virus_full_name VARCHAR(250),
    virus_backbone VARCHAR(250),
    virus_host_cell VARCHAR(250),
    virus_plot_label VARCHAR(250),
    virus_type VARCHAR(250),
    virus_species VARCHAR(250),
    clade VARCHAR(250),
    neutralization_tier VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_VirusMetadataAll PRIMARY KEY (cds_virus_id),
    CONSTRAINT UQ_VirusMetadataAll UNIQUE (virus_full_name)
);

CREATE TABLE cds.import_virus_lab_id
(
    rowId SERIAL,
    cds_virus_id INTEGER NOT NULL,
    lab_code VARCHAR(250),
    lab_virus_id INTEGER,
    lab_virus_id_variable_name VARCHAR(250),
    harvest_date TIMESTAMP,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportVirusLabId PRIMARY KEY (rowId),
    CONSTRAINT FK_PK_ImportVirusLabId FOREIGN KEY (cds_virus_id) REFERENCES cds.import_virus_metadata_all(cds_virus_id)
);

CREATE TABLE cds.virus_lab_id
(
    rowId SERIAL,
    cds_virus_id INTEGER NOT NULL,
    lab_code VARCHAR(250),
    lab_virus_id INTEGER,
    lab_virus_id_variable_name VARCHAR(250),
    harvest_date TIMESTAMP,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_VirusLabId PRIMARY KEY (rowId),
    CONSTRAINT FK_PK_VirusLabId FOREIGN KEY (cds_virus_id) REFERENCES cds.virus_metadata_all(cds_virus_id)
);

CREATE TABLE cds.import_virus_synonym
(
    rowId SERIAL,
    cds_virus_id INTEGER NOT NULL,
    virus_synonym VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportVirusSynonym PRIMARY KEY (rowId),
    CONSTRAINT FK_ImportVirusSynonym FOREIGN KEY (cds_virus_id) REFERENCES cds.import_virus_metadata_all(cds_virus_id)
);

CREATE TABLE cds.virus_synonym
(
    rowId SERIAL,
    cds_virus_id INTEGER NOT NULL,
    virus_synonym VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_VirusSynonym PRIMARY KEY (rowId),
    CONSTRAINT FK_VirusSynonym FOREIGN KEY (cds_virus_id) REFERENCES cds.virus_metadata_all(cds_virus_id)
);
