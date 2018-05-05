/*
 * Copyright (c) 2015-2017 LabKey Corporation
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
  dd.virus,
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
  dd.response_ic50 as nab_response_ic50,
  dd.response_ic80 as nab_response_ic80,
  dd.titer_point_ic50,
  dd.titer_point_ic80,
  dd.slope,
  dd.virus_type,
  dd.virus_dilution,
  dd.clade,
  dd.neutralization_tier,
  dd.fit_min,
  dd.fit_max,
  dd.fit_asymmetry,
  dd.fit_slope,
  dd.fit_inflection,
  dd.fit_error,
  dd.vaccine_matched

FROM cds.import_NABMAb AS dd;