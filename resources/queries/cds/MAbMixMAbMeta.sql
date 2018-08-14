SELECT
--  mabmix
  mix.mab_mix_id,
  mix.mab_id,
--  mix meta
  mab_mix_label,
  mab_mix_name_std,
--  mab meta
  mab_name_std,
  mab_lanlid,
  mab_hxb2_location,
  mab_ab_binding_type,
  mab_isotype,
  mab_donorid,
  mab_donor_species,
  mab_donor_clade

FROM MAbMix mix

LEFT JOIN MAbMixMetadata mixmeta ON mix.mab_mix_id = mixmeta.mab_mix_id
LEFT JOIN MAbMetadata mabmeta ON mix.mab_id = mabmeta.mab_id;