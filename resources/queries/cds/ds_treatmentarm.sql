/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
(prot || '-' || study_part || '-' || study_group || '-' || study_arm) AS arm_id,
subCont.EntityId AS container,
study_part AS arm_part,
study_group AS arm_group,
study_arm AS arm_name,
study_randomization AS randomization,
study_arm_description AS description,
-- Ignoring study_part for now
CASE WHEN (study_group = study_arm)
THEN ('Group ' || study_group || ' ' || study_randomization) -- e.g. Group 1 Vaccine
ELSE
      CASE WHEN (study_group LIKE 'Group%' OR study_group LIKE 'group%')
      THEN (study_group || ' Arm ' || study_arm || ' ' || study_randomization) -- e.g. Group 1 Arm 2 Vaccine
      ELSE ('Group ' || study_group || ' Arm ' || study_arm || ' ' || study_randomization) -- e.g. Group 1 Arm 2 Vaccine
      END
END AS coded_label,
-- study_arm_description_coded_label AS coded_label,
study_arm_last_exp_vacc_day AS last_day,
prot
FROM
cds.import_studypartgrouparm AS arm
JOIN core.containers AS subCont ON (subCont.name = arm.prot AND arm.container = subCont.parent)