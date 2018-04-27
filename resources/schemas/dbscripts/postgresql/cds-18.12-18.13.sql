/* Materialize the mabgridbase query */
DROP TABLE IF EXISTS cds.mAbGridBase;

CREATE TABLE cds.mAbGridBase (
  mab_mix_id VARCHAR(250),
  mab_mix_name_std VARCHAR(250),
  study VARCHAR(250),
  virus VARCHAR(250),
  clade VARCHAR(250),
  neutralization_tier VARCHAR(250),
  tier_clade_virus VARCHAR(250),
  titer_ic50 NUMERIC(15,4),
  container ENTITYID,

  CONSTRAINT PK_mAbGridBase PRIMARY KEY (container, mab_mix_id, tier_clade_virus)
);