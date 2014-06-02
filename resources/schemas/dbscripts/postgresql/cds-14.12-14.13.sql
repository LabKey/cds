CREATE TABLE cds.Properties
(
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  PrimaryCount INTEGER,
  DataCount INTEGER,

  CONSTRAINT pk_properties PRIMARY KEY (Container, RowId)
);