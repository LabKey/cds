-- This is a running set of the changes in this branch. In the end this will be
-- rolled up into an upgrade script.

DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitTag CASCADE;

ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN ischallvis BOOLEAN DEFAULT FALSE;

ALTER TABLE cds.import_NAb DROP COLUMN titer_ic50;
ALTER TABLE cds.import_NAb ADD COLUMN titer_ic50 NUMERIC(15,4);

ALTER TABLE cds.import_NAb DROP COLUMN titer_ic80;
ALTER TABLE cds.import_NAb ADD COLUMN titer_ic80 NUMERIC(15,4);

ALTER TABLE cds.import_NAb DROP COLUMN initial_dilution;
ALTER TABLE cds.import_NAb ADD COLUMN initial_dilution NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc_neg;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc_neg NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc_raw;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc_raw NUMERIC(15,4);