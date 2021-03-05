SELECT
sg.Label as label,
scg.cds_saved_group_id,
scg.prot
FROM cds.studyCuratedGroup scg
LEFT JOIN study.SubjectGroup sg
ON scg.cds_saved_group_id = sg.RowId
LEFT JOIN study.SubjectCategory sc
ON sc.RowId = sg.categoryId
WHERE sc.ownerId = -1 --filter to only show curated/shared groups