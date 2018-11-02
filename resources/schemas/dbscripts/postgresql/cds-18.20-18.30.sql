ALTER TABLE cds.import_NABMAb ALTER COLUMN slope TYPE double precision;
ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_slope TYPE double precision;
ALTER TABLE cds.mAbGridBase ALTER COLUMN titer_curve_ic50 TYPE double precision;

ALTER TABLE cds.import_ics ADD COLUMN functionality_score double precision;
ALTER TABLE cds.import_ics ADD COLUMN polyfunctionality_score double precision;
ALTER TABLE cds.import_studysubject ADD COLUMN subject_gender_identity VARCHAR(250);
ALTER TABLE cds.import_studysubject ADD COLUMN subject_study_cohort VARCHAR(250);

ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_type VARCHAR(250);
ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_name_other VARCHAR(250);
ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_lanlid VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_type VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_name_other VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_lanlid VARCHAR(250);
ALTER TABLE cds.mAbMetaGridBase ADD COLUMN mab_mix_type VARCHAR(250);

CREATE TABLE cds.studymAb (
  prot VARCHAR(250) NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,

  CONSTRAINT pk_studymab PRIMARY KEY (container, prot, mab_mix_id)
);