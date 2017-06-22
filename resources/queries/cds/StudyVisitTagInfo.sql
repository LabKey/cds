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
s.container.entityid AS container_id,
s.label AS study_label,

sp.TimepointType AS timepoint_type,

vtm.study_group_id.group_name,
vtm.visit_row_id,
vtm.is_vaccination,
vtm.is_challenge,
vtm.visit_tag_label,
vtm.detail_label,

v.ProtocolDay AS protocol_day,
v.Label AS visit_label,
v.SequenceNumMin AS sequence_num_min,
v.SequenceNumMax AS sequence_num_max,

vt.name AS visit_tag_name,
vt.caption AS visit_tag_caption,
vt.singleuse AS single_use,

ta.coded_label AS group_label

FROM visittagmap vtm
FULL JOIN study.StudyProperties sp ON sp.container = vtm.container
LEFT JOIN cds.Study s ON s.study_name = sp.Label
LEFT JOIN study.Visit v ON v.rowid = vtm.visit_row_id
LEFT JOIN study.VisitTag vt ON vtm.visit_tag = vt.name
LEFT JOIN cds.treatmentarm ta ON ta.container = vtm.container AND ta.arm_id = vtm.arm_id
WHERE s.label IS NOT NULL