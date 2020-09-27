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
SELECT
  assay_identifier,
  antigen_name,
  antigen_type,
  virus,
  virus_type,
  virus_insert_name,
  neutralization_tier,
  clade,
  antigen_description,
  antigen_control,
  virus_full_name,
  virus_name_other,
  virus_species,
  virus_host_cell,
  virus_backbone,
  cds_virus_id

FROM cds.import_NAbAntigen