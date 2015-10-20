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
CAST(SUM(assays) AS INTEGER) AS assays,
CAST(SUM(studies) AS INTEGER) AS studies,
CAST(SUM(subjects) AS INTEGER) AS subjects,
CAST(SUM(products) AS INTEGER) AS products,
CAST(SUM(datacount) AS INTEGER) AS datacount,
CAST(SUM(subjectlevelstudies) AS INTEGER) AS subjectlevelstudies
FROM (
  -- assays
  SELECT
  COUNT(assay.assay_identifier) AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  0 AS datacount,
  0 AS subjectlevelstudies,
  FROM cds.assay AS assay

  UNION

  -- studies
  SELECT
  0 AS assays,
  COUNT(study.study_name) AS studies,
  0 AS subjects,
  0 AS products,
  0 AS datacount,
  0 AS subjectlevelstudies
  FROM cds.study AS study

  UNION

  -- studies with subject-level data
  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  0 AS datacount,
  COUNT(DISTINCT demographics.study_label) AS subjectlevelstudies,
  FROM study.Demographics AS demographics

  UNION
  -- subjects
  SELECT
  0 AS assays,
  0 AS studies,
  COUNT(*) AS subjects,
  0 AS products,
  0 AS datacount,
  0 AS subjectlevelstudies,
  FROM study.Demographics

  UNION

  -- products
  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  COUNT(*) AS products,
  0 AS datacount,
  0 AS subjectlevelstudies,
  FROM cds.Product

  UNION

  -- datacount
  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  0 AS subjectlevelstudies,
  FROM study.ICS

  UNION

  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  0 AS subjectlevelstudies,
  FROM study.ELISPOT

  UNION

  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  0 AS subjectlevelstudies,
  FROM study.NAb

  UNION

  SELECT
  0 AS assays,
  0 AS studies,
  0 AS subjects,
  0 AS products,
  COUNT(*) AS datacount,
  0 AS subjectlevelstudies,
  FROM study.BAMA
)