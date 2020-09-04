SELECT
    mgb.mab_mix_id,
    mgb.mab_mix_name_std,
    mgb.study,
    mgb.virus,
    mgb.clade,
    mgb.neutralization_tier,
    mgb.tier_clade_virus,
    mgb.titer_curve_ic50,
    mgb.titer_curve_ic50_group,
    mgb.target_cell,
    mgb.lab_code,
    mgb.summary_level,
    mgb.curve_id,
    na.virus_full_name

FROM cds.mAbGridBase mgb
LEFT JOIN (SELECT DISTINCT virus, virus_full_name from cds.nabantigen) na
ON na.virus = mgb.virus