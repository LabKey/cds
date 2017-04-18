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

--Returns all the study arms that have the same single-use visit tag defined for more than one visit.
--Expected to return 0 rows.
SELECT * FROM (
   SELECT prot, study_group, study_arm,
   'Enrollment' AS visit_tag,
   count(*) AS assignment_count
   FROM cds.import_studypartgrouparmvisit
   WHERE enrollment
   GROUP BY prot, study_group, study_arm

   UNION

   SELECT prot, study_group, study_arm,
   'Last Vaccination' AS visit_tag,
   count(*) AS assignment_count
   FROM cds.import_studypartgrouparmvisit
   WHERE lastvacc
   GROUP BY prot, study_group, study_arm

   UNION

   SELECT prot, study_group, study_arm,
   'First Vaccination' AS visit_tag,
   count(*) AS assignment_count
   FROM cds.import_studypartgrouparmvisit
   WHERE firstvacc
   GROUP BY prot, study_group, study_arm
) X
WHERE assignment_count > 1