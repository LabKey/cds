CREATE TABLE cds.donor_metadata
(
    donor_id      VARCHAR(250) NOT NULL,
    donor_lanl_id VARCHAR(250),
    donor_code    VARCHAR(250),
    donor_species VARCHAR(250),
    donor_clade   VARCHAR(250),
    container     ENTITYID NOT NULL,

    CONSTRAINT PK_donor_metadata PRIMARY KEY (donor_id, container)
);

-- update the MabMetadata table
ALTER TABLE cds.MAbMetadata DROP COLUMN mab_donorid;
ALTER TABLE cds.MAbMetadata DROP COLUMN mab_donor_species;
ALTER TABLE cds.MAbMetadata DROP COLUMN mab_donor_clade;
ALTER TABLE cds.MAbMetadata ADD COLUMN donor_id VARCHAR(250);
ALTER TABLE cds.MAbMetadata ADD CONSTRAINT FK_MAbMetadata_donor_id
    FOREIGN KEY (donor_id, container) REFERENCES cds.donor_metadata(donor_id, container);
CREATE INDEX IX_MAbMetadata_donor_id ON cds.MAbMetadata(donor_id);

CREATE TABLE cds.donor_mab_sequence
(
    row_id      SERIAL NOT NULL,
    mab_id      VARCHAR(250),
    sequence_id VARCHAR(100),
    donor_id    VARCHAR(250),
    container   ENTITYID NOT NULL,

    CONSTRAINT PK_donor_mab_sequence PRIMARY KEY (row_id),
    CONSTRAINT FK_donor_mab_sequence_mab_id FOREIGN KEY (mab_id, container) REFERENCES cds.MabMetadata (mab_id, container),
    CONSTRAINT FK_donor_mab_sequence_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence (sequence_id),
    CONSTRAINT FK_donor_mab_sequence_donor_id FOREIGN KEY (donor_id, container) REFERENCES cds.donor_metadata (donor_id, container)
);
CREATE INDEX IX_donor_mab_sequence_mab_id ON cds.donor_mab_sequence(mab_id);
CREATE INDEX IX_donor_mab_sequence_sequence_id ON cds.donor_mab_sequence(sequence_id);
CREATE INDEX IX_donor_mab_sequence_donor_id ON cds.donor_mab_sequence(donor_id);

DROP TABLE cds.antibody_sequence;

-- add new fields
ALTER TABLE cds.alignment DROP COLUMN locus;
ALTER TABLE cds.sequence ADD COLUMN sequence_aa TEXT;
ALTER TABLE cds.sequence ADD COLUMN chain VARCHAR(20);

-- pAb tables
CREATE TABLE cds.pab_sequence
(
    pab_id      VARCHAR(250) NOT NULL,
    sequence_id VARCHAR(100) NOT NULL,
    container   ENTITYID     NOT NULL,

    CONSTRAINT PK_pab_sequence PRIMARY KEY (pab_id, sequence_id, container),
    CONSTRAINT FK_pab_sequence_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence (sequence_id)
);

CREATE INDEX IX_pab_sequence_sequence_id ON cds.pab_sequence(sequence_id);

CREATE TABLE cds.pab_sequence_study
(
    row_id           SERIAL       NOT NULL,
    prot             VARCHAR(250) NOT NULL,
    subject_id       VARCHAR(100) NOT NULL,
    study_day        VARCHAR(100) NOT NULL,
    specimen_type    VARCHAR(100) NOT NULL,
    pab_id           VARCHAR(250) NOT NULL,
    lab_code         VARCHAR(100),
    seq_method       VARCHAR(100),
    assay_identifier VARCHAR(100),
    container        ENTITYID     NOT NULL,

    CONSTRAINT PK_pab_sequence_study PRIMARY KEY (row_id),
    CONSTRAINT UQ_prot_subject_study_specimen_pab UNIQUE(prot, subject_id, study_day, specimen_type, pab_id)
);

CREATE TABLE cds.antibody_structure
(
    structure_id VARCHAR(250) NOT NULL,
    mab_id       VARCHAR(250),
    container    ENTITYID     NOT NULL,

    CONSTRAINT PK_antibody_structure PRIMARY KEY (structure_id),
    CONSTRAINT FK_antibody_structure_mab_id FOREIGN KEY (mab_id, container) REFERENCES cds.MabMetadata (mab_id, container)
);
CREATE INDEX IX_antibody_structure_mab_id ON cds.antibody_structure(mab_id);

