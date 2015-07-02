SELECT
DISTINCT participantid,
'ICS' AS assay
FROM study.ICS

UNION

SELECT
DISTINCT participantid,
'NAb' AS assay
FROM study.NAb

UNION

SELECT
DISTINCT participantid,
'ELISpot' AS assay
FROM study.ELISpot

UNION

SELECT
DISTINCT participantid,
'BAMA' AS assay
FROM study.BAMA