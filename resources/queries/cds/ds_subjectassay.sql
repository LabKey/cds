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
SELECT
participantid,
assay_identifier,
assay_type,
SS.study_name,
lab_code,
label,
FROM (
  SELECT
  DISTINCT participantid,
  'ICS' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.ICS

  UNION

  SELECT
  DISTINCT participantid,
  'NAb' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.NAb

  UNION

  SELECT
  DISTINCT participantid,
  'ELISPOT' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.ELISpot

  UNION

  SELECT
  DISTINCT participantid,
  'BAMA' AS assay_type,
  assay_identifier,
  container,
  lab_code,
  FROM study.BAMA

  UNION

  SELECT
      DISTINCT participantid,
               'PKMAb' AS assay_type,
               assay_identifier,
               container,
               lab_code
  FROM study.PKMAb

) AS DD
INNER JOIN cds.study AS SS ON SS.container = DD.container
