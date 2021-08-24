
CREATE TABLE cds.import_assayReport
(
    assay_identifier VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_ImportAssayReport PRIMARY KEY (assay_identifier, cds_report_id, container)
);

CREATE TABLE cds.assayReport
(
    assay_identifier VARCHAR(250) NOT NULL,
    cds_report_id INTEGER,
    container ENTITYID NOT NULL,

    CONSTRAINT PK_AssayReport PRIMARY KEY (assay_identifier, cds_report_id, container)
);
