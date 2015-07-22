
--Returns all the study arms that have the same single-use visit tag defined for more than one visit.
--Expected to return 0 rows.
SELECT * FROM (
   SELECT prot,
   study_group,
   study_arm,
   study_arm_visit_label,
   count(*) AS assignment_count
   FROM cds.import_studypartgrouparmvisit
   WHERE study_arm_visit_label IS NOT NULL
   GROUP BY prot,
   study_group,
   study_arm,
   study_arm_visit_label
) X
WHERE assignment_count > 1