SELECT apm.panel_name, ac.antigen_cds_id, ap.cds_panel_id FROM cds.assay_combined_antigen_metadata ac
INNER JOIN cds.antigenPanel ap ON ac.antigen_cds_id = ap.cds_ag_id
INNER JOIN cds.antigenPanelMeta apm ON apm.cds_panel_id = ap.cds_panel_id