ALTER TABLE cds.import_PublicationDocument ADD COLUMN display_order INT;
ALTER TABLE cds.PublicationDocument ADD COLUMN display_order INT;

CREATE TABLE cds.external_link
(
    cds_link_id     VARCHAR(250) NOT NULL,
    link_label      VARCHAR(250) NOT NULL,
    link_url        VARCHAR(250) NOT NULL,
    link_type       VARCHAR(100),
    link_description VARCHAR(250),
    container       ENTITYID NOT NULL,

    CONSTRAINT PK_external_links PRIMARY KEY (cds_link_id, container)
);

CREATE TABLE cds.external_link_map
(
    row_id          SERIAL,
    cds_link_id     VARCHAR(250) NOT NULL,
    protocol_id     VARCHAR(250) NOT NULL,
    type            VARCHAR(100) NOT NULL,
    container       ENTITYID NOT NULL,

    CONSTRAINT PK_external_link_map PRIMARY KEY (row_id),
    CONSTRAINT UQ_external_link_map UNIQUE (cds_link_id, protocol_id, type, container),
    CONSTRAINT FK_external_link_map_cds_link_id FOREIGN KEY (cds_link_id, container) REFERENCES cds.external_link (cds_link_id, container)
);
CREATE INDEX IX_external_link_map_cds_link_id ON cds.external_link_map(cds_link_id);

