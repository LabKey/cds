-- Helper query for store\Study.js. Grabs all metadata for each publication.
SELECT
  sp.prot,
  pub.*
FROM cds.studypublication sp
LEFT JOIN publication pub
ON pub.publication_id=sp.publication_id
