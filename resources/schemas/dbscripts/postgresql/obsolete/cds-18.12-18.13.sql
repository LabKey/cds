/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
ALTER TABLE cds.import_NABMAb
  RENAME COLUMN nab_response_ic50 to response_ic50;
ALTER TABLE cds.import_NABMAb
  RENAME COLUMN nab_response_ic80 to response_ic80;

ALTER TABLE cds.import_NABMAb
  RENAME COLUMN titer_ic50 to titer_curve_ic50;
ALTER TABLE cds.import_NABMAb
  RENAME COLUMN titer_ic80 to titer_curve_ic80;

ALTER TABLE cds.import_NABMAb ALTER COLUMN titer_curve_ic50 TYPE double precision;
ALTER TABLE cds.import_NABMAb ALTER COLUMN titer_curve_ic80 TYPE double precision;

ALTER TABLE cds.import_NABMAb ADD COLUMN curve_id INTEGER;
ALTER TABLE cds.import_NABMAb ADD COLUMN vaccine_matched BOOLEAN;
ALTER TABLE cds.import_NABMAb ADD COLUMN titer_point_ic50 double precision;
ALTER TABLE cds.import_NABMAb ADD COLUMN titer_point_ic80 double precision;

/* Materialize the mabgridbase query */
DROP TABLE IF EXISTS cds.mAbGridBase;

CREATE TABLE cds.mAbGridBase (
  mab_mix_id VARCHAR(250),
  mab_mix_name_std VARCHAR(250),
  study VARCHAR(250),
  virus VARCHAR(250),
  clade VARCHAR(250),
  neutralization_tier VARCHAR(250),
  tier_clade_virus VARCHAR(250),
  titer_curve_ic50 NUMERIC(15,4),
  titer_curve_ic50_group VARCHAR(10),

  target_cell VARCHAR(250),
  lab_code VARCHAR(250),
  summary_level VARCHAR(250),

  curve_id INTEGER,

  container ENTITYID,

  CONSTRAINT PK_mAbGridBase PRIMARY KEY (container, mab_mix_id, tier_clade_virus, target_cell, lab_code, summary_level, curve_id)
);

DROP TABLE IF EXISTS cds.mAbMetaGridBase;

CREATE TABLE cds.mAbMetaGridBase (
  mab_mix_id VARCHAR(250),
  mab_mix_name_std VARCHAR(250),
  mab_id VARCHAR(250),
  mab_hxb2_location VARCHAR(250),
  mab_isotype VARCHAR(250),
  mab_donor_species VARCHAR(250),
  container ENTITYID,

  CONSTRAINT PK_mAbMetaGridBase PRIMARY KEY (container, mab_mix_id, mab_id)
);