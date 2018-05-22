/*
 * Copyright (c) 2015 LabKey Corporation
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
ArmProduct.product_id,
ArmSubject.subject_id AS participantid,
ProductInsert.insert_name,
ProductInsert.clade_name,
ArmProduct.prot,
ArmProduct.container AS projectContainer

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