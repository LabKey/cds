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
  titer_curve_ic50,

  CASE WHEN titer_curve_ic50 < 0.1
    THEN 'G0.1'
  WHEN titer_curve_ic50 >= -0.1 AND titer_curve_ic50 < 1
    THEN 'G1'
  WHEN titer_curve_ic50 >= 1 AND titer_curve_ic50 < 10
    THEN 'G10'
  WHEN titer_curve_ic50 >= 10 AND titer_curve_ic50 <= 50
    THEN 'G50'
  ELSE 'G50+'
  END AS titer_curve_ic50_group,

  target_cell,
  lab_code,
  summary_level,

  to_char(initial_concentration, 'FM999999.99') as ic_key,

  MixMeta.mab_mix_name_std
FROM study.NABMAb as MAB
  LEFT JOIN cds.MAbMixMetadata as MixMeta on (MixMeta.mab_mix_id = MAB.mab_mix_id)
where MAB.specimen_concentration_id = 8
AND MAB.titer_curve_ic50 > 0 AND MAB.titer_curve_ic50 IS NOT NULL;