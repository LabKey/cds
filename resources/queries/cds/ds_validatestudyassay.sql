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
--Returns all the subjects assays pairs that appear in the datasets where the corresponding study assay pair is not
--enumerated in the studyassay table.
--Expected to return 0 rows
SELECT DISTINCT
	d.prot,
	d.subject_id,
	d.assay_identifier
FROM import_studyassay md --metadataTable
FULL JOIN (
  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_ICS

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_nab

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_els_ifng

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_bama

  UNION

  SELECT DISTINCT
  prot,
  subject_id,
  assay_identifier
  FROM cds.import_pkmab
) d --dataTable
ON d.prot=md.prot AND d.assay_identifier=md.assay_identifier
WHERE md.prot IS NULL AND md.assay_identifier IS NULL