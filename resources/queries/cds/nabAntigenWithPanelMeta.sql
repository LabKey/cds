SELECT
ag.assay_identifier,
ag.antigen_name,
ag.antigen_type,
ag.virus,
ag.virus_type,
ag.virus_insert_name,
ag.neutralization_tier,
ag.clade,
ag.antigen_description,
ag.antigen_control,
ag.virus_full_name,
ag.virus_name_other,
ag.virus_species,
ag.virus_host_cell,
ag.virus_backbone,
ag.cds_virus_id,
GROUP_CONCAT(DISTINCT ap.panel_name, '|') AS panel_names
FROM cds.nabantigen ag
LEFT JOIN cds.virusPanel vp ON vp.cds_virus_id = ag.cds_virus_id
LEFT JOIN cds.antigenPanelMeta ap ON ap.cds_panel_id = vp.cds_panel_id
GROUP BY
ag.assay_identifier,
ag.antigen_name,
ag.antigen_type,
ag.virus,
ag.virus_type,
ag.virus_insert_name,
ag.neutralization_tier,
ag.clade,
ag.antigen_description,
ag.antigen_control,
ag.virus_full_name,
ag.virus_name_other,
ag.virus_species,
ag.virus_host_cell,
ag.virus_backbone,
ag.cds_virus_id