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
-- DROP TABLE cds.CitableAuthors;
-- DROP TABLE cds.CitableCitations;
-- DROP TABLE cds.Citable;

ALTER TABLE cds.People RENAME email TO Id;
ALTER TABLE cds.People ADD COLUMN email varchar(250);
UPDATE cds.People SET email=Id;

CREATE TABLE cds.Citable (
	URI varchar(250) NOT NULL,
	CitableType varchar(20) NOT NULL,
	Link text,
	Title text,
	Description text,
	Container entityid NOT NULL,
	EntityId entityid NOT NULL, -- for attachments
	CONSTRAINT pk_citable PRIMARY KEY (Container, URI)
)
;

CREATE TABLE cds.Citations (
    RowId SERIAL,
    ObjectURI varchar(250) NOT NULL,
    CitableURI varchar(250) NOT NULL,
    CitationType varchar(20),
    SortIndex int not null,
    Container entityid NOT NULL,
    CONSTRAINT fk_citations_citable FOREIGN KEY (Container, CitableURI) REFERENCES cds.Citable(Container, URI),
    CONSTRAINT uq_citations UNIQUE (Container, ObjectURI, CitableURI, CitationType),
    CONSTRAINT pk_citations PRIMARY KEY (Container, RowId)
)
;

CREATE TABLE cds.CitableAuthors (
  RowId SERIAL,
  CitableURI varchar(250) NOT NULL,
  AuthorId varchar(250) NOT NULL,
  AuthorType varchar(20), -- CONTRIBUTOR | CREATOR
  Contact bool,
  SortIndex int not null,
  Container entityid NOT NULL,
  CONSTRAINT fk_citableauthors_citable FOREIGN KEY (Container, CitableURI) REFERENCES cds.Citable(Container, URI),
  CONSTRAINT uq_citableauthors UNIQUE (Container, CitableURI, AuthorId),
  CONSTRAINT pk_citableauthors PRIMARY KEY (Container, RowId)
)
;


