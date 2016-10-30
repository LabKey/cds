/*
 * Copyright (c) 2016 LabKey Corporation
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

/* cds-0.00-12.20.sql */

CREATE SCHEMA cds;

CREATE TABLE cds.Antigens
(
	Container ENTITYID NOT NULL,
	Id varchar(250) NOT NULL,
	OtherNamesUsed VARCHAR(250),
	Clade VARCHAR(250),
	Tier VARCHAR(250),
	Countryoforigin VARCHAR(250),
	Year VARCHAR(250),
	FiebigStage VARCHAR(250),
	ModeOfTrans VARCHAR(250),
	SpecimenSource VARCHAR(250),
	NucleicAcidAmplificationMethod VARCHAR(250),
	AccessionNumber VARCHAR(250),
	ArrrpCatNum VARCHAR(250),
	NucleotideSequence TEXT,
	AminoAcidSequence TEXT,
	EnvCloneProvider VARCHAR(250),
	ContributorsOfSourceSpecimen VARCHAR(250),
	ContributingInstituteOrNetwork VARCHAR(250),
	Notes TEXT,

	CONSTRAINT pk_antigens PRIMARY KEY (container, id)
);

ALTER TABLE cds.Antigens
	ADD COLUMN ShortDescription VARCHAR(100),
    ADD COLUMN AntigenCategory VARCHAR(50),
    ADD COLUMN AntigenType VARCHAR(50),
    ADD COLUMN HostSpecies VARCHAR(50),
    ADD COLUMN Family VARCHAR(50),
    ADD COLUMN "Group" VARCHAR(10),
    ADD COLUMN Region VARCHAR(50),
    ADD COLUMN Mutations VARCHAR(50),
    ADD COLUMN ConsensusVIsolate VARCHAR(50),
    ADD COLUMN IsolateOrConsensusName VARCHAR(50),
    ADD COLUMN Protein VARCHAR(50),
    ADD COLUMN Virus VARCHAR(50),
    ADD COLUMN Purification VARCHAR(50),
    ADD COLUMN Tag VARCHAR(50),
    ADD COLUMN HostCell VARCHAR(50),
    ADD COLUMN JournalReference VARCHAR(50),
    ADD COLUMN ProviderName VARCHAR(100),
    ADD COLUMN Biotin VARCHAR(30);

ALTER TABLE cds.Antigens
    RENAME COLUMN fiebigstage to stageofinfection;

ALTER TABLE cds.Antigens
    RENAME COLUMN arrrpcatnum to catnumber;

DELETE FROM cds.Antigens WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Assays
(
	Id VARCHAR(250) NOT NULL,
	Caption VARCHAR(250),
	LabId VARCHAR(250),
	DatasetId int4,
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT pk_assays PRIMARY KEY (container, id)
);

ALTER TABLE cds.Assays
   ADD COLUMN category VARCHAR(250);

ALTER TABLE cds.Assays
	ADD COLUMN leadcontributor VARCHAR(250),
	ADD COLUMN contact VARCHAR(250),
	ADD COLUMN assayabstract TEXT,
	ADD COLUMN relatedpublications VARCHAR(250),
	ADD COLUMN methodology VARCHAR(250);

ALTER TABLE cds.Assays
	RENAME COLUMN category TO targetarea;

ALTER TABLE cds.Assays
	ADD COLUMN datasetname VARCHAR(200);

DELETE FROM cds.Assays WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Datasources
(
	Container ENTITYID NOT NULL,
	RowId SERIAL,
	SourceContainer ENTITYID NOT NULL,
	QueryName VARCHAR(250),
	SchemaName VARCHAR(250),
	ViewName VARCHAR(250),
	TargetDatasetId int4,
	Lab VARCHAR(250),
	Assay VARCHAR(250),
	Contact VARCHAR(250),
	Batch VARCHAR(250),

	CONSTRAINT pk_datasources PRIMARY KEY (Container, RowId)
);

CREATE TABLE cds.Labs
(
	Id VARCHAR(250) NOT NULL,
	PI VARCHAR(250),
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT pk_labs PRIMARY KEY (Container, Id)
);

DELETE FROM cds.Labs WHERE container NOT IN (SELECT ENTITYID FROM core.Containers);

CREATE TABLE cds.People
(
	Email VARCHAR(250) NOT NULL,
	FullName VARCHAR(250),
	LabId VARCHAR(250),
	Role VARCHAR(250),
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT pk_people PRIMARY KEY (Container, Email)
);

