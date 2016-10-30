/*
 * Copyright (c) 2016 LabKey Corporation
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
ALTER TABLE cds.import_Study ADD COLUMN study_primary_poc_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_primary_poc_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pi_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pi_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pm_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_grant_pm_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_investigator_name VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN study_investigator_email VARCHAR(250);
ALTER TABLE cds.import_Study ADD COLUMN cavd_affiliation TEXT;
ALTER TABLE cds.import_Study ADD COLUMN treatment_schema_link TEXT;
ALTER TABLE cds.import_Study ADD COLUMN assay_schema_link TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_groups TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_conclusions TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_publications TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_executive_summary TEXT;
ALTER TABLE cds.import_Study ADD COLUMN study_data_availability TEXT;

ALTER TABLE cds.Study ADD COLUMN primary_poc_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN primary_poc_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pi_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pi_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pm_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN grant_pm_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN investigator_name VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN investigator_email VARCHAR(250);
ALTER TABLE cds.Study ADD COLUMN cavd_affiliation TEXT;
ALTER TABLE cds.Study ADD COLUMN treatment_schema_link TEXT;
ALTER TABLE cds.Study ADD COLUMN assay_schema_link TEXT;
ALTER TABLE cds.Study ADD COLUMN groups TEXT;
ALTER TABLE cds.Study ADD COLUMN conclusions TEXT;
ALTER TABLE cds.Study ADD COLUMN publications TEXT;
ALTER TABLE cds.Study ADD COLUMN executive_summary TEXT;
ALTER TABLE cds.Study ADD COLUMN data_availability TEXT;

