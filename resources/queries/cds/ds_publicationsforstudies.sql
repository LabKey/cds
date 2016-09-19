-- Helper query for store\Study.js. Grabs all metadata for each publication.
SELECT
  sp.prot,
  sp.publication_order,
  pub.*
FROM cds.studypublication sp
LEFT JOIN publication pub
ON pub.id=sp.publication_id
