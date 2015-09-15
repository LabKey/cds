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