SELECT DISTINCT sgm.groupId.rowid  AS cds_saved_group_id,
                sgm.GroupId.label,
                sgm.container.name AS prot -- each study protocol has a container of the same name as the study protocol
FROM study.subjectgroupmap sgm
         LEFT JOIN study.subjectcategory sc ON sgm.groupId.CategoryId.RowId = sc.RowId
WHERE sc.ownerId = -1 --filter to only show curated/shared groups