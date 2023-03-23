-- CREATE TABLE cds.import_sequence
-- (
--     sequence_id VARCHAR(100) NOT NULL,
--     sequence_nt VARCHAR(10000),
--     source VARCHAR(100),
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_sequence PRIMARY KEY (sequence_id, container)
-- );

CREATE TABLE cds.sequence
(
    sequence_id VARCHAR(100) NOT NULL,
    sequence_nt VARCHAR(10000),
    source VARCHAR(100),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_sequence PRIMARY KEY (sequence_id)
);

-- CREATE TABLE cds.import_run_log
-- (
--     run_number VARCHAR(100) NOT NULL,
--     run_application VARCHAR(10),
--     run_information VARCHAR(10000),
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_run_log PRIMARY KEY (run_number, container)
-- );

CREATE TABLE cds.run_log
(
    run_number VARCHAR(100) NOT NULL,
    run_application VARCHAR(10),
    run_information VARCHAR(10000),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_run_log PRIMARY KEY (run_number)
);

-- CREATE TABLE cds.import_allele_sequence
-- (
--     allele VARCHAR(100) NOT NULL,
--     allele_sequence_nt VARCHAR(1000),
--     release_date DATE,
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_allele_sequence PRIMARY KEY (allele, container)
-- );

CREATE TABLE cds.allele_sequence
(
    allele VARCHAR(100) NOT NULL,
    allele_sequence_nt VARCHAR(1000),
    release_date DATE,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_allele_sequence PRIMARY KEY (allele)
);

-- CREATE TABLE cds.import_sequence_headers
-- (
--     sequence_header_id SERIAL,
--     header VARCHAR(1000),
--     sequence_id VARCHAR(100),
--     source VARCHAR(100),
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_sequence_headers PRIMARY KEY (sequence_header_id),
--     CONSTRAINT FK_cds_import_sequence_headers_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.import_sequence(sequence_id)
-- );

CREATE TABLE cds.sequence_headers
(
    sequence_header_id SERIAL,
    header VARCHAR(1000),
    sequence_id VARCHAR(100),
    source VARCHAR(100),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_sequence_headers PRIMARY KEY (sequence_header_id),
    CONSTRAINT FK_cds_sequence_headers_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence(sequence_id)
);

CREATE INDEX IX_cds_sequence_headers_sequence_id ON cds.sequence_headers(sequence_id);

-- CREATE TABLE cds.import_sequence_germline
-- (
--     sequence_germline_id SERIAL,
--     allele VARCHAR(100),
--     sequence_id VARCHAR(100),
--     percent_identity NUMERIC(15,4),
--     matches INT,
--     alignment_length INT,
--     score NUMERIC(15,4),
--     run_number VARCHAR(100),
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_sequence_germline PRIMARY KEY (sequence_germline_id),
--     CONSTRAINT FK_cds_import_sequence_germline_allele FOREIGN KEY (allele) REFERENCES cds.import_allele_sequence(allele)
--     CONSTRAINT FK_cds_import_sequence_germline_run_number FOREIGN KEY (run_number) REFERENCES cds.import_run_log(run_number)
--     CONSTRAINT FK_cds_import_sequence_germline_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.import_sequence(sequence_id)
-- );


CREATE TABLE cds.sequence_germline
(
    sequence_germline_id SERIAL,
    allele VARCHAR(100),
    sequence_id VARCHAR(100),
    percent_identity NUMERIC(15,4),
    matches INT,
    alignment_length INT,
    score NUMERIC(15,4),
    run_number VARCHAR(100),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_sequence_germline PRIMARY KEY (sequence_germline_id),
    CONSTRAINT FK_cds_sequence_germline_allele FOREIGN KEY (allele) REFERENCES cds.allele_sequence(allele),
    CONSTRAINT FK_cds_sequence_germline_run_number FOREIGN KEY (run_number) REFERENCES cds.run_log(run_number),
    CONSTRAINT FK_cds_sequence_germline_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence(sequence_id)
);

CREATE INDEX IX_cds_sequence_germline_allele ON cds.sequence_germline(allele);
CREATE INDEX IX_cds_sequence_germline_run_number ON cds.sequence_germline(run_number);
CREATE INDEX IX_cds_sequence_germline_sequence_id ON cds.sequence_germline(sequence_id);

-- CREATE TABLE cds.import_antibody_sequence
-- (
--     mab_id VARCHAR(100),
--     chain VARCHAR(10),
--     sequence_id VARCHAR(100),
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_antibody_sequence PRIMARY KEY (mab_id, chain),
--     CONSTRAINT FK_cds_import_antibody_sequence_mab_id FOREIGN KEY (mab_id) REFERENCES cds.import_MAbMetadata(mab_id),
--     CONSTRAINT FK_cds_import_antibody_sequence_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.import_sequence(sequence_id)
-- );

