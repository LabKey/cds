SELECT
  mixmeta.mab_mix_name_std,
  mixmeta.mab_mix_id,
  mixmeta.mab_mix_type,
  mix.mab_id,
  mixmeta.container,
  mabmeta.mab_hxb2_location,
  mabmeta.mab_isotype,
  mabmeta.mab_donor_species

FROM cds.MAbMix mix
JOIN cds.MAbMixMetadata mixmeta ON (mixmeta.container = mix.container AND mixmeta.mab_mix_id = mix.mab_mix_id)
JOIN cds.MAbMetadata mabmeta ON (mabmeta.container = mix.container AND mabmeta.mab_id = mix.mab_id);