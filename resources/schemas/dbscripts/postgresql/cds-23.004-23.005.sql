ALTER TABLE cds.sequence_header RENAME COLUMN source TO source_id;
ALTER TABLE cds.antibody_sequence ADD COLUMN lineage BOOLEAN;
ALTER TABLE cds.antibody_sequence DROP CONSTRAINT PK_cds_antibody_sequence;
ALTER TABLE cds.antibody_sequence ADD CONSTRAINT PK_cds_antibody_sequence PRIMARY KEY (mab_id, sequence_id);

DROP TABLE cds.run_log;
CREATE TABLE cds.alignment_run
(
    run_application VARCHAR(10) NOT NULL,
    run_information VARCHAR(10000),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_alignment_run PRIMARY KEY (run_application)
);

CREATE TABLE cds.header_source
(
    source_id VARCHAR(30),
    source VARCHAR(1000),
    notes TEXT,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_header_source_id PRIMARY KEY (source_id)
);