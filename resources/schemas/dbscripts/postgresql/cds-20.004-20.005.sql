ALTER TABLE cds.import_nab DROP COLUMN antigen;
ALTER TABLE cds.import_nab DROP COLUMN antigen_type;
ALTER TABLE cds.import_nab DROP COLUMN virus;
ALTER TABLE cds.import_nab DROP COLUMN virus_insert_name;
ALTER TABLE cds.import_nab DROP COLUMN virus_type;
ALTER TABLE cds.import_nab DROP COLUMN neutralization_tier;
ALTER TABLE cds.import_nab DROP COLUMN clade;
ALTER TABLE cds.import_nab DROP COLUMN target_cell;
ALTER TABLE cds.import_nab ADD COLUMN cds_virus_id VARCHAR(250);

ALTER TABLE cds.import_nabmab DROP COLUMN target_cell;
ALTER TABLE cds.import_nabmab DROP COLUMN clade;
ALTER TABLE cds.import_nabmab DROP COLUMN neutralization_tier;
ALTER TABLE cds.import_nabmab DROP COLUMN virus;
ALTER TABLE cds.import_nabmab DROP COLUMN virus_type;
ALTER TABLE cds.import_nabmab ADD COLUMN cds_virus_id VARCHAR(250);