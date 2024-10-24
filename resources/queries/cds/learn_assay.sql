/*
 * Copyright (c) 2015-2019 LabKey Corporation
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
SELECT *,
    (CASE WHEN (AA.assay_identifier = 'PK MAB' OR AA.assay_type IS NULL) THEN false -- assay_type is null for Non-Integrated assay, at least for now, see ds_assay query.
      ELSE true
    END) AS hasAntigen
FROM cds.assay AS AA
LEFT JOIN (
  SELECT assay_identifier AS id,
  COUNT(assay_identifier) AS study_count
  FROM (
    SELECT DISTINCT assay_identifier,
    study_name
    FROM ds_subjectassay
  ) _x_
  GROUP BY assay_identifier
)
AS BB ON AA.assay_identifier = BB.id