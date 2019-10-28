SELECT
a.assay_identifier,
a.assay_type AS datasetName
FROM
cds.assay a
LEFT JOIN
study.datasets ds
ON a.assay_type = ds.name
WHERE assay_type IS NOT NULL