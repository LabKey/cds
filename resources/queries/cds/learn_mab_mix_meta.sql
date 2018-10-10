SELECT
  meta.*,
  labels.mab_label as mix_labels
FROM cds.MAbMixMAbMeta meta
LEFT JOIN cds.ds_mixlabels labels
    ON meta.mab_mix_name_std = labels.mab_mix_name_std
