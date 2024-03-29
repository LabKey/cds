/*
 * Copyright (c) 2017 LabKey Corporation
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
-- Helper query for store\Study.js. Grabs all metadata for each assay.
SELECT
  sa.prot,
  sa.has_data,
  sa.assay_identifier AS "study_assay_id",
  sa.assay_status,
  amd.*
FROM cds.metadata.studyassay sa
LEFT JOIN assay amd
ON amd.assay_identifier=sa.assay_identifier
