SELECT
    elm.protocol_id,
    el.*
FROM cds.external_link el
         LEFT JOIN cds.external_link_map elm ON el.cds_link_id = elm.cds_link_id
WHERE elm.type = 'publication'
