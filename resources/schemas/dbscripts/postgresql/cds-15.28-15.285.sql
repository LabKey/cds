/*
 * Copyright (c) 2015 LabKey Corporation
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
DROP TABLE IF EXISTS cds.import_StudyPartGroupArmVisitTag CASCADE;

ALTER TABLE cds.import_StudyPartGroupArmVisit ADD COLUMN ischallvis BOOLEAN DEFAULT FALSE;

ALTER TABLE cds.import_NAb DROP COLUMN titer_ic50;
ALTER TABLE cds.import_NAb ADD COLUMN titer_ic50 NUMERIC(15,4);

ALTER TABLE cds.import_NAb DROP COLUMN titer_ic80;
ALTER TABLE cds.import_NAb ADD COLUMN titer_ic80 NUMERIC(15,4);

ALTER TABLE cds.import_NAb DROP COLUMN initial_dilution;
ALTER TABLE cds.import_NAb ADD COLUMN initial_dilution NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc_neg;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc_neg NUMERIC(15,4);

ALTER TABLE cds.import_ELS_IFNg DROP COLUMN mean_sfc_raw;
ALTER TABLE cds.import_ELS_IFNg ADD COLUMN mean_sfc_raw NUMERIC(15,4);

ALTER TABLE cds.VisitTagMap ADD COLUMN is_challenge BOOLEAN DEFAULT FALSE;