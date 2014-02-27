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
 
/* 

ALTER TABLE cds.Antigens
	DROP COLUMN ShortDescription,
    DROP COLUMN AntigenCategory,
    DROP COLUMN AntigenType,
    DROP COLUMN HostSpecies,
    DROP COLUMN Family,
    DROP COLUMN "Group",
    DROP COLUMN Region,
    DROP COLUMN Mutations,
    DROP COLUMN ConsensusVIsolate,
    DROP COLUMN IsolateOrConsensusName,
    DROP COLUMN Protein,
    DROP COLUMN Virus,
    DROP COLUMN Purification,
    DROP COLUMN Biotin,
    DROP COLUMN Tag,
    DROP COLUMN HostCell,
    DROP COLUMN JournalReference,
    DROP COLUMN ProviderName
;

ALTER TABLE cds.Antigens
	ADD COLUMN coreceptor character varying(250)
;

ALTER TABLE cds.Antigens
	RENAME COLUMN stageofinfection to fiebigstage
;

ALTER TABLE cds.Antigens
	RENAME COLUMN catnumber to arrrpcatnum
;

DELETE FROM core.sqlscripts
	WHERE filename = 'cds-0.10-0.11.sql'
;

UPDATE core.modules
	SET installedversion = '0.11'
	WHERE name = 'CDS'
;

*/

ALTER TABLE cds.Antigens
	ADD COLUMN ShortDescription varchar(100),
    ADD COLUMN AntigenCategory varchar(50),
    ADD COLUMN AntigenType varchar(50),
    ADD COLUMN HostSpecies varchar(50),
    ADD COLUMN Family varchar(50),
    ADD COLUMN "Group" varchar(10),
    ADD COLUMN Region varchar(50),
    ADD COLUMN Mutations varchar(50),
    ADD COLUMN ConsensusVIsolate varchar(50),
    ADD COLUMN IsolateOrConsensusName varchar(50),
    ADD COLUMN Protein varchar(50),
    ADD COLUMN Virus varchar(50),
    ADD COLUMN Purification varchar(50),
    ADD COLUMN Tag varchar(50),
    ADD COLUMN HostCell varchar(50),
    ADD COLUMN JournalReference varchar(50),
    ADD COLUMN ProviderName varchar(100),
    ADD COLUMN Biotin varchar(30)
;

ALTER TABLE cds.Antigens
    DROP COLUMN coreceptor
;

ALTER TABLE cds.Antigens
    RENAME COLUMN fiebigstage to stageofinfection
;

ALTER TABLE cds.Antigens
    RENAME COLUMN arrrpcatnum to catnumber
;