CREATE TABLE cds.antibody_sequence
(
    mab_id VARCHAR(100),
    chain VARCHAR(10),
    sequence_id VARCHAR(100),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_antibody_sequence PRIMARY KEY (mab_id, chain),
    CONSTRAINT FK_cds_antibody_sequence_mab_id FOREIGN KEY (container, mab_id) REFERENCES cds.MAbMetadata(container, mab_id),
    CONSTRAINT FK_cds_antibody_sequence_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence(sequence_id)
);

CREATE INDEX IX_cds_antibody_sequence_mab_id ON cds.antibody_sequence(container, mab_id);
CREATE INDEX IX_cds_antibody_sequence_sequence_id ON cds.antibody_sequence(sequence_id);

-- CREATE TABLE cds.import_alignment
-- (
--     alignment_id SERIAL,
--     sequence_id VARCHAR(100),
--     locus VARCHAR(10),
--     stop_codon VARCHAR(1),
--     vj_in_frame VARCHAR(1),
--     productive VARCHAR(1),
--     rev_comp VARCHAR(1),
--     complete_vdj VARCHAR(1),
--     v_call VARCHAR(25),
--     d_call VARCHAR(25),
--     j_call VARCHAR(25),
--     sequence_alignment VARCHAR(1000),
--     germline_alignment VARCHAR(1000),
--     sequence_alignment_aa VARCHAR(1000),
--     germline_alignment_aa VARCHAR(1000),
--     v_alignment_start INT,
--     v_alignment_end INT,
--     d_alignment_start INT,
--     d_alignment_end INT,
--     j_alignment_start INT,
--     j_alignment_end INT,
--     v_sequence_alignment VARCHAR(1000),
--     v_sequence_alignment_aa VARCHAR(1000),
--     v_germline_alignment VARCHAR(1000),
--     v_germline_alignment_aa VARCHAR(1000),
--     d_sequence_alignment VARCHAR(100),
--     d_sequence_alignment_aa VARCHAR(100),
--     d_germline_alignment VARCHAR(100),
--     d_germline_alignment_aa VARCHAR(100),
--     j_sequence_alignment VARCHAR(100),
--     j_sequence_alignment_aa VARCHAR(100),
--     j_germline_alignment VARCHAR(100),
--     j_germline_alignment_aa VARCHAR(100),
--     fwr1 VARCHAR(100),
--     fwr1_aa VARCHAR(100),
--     cdr1 VARCHAR(100),
--     cdr1_aa VARCHAR(100),
--     fwr2 VARCHAR(100),
--     fwr2_aa VARCHAR(100),
--     cdr2 VARCHAR(100),
--     cdr2_aa VARCHAR(100),
--     fwr3 VARCHAR(1000),
--     fwr3_aa VARCHAR(100),
--     fwr4 VARCHAR(100),
--     fwr4_aa VARCHAR(100),
--     cdr3 VARCHAR(100),
--     cdr3_aa VARCHAR(100),
--     junction VARCHAR(100),
--     junction_length INT,
--     junction_aa VARCHAR(100),
--     junction_aa_length INT,
--     v_score NUMERIC(15,4),
--     d_score NUMERIC(15,4),
--     j_score NUMERIC(15,4),
--     v_cigar VARCHAR(1000),
--     d_cigar VARCHAR(1000),
--     j_cigar VARCHAR(1000),
--     v_support NUMERIC(15,4),
--     d_support NUMERIC(15,4),
--     j_support NUMERIC(15,4),
--     v_identity NUMERIC(15,4),
--     d_identity NUMERIC(15,4),
--     j_identity NUMERIC(15,4),
--     v_sequence_start INT,
--     v_sequence_end INT,
--     v_germline_start INT,
--     v_germline_end INT,
--     d_sequence_start INT,
--     d_sequence_end INT,
--     d_germline_start INT,
--     d_germline_end INT,
--     j_sequence_start INT,
--     j_sequence_end INT,
--     j_germline_start INT,
--     j_germline_end INT,
--     fwr1_start INT,
--     fwr1_end INT,
--     cdr1_start INT,
--     cdr1_end INT,
--     fwr2_start INT,
--     fwr2_end INT,
--     cdr2_start INT,
--     cdr2_end INT,
--     fwr3_start INT,
--     fwr3_end INT,
--     fwr4_start INT,
--     fwr4_end INT,
--     cdr3_start INT,
--     cdr3_end INT,
--     np1 VARCHAR(100),
--     np1_length INT,
--     np2 VARCHAR(100),
--     np2_length INT,
--     run_number VARCHAR(100),
--     container ENTITYID NOT NULL,
--
--     CONSTRAINT PK_cds_import_alignment_alignment_id PRIMARY KEY (alignment_id),
--     CONSTRAINT FK_cds_import_alignment_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.import_sequence (sequence_id),
--     CONSTRAINT FK_cds_import_alignment_run_number FOREIGN KEY (run_number) REFERENCES cds.import_run_log (run_number)
-- );

