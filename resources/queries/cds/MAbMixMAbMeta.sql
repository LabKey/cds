/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
SELECT
--  mabmix
  mix.mab_mix_id,
  mix.mab_id,
--  mix meta
  mab_mix_label,
  mab_mix_name_std,
  mab_mix_type,
  mab_mix_name_other,
  mab_mix_lanlid,
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
LEFT JOIN MAbMetadata mabmeta ON mix.mab_id = mabmeta.mab_id