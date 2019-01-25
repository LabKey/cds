CREATE TABLE cds.mabgroup (
  RowId SERIAL,
  Container ENTITYID NOT NULL,
  Label VARCHAR(250) NOT NULL,
  Description TEXT,
  Type VARCHAR(250),
  Filters TEXT,
  Shared BOOLEAN DEFAULT FALSE,

  Created TIMESTAMP NOT NULL,
  CreatedBy USERID NOT NULL,
  Modified TIMESTAMP NOT NULL,
  ModifiedBy USERID NOT NULL,

  CONSTRAINT pk_mabgroup PRIMARY KEY (container, rowId)
);