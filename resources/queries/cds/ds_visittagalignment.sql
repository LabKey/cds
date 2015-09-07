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

SELECT tasm.Container AS container,
tasm.ParticipantId AS participantid,
vtm.visit_row_id AS visitid,
v.ProtocolDay AS protocolday,
vtm.visit_tag AS visittagname
FROM cds.treatmentarmsubjectmap tasm
LEFT JOIN cds.treatmentarm ta ON tasm.arm_id = ta.arm_id AND tasm.container = ta.container
-- TODO: need to verify if the join from treatmentarm to studygroup has a way to include arm_name and arm_part?
LEFT JOIN cds.studygroup sg ON ta.arm_group = sg.group_name AND ta.container = sg.container
LEFT JOIN cds.visittagmap vtm ON sg.row_id = vtm.study_group_id AND sg.container = vtm.container AND vtm.single_use
LEFT JOIN study.visit v ON vtm.visit_row_id = v.RowId
WHERE vtm.visit_tag IS NOT NULL