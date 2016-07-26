CREATE TABLE cds.StudyPartGroupArmProduct (
  prot VARCHAR(250) NOT NULL REFERENCES cds.Study (prot),
  container ENTITYID NOT NULL,
  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  product_id INTEGER NOT NULL REFERENCES cds.Product (product_id),

  CONSTRAINT PK_StudyPartGroupArmProduct PRIMARY KEY (prot, study_part, study_group, study_arm, product_id)
);