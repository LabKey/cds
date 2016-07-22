-- Helper query for store\Assay.js. Grabs all metadata for each study.
SELECT
  sa.assay_identifier,
  sa.has_data,
  sa.prot,
  smd.*
FROM cds.studyassay sa
LEFT JOIN study smd
ON smd.study_name=sa.prot