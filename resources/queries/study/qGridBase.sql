SELECT
-- Display Columns
SV.participantId.participantId AS SubjectId,
STUDY.label AS Study,
TASM.arm_id.coded_label AS TreatmentSummary,
SV.Visit.Label AS SubjectVisit,

-- Join columns
SV.participantsequencenum,
SV.sequencenum,
SV.container,
SV.container as participantContainer

FROM study.SubjectVisit AS SV
LEFT JOIN cds.study AS STUDY ON (SV.container = study.container)
LEFT JOIN cds.treatmentarmsubjectmap AS TASM ON (TASM.participantId = SV.participantId AND TASM.container = SV.container)