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
 
/* 

DROP TABLE cds.VaccineComponents
;

DROP TABLE cds.Vaccines
;

DELETE FROM core.sqlscripts
	WHERE filename = 'cds-0.11-0.12.sql'
;

UPDATE core.modules
	SET installedversion = '0.11'
	WHERE name = 'CDS'
;

*/

CREATE TABLE cds.Vaccines (
    VaccineName varchar(100),
    Type varchar(20),
    Container entityid NOT NULL,
    CONSTRAINT pk_vaccines PRIMARY KEY (Container, VaccineName)
)
;

CREATE TABLE cds.VaccineComponents (
    RowId SERIAL,
    VaccineName varchar(100),
    VaccineComponent varchar(100),
    Type varchar(100),
    Clade varchar(10),
    Region varchar(20),
    Container entityid NOT NULL,
    CONSTRAINT fk_vaccine_components FOREIGN KEY (Container, VaccineName) REFERENCES cds.Vaccines(Container, VaccineName),
    CONSTRAINT pk_vaccine_components PRIMARY KEY (Container, RowId)

)
;