ALTER TABLE cds.People
	ADD COLUMN PictureFile VARCHAR(250);

ALTER TABLE cds.People RENAME email TO Id;
ALTER TABLE cds.People ADD COLUMN email VARCHAR(250);
UPDATE cds.People SET email=Id;

ALTER TABLE cds.People
    ADD COLUMN ForeName VARCHAR(50),
    ADD COLUMN LastName VARCHAR(50),
    ADD COLUMN Initials VARCHAR(10);

UPDATE cds.people SET LastName = substring(fullname FROM '[^ ]*$'),  Forename = substring(fullname FROM '(.*) [^ ]*$'), Initials = substring(fullname FROM '(.)[^ ]* ') || coalesce(substring(fullname FROM '[^ ]* (.)[^ ]* [^ ]+'), '');
UPDATE cds.people SET id = coalesce(LastName || ' ' || Initials, id);

DELETE FROM cds.People WHERE container NOT IN (SELECT EntityId FROM core.Containers);

UPDATE cds.Assays SET Contact=people.id FROM cds.people WHERE Assays.Contact=People.email;
UPDATE cds.Assays SET LeadContributor=people.id FROM cds.people WHERE Assays.LeadContributor=People.email;

CREATE TABLE cds.Studies
(
	Container ENTITYID NOT NULL,
	StudyName VARCHAR(250) NOT NULL,
	Description TEXT,
	PI1 VARCHAR(250),
	PI2 VARCHAR(250),
	Contact VARCHAR(250),

	CONSTRAINT pk_studies PRIMARY KEY (Container, StudyName)
);


ALTER TABLE cds.Studies
	ADD COLUMN type VARCHAR(250),
	ADD COLUMN network VARCHAR(250);

UPDATE cds.Studies SET PI1=people.id FROM cds.people WHERE Studies.PI1=People.email;
UPDATE cds.Studies SET PI2=people.id FROM cds.people WHERE Studies.PI2=People.email;
UPDATE cds.Studies SET Contact=people.id FROM cds.people WHERE STudies.Contact=People.email;

DELETE FROM cds.Studies WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Facts
(
	ParticipantId VARCHAR(32) NOT NULL,
	Assay VARCHAR(250),
	Lab VARCHAR(250),
	Antigen VARCHAR(250),
	Study VARCHAR(250),
	Container ENTITYID NOT NULL,

	CONSTRAINT fk_fact_assay FOREIGN KEY (container, assay) REFERENCES cds.assays (container, id),
	CONSTRAINT fk_fact_lab FOREIGN KEY (container, lab) REFERENCES cds.labs (container, id),
	CONSTRAINT fk_fact_antigen FOREIGN KEY (container, antigen) REFERENCES cds.antigens (container, id),
	CONSTRAINT fk_fact_study FOREIGN KEY (container, study) REFERENCES cds.studies (container, studyname)
);

DELETE FROM cds.Facts WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.AssayPublications
(
	AssayId VARCHAR(250) NOT NULL,
	PubMedID VARCHAR(20),
	Link TEXT,
	Title TEXT,
	Description TEXT,
	Container ENTITYID NOT NULL,

	CONSTRAINT fk_assay_pub FOREIGN KEY (container, AssayID) REFERENCES cds.assays (container, ID)
);

ALTER TABLE cds.AssayPublications
	ADD COLUMN RowId SERIAL,
	ADD COLUMN Type VARCHAR(50);

ALTER TABLE cds.AssayPublications
	ADD PRIMARY KEY (container, RowId);

DELETE FROM cds.AssayPublications WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Citable
(
	URI VARCHAR(250) NOT NULL,
	CitableType VARCHAR(20) NOT NULL,
	Link TEXT,
	Title TEXT,
	Description TEXT,
	Container ENTITYID NOT NULL,
	EntityId ENTITYID NOT NULL, -- for attachments

	CONSTRAINT pk_citable PRIMARY KEY (Container, URI)
);

DELETE FROM cds.Citable WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Citations
(
    RowId SERIAL,
    ObjectURI VARCHAR(250) NOT NULL,
    CitableURI VARCHAR(250) NOT NULL,
    CitationType VARCHAR(20),
    SortIndex INT NOT NULL,
    Container ENTITYID NOT NULL,

    CONSTRAINT uq_citations UNIQUE (Container, ObjectURI, CitableURI, CitationType),
    CONSTRAINT pk_citations PRIMARY KEY (Container, RowId)
);

