SELECT studymabmix.*, labels.mab_label
FROM
  (SELECT DISTINCT smab.prot, mixmeta.mab_mix_name_std
   FROM cds.studymab smab
     JOIN cds.MAbMixMetadata mixmeta
       ON smab.mab_mix_id = mixmeta.mab_mix_id) studymabmix
  LEFT JOIN cds.ds_mixlabels labels
    ON studymabmix.mab_mix_name_std = labels.mab_mix_name_std

