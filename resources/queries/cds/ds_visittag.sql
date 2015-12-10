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
DISTINCT arm_visit.study_arm_visit_type AS Name,
arm_visit.study_arm_visit_type AS caption,
FALSE AS SingleUse
FROM cds.import_studypartgrouparmvisit AS arm_visit
WHERE study_arm_visit_type IS NOT NULL

UNION

SELECT
DISTINCT arm_visit.study_arm_visit_label AS Name,
arm_visit.study_arm_visit_label AS caption,
TRUE AS SingleUse
FROM cds.import_studypartgrouparmvisit AS arm_visit
WHERE study_arm_visit_label IS NOT NULL