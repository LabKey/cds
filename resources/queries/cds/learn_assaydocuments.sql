SELECT
ad.document_id,
d.label,
d.filename,
d.document_type,
ad.assay_identifier,
d.link
FROM cds.assaydocument ad
LEFT JOIN cds.document d ON ad.document_id = d.document_id