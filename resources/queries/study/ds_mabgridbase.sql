/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
select
  MAB.mab_mix_id,
  MAB.container,
  prot as study,
  virus,
  clade,
  neutralization_tier,
  tier_clade_virus,
  titer_curve_ic50,

  CASE WHEN titer_curve_ic50 < 0.1 OR titer_curve_ic50 = CAST('-Infinity' AS DOUBLE)
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

  curve_id,

  MixMeta.mab_mix_name_std
FROM study.NABMAb as MAB
  LEFT JOIN cds.MAbMixMetadata as MixMeta on (MixMeta.mab_mix_id = MAB.mab_mix_id)
where MAB.specimen_concentration_id = 8;