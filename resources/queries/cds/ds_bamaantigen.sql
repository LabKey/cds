/*
 * Copyright (c) 2015 LabKey Corporation
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
  assay_identifier,
  cds_ag_id,
  antigen_full_name,
  antigen_short_name,
  antigen_plot_label,
  antigen_name_other,
  dna_construct_id,
  antigen_type_component,
  antigen_category,
  antigen_type_region,
  antigen_type_scaffold,
  antigen_type_modifiers,
  antigen_type_tags,
  antigen_type_differentiate,
  antigen_control,
  isolate_name_component,
  isolate_species,
  isolate_donor_id,
  isolate_differentiate,
  isolate_clade,
  isolate_clone,
  isolate_mutations,
  isolate_cloner_pi,
  isolate_country_origin,
  isolate_yr_isolated,
  isolate_fiebig_stage,
  isolate_accession_num,
  production_component,
  production_host_cell,
  production_purification_method,
  production_special_reagent,
  production_manufacturer,
  production_codon_optimization,
  transfection_method,
  transmitter_founder_status
FROM cds.import_BAMAAntigen