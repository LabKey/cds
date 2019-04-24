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
--Returns all the visits that appear in the datasets that do not appear in the studypartgrouparmvisit table.
--Expected to return 0 rows.
SELECT
subject_id,
assay_type,
study_day
FROM (
   SELECT
   MQ.subject_id,
   MQ.assay_type,
   MQ.prot || '-' || IQ.study_arm || '-' || IQ.study_group || '-' || MQ.study_day AS visit,
   MQ.study_day
   FROM
      (SELECT DISTINCT
      subject_id,
      prot,
      study_day,
      'BAMA' as assay_type
      FROM import_bama

      UNION

      SELECT DISTINCT
      subject_id,
      prot,
      study_day,
      'ELISPOT' as assay_type
      FROM import_els_ifng

      UNION

      SELECT DISTINCT
      subject_id,
      prot,
      study_day,
      'ICS' as assay_type
      FROM import_ics

      UNION

      SELECT DISTINCT
      subject_id,
      prot,
      study_day,
      'NAB' as assay_type
      FROM import_nab

      UNION

      SELECT DISTINCT
      subject_id,
      prot,
      study_day,
      'PKMAB' as assay_type
      FROM import_pkmab
      ) AS MQ
   LEFT JOIN
       import_studypartgrouparmsubject AS IQ
   ON MQ.subject_id = IQ.subject_id
) AS recorded_visits
LEFT JOIN (
   SELECT DISTINCT
     prot || '-' || study_arm || '-' || study_group || '-' || study_day AS visit
   FROM import_studypartgrouparmvisit
) AS possible_visits
ON recorded_visits.visit=possible_visits.visit
WHERE possible_visits.visit IS NULL