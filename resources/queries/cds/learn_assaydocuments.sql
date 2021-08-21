SELECT
ad.document_id,
d.label,
d.filename,
d.document_type,
ad.assay_identifier,
d.video_link,
d.video_thumbnail_filename
FROM cds.assaydocument ad
LEFT JOIN cds.document d ON ad.document_id = d.document_id