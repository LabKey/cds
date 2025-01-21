-- drop constraints to cds.pab_sequence
ALTER TABLE cds.pab_sequence DROP CONSTRAINT PK_pab_sequence;
ALTER TABLE cds.pab_sequence DROP CONSTRAINT FK_pab_sequence_sequence_id;
DROP INDEX IF EXISTS cds.IX_pab_sequence_sequence_id;

ALTER TABLE cds.pab_sequence RENAME COLUMN pab_id TO bcr_study_seq_id;
ALTER TABLE cds.pab_sequence RENAME TO bcr_sequence;

-- re-add constraints
ALTER TABLE cds.bcr_sequence ADD CONSTRAINT PK_bcr_sequence PRIMARY KEY (bcr_study_seq_id, sequence_id, container);
ALTER TABLE cds.bcr_sequence ADD CONSTRAINT FK_bcr_sequence_sequence_id FOREIGN KEY (sequence_id) REFERENCES cds.sequence (sequence_id);
CREATE INDEX IX_bcr_sequence_sequence_id ON cds.bcr_sequence(sequence_id);