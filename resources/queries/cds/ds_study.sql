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
-- KEYS
import_study.prot AS study_name,
containers.EntityId AS container,

-- VARCHAR
import_study.network,
import_study.study_label AS label,
import_study.study_short_name AS short_name,
import_study.study_title AS title,
import_study.study_type AS type,
import_study.study_status AS status,
import_study.study_stage AS stage,
import_study.study_species AS species,
import_study.study_population AS population,
import_study.study_primary_poc_name AS primary_poc_name,
import_study.study_primary_poc_email AS primary_poc_email,
import_study.study_grant_pi_name AS grant_pi_name,
import_study.study_grant_pi_email AS grant_pi_email,
import_study.study_grant_pm_name AS grant_pm_name,
import_study.study_grant_pm_email AS grant_pm_email,
import_study.study_investigator_name AS investigator_name,
import_study.study_investigator_email AS investigator_email,
import_study.study_strategy AS strategy,

-- DATE
import_study.study_first_enr_date AS first_enr_date,
import_study.study_fu_complete_date AS followup_complete_date,
import_study.study_start_date AS start_date,
import_study.study_public_date AS public_date,

-- TEXT
import_study.study_rationale AS rationale,
import_study.study_description AS description,
import_study.study_hypothesis AS hypothesis,
import_study.study_objectives AS objectives,
import_study.study_methods AS methods,
import_study.study_findings AS findings,
import_study.study_discussion AS discussion,
import_study.study_context AS context,
import_study.cavd_affiliation AS cavd_affiliation,
import_study.treatment_schema_link AS treatment_schema_link,
import_study.assay_schema_link AS assay_schema_link,
import_study.study_groups AS groups,
import_study.study_conclusions AS conclusions,
import_study.study_publications AS publications,
import_study.study_executive_summary AS executive_summary,
import_study.study_data_availability AS data_availability,
import_study.atlas_link AS atlas_link,
import_study.cavd_link AS cavd_link

FROM cds.import_study AS import_study
JOIN core.containers AS containers ON (containers.name = import_study.prot)
