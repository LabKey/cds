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
  dd.prot,
  0 AS sequencenum,
  dd.mab_mix_id AS participantid,
  dd.mab_mix_id,
  dd.mab_name_source,
  dd.summary_level,
  dd.target_cell,
  dd.assay_identifier,
  dd.mab_concentration,
  dd.mab_concentration_units,
  dd.specimen_concentration_id,
  dd.curve_id,
  dd.specimen_type,
  dd.lab_code,
  na.virus,
  dd.initial_concentration,
  dd.min_concentration,
  dd.max_concentration,
  dd.percent_neutralization,
  dd.neutralization_plus_minus,
  dd.min_well_value,
  dd.max_well_value,
  dd.mean_well_value,
  dd.well_std_dev,
  dd.titer_curve_ic50,
  dd.titer_curve_ic80,
  dd.nab_response_ic50,
  dd.nab_response_ic80,
  dd.titer_point_ic50,
  dd.titer_point_ic80,
  dd.slope,
  na.virus_type,
  na.virus_full_name,
  na.virus_species,
  na.virus_host_cell,
  na.virus_backbone,
  dd.virus_dilution,
  na.clade,
  na.neutralization_tier,
  -- Delimiter has to match ChartUtil.ANTIGEN_LEVEL_DELIMITER
  (CASE WHEN na.neutralization_tier IS NULL THEN 'null' ELSE na.neutralization_tier END)
  || '|||' || (CASE WHEN na.clade IS NULL THEN 'null' ELSE na.clade END)
  || '|||' || (CASE WHEN na.virus IS NULL THEN 'null' ELSE na.virus END)
    AS tier_clade_virus,
  dd.fit_min,
  dd.fit_max,
  dd.fit_asymmetry,
  dd.fit_slope,
  dd.fit_inflection,
  dd.fit_error,
  dd.vaccine_matched

FROM cds.import_NABMAb AS dd left join cds.import_nabantigen na on na.cds_virus_id = dd.cds_virus_id AND na.assay_identifier = dd.assay_identifier