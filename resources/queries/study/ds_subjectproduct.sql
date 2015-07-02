SELECT
ArmProduct.product_id,
ArmSubject.subject_id AS participantid,
ProductInsert.insert_name,
ProductInsert.clade_name,
ArmProduct.prot,
FROM cds.import_studypartgrouparmproduct AS ArmProduct
JOIN cds.import_studypartgrouparmsubject AS ArmSubject ON (
  ArmSubject.prot = ArmProduct.prot AND
  ArmSubject.study_part = ArmProduct.study_part AND
  ArmSubject.study_group = ArmProduct.study_group AND
  ArmSubject.study_arm = ArmProduct.study_arm
)
LEFT JOIN cds.import_productinsert AS ProductInsert ON (
  ProductInsert.product_id = ArmProduct.product_id
)