ALTER TABLE cds.Citations ADD CONSTRAINT fk_citations_citable FOREIGN KEY (Container, CitableURI) REFERENCES cds.Citable(Container, URI) ON DELETE CASCADE;

DELETE FROM cds.Citations WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.CitableAuthors
(
    RowId SERIAL,
    CitableURI VARCHAR(250) NOT NULL,
    AuthorId VARCHAR(250) NOT NULL,
    AuthorType VARCHAR(20), -- CONTRIBUTOR | CREATOR
    Contact bool,
    SortIndex INT NOT NULL,
    Container ENTITYID NOT NULL,

    CONSTRAINT uq_citableauthors UNIQUE (Container, CitableURI, AuthorId),
    CONSTRAINT pk_citableauthors PRIMARY KEY (Container, RowId)
);

ALTER TABLE cds.CitableAuthors ADD CONSTRAINT fk_citableauthors_citable FOREIGN KEY (container, citableuri) REFERENCES cds.Citable(container, uri) ON DELETE CASCADE;
DELETE FROM cds.CitableAuthors WHERE container NOT IN (SELECT EntityId FROM core.Containers);

CREATE TABLE cds.Vaccines
(
    VaccineName VARCHAR(100),
    Type VARCHAR(20),
    Container ENTITYID NOT NULL,
    CONSTRAINT pk_vaccines PRIMARY KEY (Container, VaccineName)
);

CREATE TABLE cds.VaccineComponents
(
    RowId SERIAL,
    VaccineName VARCHAR(100),
    VaccineComponent VARCHAR(100),
    Type VARCHAR(100),
    Clade VARCHAR(10),
    Region VARCHAR(20),
    Container ENTITYID NOT NULL,

    CONSTRAINT fk_vaccine_components FOREIGN KEY (Container, VaccineName) REFERENCES cds.Vaccines(Container, VaccineName),
    CONSTRAINT pk_vaccine_components PRIMARY KEY (Container, RowId)
);

CREATE TABLE cds.Feedback
(
    RowId SERIAL,
    Container ENTITYID NOT NULL,
    Created TIMESTAMP NOT NULL,
    CreatedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Description TEXT,
    State TEXT,

    CONSTRAINT pk_feedback PRIMARY KEY (Container, RowId)
);

/* cds-12.20-12.30.sql */

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

/* cds-13.30-14.10.sql */

ALTER TABLE cds.Studies
    ADD COLUMN StartDate TIMESTAMP,
    ADD COLUMN EndDate TIMESTAMP,
    ADD COLUMN Phase VARCHAR(10),
    ADD COLUMN Treatments TEXT;

CREATE TABLE cds.Sites
(
	Id VARCHAR(250) NOT NULL,
	PI VARCHAR(250),
	Description TEXT,
	Location TEXT,
	Container ENTITYID NOT NULL,
  Status VARCHAR(50),
  AltName VARCHAR(250),
  Network VARCHAR(250),

	CONSTRAINT pk_sites PRIMARY KEY (Container, Id)
);

ALTER TABLE cds.Studies
    ADD COLUMN AltTitle VARCHAR(250);

ALTER TABLE cds.Vaccines
    ADD COLUMN Class VARCHAR(250),
    ADD COLUMN SubClass VARCHAR(250),
    ADD COLUMN Developer VARCHAR(250);

ALTER TABLE cds.Assays
    ADD COLUMN AltName VARCHAR(250),
    ADD COLUMN SystemTarget VARCHAR(250),
    ADD COLUMN Type VARCHAR(250),
    ADD COLUMN Platform VARCHAR(250),
    ADD COLUMN Target VARCHAR(250),
    ADD COLUMN TargetFunction VARCHAR(250);

ALTER TABLE cds.Labs
    ADD COLUMN Institution VARCHAR(250),
    ADD COLUMN Location TEXT;

/* cds-14.10-14.20.sql */

ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_study;
ALTER TABLE cds.Facts DROP COLUMN study;
ALTER TABLE cds.Facts ADD COLUMN study ENTITYID;
ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_assay;
ALTER TABLE cds.Facts DROP CONSTRAINT fk_fact_lab;

ALTER TABLE cds.assaypublications DROP CONSTRAINT fk_assay_pub;

CREATE TABLE cds.Properties
(
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  PrimaryCount INTEGER,
  DataCount INTEGER,

  CONSTRAINT pk_properties PRIMARY KEY (Container, RowId)
);

ALTER TABLE cds.Antigens ADD COLUMN panel varchar(200);

ALTER TABLE cds.Antigens ADD COLUMN description TEXT;