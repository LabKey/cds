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
-- Helper query for store\Study.js. Grabs all metadata for each document.
SELECT
  sd.prot,
  sd.document_order,
  (sd.access_level <> 'restricted' OR sd.access_level IS NULL) OR study.study_name IS NOT NULL AS "accessible",
  doc.*
FROM cds.ds_studydocument sd
LEFT JOIN document doc
ON doc.document_id=sd.document_id
LEFT JOIN study study
ON study.study_name=sd.prot
