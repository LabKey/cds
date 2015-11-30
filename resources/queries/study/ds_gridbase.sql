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
-- Display Columns
SV.participantId.participantId AS SubjectId,
STUDY.label AS Study,
TS.coded_label AS TreatmentSummary,
SV.Visit.RowId AS VisitRowId,

-- Join columns
SV.participantsequencenum,
SV.sequencenum,
CAST(ROUND(Floor(SV.Visit.ProtocolDay)) AS INTEGER) AS ProtocolDay,
SV.container

FROM study.ParticipantVisit AS SV
LEFT JOIN cds.study AS STUDY ON (SV.container = study.container)
LEFT JOIN cds.treatmentarmsubjectmap AS TASM ON (TASM.participantId = SV.participantId AND TASM.container = SV.container)
LEFT JOIN cds.treatmentarm AS TS ON (TASM.arm_id = TS.arm_id)