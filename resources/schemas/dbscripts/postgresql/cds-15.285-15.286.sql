DELETE FROM cds.import_StudyPartGroupArmSubject;

ALTER TABLE cds.import_StudyPartGroupArmSubject ADD CONSTRAINT FK_ArmSubject_StudySubject FOREIGN KEY (prot, subject_id) REFERENCES cds.import_StudySubject (prot, subject_id) MATCH FULL;