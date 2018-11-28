/*
 * Copyright (c) 2015-2018 LabKey Corporation
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
DD.participantid,
DD.folder.entityid as container,
DD.participantid || '-product' AS product_group,
P.product_name,
SPM.insert_name,
SPM.clade_name,
P.product_type,
P.product_developer,
P.product_class_label
FROM study.demographics AS DD
LEFT JOIN cds.subjectproductmap AS SPM ON (DD.participantId = SPM.participantId AND DD.folder = SPM.container)
LEFT JOIN cds.product AS P ON (SPM.product_id = P.product_id AND SPM.projectContainer = P.container)