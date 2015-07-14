SELECT
participantid,
assay,
SS.study_name,
FROM (
  SELECT
  DISTINCT participantid,
  'ICS' AS assay,
  container,
  FROM study.ICS

  UNION

  SELECT
  DISTINCT participantid,
  'NAb' AS assay,
  container
  FROM study.NAb

  UNION

  SELECT
  DISTINCT participantid,
  'ELISpot' AS assay,
  container
  FROM study.ELISpot

  UNION

  SELECT
  DISTINCT participantid,
  'BAMA' AS assay,
  container
  FROM study.BAMA
) AS DD
INNER JOIN cds.study AS SS ON SS.container = DD.container
