SELECT
sgm.container.name AS studyProt, -- each study protocol has a container of the same name as the study protocol
sgm.groupId AS group_name,
-- s.species,
-- pfs.product_name,
-- afs.assay_identifier,
-- afs.has_data

FROM
    study.subjectgroupmap sgm
-- LEFT JOIN cds.study s ON sgm.container.name = s.study_name
-- LEFT JOIN cds.learn_productsforstudies pfs ON sgm.container.name = pfs.study_name
-- LEFT JOIN cds.learn_assaysforstudies afs ON sgm.container.name = afs.prot

GROUP BY
    sgm.container.name,
    sgm.groupId
--     s.species,
--     pfs.product_name,
--     afs.assay_identifier,
--     afs.has_data