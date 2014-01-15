/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
 
ALTER TABLE cds.Studies
	ADD COLUMN type varchar(250),
	ADD COLUMN network varchar(250)
;

ALTER TABLE cds.Assays
	ADD COLUMN leadcontributor varchar(250),
	ADD COLUMN contact varchar(250),
	ADD COLUMN measurementoverview text,
	ADD COLUMN assayabstract text,
	ADD COLUMN relatedpublications varchar(250),
	ADD COLUMN genetics varchar(250),
	ADD COLUMN methodology varchar(250)
;

ALTER TABLE cds.Assays
	RENAME COLUMN category TO targetarea
;