SELECT DISTINCT

    g.group_id,
    g.study_label,
    g.group_name,
    group_concat(g.has_data) AS has_data, -- since LK SQL doesn't support boolean aggregate, going this route
    g.study_name,
    g.description

    FROM
        (SELECT DISTINCT
sgm.groupId.rowid AS group_id,
s.label AS study_label,
sgm.groupId.label AS group_name,
(CASE WHEN afs.has_data IS NULL OR pfs.has_data IS NULL THEN false ELSE (afs.has_data OR pfs.has_data) END) AS has_data,
s.study_name AS study_name,
s.description

FROM
    study.subjectgroupmap sgm
LEFT JOIN study.subjectcategory sc ON sgm.groupId.label = sc.label
LEFT JOIN cds.study s ON sgm.container.name = s.study_name -- each study protocol has a container of the same name as the study protocol
LEFT JOIN cds.learn_productsforstudies pfs ON sgm.container.name = pfs.study_name
LEFT JOIN cds.learn_assaysforstudies afs ON sgm.container.name = afs.prot

WHERE sc.OwnerId IN (-1, userid()) -- Get Shared/Curated groups and Saved Groups created by the current user

GROUP BY
    sgm.groupId.rowid,
    s.label,
    sgm.groupId.label,
    afs.has_data,
    pfs.has_data,
    s.study_name,
    s.description) g

    GROUP BY
    g.group_id,
    g.study_label,
    g.group_name,
    g.study_name,
    g.description