-- add target_cell columns back since data for target_cell should be coming from nab and nabmab assays, and not nabantigen metadata table
ALTER TABLE cds.import_nab ADD COLUMN target_cell VARCHAR(250);
ALTER TABLE cds.import_nabmab ADD COLUMN target_cell VARCHAR(250);

-- Drop NOT NULL constraint since target_cell column is now expected to have null vals in nabantigen metadata table
ALTER TABLE cds.import_nabantigen ALTER COLUMN target_cell DROP NOT NULL;
ALTER TABLE cds.nabantigen ALTER COLUMN target_cell DROP NOT NULL;