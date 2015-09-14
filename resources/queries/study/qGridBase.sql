SELECT
-- Display Columns
SV.participantId.participantId AS SubjectId,
STUDY.label AS Study,
TS.coded_label AS TreatmentSummary,
SV.Visit.Label AS SubjectVisit,

-- Join columns
SV.participantsequencenum,
SV.sequencenum,
SV.container

FROM study.ParticipantVisit AS SV
LEFT JOIN cds.study AS STUDY ON (SV.container = study.container)
LEFT JOIN cds.treatmentarmsubjectmap AS TASM ON (TASM.participantId = SV.participantId AND TASM.container = SV.container)
LEFT JOIN cds.treatmentarm AS TS ON (TASM.arm_id = TS.arm_id)