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

ALTER TABLE cds.Assays
	DROP COLUMN datasetname
;

ALTER TABLE cds.Assays
	ADD COLUMN genetics varchar(250)
;

DELETE FROM core.sqlscripts
	WHERE filename = 'cds-0.06-0.07.sql'
;

UPDATE core.modules
	SET installedversion = '0.06'
	WHERE name = 'CDS'
;

*/

ALTER TABLE cds.Assays
	ADD COLUMN datasetname varchar(200)
;

ALTER TABLE cds.Assays
	DROP COLUMN Genetics
;