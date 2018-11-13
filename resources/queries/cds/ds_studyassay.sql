/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
	md.prot,
	md.assay_identifier,
	md.assay_status,
	md.provenance_source,
	md.provenance_summary,
	d.prot IS NOT NULL AND d.assay_identifier IS NOT NULL AS "has_data",
FROM import_studyassay md --metadataTable
LEFT JOIN (
  -- Could use ds_subjectassay, but then we must ensure this is run after that in the ETL
  SELECT DISTINCT
  prot,
  assay_identifier
  FROM cds.import_ICS

  UNION

  SELECT DISTINCT
  prot,
  assay_identifier
  FROM cds.import_nab

  UNION

  SELECT DISTINCT
  prot,
  assay_identifier
  FROM cds.import_els_ifng

  UNION

  SELECT DISTINCT
  prot,
  assay_identifier
  FROM cds.import_bama

  UNION

  SELECT DISTINCT
    prot,
    assay_identifier
  FROM cds.import_nabmab
) d --dataTable
ON d.prot=md.prot AND d.assay_identifier=md.assay_identifier