ALTER TABLE cds.sequence_header RENAME COLUMN source TO source_id;
ALTER TABLE cds.antibody_sequence ADD COLUMN lineage BOOLEAN;
ALTER TABLE cds.antibody_sequence DROP CONSTRAINT PK_cds_antibody_sequence;
ALTER TABLE cds.antibody_sequence ADD CONSTRAINT PK_cds_antibody_sequence PRIMARY KEY (mab_id, sequence_id);

ALTER TABLE cds.run_log RENAME TO alignment_run;

CREATE TABLE cds.header_source
(
    source_id VARCHAR(30),
    source VARCHAR(1000),
    notes TEXT,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_header_source_id PRIMARY KEY (source_id)
);