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
-- Helper query for store\StudyProduct.js. Grabs all metadata for each study.
SELECT
spm.study_name,
spm.product_id,
spm.has_data,
s.label AS "study_label",
s.short_name AS "study_short_name"
FROM cds.metadata.studyproductmap spm
LEFT JOIN cds.metadata.study s ON spm.study_name=s.study_name