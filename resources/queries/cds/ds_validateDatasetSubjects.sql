--Returns all the subjects that appear in the datasets that do not appear in the demographics table.
--Expected to return 0 rows.
SELECT
datasets.subjects_in_datasets as "prot subject",
study,
id
FROM(
	SELECT
	prot||' '||subject_id as subjects_in_datasets,
	prot as study,
	subject_id as id
	FROM (
		SELECT
		DISTINCT subject_id,
		prot
		FROM import_ics

		UNION

		SELECT
		DISTINCT subject_id,
		prot
		FROM import_nab

		UNION

		SELECT
		DISTINCT subject_id,
		prot
		FROM import_els_ifng

		UNION

		SELECT
		DISTINCT subject_id,
		prot
		FROM import_bama
	)
) as datasets
LEFT JOIN(
	SELECT
	prot||' '||subject_id as subjects_in_demographics
	FROM import_studysubject
) as demographics on demographics.subjects_in_demographics = datasets.subjects_in_datasets
WHERE demographics.subjects_in_demographics IS NULL