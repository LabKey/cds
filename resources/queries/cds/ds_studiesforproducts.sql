-- Helper query for store\StudyProduct.js. Grabs all metadata for each study.
SELECT
spm.*,
s.label AS "study_label",
s.short_name AS "study_short_name"
FROM cds.studyproductmap spm
LEFT JOIN cds.study s ON spm.study_name=s.study_name