-- Helper query for store\Study.js. Grabs all metadata for each document.
SELECT
  sd.prot,
  doc.*
FROM cds.studydocument sd
LEFT JOIN document doc
ON doc.document_id=sd.document_id
