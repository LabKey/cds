SELECT
TA.arm_id,
TA.container.entityId,
ITS.subject_id AS participantId,
ITS.prot,
FROM cds.treatmentarm AS TA
JOIN cds.import_studypartgrouparmsubject AS ITS
ON (TA.container.name = ITS.prot AND
    TA.arm_part = ITS.study_part AND
    TA.arm_group = ITS.study_group AND
    TA.arm_name = ITS.study_arm)