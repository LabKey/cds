SELECT
DD.participantid,
DD.folder.entityid as container,
DD.participantid || '-product' AS product_group,
SPM.product_id.product_name,
SPM.insert_name,
SPM.clade_name,
P.product_type,
P.product_developer,
P.product_class_label,
FROM study.demographics AS DD
LEFT JOIN cds.subjectproductmap AS SPM ON (DD.participantId = SPM.participantId AND DD.folder = SPM.container)
LEFT JOIN cds.product AS P ON (SPM.product_id = P.product_id)