-- Don't need the import_publicationDocument table since no transform occurs between the import and final tables
DROP TABLE IF EXISTS cds.import_PublicationDocument;

ALTER TABLE cds.PublicationDocument ADD COLUMN display_order INT;
