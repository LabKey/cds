ALTER TABLE cds.MabMetadata RENAME COLUMN mab_lanlid to mab_lanl_id;

-- drop FK constraints to cds.mabMetadata
ALTER TABLE cds.MAbMix DROP CONSTRAINT MAbMix_mab_id_fkey;
ALTER TABLE cds.donor_mab_sequence DROP CONSTRAINT FK_donor_mab_sequence_mab_id;
ALTER TABLE cds.antibody_structure DROP CONSTRAINT FK_antibody_structure_mab_id;

-- rename mabMetadata table
ALTER TABLE cds.MabMetadata RENAME TO mab_metadata;

-- re-add FK constraints to mab_metadata
ALTER TABLE cds.MAbMix ADD CONSTRAINT MAbMix_mab_id_fkey FOREIGN KEY (container, mab_id) REFERENCES cds.mab_metadata (container, mab_id);
ALTER TABLE cds.donor_mab_sequence ADD CONSTRAINT FK_donor_mab_sequence_mab_id FOREIGN KEY (mab_id, container) REFERENCES cds.mab_metadata (mab_id, container);
ALTER TABLE cds.antibody_structure ADD CONSTRAINT FK_antibody_structure_mab_id FOREIGN KEY (mab_id, container) REFERENCES cds.mab_metadata (mab_id, container);
