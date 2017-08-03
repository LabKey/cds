ALTER TABLE cds.import_studyassay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.import_studyassay ADD COLUMN provenance_summary TEXT;

ALTER TABLE cds.studyassay ADD COLUMN provenance_source VARCHAR(250);
ALTER TABLE cds.studyassay ADD COLUMN provenance_summary TEXT;