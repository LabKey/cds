SELECT
CAST(SUM(assays) AS INTEGER) AS assays,
CAST(SUM(studies) AS INTEGER) AS studies,
CAST(SUM(subjects) AS INTEGER) AS subjects,
CAST(SUM(products) AS INTEGER) AS products,
CAST(SUM(datacount) AS INTEGER) AS datacount
FROM (
  -- assays
  SELECT
  COUNT(assay.assay_identifier) AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  0 AS datacount,
  FROM cds.assay AS assay

  UNION

  -- studies
  SELECT
  0 AS assays,
  COUNT(study.study_name) AS studies,
  0 AS subjects,
  0 AS products,
  0 AS datacount,
  FROM cds.study AS study

  UNION

  -- subjects
  SELECT
  0 AS assays,
  0 AS studies,
  COUNT(*) AS subjects,
  0 AS products,
  0 AS datacount,
  FROM study.Demographics

  UNION

  -- products
  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  COUNT(*) AS products,
  0 AS datacount,
  FROM cds.Product

  UNION

  -- datacount
  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  FROM study.ICS

  UNION

  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  FROM study.ELISPOT

  UNION

  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  FROM study.NAb

  UNION

  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  FROM study.BAMA
)