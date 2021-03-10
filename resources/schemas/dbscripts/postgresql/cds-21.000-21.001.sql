
CREATE TABLE cds.import_studyReport
(
    prot VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportStudyReport PRIMARY KEY (prot, cds_report_id, container)
);

CREATE TABLE cds.studyReport
(
    prot VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_studyReport PRIMARY KEY (prot, cds_report_id, container)
);

CREATE TABLE cds.import_studyCuratedGroup
(
    prot VARCHAR(250) NOT NULL,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportStudyCuratedGroup PRIMARY KEY (prot, cds_saved_group_id, container)
);

CREATE TABLE cds.studyCuratedGroup
(
    prot VARCHAR(250) NOT NULL,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_studyCuratedGroup PRIMARY KEY (prot, cds_saved_group_id, container)
);

CREATE TABLE cds.import_publicationReport
(
    publication_id INTEGER,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportPublicationReport PRIMARY KEY (publication_id, cds_report_id, container)
);

CREATE TABLE cds.publicationReport
(
    publication_id INTEGER,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_publicationReport PRIMARY KEY (publication_id, cds_report_id, container)
);

CREATE TABLE cds.import_publicationCuratedGroup
(
    publication_id INTEGER,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportPublicationCuratedGroup PRIMARY KEY (publication_id, cds_saved_group_id, container)
);

CREATE TABLE cds.publicationCuratedGroup
(
    publication_id INTEGER,
    cds_saved_group_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_publicationCuratedGroup PRIMARY KEY (publication_id, cds_saved_group_id, container)
);