/*
 * Copyright (c) 2014 LabKey Corporation
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
-- most of these have constraints and shouldn't fail, ptid does not

SELECT Container, 'FAILED - missing study' as qc, Facts.Study as value
FROM Facts
WHERE Facts.Study.Label IS NULL

UNION

SELECT Container, 'FAILED - missing ptid' as qc, Facts.ParticipantId as value
FROM Facts
WHERE Facts.ParticipantId.SubjectId IS NULL

UNION

SELECT Container, 'FAILED - missing antigen' as qc, Facts.Antigen as value
FROM Facts
WHERE Facts.Antigen IS NOT NULL AND Facts.Antigen.Id IS NULL

UNION

SELECT Container, 'FAILED - missing assay' as qc, Facts.Assay as value
FROM Facts
WHERE Facts.Assay IS NOT NULL AND Facts.Assay.Id IS NULL

UNION

SELECT Container, 'FAILED - missing lab' as qc, Facts.Lab as value
FROM Facts
WHERE Facts.Lab IS NOT NULL AND Facts.Lab.Id IS NULL

