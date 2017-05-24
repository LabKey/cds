-- studies that have data added
SELECT
	allStudy.study_name AS "StudyWithData",
	study.study_name IS NOT NULL AS "accessible"
FROM
cds.metadata.study allStudy
LEFT JOIN cds.study study
ON allStudy.study_name=study.study_name
INNER JOIN
(
  SELECT DISTINCT
    sa.prot
  FROM cds.ds_studyassay sa
  WHERE sa.has_data = true
) noEmptyStudy
ON allStudy.study_name = noEmptyStudy.prot;