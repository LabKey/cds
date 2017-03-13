
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN enrollment BOOLEAN DEFAULT FALSE;
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN firstvacc BOOLEAN DEFAULT FALSE;
ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN lastvacc BOOLEAN DEFAULT FALSE;

ALTER TABLE cds.GridBase ADD COLUMN FirstVaccinationDay INT;