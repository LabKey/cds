SELECT DISTINCT
  assay_identifier,
  protein_panel as antigen_name,
  protein,
  pools,
  antigen_description,
  antigen_control,
  clades
FROM ds_elispotantigen AS MAIN
JOIN (
	SELECT
		protein as p,
        GROUP_CONCAT(DISTINCT peptide_pool, ', ') AS pools
   	FROM cds.ds_elispotantigen
  	GROUP BY ds_elispotantigen.protein) AS pool_query
ON MAIN.protein = pool_query.p
JOIN (
   SELECT
       protein_panel AS pp,
       GROUP_CONCAT(DISTINCT clade, ', ') AS clades
	FROM cds.ds_elispotantigen
	GROUP BY ds_elispotantigen.protein_panel) AS clade_query
ON MAIN.protein_panel = clade_query.pp
ORDER BY antigen_name