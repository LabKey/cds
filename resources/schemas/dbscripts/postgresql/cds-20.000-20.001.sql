ALTER TABLE cds.import_study ADD COLUMN study_specimen_repository VARCHAR(250);
ALTER TABLE cds.study ADD COLUMN specimen_repository_label VARCHAR(250);