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
SELECT DISTINCT
  assay_identifier,
  protein_panel as antigen_name,
  protein,
  pools,
  description as antigen_description,
  antigen_control,
  clades
FROM elispotantigen AS MAIN
JOIN (
  SELECT
    protein_panel as pp,
   	protein as p,
    GROUP_CONCAT(DISTINCT peptide_pool, ', ') AS pools,
    GROUP_CONCAT(DISTINCT antigen_description, ', ') AS description
  FROM cds.elispotantigen
  GROUP BY elispotantigen.protein_panel, elispotantigen.protein) AS pool_query
ON MAIN.protein_panel = pool_query.pp AND MAIN.protein = pool_query.p
JOIN (
   SELECT
       protein_panel AS pp,
       GROUP_CONCAT(DISTINCT clade, ', ') AS clades
	FROM cds.elispotantigen
	GROUP BY elispotantigen.protein_panel) AS clade_query
ON MAIN.protein_panel = clade_query.pp
ORDER BY MAIN.protein_panel