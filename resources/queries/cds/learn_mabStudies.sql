/*
 * Copyright (c) 2018-2019 LabKey Corporation
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

-- mab as subject
SELECT mabwithstudy.prot as prot, mabwithstudy.mab_mix_name_std, mabwithstudy.mab_label as mix_labels,
  studyassay.label, studyassay.has_data, studyassay.assay_status, 'MAb Characterization Studies' as study_type,
  'Go to monoclonal antibodies to view or export' as subheader_instr,
FROM cds.learn_mab_mix_forstudies mabwithstudy
LEFT JOIN cds.learn_studiesforassays studyassay
  ON mabwithstudy.prot = studyassay.prot
     AND studyassay.assay_identifier = 'NAB MAB'

UNION

-- mab as product
SELECT s.study_name as prot, mab.mab_mix_name_std, null as mix_labels,
       s.label, spm.has_data, studyassay.assay_status, 'MAb Administration Studies' as study_type,
       'Go to Plot to view or Grid to export.  Additional non-integrated data files may be available for download. See study page.' as subheader_instr
FROM cds.metadata.studyproductmap spm
          JOIN cds.product p ON (spm.product_id = p.product_id AND spm.projectContainer = p.container)
          JOIN cds.MabMixMetadata mab ON (mab.mab_mix_id = p.mab_mix_id AND mab.container = p.container)
          LEFT JOIN cds.metadata.study s ON (spm.study_name=s.study_name AND spm.container = s.container)
          LEFT JOIN cds.learn_studiesforassays studyassay
         ON (s.study_name = studyassay.prot AND s.container = studyassay.container
                  AND studyassay.assay_identifier = 'PK MAB')

