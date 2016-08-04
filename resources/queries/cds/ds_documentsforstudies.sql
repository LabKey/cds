-- Helper query for store\Study.js. Grabs all metadata for each document.
SELECT
  sd.prot,
  doc.*
FROM cds.studydocuments sd
LEFT JOIN documents doc
ON doc.document_id=sd.document_id
