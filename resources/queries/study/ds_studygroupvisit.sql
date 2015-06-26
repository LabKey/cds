SELECT
DISTINCT studygroup.row_id AS group_id,
visit.rowid AS visit_row_id,
arm_visit.prot
FROM cds.import_studypartgrouparmvisit AS arm_visit
JOIN ( SELECT * FROM cds.studygroup ) AS studygroup ON (studygroup.container.name = arm_visit.prot AND studygroup.group_name = arm_visit.study_group)
JOIN ( SELECT * FROM study.visit ) AS visit ON (visit.Folder.name = arm_visit.prot AND visit.sequencenummin = CAST(arm_visit.study_day AS DOUBLE))