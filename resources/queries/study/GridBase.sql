SELECT
-- Display Columns
SV.participantId AS SubjectId,
STUDY.label AS Study,
TASM.arm_id.coded_label AS TreatmentSummary,
SV.Visit AS SubjectVisit,

-- Join columns
SV.sequencenum,
SV.container

FROM study.SubjectVisit AS SV
JOIN cds.treatmentarmsubjectmap AS TASM ON (TASM.participantId = SV.participantId)
JOIN cds.study AS STUDY ON (SV.container = study.container)