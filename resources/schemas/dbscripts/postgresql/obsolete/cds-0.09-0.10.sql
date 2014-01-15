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
ALTER TABLE cds.People
ADD COLUMN ForeName varchar(50),
ADD COLUMN LastName varchar(50),
ADD COLUMN Initials varchar(10);

UPDATE cds.people SET LastName = substring(fullname FROM '[^ ]*$'),  Forename = substring(fullname FROM '(.*) [^ ]*$'), Initials = substring(fullname FROM '(.)[^ ]* ') || coalesce(substring(fullname FROM '[^ ]* (.)[^ ]* [^ ]+'), '');
UPDATE cds.people SET id = coalesce(LastName || ' ' || Initials, id);

UPDATE cds.Studies SET PI1=people.id FROM cds.people WHERE Studies.PI1=People.email;
UPDATE cds.Studies SET PI2=people.id FROM cds.people WHERE Studies.PI2=People.email;
UPDATE cds.Studies SET Contact=people.id FROM cds.people WHERE STudies.Contact=People.email;
UPDATE cds.Assays SET Contact=people.id FROM cds.people WHERE Assays.Contact=People.email;
UPDATE cds.Assays SET LeadContributor=people.id FROM cds.people WHERE Assays.LeadContributor=People.email;

ALTER TABLE cds.CitableAuthors DROP CONSTRAINT fk_citableauthors_citable;
ALTER TABLE cds.CitableAuthors ADD CONSTRAINT fk_citableauthors_citable FOREIGN KEY (container, citableuri) REFERENCES cds.Citable(container, uri) ON DELETE CASCADE;
ALTER TABLE cds.Citations DROP CONSTRAINT fk_citations_citable;
ALTER TABLE cds.Citations ADD  CONSTRAINT fk_citations_citable FOREIGN KEY (Container, CitableURI) REFERENCES cds.Citable(Container, URI) ON DELETE CASCADE;



