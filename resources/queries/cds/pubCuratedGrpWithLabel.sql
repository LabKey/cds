SELECT
    sg.Label as label,
    pcg.cds_saved_group_id,
    pcg.publication_id
FROM cds.publicationCuratedGroup pcg
LEFT JOIN study.SubjectGroup sg
ON pcg.cds_saved_group_id = sg.RowId
LEFT JOIN study.SubjectCategory sc
          ON sc.RowId = sg.categoryId
WHERE sc.ownerId = -1 --filter to only show curated/shared groups