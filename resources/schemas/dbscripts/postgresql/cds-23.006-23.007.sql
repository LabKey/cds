TRUNCATE TABLE cds.sequence_germline CASCADE;
TRUNCATE TABLE cds.allele_sequence CASCADE;
TRUNCATE TABLE cds.alignment CASCADE;
TRUNCATE TABLE cds.alignment_run CASCADE;
TRUNCATE TABLE cds.sequence_header CASCADE;
TRUNCATE TABLE cds.header_source CASCADE;
TRUNCATE TABLE cds.antibody_sequence CASCADE;
TRUNCATE TABLE cds.antibody_class CASCADE;
TRUNCATE TABLE cds.sequence CASCADE;

ALTER TABLE cds.sequence_germline ADD CONSTRAINT FK_cds_sequence_germline_allele FOREIGN KEY (allele) REFERENCES cds.allele_sequence (allele);
CREATE INDEX IX_cds_sequence_germline_allele ON cds.sequence_germline (allele);

ALTER TABLE cds.alignment ADD CONSTRAINT FK_cds_alignment_v_call FOREIGN KEY (v_call) REFERENCES cds.allele_sequence (allele);
CREATE INDEX IX_cds_alignment_v_call ON cds.alignment (v_call);

ALTER TABLE cds.alignment ADD CONSTRAINT FK_cds_alignment_d_call FOREIGN KEY (d_call) REFERENCES cds.allele_sequence (allele);
CREATE INDEX IX_cds_alignment_d_call ON cds.alignment (d_call);

ALTER TABLE cds.alignment ADD CONSTRAINT FK_cds_alignment_j_call FOREIGN KEY (j_call) REFERENCES cds.allele_sequence (allele);
CREATE INDEX IX_cds_alignment_j_call ON cds.alignment (j_call);

ALTER TABLE cds.sequence_germline ADD CONSTRAINT FK_cds_sequence_germline_run_application FOREIGN KEY (run_application) REFERENCES cds.alignment_run (run_application);
CREATE INDEX IX_cds_sequence_germline_run_application ON cds.sequence_germline (run_application);

ALTER TABLE cds.alignment ADD CONSTRAINT FK_cds_alignment_run_application FOREIGN KEY (run_application) REFERENCES cds.alignment_run (run_application);
CREATE INDEX IX_cds_alignment_run_application ON cds.alignment (run_application);

ALTER TABLE cds.sequence_header ADD CONSTRAINT FK_cds_sequence_header_source_id FOREIGN KEY (source_id) REFERENCES cds.header_source (source_id);
CREATE INDEX IX_cds_sequence_header_source_id ON cds.sequence_header(source_id);

ALTER TABLE cds.antibody_sequence ADD CONSTRAINT FK_cds_antibody_sequence_mab_id FOREIGN KEY (container, mab_id) REFERENCES cds.mabmetadata (container, mab_id);
CREATE INDEX IX_cds_antibody_sequence_mab_id ON cds.antibody_sequence (container, mab_id);

ALTER TABLE cds.mabmetadata ADD CONSTRAINT FK_cds_mabmetadata_mab_class_id FOREIGN KEY (mab_class_id) REFERENCES cds.antibody_class (mab_class_id);
CREATE INDEX IX_cds_mabmetadata_mab_class_id ON cds.mabmetadata (mab_class_id);

ALTER TABLE cds.import_MAbMix DROP CONSTRAINT import_MAbMix_mab_id_fkey;
DROP TABLE cds.import_mabmetadata;