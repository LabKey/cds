SELECT *
FROM cds.assay AS AA
LEFT JOIN (
  SELECT assay_identifier AS id,
  COUNT(assay_identifier) AS study_count
  FROM (
    SELECT DISTINCT assay_identifier,
    study_name,
    FROM ds_subjectassay
  )
  GROUP BY assay_identifier
)
AS BB ON AA.assay_identifier = BB.id