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
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot,

-- DIMENSIONS
summary_level,
specimen_type,
assay_identifier,
antigen,
antigen_type,
cell_type,
cell_name,
clade,
protein_panel,
protein,
peptide_pool,
protein_panel || '|' || protein AS protein_panel_protein,
protein_panel || '|' || protein || '|' || peptide_pool AS protein_panel_protein_peptide_pool,
vaccine_matched,
functional_marker_name,
functional_marker_type,

-- LOOKUPS
els_ifng_lab_source_key,
lab_code,
exp_assayid,

-- MEASURES
els_ifng_response AS response_call,
mean_sfc,
mean_sfc_neg,
mean_sfc_raw,

FROM cds.import_ELS_IFNg;