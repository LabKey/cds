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
SELECT
  mab.prot,
  mab.mab_mix_id,
  MixMeta.mab_mix_name_std,
  MixMeta.mab_mix_label,
  mab.mab_name_source,
  mab.summary_level,
  mab.target_cell,
  mab.assay_identifier,
  mab.mab_concentration,
  mab.mab_concentration_units,
  mab.specimen_concentration_id,
  mab.curve_id,
  mab.specimen_type,
  mab.lab_code,
  mab.virus,
  mab.initial_concentration,
  mab.min_concentration,
  mab.max_concentration,
  mab.percent_neutralization,
  mab.neutralization_plus_minus,
  mab.min_well_value,
  mab.max_well_value,
  mab.mean_well_value,
  mab.well_std_dev,
  mab.titer_curve_ic50,
  mab.titer_curve_ic80,
  mab.nab_response_ic50,
  mab.nab_response_ic80,
  mab.titer_point_ic50,
  mab.titer_point_ic80,
  mab.slope,
  mab.virus_type,
  mab.virus_dilution,
  mab.clade,
  mab.neutralization_tier,
  mab.tier_clade_virus,
  mab.fit_min,
  mab.fit_max,
  mab.fit_asymmetry,
  mab.fit_slope,
  mab.fit_inflection,
  mab.fit_error,
  mab.vaccine_matched

FROM study.NABMAb as mab
  LEFT JOIN cds.MAbMixMetadata as MixMeta on (MixMeta.mab_mix_id = mab.mab_mix_id)