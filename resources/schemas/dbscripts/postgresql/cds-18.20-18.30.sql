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
ALTER TABLE cds.import_NABMAb ALTER COLUMN slope TYPE double precision;
ALTER TABLE cds.import_NABMAb ALTER COLUMN fit_slope TYPE double precision;
ALTER TABLE cds.mAbGridBase ALTER COLUMN titer_curve_ic50 TYPE double precision;

ALTER TABLE cds.import_ics ADD COLUMN functionality_score double precision;
ALTER TABLE cds.import_ics ADD COLUMN polyfunctionality_score double precision;
ALTER TABLE cds.import_studysubject ADD COLUMN subject_gender_identity VARCHAR(250);
ALTER TABLE cds.import_studysubject ADD COLUMN subject_study_cohort VARCHAR(250);

ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_type VARCHAR(250);
ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_name_other VARCHAR(250);
ALTER TABLE cds.import_MAbMixMetadata ADD COLUMN mab_mix_lanlid VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_type VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_name_other VARCHAR(250);
ALTER TABLE cds.MAbMixMetadata ADD COLUMN mab_mix_lanlid VARCHAR(250);
ALTER TABLE cds.mAbMetaGridBase ADD COLUMN mab_mix_type VARCHAR(250);

CREATE TABLE cds.studymAb (
  prot VARCHAR(250) NOT NULL,
  mab_mix_id VARCHAR(250) NOT NULL,
  container ENTITYID NOT NULL,

  CONSTRAINT pk_studymab PRIMARY KEY (container, prot, mab_mix_id)
);