CREATE TABLE cds.alignment
(
    alignment_id SERIAL,
    sequence_id VARCHAR(100),
    locus VARCHAR(10),
    stop_codon VARCHAR(1),
    vj_in_frame VARCHAR(1),
    productive VARCHAR(1),
    rev_comp VARCHAR(1),
    complete_vdj VARCHAR(1),
    v_call VARCHAR(25),
    d_call VARCHAR(25),
    j_call VARCHAR(25),
    sequence_alignment VARCHAR(1000),
    germline_alignment VARCHAR(1000),
    sequence_alignment_aa VARCHAR(1000),
    germline_alignment_aa VARCHAR(1000),
    v_alignment_start INT,
    v_alignment_end INT,
    d_alignment_start INT,
    d_alignment_end INT,
    j_alignment_start INT,
    j_alignment_end INT,
    v_sequence_alignment VARCHAR(1000),
    v_sequence_alignment_aa VARCHAR(1000),
    v_germline_alignment VARCHAR(1000),
    v_germline_alignment_aa VARCHAR(1000),
    d_sequence_alignment VARCHAR(100),
    d_sequence_alignment_aa VARCHAR(100),
    d_germline_alignment VARCHAR(100),
    d_germline_alignment_aa VARCHAR(100),
    j_sequence_alignment VARCHAR(100),
    j_sequence_alignment_aa VARCHAR(100),
    j_germline_alignment VARCHAR(100),
    j_germline_alignment_aa VARCHAR(100),
    fwr1 VARCHAR(100),
    fwr1_aa VARCHAR(100),
    cdr1 VARCHAR(100),
    cdr1_aa VARCHAR(100),
    fwr2 VARCHAR(100),
    fwr2_aa VARCHAR(100),
    cdr2 VARCHAR(100),
    cdr2_aa VARCHAR(100),
    fwr3 VARCHAR(1000),
    fwr3_aa VARCHAR(100),
    fwr4 VARCHAR(100),
    fwr4_aa VARCHAR(100),
    cdr3 VARCHAR(100),
    cdr3_aa VARCHAR(100),
    junction VARCHAR(100),
    junction_length INT,
    junction_aa VARCHAR(100),
    junction_aa_length INT,
    v_score NUMERIC(15,4),
    d_score NUMERIC(15,4),
    j_score NUMERIC(15,4),
    v_cigar VARCHAR(1000),
    d_cigar VARCHAR(1000),
    j_cigar VARCHAR(1000),
    v_support NUMERIC(15,4),
    d_support NUMERIC(15,4),
    j_support NUMERIC(15,4),
    v_identity NUMERIC(15,4),
    d_identity NUMERIC(15,4),
    j_identity NUMERIC(15,4),
    v_sequence_start INT,
    v_sequence_end INT,
    v_germline_start INT,
    v_germline_end INT,
    d_sequence_start INT,
    d_sequence_end INT,
    d_germline_start INT,
    d_germline_end INT,
    j_sequence_start INT,
    j_sequence_end INT,
    j_germline_start INT,
    j_germline_end INT,
    fwr1_start INT,
    fwr1_end INT,
    cdr1_start INT,
    cdr1_end INT,
    fwr2_start INT,
    fwr2_end INT,
    cdr2_start INT,
    cdr2_end INT,
    fwr3_start INT,
    fwr3_end INT,
    fwr4_start INT,
    fwr4_end INT,
    cdr3_start INT,
    cdr3_end INT,
    np1 VARCHAR(100),
    np1_length INT,
    np2 VARCHAR(100),
    np2_length INT,
    run_number VARCHAR(100),
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_alignment_alignment_id PRIMARY KEY (alignment_id),
    CONSTRAINT FK_cds_alignment_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence(sequence_id),
    CONSTRAINT FK_cds_alignment_run_number FOREIGN KEY (run_number) REFERENCES cds.run_log(run_number)
);

CREATE INDEX IX_cds_alignment_sequence_id ON cds.alignment(sequence_id);
CREATE INDEX IX_cds_alignment_run_number ON cds.alignment(run_number);