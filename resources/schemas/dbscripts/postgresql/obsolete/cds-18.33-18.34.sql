/*
 * Copyright (c) 2019 LabKey Corporation
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
CREATE TABLE cds.import_StudyPartGroupArmVisitTime (
  container ENTITYID NOT NULL,
  prot VARCHAR(250) NOT NULL,

  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  visit_code VARCHAR(250) NOT NULL,

  hours_post_initial_infusion NUMERIC(7,2),
  hours_post_recent_infusion NUMERIC(7,2),
  visit_time_label VARCHAR(250),

  CONSTRAINT PK_import_StudyPartGroupArmVisitTime PRIMARY KEY (container, prot, study_part, study_arm, study_group, study_day, visit_code),

  CONSTRAINT import_StudyPartGroupArmVisitTime_combo_fkey
  FOREIGN KEY (container, prot, study_part, study_arm, study_group, study_day) REFERENCES cds.import_StudyPartGroupArmVisit (container, prot, study_part, study_arm, study_group, study_day)
);

CREATE TABLE cds.StudyPartGroupArmVisitTime (
  container ENTITYID NOT NULL,

  study_part VARCHAR(250) NOT NULL,
  study_group VARCHAR(250) NOT NULL,
  study_arm VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  visit_code VARCHAR(250) NOT NULL,

  hours_post_initial_infusion NUMERIC(7,2),
  hours_post_recent_infusion NUMERIC(7,2),
  visit_time_label VARCHAR(250),

  CONSTRAINT PK_StudyPartGroupArmVisitTime PRIMARY KEY (container, study_part, study_arm, study_group, study_day, visit_code)
);

CREATE TABLE cds.import_PKMAb (
  row_id SERIAL,
  container ENTITYID NOT NULL,

  -- REQUIRED
  prot VARCHAR(250) NOT NULL,
  subject_id VARCHAR(250) NOT NULL,
  study_day INTEGER NOT NULL,
  visit_code VARCHAR(250) NOT NULL,
  source_assay VARCHAR(250) NOT NULL,

  lab_code VARCHAR(250),
  specimen_type VARCHAR(250),
  summary_level VARCHAR(250),
  assay_identifier VARCHAR(250) NOT NULL,

  mab_name_source VARCHAR(250),
  mab_mix_id VARCHAR(250) NOT NULL,
  mab_concentration NUMERIC(15,4),
  mab_concentration_units VARCHAR(250),

  CONSTRAINT PK_import_PKMAb PRIMARY KEY (row_id),

  CONSTRAINT import_PKMAb_mab_mix_id_fkey
  FOREIGN KEY (container, mab_mix_id) REFERENCES cds.import_MAbMixMetadata (container, mab_mix_id),

  CONSTRAINT import_PKMAb_prot_fkey
  FOREIGN KEY (container, prot) REFERENCES cds.import_study (container, prot),

  CONSTRAINT import_PKMAb_assay_identifier_fkey
  FOREIGN KEY (container, assay_identifier) REFERENCES cds.import_assay (container, assay_identifier),

  CONSTRAINT import_PKMAb_lab_code_fkey
  FOREIGN KEY (container, lab_code) REFERENCES cds.import_lab (container, lab_code)
);
