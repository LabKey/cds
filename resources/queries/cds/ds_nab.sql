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
nab.subject_id AS participantid,
CAST(nab.study_day AS DOUBLE) AS sequencenum,
nab.study_day AS visit_day,
nab.prot AS study_prot,
nab.prot,
nab.assay_identifier,

-- DIMENSIONS
nab.summary_level,
nab.specimen_type,
na.antigen_name as antigen,
na.antigen_type,
na.neutralization_tier,
na.clade,
-- Delimiter has to match ChartUtil.ANTIGEN_LEVEL_DELIMITER
(CASE WHEN na.neutralization_tier IS NULL THEN 'null' ELSE na.neutralization_tier END)
  || '|||' || (CASE WHEN na.clade IS NULL THEN 'null' ELSE na.clade END)
  || '|||' || (CASE WHEN na.virus IS NULL THEN 'null' ELSE na.virus END)
  AS tier_clade_virus,
nab.vaccine_matched,
na.target_cell,
nab.initial_dilution,
na.virus,
na.virus_type,
na.virus_full_name,
na.virus_species,
na.virus_host_cell,
na.virus_backbone,
na.virus_insert_name,

-- LOOKUPS
nab.nab_lab_source_key,
nab.exp_assayid,
nab.lab_code,

-- MEASURES
nab.nab_response AS response_call,
nab.titer_ic50,
nab.titer_ic80,
nab.nab_response_ID50,
nab.nab_response_ID80,
nab.titer_ID50,
nab.titer_ID80,
nab.slope

FROM cds.import_nab nab left join cds.import_nabantigen na on na.cds_virus_id = nab.cds_virus_id