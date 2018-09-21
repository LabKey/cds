SELECT DISTINCT tidy_mix.mab_mix_name_std, GROUP_CONCAT(DISTINCT tidy_mix.mab_mix_label, '; ') as mab_label
FROM (
       SELECT * FROM cds.MAbMixMetadata raw_mix WHERE raw_mix.mab_mix_name_std <> raw_mix.mab_mix_label
     ) tidy_mix
GROUP BY tidy_mix.mab_mix_name_std