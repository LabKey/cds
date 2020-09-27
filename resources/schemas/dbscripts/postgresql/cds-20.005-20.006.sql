-- add target_cell columns back since data for target_cell should be coming from nab and nabmab assays, and not nabantigen metadata table
ALTER TABLE cds.import_nab ADD COLUMN target_cell VARCHAR(250);
ALTER TABLE cds.import_nabmab ADD COLUMN target_cell VARCHAR(250);

ALTER TABLE cds.import_nabantigen DROP COLUMN target_cell;
ALTER TABLE cds.nabantigen DROP COLUMN target_cell;