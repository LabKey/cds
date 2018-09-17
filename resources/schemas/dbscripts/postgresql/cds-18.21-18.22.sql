ALTER TABLE cds.import_ics ADD COLUMN functionality_score double precision;
ALTER TABLE cds.import_ics ADD COLUMN polyfunctionality_score double precision;
ALTER TABLE cds.import_studysubject ADD COLUMN subject_gender_identity VARCHAR(250);
ALTER TABLE cds.import_studysubject ADD COLUMN subject_study_cohort VARCHAR(250);