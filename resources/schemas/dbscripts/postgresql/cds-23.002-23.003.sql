DROP TABLE cds.sequence_headers;

CREATE TABLE cds.sequence_header
(
    sequence_header_id SERIAL,
    header VARCHAR(1000),
    sequence_id VARCHAR(100),
    source VARCHAR(100),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_sequence_header PRIMARY KEY (sequence_header_id),
    CONSTRAINT FK_cds_sequence_header_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence(sequence_id)
);
CREATE INDEX IX_cds_sequence_header_sequence_id ON cds.sequence_header(sequence_id);

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