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
    bama.assay_identifier,
    bama.cds_ag_id,
    bama.antigen_full_name,
    bama.antigen_short_name,
    bama.antigen_plot_label,
    bama.antigen_name_other,
    bama.dna_construct_id,
    bama.antigen_type_component,
    bama.antigen_category,
    bama.antigen_type_region,
    bama.antigen_type_scaffold,
    bama.antigen_type_modifiers,
    bama.antigen_type_tags,
    bama.antigen_type_differentiate,
    bama.antigen_control,
    bama.isolate_name_component,
    bama.isolate_species,
    bama.isolate_donor_id,
    bama.isolate_differentiate,
    bama.isolate_clade,
    bama.isolate_clone,
    bama.isolate_mutations,
    bama.isolate_cloner_pi,
    bama.isolate_country_origin,
    bama.isolate_yr_isolated,
    bama.isolate_fiebig_stage,
    bama.isolate_accession_num,
    bama.production_component,
    bama.production_host_cell,
    bama.production_purification_method,
    bama.production_special_reagent,
    bama.production_manufacturer,
    bama.production_codon_optimization,
    bama.transfection_method,
    bama.transmitter_founder_status,
    GROUP_CONCAT(DISTINCT apm.panel_name, '|') AS panel_names
FROM cds.bamaantigen bama
     LEFT JOIN cds.antigenPanel ap ON ap.cds_ag_id = bama.cds_ag_id
     LEFT JOIN cds.antigenPanelMeta apm ON apm.cds_panel_id = ap.cds_panel_id

GROUP BY
    bama.assay_identifier,
    bama.cds_ag_id,
    bama.antigen_full_name,
    bama.antigen_short_name,
    bama.antigen_plot_label,
    bama.antigen_name_other,
    bama.dna_construct_id,
    bama.antigen_type_component,
    bama.antigen_category,
    bama.antigen_type_region,
    bama.antigen_type_scaffold,
    bama.antigen_type_modifiers,
    bama.antigen_type_tags,
    bama.antigen_type_differentiate,
    bama.antigen_control,
    bama.isolate_name_component,
    bama.isolate_species,
    bama.isolate_donor_id,
    bama.isolate_differentiate,
    bama.isolate_clade,
    bama.isolate_clone,
    bama.isolate_mutations,
    bama.isolate_cloner_pi,
    bama.isolate_country_origin,
    bama.isolate_yr_isolated,
    bama.isolate_fiebig_stage,
    bama.isolate_accession_num,
    bama.production_component,
    bama.production_host_cell,
    bama.production_purification_method,
    bama.production_special_reagent,
    bama.production_manufacturer,
    bama.production_codon_optimization,
    bama.transfection_method,
    bama.transmitter_founder_status