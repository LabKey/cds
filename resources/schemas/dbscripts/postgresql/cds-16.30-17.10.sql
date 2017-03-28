/* cds-16.30-16.31.sql */

ALTER TABLE cds.import_study ADD COLUMN study_clintrials_id VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN clintrials_id VARCHAR(250);

/* cds-16.31-16.32.sql */

ALTER TABLE cds.GridBase ADD COLUMN EnrollmentDay INT;
ALTER TABLE cds.GridBase ADD COLUMN LastVaccinationDay INT;