-- Helper query for store\Study.js. Grabs all metadata for each publication.
SELECT
  sr.prot,
  sr.rel_prot,
  sr.relationship
FROM cds.import_studyrelationship sr

