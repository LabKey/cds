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
assay_identifier,

-- DIMENSIONS
summary_level,
specimen_type,
cell_type,
cell_name,
antigen,
antigen_type,
protein_panel,
protein,
peptide_pool,
(CASE WHEN protein_panel IS NULL THEN 'null' ELSE protein_panel END)
  || '|' || (CASE WHEN protein IS NULL THEN 'null' ELSE protein END)
  AS protein_panel_protein,
(CASE WHEN protein_panel IS NULL THEN 'null' ELSE protein_panel END)
  || '|' || (CASE WHEN protein IS NULL THEN 'null' ELSE protein END)
  || '|' || (CASE WHEN peptide_pool IS NULL THEN 'null' ELSE peptide_pool END)
  AS protein_panel_protein_peptide_pool,
functional_marker_name,
functional_marker_type,
clade,
vaccine_matched,

-- LOOKUPS
ics_lab_source_key,
exp_assayid,
lab_code,

-- MEASURES
ics_response AS response_call,
pctpos,
pctpos_adj,
pctpos_neg,

FROM cds.import_ics;