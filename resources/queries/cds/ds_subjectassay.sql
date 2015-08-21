SELECT
participantid,
assay_identifier,
assay_type,
SS.study_name,
lab_code,
label,
FROM (
  SELECT
  DISTINCT participantid,
  'ICS' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.ICS

  UNION

  SELECT
  DISTINCT participantid,
  'NAb' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.NAb

  UNION

  SELECT
  DISTINCT participantid,
  'ELISpot' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.ELISpot

  UNION

  SELECT
  DISTINCT participantid,
  'BAMA' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.BAMA
) AS DD
INNER JOIN cds.study AS SS ON SS.container = DD.container
