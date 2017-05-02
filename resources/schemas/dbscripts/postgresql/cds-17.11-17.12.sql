DROP TABLE cds.studyrelationshiporder;

ALTER TABLE cds.import_studydocument ADD COLUMN access_level VARCHAR(250);
ALTER TABLE cds.studydocument ADD COLUMN access_level VARCHAR(250);