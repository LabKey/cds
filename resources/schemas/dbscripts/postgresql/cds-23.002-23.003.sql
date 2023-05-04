ALTER TABLE cds.sequence_headers RENAME TO sequence_header;

DROP TABLE cds.run_log;

CREATE TABLE cds.run_log
(
    run_application VARCHAR(10) NOT NULL,
    run_information VARCHAR(10000),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_run_log PRIMARY KEY (run_application)
);

ALTER TABLE cds.sequence DROP COLUMN source;

ALTER TABLE cds.sequence_germline DROP COLUMN run_number;
ALTER TABLE cds.alignment DROP COLUMN run_number;

ALTER TABLE cds.sequence_germline ADD COLUMN run_application VARCHAR(10);
ALTER TABLE cds.alignment ADD COLUMN run_application VARCHAR(10);

CREATE TABLE cds.antibody_class
(
    mab_class_id VARCHAR(30) NOT NULL,
    mab_class_name VARCHAR(50),
    description TEXT,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_antibody_class PRIMARY KEY (mab_class_id)
);

ALTER TABLE cds.import_MAbMetadata ADD COLUMN mab_class_id VARCHAR(30);
ALTER TABLE cds.MAbMetadata ADD COLUMN mab_class_id VARCHAR(30);