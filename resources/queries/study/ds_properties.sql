SELECT
CAST(SUM(primarycount) AS INTEGER) AS primarycount,
CAST(SUM(datacount) AS INTEGER) AS datacount
FROM (
  SELECT
  COUNT(study.study_name) AS primarycount,
  0 AS datacount,
  FROM cds.study AS study

  UNION

  SELECT
  0 AS primarycount,
  COUNT(*) AS datacount,
  FROM study.ICS

  UNION

  SELECT
  0 AS primarycount,
  COUNT(*) AS datacount,
  FROM study.ELISPOT

  UNION

  SELECT
  0 AS primarycount,
  COUNT(*) AS datacount,
  FROM study.NAb
  UNION

  SELECT
  0 AS primarycount,
  COUNT(*) AS datacount,
  FROM study.BAMA
)