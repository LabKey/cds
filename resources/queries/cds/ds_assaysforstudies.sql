-- Helper query for store\Study.js. Grabs all metadata for each assay.
SELECT
  sa.prot,
  sa.has_data,
  sa.assay_identifier AS "study_assay_id",
  sa.assay_status,
  amd.*
FROM cds.studyassay sa
LEFT JOIN assay amd
ON amd.assay_identifier=sa.assay_identifier
