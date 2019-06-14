/*
 * Copyright (c) 2019 LabKey Corporation
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
       'PKMAB' as assay_type,
       study_day,
       visit_code,
       possible_visittimes.visit
FROM (
     SELECT DISTINCT
            MQ.subject_id,
            MQ.prot || '-' || IQ.study_arm || '-' || IQ.study_group || '-' || MQ.study_day || '-' || MQ.visit_code AS visit,
            MQ.study_day,
            MQ.visit_code
     FROM import_pkmab AS MQ
     LEFT JOIN
          import_studypartgrouparmsubject AS IQ
              ON MQ.subject_id = IQ.subject_id AND MQ.container = IQ.container
     ) AS recorded_visittimes
       LEFT JOIN (
                 SELECT DISTINCT
                                 prot || '-' || study_arm || '-' || study_group || '-' || study_day || '-' || visit_code visit
                 FROM import_studypartgrouparmvisittime
                 ) AS possible_visittimes
         ON recorded_visittimes.visit=possible_visittimes.visit
WHERE possible_visittimes.visit IS NULL;