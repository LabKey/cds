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
  -- KEYS
  dd.prot AS study_prot,
  dd.prot,
  dd.subject_id AS participantid,

  -- VARCHAR
  dd.subject_species AS species,
  dd.subject_subspecies AS subspecies,
  dd.subject_sex_at_birth AS sexatbirth,
  dd.subject_gender_identity AS genderidentity,
  dd.subject_race_nih AS race,
  dd.subject_hispanic AS ethnicity,
  dd.subject_country_enrollment AS country_enrollment,
  dd.subject_circumcised_enrollment AS circumcised_enrollment,
  dd.subject_study_cohort AS studycohort,

  -- INTEGER
  CAST(ROUND(10 * Floor(dd.subject_age_enrollment_years / 10.0)) AS VARCHAR) || '-' || CAST(ROUND((10 * Floor(dd.subject_age_enrollment_years / 10.0)) + 9) AS VARCHAR) AS agegroup_range,
  CAST(ROUND(10 * Floor(dd.subject_age_enrollment_years / 10.0)) AS INTEGER) AS agegroup_enrollment,
  dd.subject_age_enrollment_years AS age_enrollment,
  -- import_demographics.subject_bmi_enrollment AS bmi,

  -- STUDY RELATED
  istudy.study_label,
  istudy.study_short_name,
  istudy.study_start_date,
  istudy.study_first_enr_date,
  istudy.study_fu_complete_date,
  istudy.study_public_date,
  istudy.network AS study_network,
  istudy.study_grant_pi_name AS study_grant_pi_name,
  istudy.study_strategy AS study_strategy,
  it.study_arm_last_exp_vacc_day AS study_last_vaccination_day,
  istudy.study_type,

  -- TREATMENT RELATED
  it.study_part,
  it.study_group,
  it.study_arm,
  -- NOTE: this is duplicated from ds_treatmentarm.sql with the exception of including the study label prefix (issue 24492)
  CASE WHEN (it.study_group = it.study_arm) THEN (istudy.study_label || ' Group ' || it.study_group || ' ' || it.study_randomization) -- e.g. Group 1 Vaccine
  ELSE
        CASE WHEN (it.study_group LIKE 'Group%' OR it.study_group LIKE 'group%')
        THEN (istudy.study_label || ' ' || it.study_group || ' Arm ' || it.study_arm || ' ' || it.study_randomization) -- e.g. Group 1 Arm 2 Vaccine
        ELSE (istudy.study_label || ' Group ' || it.study_group || ' Arm ' || it.study_arm || ' ' || it.study_randomization) -- e.g. Group 1 Arm 2 Vaccine
        END
  END AS study_arm_summary,
  it.study_arm_description_coded_label AS study_arm_coded_label,
  it.study_randomization,
  it.product_class_combination_label AS study_product_class_combination,
  it.product_combination_label AS study_product_combination

FROM cds.import_studysubject AS dd
LEFT JOIN cds.import_study AS istudy
  ON istudy.prot = dd.prot
LEFT JOIN cds.import_studypartgrouparmsubject AS its
  ON its.prot = dd.prot AND its.subject_id = dd.subject_id
LEFT JOIN cds.import_studypartgrouparm it
  ON it.prot = dd.prot AND it.study_part = its.study_part
    AND it.study_group = its.study_group AND it.study_arm = its.study_arm
