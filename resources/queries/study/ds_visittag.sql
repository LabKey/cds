SELECT
DISTINCT arm_visit.visit_type AS Name,
arm_visit.visit_type AS caption,
FALSE AS SingleUse
FROM cds.import_studypartgrouparmvisit AS arm_visit
WHERE visit_type IS NOT NULL

UNION

SELECT
DISTINCT arm_visit.visit_align_tag AS Name,
arm_visit.visit_align_tag AS caption,
TRUE AS SingleUse
FROM cds.import_studypartgrouparmvisit AS arm_visit
WHERE visit_align_tag IS NOT NULL