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
DISTINCT studygroup.row_id AS group_id,
visit.rowid AS visit_row_id,
arm_visit.prot
FROM cds.import_studypartgrouparmvisit AS arm_visit
JOIN ( SELECT * FROM cds.studygroup ) AS studygroup ON (studygroup.container.name = arm_visit.prot AND studygroup.group_name = arm_visit.study_group)
JOIN ( SELECT * FROM study.visit ) AS visit ON (visit.Folder.name = arm_visit.prot AND visit.sequencenummin = CAST(arm_visit.study_day AS DOUBLE))