/*
 * Copyright (c) 2020 LabKey Corporation
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

CREATE TABLE cds.import_antigenPanel
(
    cds_panel_id VARCHAR(250),
    panel_name VARCHAR(250),
    panel_description TEXT,
    antigen_type VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_import_antigenPanel PRIMARY KEY(container, cds_panel_id)
);

CREATE TABLE cds.antigenPanel
(
    cds_panel_id VARCHAR(250),
    panel_name VARCHAR(250),
    panel_description TEXT,
    antigen_type VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_antigenPanel PRIMARY KEY(container, cds_panel_id)
);

ALTER TABLE cds.import_nabantigen ADD COLUMN virus_full_name VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_name_other VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_species VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_host_cell VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN virus_backbone VARCHAR(250);
ALTER TABLE cds.import_nabantigen ADD COLUMN cds_virus_id VARCHAR(250);

TRUNCATE --necessary since cds_virus_id currently has null values and can't otherwise make it part of Primary Key below. Data will get repopulated as part of ETL run after server upgrade.
    cds.import_nabantigen
RESTART IDENTITY CASCADE;

ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_pkey;
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, assay_identifier, antigen_name, target_cell, antigen_type, cds_virus_id);

ALTER TABLE cds.nabantigen ADD COLUMN virus_full_name VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_name_other VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_species VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_host_cell VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN virus_backbone VARCHAR(250);
ALTER TABLE cds.nabantigen ADD COLUMN cds_virus_id VARCHAR(250);

TRUNCATE --necessary since cds_virus_id currently has null values and can't otherwise make it part of Primary Key below. Data will get repopulated as part of ETL run after server upgrade.
    cds.nabantigen
RESTART IDENTITY CASCADE;

ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_pkey;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, assay_identifier, antigen_name, target_cell, antigen_type, cds_virus_id);

CREATE TABLE cds.import_virusPanel
(
    rowid SERIAL,
    cds_virus_id VARCHAR(250),
    cds_panel_id VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_import_virusPanel PRIMARY KEY(rowid),
    CONSTRAINT uq_import_virusPanel UNIQUE (container, cds_virus_id, cds_panel_id)
);

CREATE TABLE cds.virusPanel
(
    rowid SERIAL,
    cds_virus_id VARCHAR(250),
    cds_panel_id VARCHAR(250),
    container ENTITYID NOT NULL,

    CONSTRAINT pk_virusPanel PRIMARY KEY(rowid),
    CONSTRAINT uq_virusPanel UNIQUE (container, cds_virus_id, cds_panel_id)
);