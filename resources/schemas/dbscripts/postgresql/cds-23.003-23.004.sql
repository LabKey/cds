ALTER TABLE cds.alignment
    ALTER COLUMN cdr3 TYPE VARCHAR(200),
    ALTER junction TYPE VARCHAR(200),
    ALTER COLUMN np1 TYPE VARCHAR(200),
    ALTER COLUMN np2 TYPE VARCHAR(200);

CREATE TABLE cds.preferred_allele
(
    rowid SERIAL,
    sequence_id VARCHAR(100),
    allele VARCHAR(100),
    status BOOLEAN,
    note TEXT,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_cds_preferred_allele PRIMARY KEY (rowid),
    CONSTRAINT FK_cds_preferred_allele_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence(sequence_id),
    CONSTRAINT FK_cds_preferred_allele FOREIGN KEY (allele) REFERENCES cds.allele_sequence(allele)
);

CREATE INDEX IX_cds_preferred_allele_sequence_id ON cds.preferred_allele(sequence_id);
CREATE INDEX IX_cds_preferred_allele ON cds.preferred_allele(allele);
