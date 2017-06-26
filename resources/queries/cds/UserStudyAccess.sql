/*
 * Copyright (c) 2017 LabKey Corporation
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
-- studies that have data added
SELECT
	allStudy.study_name AS "StudyWithData",
	study.study_name IS NOT NULL AS "accessible"
FROM
cds.metadata.study allStudy
LEFT JOIN cds.study study
ON allStudy.study_name=study.study_name
INNER JOIN
(
  SELECT DISTINCT
    sa.prot
  FROM cds.metadata.studyassay sa
  WHERE sa.has_data = true
) noEmptyStudy
ON allStudy.study_name = noEmptyStudy.prot;