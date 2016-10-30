/*
 * Copyright (c) 2016 LabKey Corporation
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
--Returns all the subjects products pairs that appear in the data that are not represented in the studyproduct table.
--Expected to return 0 rows
SELECT DISTINCT
   d.participantid,
   d.product_id,
   d.prot
FROM import_studyproduct md --metadataTable
RIGHT JOIN ds_subjectproduct d --dataTable
ON (
   md.prot=d.prot
   AND md.product_id=d.product_id
)
WHERE md.prot IS NULL AND md.product_id IS NULL