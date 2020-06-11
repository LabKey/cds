ALTER TABLE cds.import_nabantigen DROP CONSTRAINT import_nabantigen_pkey;
ALTER TABLE cds.import_nabantigen ADD PRIMARY KEY (container, assay_identifier, cds_virus_id);

ALTER TABLE cds.nabantigen DROP CONSTRAINT nabantigen_pkey;
ALTER TABLE cds.nabantigen ADD PRIMARY KEY (container, assay_identifier, cds_virus_id);
