ALTER TABLE cds.import_assay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.import_assay ADD COLUMN provenance_summary TEXT;

ALTER TABLE cds.assay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.assay ADD COLUMN provenance_summary TEXT;