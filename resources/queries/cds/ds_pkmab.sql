/*
 * Copyright (c) 2018 LabKey Corporation
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

       dd.visit_code,
       VT.visit_time_label,
       dd.source_assay,

       dd.assay_identifier,
       dd.summary_level,
       dd.specimen_type,
       dd.lab_code,

       dd.mab_mix_id,
       mixmeta.mab_mix_name_std,
       dd.mab_name_source,
       dd.mab_concentration,
       dd.mab_concentration_units

FROM cds.import_PKMAb AS dd
LEFT JOIN MAbMixMetadata mixmeta ON dd.mab_mix_id = mixmeta.mab_mix_id and dd.container = mixmeta.container
LEFT JOIN (
    SELECT * FROM
    (SELECT IP.subject_id,
            IP.prot || '-' || IQ.study_arm || '-' || IQ.study_group || '-' || IP.visit_code AS visit,
            IP.visit_code,
            recorded_visits.visit_time_label
     FROM (SELECT DISTINCT subject_id, visit_code FROM import_pkmab) AS IP
            LEFT JOIN import_studypartgrouparmsubject AS IQ
              ON IP.subject_id = IQ.subject_id AND IP.container = IQ.container) AS recorded_visits
        LEFT JOIN (SELECT prot || '-' || study_arm || '-' || study_group || '-' || visit_code AS visit
                   FROM import_studypartgrouparmvisit) AS possible_visits
        ON recorded_visits.visit = possible_visits.visit
    ) AS VT ON VT.subject_id = dd.subject_id AND VT.visit_code = dd.visit_code;
-- LEFT JOIN (
--     (
--     SELECT DISTINCT
--                     MQ.subject_id,
--                     MQ.prot || '-' || IQ.study_arm || '-' || IQ.study_group || '-' || MQ.study_day || '-' || MQ.visit_code AS visit,
--                     MQ.study_day,
--                     MQ.visit_code,
--                     possible_visittimes.visit_time_label,
--                     possible_visittimes.hours_post_initial_infusion
--     FROM import_pkmab AS MQ
--            LEFT JOIN
--              import_studypartgrouparmsubject AS IQ
--              ON MQ.subject_id = IQ.subject_id AND MQ.container = IQ.container
--     ) AS recorded_visittimes
--         LEFT JOIN (
--                   SELECT DISTINCT
--                                   prot || '-' || study_arm || '-' || study_group || '-' || study_day || '-' || visit_code visit,
--                                   visit_time_label,
--                                   hours_post_initial_infusion
--                   FROM import_studypartgrouparmvisittime
--                   ) AS possible_visittimes
--         ON recorded_visittimes.visit=possible_visittimess.visit
--     ) AS VT ON dd.subject_id = VT.subject_id AND dd.visit_code = VT.visit_code
