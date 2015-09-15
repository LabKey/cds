SELECT DISTINCT
  assay_identifier,
  protein_panel as antigen_name,
  protein,
  pools,
  antigen_description,
  antigen_control,
  clades
FROM icsantigen AS MAIN
JOIN (
	SELECT
  	protein_panel as pp,
		protein as p,
    GROUP_CONCAT(DISTINCT peptide_pool, ', ') AS pools
  FROM cds.icsantigen
  GROUP BY icsantigen.protein_panel, icsantigen.protein) AS pool_query
ON MAIN.protein_panel = pool_query.pp AND MAIN.protein = pool_query.p
JOIN (
   SELECT
       protein_panel AS pp,
       GROUP_CONCAT(DISTINCT clade, ', ') AS clades
	FROM cds.icsantigen
	GROUP BY icsantigen.protein_panel) AS clade_query
ON MAIN.protein_panel = clade_query.pp
ORDER BY MAIN.protein_panel