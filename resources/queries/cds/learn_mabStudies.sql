SELECT mabwithstudy.prot, mabwithstudy.mab_mix_name_std, mabwithstudy.mab_label as mix_labels,
  studyassay.label, studyassay.has_data, studyassay.assay_status
FROM cds.learn_mab_mix_forstudies mabwithstudy
LEFT JOIN cds.learn_studiesforassays studyassay
  ON mabwithstudy.prot = studyassay.prot
     AND studyassay.assay_identifier = 'NAB MAB'
