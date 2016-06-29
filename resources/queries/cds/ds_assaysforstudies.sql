-- Helper query for store\Study.js. Grabs all metadata for each assay.
SELECT
  sa.prot,
  sa.has_data,
  amd.*
FROM cds.studyassay sa
LEFT JOIN assay amd
ON amd.assay_identifier=sa.assay_identifier