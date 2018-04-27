select
  MAB.mab_mix_id,
  MAB.container,
  prot as study,
  virus,
  clade,
  neutralization_tier,
  -- Delimiter has to match ChartUtil.ANTIGEN_LEVEL_DELIMITER
  (CASE WHEN neutralization_tier IS NULL THEN 'null' ELSE neutralization_tier END)
  || '|||' || (CASE WHEN clade IS NULL THEN 'null' ELSE clade END)
  || '|||' || (CASE WHEN virus IS NULL THEN 'null' ELSE virus END)
    AS tier_clade_virus,
  titer_ic50,

  MixMeta.mab_mix_name_std
FROM study.NABMAb as MAB
  LEFT JOIN cds.MAbMixMetadata as MixMeta on (MixMeta.mab_mix_id = MAB.mab_mix_id)
where MAB.specimen_concentration_id = 8
AND MAB.titer_ic50 > 0 AND MAB.titer_ic50 IS NOT NULL;