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
DD.participantid,
DD.folder.entityid as container,
DD.container as study,
S.label AS study_label,
TA.coded_label AS treatment_arm,
DD.participantid || '-product' AS product_group,
FROM study.demographics AS DD
LEFT JOIN cds.treatmentarmsubjectmap AS TSM ON (DD.participantid = TSM.participantid AND DD.container = TSM.container)
LEFT JOIN cds.treatmentarm AS TA ON (TSM.arm_id = TA.arm_id)
LEFT JOIN cds.study AS S ON (DD.container = S.container)