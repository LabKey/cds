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
antigen,
antigen_type,
neutralization_tier,
clade,
(CASE WHEN neutralization_tier IS NULL THEN 'null' ELSE neutralization_tier END)
  || '|' || (CASE WHEN clade IS NULL THEN 'null' ELSE clade END)
  || '|' || (CASE WHEN virus IS NULL THEN 'null' ELSE virus END)
  AS tier_clade_virus,
vaccine_matched,
target_cell,
initial_dilution,
virus,
virus_type,
virus_insert_name,

-- LOOKUPS
nab_lab_source_key,
exp_assayid,
lab_code,

-- MEASURES
nab_response AS response_call,
titer_ic50,
titer_ic80,

FROM cds.import_nab;