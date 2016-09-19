SELECT
  publication_id AS id,
  publication_title AS title,
  publication_author_all AS author_all,
  publication_journal_short AS journal_short,
  publication_date AS date,
  publication_volume AS volume,
  publication_issue AS issue,
  publication_location AS location,
  publication_pmid AS pmid,
  publication_link AS link,
FROM cds.import_Publication