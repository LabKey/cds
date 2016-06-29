--Returns all the subjects assays pairs that appear in the datasets where the corresponding study assay pair is not
--enumerated in the studyassay table.
--Expected to return 0 rows
SELECT DISTINCT
	d.prot,
	d.subject_id,
	d.assay_identifier
FROM import_studyassay md --metadataTable
FULL JOIN (
  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_ICS

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_nab

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_els_ifng

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_bama
) d --dataTable
ON d.prot=md.prot AND d.assay_identifier=md.assay_identifier
WHERE md.prot IS NULL AND md.assay_identifier IS NULL