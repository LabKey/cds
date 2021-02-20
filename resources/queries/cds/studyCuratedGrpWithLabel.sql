SELECT
sg.Label,
scg.cds_saved_group_id,
scg.prot
FROM cds.studyCuratedGroup scg
LEFT JOIN study.SubjectGroup sg
ON scg.cds_saved_group_id = sg.RowId