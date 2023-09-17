SELECT
-- sgm.container.name AS studyProt, -- each study protocol has a container of the same name as the study protocol
sgm.groupId.label AS group_name,
(CASE WHEN sc.ownerid < 0 THEN 'Curated groups' ELSE 'My saved groups' END) AS group_type,
-- s.species,
-- pfs.product_name,
-- afs.assay_identifier,
-- afs.has_data

FROM
    study.subjectgroupmap sgm
LEFT JOIN study.subjectcategory sc ON sgm.groupId.label = sc.label
-- LEFT JOIN cds.study s ON sgm.container.name = s.study_name
-- LEFT JOIN cds.learn_productsforstudies pfs ON sgm.container.name = pfs.study_name
-- LEFT JOIN cds.learn_assaysforstudies afs ON sgm.container.name = afs.prot

GROUP BY
--     sgm.container.name,
    sgm.groupId.label,
    sc.ownerid
--     s.species,
--     pfs.product_name,
--     afs.assay_identifier,
--     afs.has_data