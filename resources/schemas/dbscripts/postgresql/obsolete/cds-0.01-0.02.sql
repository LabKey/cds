/*
 * Copyright (c) 2012 LabKey Corporation
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
CREATE TABLE cds.Antigens (
	Container entityid NOT NULL,
	Id varchar(250) NOT NULL,
	OtherNamesUsed varchar(250),
	Clade varchar(250),
	Tier varchar(250),
	Coreceptor varchar(250),
	Countryoforigin varchar(250),
	Year varchar(250),
	FiebigStage varchar(250),
	ModeOfTrans varchar(250),
	SpecimenSource varchar(250),
	NucleicAcidAmplificationMethod varchar(250),
	AccessionNumber varchar(250),
	ArrrpCatNum varchar(250),
	NucleotideSequence text,
	AminoAcidSequence text,
	EnvCloneProvider varchar(250),
	ContributorsOfSourceSpecimen varchar(250),
	ContributingInstituteOrNetwork varchar(250),
	Notes text,
	CONSTRAINT pk_antigens PRIMARY KEY (container, id) 
);

CREATE TABLE cds.Assays (
	Id varchar(250) NOT NULL,
	Caption varchar(250),
	LabId varchar(250),
	DatasetId int4,
	Description text,
	Container entityid NOT NULL,
	CONSTRAINT pk_assays PRIMARY KEY (container, id)
);

CREATE TABLE cds.Datasources (
	Container entityid NOT NULL,
	RowId SERIAL,
	SourceContainer entityid NOT NULL,
	QueryName varchar(250),
	SchemaName varchar(250),
	ViewName varchar(250),
	TargetDatasetId int4,
	Lab varchar(250),
	Assay varchar(250),
	Contact varchar(250),
	Batch varchar(250),
	CONSTRAINT pk_datasources PRIMARY KEY (Container, RowId)
);


CREATE TABLE cds.Labs (
	Id varchar(250) NOT NULL,
	PI varchar(250),
	Description text,
	Container entityid NOT NULL,
	CONSTRAINT pk_labs PRIMARY KEY (Container, Id)
);

CREATE TABLE cds.People (
	Email varchar(250) NOT NULL,
	FullName varchar(250),
	LabId varchar(250),
	Role varchar(250),
	Description text,
	Container entityid NOT NULL,
	CONSTRAINT pk_people PRIMARY KEY (Container, Email)
);

CREATE TABLE cds.Studies (
	Container entityid NOT NULL,
	StudyName varchar(250) NOT NULL,
	Description text,
	PI1 varchar(250),
	PI2 varchar(250),
	Contact varchar(250),
	CONSTRAINT pk_studies PRIMARY KEY (Container, StudyName)
);


CREATE TABLE cds.Facts (
	ParticipantId varchar(32) NOT NULL,
	Assay varchar(250),
	Lab varchar(250),
	Antigen varchar(250),
	Study varchar(250),
	Container entityid NOT NULL,
	CONSTRAINT fk_fact_assay FOREIGN KEY (container, assay) REFERENCES cds.assays (container, id),
	CONSTRAINT fk_fact_lab FOREIGN KEY (container, lab) REFERENCES cds.labs (container, id),
	CONSTRAINT fk_fact_antigen FOREIGN KEY (container, antigen) REFERENCES cds.antigens (container, id),
	CONSTRAINT fk_fact_study FOREIGN KEY (container, study) REFERENCES cds.studies (container, studyname)
);
