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