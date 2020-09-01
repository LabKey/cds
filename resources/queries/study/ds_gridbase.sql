/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
SV.container,

-- single-use visit tag calculations for visit day alignment
CAST(SV.Visit.ProtocolDay - visittagalignment_enrollment.ProtocolDay_Enrollment AS INTEGER) AS EnrollmentDay,
CAST(SV.Visit.ProtocolDay - visittagalignment_last_vaccination.ProtocolDay_Last_Vaccination AS INTEGER) AS LastVaccinationDay,
CAST(SV.Visit.ProtocolDay - visittagalignment_first_vaccination.ProtocolDay_First_Vaccination AS INTEGER) AS FirstVaccinationDay

FROM study.ParticipantVisit AS SV
LEFT JOIN cds.study AS STUDY ON (SV.container = study.container)
LEFT JOIN cds.treatmentarmsubjectmap AS TASM ON (TASM.participantId = SV.participantId AND TASM.container = SV.container)
LEFT JOIN cds.treatmentarm AS TS ON (TASM.arm_id = TS.arm_id)

-- Enrollment VisitTag
LEFT JOIN (SELECT Container, ParticipantId, MIN(ProtocolDay) AS ProtocolDay_Enrollment FROM cds.visittagalignment
  WHERE visittagname='Enrollment' GROUP BY Container, ParticipantId) AS visittagalignment_enrollment
  ON SV.container=visittagalignment_enrollment.container
  AND SV.participantId.participantId=visittagalignment_enrollment.participantid

-- Last Vaccination VisitTag
LEFT JOIN (SELECT Container, ParticipantId, MIN(ProtocolDay) AS ProtocolDay_Last_Vaccination FROM cds.visittagalignment
  WHERE visittagname='Last Vaccination' GROUP BY Container, ParticipantId) AS visittagalignment_last_vaccination
  ON SV.container=visittagalignment_last_vaccination.container
  AND SV.participantId.participantId=visittagalignment_last_vaccination.participantid

-- First Vaccination VisitTag
LEFT JOIN (SELECT Container, ParticipantId, MIN(ProtocolDay) AS ProtocolDay_First_Vaccination FROM cds.visittagalignment
  WHERE visittagname='First Vaccination' GROUP BY Container, ParticipantId) AS visittagalignment_first_vaccination
  ON SV.container=visittagalignment_first_vaccination.container
  AND SV.participantId.participantId=visittagalignment_first_vaccination.participantid

WHERE SV.participantId NOT IN
      (SELECT MAB.participantId FROM study.NABMAb AS MAB WHERE MAB.participantId = SV.participantId AND MAB.container = SV.container)