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
SELECT
       dd.subject_id AS participantid,
       CAST(dd.study_day AS DOUBLE) AS sequencenum,

       dd.study_day AS visit_day,
       dd.prot AS study_prot,
       dd.prot,

       dd.visit_code,
       VT.visit_time_label,
       VT.hours_post_initial_infusion,
       VT.hours_post_recent_infusion,
       dd.source_assay,

       dd.assay_identifier,
       dd.summary_level,
       dd.specimen_type,
       dd.lab_code,

       dd.mab_mix_id,
       mixmeta.mab_mix_name_std,
       mixmeta.mab_mix_label,
       dd.mab_name_source,
       dd.mab_concentration,
       dd.mab_concentration_units,
       dd.lloq,
       dd.lloq_units

FROM cds.import_PKMAb AS dd
LEFT JOIN MAbMixMetadata mixmeta ON dd.mab_mix_id = mixmeta.mab_mix_id and dd.container = mixmeta.container
LEFT JOIN (
          SELECT subjectvisit.subject_id,
                 subjectvisit.visit_code,
                 subjectvisit.container,
                 visittime.visit_time_label,
                 visittime.hours_post_initial_infusion,
                 visittime.hours_post_recent_infusion
          FROM
               (SELECT DISTINCT subject_id, visit_code, container FROM import_pkmab) AS subjectvisit
                 LEFT JOIN
                   import_studypartgrouparmsubject AS subjectgroup
                   ON subjectgroup.subject_id = subjectvisit.subject_id
                        AND subjectgroup.container = subjectvisit.container
                 LEFT JOIN
                   import_studypartgrouparmvisittime AS visittime
                   ON subjectgroup.prot = visittime.prot
                        AND subjectgroup.study_arm = visittime.study_arm
                        AND subjectgroup.study_group = visittime.study_group
                        AND subjectvisit.visit_code = visittime.visit_code
                        AND subjectgroup.container = visittime.container
    ) AS VT ON dd.container = VT.container AND dd.subject_id = VT.subject_id AND dd.visit_code = VT.visit_code

