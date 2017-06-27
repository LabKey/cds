-- titer_ID50, titer_ID80, nab_response_ID50, nab_response_ID80, slope --
ALTER TABLE cds.import_nab ADD COLUMN titer_ID50 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_ID80 NUMERIC(15,4);
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID50 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN titer_response_ID80 BOOLEAN;
ALTER TABLE cds.import_nab ADD COLUMN slope NUMERIC(15,4);

-- mfi_bkgd, auc --
ALTER TABLE cds.import_bama ADD COLUMN mfi_bkgd NUMERIC(15, 4);
ALTER TABLE cds.import_bama ADD COLUMN auc NUMERIC(15, 4);