ALTER TABLE cds.import_publication ADD COLUMN publication_author_first VARCHAR(250);
ALTER TABLE cds.import_publication ADD COLUMN publication_label VARCHAR(250);
ALTER TABLE cds.publication ADD COLUMN author_first VARCHAR(250);
ALTER TABLE cds.publication ADD COLUMN publication_label VARCHAR(250);