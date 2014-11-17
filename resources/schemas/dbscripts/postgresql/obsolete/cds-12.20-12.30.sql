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

ALTER TABLE cds.Vaccines
	ADD COLUMN description text,
	ADD COLUMN production text,
	ADD COLUMN inserts varchar(250),
	ADD COLUMN toxicity_studies text,
	ADD COLUMN previous_trials text
;

ALTER TABLE cds.VaccineComponents
    ADD COLUMN description text,
    ADD COLUMN isolate varchar(50),
    ADD COLUMN GenBankID varchar(50)
;

ALTER TABLE cds.Antigens
    ADD COLUMN viruscategory varchar(10),
    ADD COLUMN pseudovirus_backbone varchar(50)
;

ALTER TABLE cds.Antigens
    DROP COLUMN isolateorconsensusname
;

ALTER TABLE cds.Antigens
    RENAME COLUMN HostSpecies to DonorID
;
