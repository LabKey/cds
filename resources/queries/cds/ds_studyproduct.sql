/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
SELECT DISTINCT
   md.prot AS study_name,
   md.prot,
   md.product_id,
   md.container AS projectContainer,
   d.product_id IS NOT NULL AND d.prot IS NOT NULL AS has_data
FROM import_studyproduct md --metadataTable
--Pulls in real data for each metadata relationship if it exists.
LEFT JOIN ds_subjectproduct d --dataTable
ON (
   md.prot=d.prot
   AND md.product_id=d.product_id
)