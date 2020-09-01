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
subject_id AS participantid,
CAST(study_day AS DOUBLE) AS sequencenum,
study_day AS visit_day,
prot AS study_prot,
prot,

-- DIMENSIONS
assay_identifier,
exp_assayid,
specimen_type,
antigen,
antigen_type,
antibody_isotype,
summary_level,
protein,
protein_panel,
clade,
vaccine_matched,
detection_ligand,
instrument_code,
lab_code,
bama_lab_source_key,
dilution,

-- MEASURES
bama_response AS response_call,
mfi_delta,
mfi_delta_baseline,
mfi_raw,
mfi_raw_baseline,
mfi_blank,
mfi_blank_baseline,
mfi_bkgd,
mfi_bkgd_blank,
auc

FROM cds.import_bama