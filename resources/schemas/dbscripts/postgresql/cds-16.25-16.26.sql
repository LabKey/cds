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
CREATE TABLE cds.import_Publication (
  publication_id VARCHAR(250) NOT NULL,
  publication_title TEXT,
  publication_author_all TEXT,
  publication_journal_short VARCHAR(250),
  publication_date VARCHAR(250),
  publication_volume VARCHAR(250),
  publication_issue VARCHAR(250),
  publication_location VARCHAR(250),
  publication_pmid VARCHAR(250),
  publication_link VARCHAR(250),

  CONSTRAINT pk_import_Publication PRIMARY KEY (publication_id)
);

CREATE TABLE cds.import_StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  study_publication_order VARCHAR(250),

  CONSTRAINT pk_import_StudyPublication PRIMARY KEY (prot, publication_id)
);

CREATE TABLE cds.Publication (
  id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  title TEXT,
  author_all TEXT,
  journal_short VARCHAR(250),
  date VARCHAR(250),
  volume VARCHAR(250),
  issue VARCHAR(250),
  location VARCHAR(250),
  pmid VARCHAR(250),
  link VARCHAR(250),

  CONSTRAINT PK_Publication PRIMARY KEY (id)
);

CREATE TABLE cds.StudyPublication (
  prot VARCHAR(250) NOT NULL,
  publication_id VARCHAR(250) NOT NULL,
  container entityid NOT NULL,
  publication_order VARCHAR(250),

  CONSTRAINT pk_StudyPublication PRIMARY KEY (prot, publication_id)
);

ALTER TABLE cds.import_studydocument ADD COLUMN study_document_order INTEGER;
ALTER TABLE cds.StudyDocument ADD COLUMN document_order INTEGER;