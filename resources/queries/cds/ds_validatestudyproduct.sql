--Returns all the subjects products pairs that appear in the data that are not represented in the studyproduct table.
--Expected to return 0 rows
SELECT DISTINCT
   d.participantid,
   d.product_id,
   d.prot
FROM import_studyproduct md --metadataTable
RIGHT JOIN ds_subjectproduct d --dataTable
ON (
   md.prot=d.prot
   AND md.product_id=d.product_id
)
WHERE md.prot IS NULL AND md.product_id IS NULL