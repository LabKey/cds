SELECT
DISTINCT arm_visit.study_arm_visit_type AS Name,
arm_visit.study_arm_visit_type AS caption,
FALSE AS SingleUse
FROM cds.import_studypartgrouparmvisit AS arm_visit
WHERE study_arm_visit_type IS NOT NULL

UNION

SELECT
DISTINCT arm_visit.study_arm_visit_label AS Name,
arm_visit.study_arm_visit_label AS caption,
TRUE AS SingleUse
FROM cds.import_studypartgrouparmvisit AS arm_visit
WHERE study_arm_visit_label IS NOT NULL